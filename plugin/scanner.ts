import fs from 'node:fs';
import path from 'node:path';
import type { RouteNode } from './types.js';

/** File extensions recognised as route modules. */
const ROUTE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js']);

/** Special file names that are never turned into routes. */
const SPECIAL_FILES = new Set(['layout', 'guard']);

/**
 * Convert a file base name (no extension) into a URL path segment.
 *
 * Rules:
 *  - `index`        → '' (index route, no segment)
 *  - `[...slug]`    → '*' (catch-all)
 *  - `[param]`      → ':param' (dynamic segment)
 *  - `about`        → 'about' (static segment)
 */
function fileNameToSegment(base: string): string {
  if (base === 'index') return '';

  // Catch-all: [...slug] → *
  const catchAllMatch = base.match(/^\[\.\.\.(.+)\]$/);
  if (catchAllMatch) return '*';

  // Dynamic param: [id] → :id
  const dynamicMatch = base.match(/^\[(.+)\]$/);
  if (dynamicMatch) return `:${dynamicMatch[1]}`;

  return base;
}

/**
 * Returns true when a directory name is a route group, e.g. `(users)`.
 * Group folders are stripped from the URL but can carry their own layout/guard.
 */
function isGroupDir(name: string): boolean {
  return /^\(.+\)$/.test(name);
}

/**
 * Recursively flatten group nodes (segment === '', filePath === null,
 * isIndex === false) into their effective children.
 * Used for duplicate-segment detection.
 */
function collectEffectiveNodes(nodes: RouteNode[]): RouteNode[] {
  const result: RouteNode[] = [];
  for (const node of nodes) {
    if (node.segment === '' && node.filePath === null && !node.isIndex) {
      result.push(...collectEffectiveNodes(node.children));
    } else {
      result.push(node);
    }
  }
  return result;
}

/**
 * Emit a console warning when two sibling nodes resolve to the same URL
 * segment at the same directory level.
 */
function checkDuplicateSegments(nodes: RouteNode[], context: string): void {
  const effective = collectEffectiveNodes(nodes);
  const seen = new Set<string>();
  for (const node of effective) {
    const key = node.isIndex ? '__index__' : node.segment;
    if (seen.has(key)) {
      console.warn(
        `[file-based-routing] Duplicate segment "${node.isIndex ? '(index)' : node.segment}" in ${context}. ` +
          'Multiple routes resolve to the same URL — only the first match will be used.',
      );
    } else {
      seen.add(key);
    }
  }
}

/**
 * Scan a single directory level and build the immediate RouteNode list.
 *
 * @param dir       - Absolute path to the directory being scanned.
 * @param srcDir    - Absolute path to `src/` (used for relative path calculation).
 */
function scanDirectory(dir: string, srcDir: string): RouteNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // ── Classify entries ────────────────────────────────────────────────────────

  let layoutFile: string | null = null;
  let guardFile: string | null = null;
  const fileNodes: RouteNode[] = [];
  const subDirs: fs.Dirent[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      subDirs.push(entry);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!ROUTE_EXTENSIONS.has(ext)) continue;

    const base = path.basename(entry.name, ext);
    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.relative(srcDir, absolutePath).replace(/\\/g, '/');

    if (base === 'layout') {
      layoutFile = relativePath;
      continue;
    }

    if (base === 'guard') {
      guardFile = relativePath;
      continue;
    }

    const segment = fileNameToSegment(base);
    const isDynamic = /^\[(?!\.\.\.)(.+)\]$/.test(base);
    const isCatchAll = /^\[\.\.\.(.+)\]$/.test(base);

    fileNodes.push({
      segment,
      filePath: relativePath,
      isIndex: base === 'index',
      isDynamic,
      isCatchAll,
      layout: null,
      guard: null,
      children: [],
    });
  }

  // ── Build sub-directory nodes ────────────────────────────────────────────────

  const dirNodes: RouteNode[] = [];

  for (const subDir of subDirs) {
    const subDirPath = path.join(dir, subDir.name);
    const children = scanDirectory(subDirPath, srcDir);

    if (children.length === 0) continue; // empty dir → skip

    // Extract layout/guard from the children's parent metadata.
    // We need to "promote" them from the children array to the dir node.
    // But scanDirectory already handles this via the layout/guard vars above.
    // For the subdirectory, we do a recursive call which returns child nodes
    // including their own layout/guard already set on those nodes.
    // We need a different approach: scan the subdirectory and extract its
    // layout/guard to attach to the *directory node*, not the child nodes.

    const subDirNode = buildDirectoryNode(subDir.name, subDirPath, srcDir);
    if (subDirNode) dirNodes.push(subDirNode);
  }

  // ── Attach layout/guard to all nodes at this level ──────────────────────────
  // The layout and guard belong to the *directory level*, not individual files.
  // We return the file nodes + dir nodes, and the *caller* of scanDirectory
  // will attach layout/guard to them. But actually, layout/guard should be on
  // the *enclosing* directory's RouteNode so the generator can wrap children.
  //
  // Strategy: return all route nodes from this directory.
  // The parent's directory node will hold layout/guard.
  // We annotate each returned node set via a wrapper object.

  const allNodes = [...fileNodes, ...dirNodes];

  // Sort: catch-all always last, then dynamics before catch-all, statics first
  allNodes.sort((a, b) => {
    if (a.isCatchAll) return 1;
    if (b.isCatchAll) return -1;
    if (a.isDynamic && !b.isDynamic) return 1;
    if (!a.isDynamic && b.isDynamic) return -1;
    return a.segment.localeCompare(b.segment);
  });

  return allNodes;
}

/**
 * Build a RouteNode for a sub-directory.
 * Returns null if the directory has no scannable content.
 *
 * @param isGroup - When true the directory is a route group `(name)`: its name
 *                  is stripped from the URL and the node gets segment `''`.
 */
function buildDirectoryNode(dirName: string, dirPath: string, srcDir: string, isGroup = false): RouteNode | null {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  let layoutFile: string | null = null;
  let guardFile: string | null = null;
  const fileNodes: RouteNode[] = [];
  const subDirs: fs.Dirent[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      subDirs.push(entry);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!ROUTE_EXTENSIONS.has(ext)) continue;

    const base = path.basename(entry.name, ext);
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.relative(srcDir, absolutePath).replace(/\\/g, '/');

    if (base === 'layout') {
      layoutFile = relativePath;
      continue;
    }

    if (base === 'guard') {
      guardFile = relativePath;
      continue;
    }

    const segment = fileNameToSegment(base);
    const isDynamic = /^\[(?!\.\.\.)(.+)\]$/.test(base);
    const isCatchAll = /^\[\.\.\.(.+)\]$/.test(base);

    fileNodes.push({
      segment,
      filePath: relativePath,
      isIndex: base === 'index',
      isDynamic,
      isCatchAll,
      layout: null,
      guard: null,
      children: [],
    });
  }

  // Recurse into sub-directories
  for (const subDir of subDirs) {
    const subDirPath = path.join(dirPath, subDir.name);
    const subDirNode = buildDirectoryNode(subDir.name, subDirPath, srcDir, isGroupDir(subDir.name));
    if (subDirNode) fileNodes.push(subDirNode);
  }

  if (fileNodes.length === 0 && !layoutFile && !guardFile) return null;

  // Sort: index first, then statics, then dynamics, catch-all last
  fileNodes.sort((a, b) => {
    if (a.isIndex) return -1;
    if (b.isIndex) return 1;
    if (a.isCatchAll) return 1;
    if (b.isCatchAll) return -1;
    if (a.isDynamic && !b.isDynamic) return 1;
    if (!a.isDynamic && b.isDynamic) return -1;
    return a.segment.localeCompare(b.segment);
  });

  checkDuplicateSegments(fileNodes, dirPath);

  // Group dirs contribute no URL segment; dynamic/catch-all flags are n/a.
  const segment = isGroup ? '' : dirName;
  const isDynamic = !isGroup && /^\[(?!\.\.\.)(.+)\]$/.test(dirName);
  const isCatchAll = !isGroup && /^\[\.\.\.(.+)\]$/.test(dirName);

  return {
    segment,
    filePath: null, // directory node has no own route file
    isIndex: false,
    isDynamic,
    isCatchAll,
    layout: layoutFile,
    guard: guardFile,
    children: fileNodes,
  };
}

/**
 * Scan the routes directory and return the root-level route tree.
 *
 * @param routesDir - Absolute path to `src/routes/`
 * @param srcDir    - Absolute path to `src/`
 */
export function scan(routesDir: string, srcDir: string): RouteNode {
  const entries = fs.readdirSync(routesDir, { withFileTypes: true });

  let layoutFile: string | null = null;
  let guardFile: string | null = null;
  const children: RouteNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDirPath = path.join(routesDir, entry.name);
      const subDirNode = buildDirectoryNode(entry.name, subDirPath, srcDir, isGroupDir(entry.name));
      if (subDirNode) children.push(subDirNode);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!ROUTE_EXTENSIONS.has(ext)) continue;

    const base = path.basename(entry.name, ext);
    const absolutePath = path.join(routesDir, entry.name);
    const relativePath = path.relative(srcDir, absolutePath).replace(/\\/g, '/');

    if (base === 'layout') {
      layoutFile = relativePath;
      continue;
    }

    if (base === 'guard') {
      guardFile = relativePath;
      continue;
    }

    const segment = fileNameToSegment(base);
    const isDynamic = /^\[(?!\.\.\.)(.+)\]$/.test(base);
    const isCatchAll = /^\[\.\.\.(.+)\]$/.test(base);

    children.push({
      segment,
      filePath: relativePath,
      isIndex: base === 'index',
      isDynamic,
      isCatchAll,
      layout: null,
      guard: null,
      children: [],
    });
  }

  // Sort root-level children: index first, statics, dynamics, catch-all last
  children.sort((a, b) => {
    if (a.isIndex) return -1;
    if (b.isIndex) return 1;
    if (a.isCatchAll) return 1;
    if (b.isCatchAll) return -1;
    if (a.isDynamic && !b.isDynamic) return 1;
    if (!a.isDynamic && b.isDynamic) return -1;
    return a.segment.localeCompare(b.segment);
  });

  checkDuplicateSegments(children, routesDir);

  // Root node — represents the src/routes/ directory itself
  return {
    segment: '',
    filePath: null,
    isIndex: false,
    isDynamic: false,
    isCatchAll: false,
    layout: layoutFile,
    guard: guardFile,
    children,
  };
}
