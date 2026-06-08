/**
 * _helpers.ts — excluded from routing by the _ prefix convention.
 *
 * This file is co-located with route files inside src/routes/ but is
 * completely invisible to the plugin scanner. It will never become a route.
 * Use this pattern to keep utilities, hooks, and shared components alongside
 * the routes that use them.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
