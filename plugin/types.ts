/**
 * Internal types for the file-based routing Vite plugin.
 */

/**
 * A node in the route tree built by the scanner.
 *
 * Each node represents either:
 *  - A route file   (filePath !== null)
 *  - A directory    (filePath === null, acts as a path-namespace container)
 *
 * Special files (layout.tsx / guard.tsx) are stored on the *parent* directory
 * node rather than being represented as their own nodes.
 */
export interface RouteNode {
  /** URL path segment for this node (empty string for index routes). */
  segment: string;

  /**
   * Path to the route component file, relative to `src/`.
   * Null for directory-only namespace nodes that have no index file.
   */
  filePath: string | null;

  /** True when this node maps to the index of its directory (index.tsx). */
  isIndex: boolean;

  /** True when the segment contains a dynamic param: [param] → :param */
  isDynamic: boolean;

  /** True when the segment is a catch-all: [...slug] → * */
  isCatchAll: boolean;

  /**
   * Path to the layout.tsx for this directory level, relative to `src/`.
   * Null if no layout.tsx exists at this level.
   */
  layout: string | null;

  /**
   * Path to the guard.tsx for this directory level, relative to `src/`.
   * Null if no guard.tsx exists at this level.
   */
  guard: string | null;

  /**
   * Path to the error.tsx for this directory level, relative to `src/`.
   * When present the scanner emits a pathless ErrorBoundary wrapper that is
   * outermost among error/guard/layout — it catches errors from the guard,
   * layout, and all descendant routes.
   * Null if no error.tsx exists at this level.
   */
  error: string | null;

  /** Child route nodes (routes inside sub-directories or sibling files). */
  children: RouteNode[];
}

/** Options accepted by the fileBasedRouting plugin factory. */
export interface PluginOptions {
  /**
   * Directory to scan for route files.
   * Relative to the Vite project root.
   * @default 'src/routes'
   */
  routesDir: string;

  /**
   * File path where the generated routes config will be written.
   * Relative to the Vite project root.
   * @default 'src/routes.ts'
   */
  output: string;
}
