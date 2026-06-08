import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import type { PluginOptions } from './types.js';
import { scan } from './scanner.js';
import { generate } from './generator.js';

/**
 * Vite plugin: file-based routing
 *
 * Scans `routesDir` on startup and every file change, then writes a
 * TypeScript `RouteObject[]` config to `output`.
 *
 * Usage in vite.config.ts:
 *   import { fileBasedRouting } from './plugin';
 *   plugins: [fileBasedRouting({ routesDir: 'src/routes', output: 'src/routes.ts' })]
 */
export function fileBasedRouting(options: PluginOptions): Plugin {
  const { routesDir = 'src/routes', output = 'src/routes.ts' } = options;

  let resolvedRoot = process.cwd();
  let absoluteRoutesDir: string;
  let absoluteOutput: string;
  let absoluteSrcDir: string;

  function generateRoutes(): void {
    if (!fs.existsSync(absoluteRoutesDir)) {
      console.warn(
        `[file-based-routing] routes directory not found: ${absoluteRoutesDir}`,
      );
      return;
    }

    const root = scan(absoluteRoutesDir, absoluteSrcDir);
    const code = generate(root);

    // Only write if content changed to avoid unnecessary HMR triggers
    let existing = '';
    try {
      existing = fs.readFileSync(absoluteOutput, 'utf-8');
    } catch {
      // file doesn't exist yet — that's fine
    }

    if (existing !== code) {
      fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
      fs.writeFileSync(absoluteOutput, code, 'utf-8');
      console.log(
        `[file-based-routing] generated ${path.relative(resolvedRoot, absoluteOutput)}`,
      );
    }
  }

  return {
    name: 'file-based-routing',

    configResolved(config: ResolvedConfig) {
      resolvedRoot = config.root;
      absoluteRoutesDir = path.resolve(resolvedRoot, routesDir);
      absoluteOutput = path.resolve(resolvedRoot, output);
      // src/ is one directory above routesDir (src/routes → src/)
      absoluteSrcDir = path.dirname(absoluteRoutesDir);
    },

    buildStart() {
      generateRoutes();
    },

    watchChange(id: string) {
      // Re-generate whenever a file inside src/routes/ is added, changed, or removed
      if (id.startsWith(absoluteRoutesDir)) {
        generateRoutes();
      }
    },

    handleHotUpdate({ file, server }) {
      // If the generated routes.ts itself changed (because we just re-wrote it),
      // invalidate all modules that import it so the browser gets the update.
      if (file === absoluteOutput) {
        const mod = server.moduleGraph.getModuleById(absoluteOutput);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
      // If a route file changed, force a full reload so the new lazy import
      // is picked up correctly.
      if (file.startsWith(absoluteRoutesDir) && file !== absoluteOutput) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
