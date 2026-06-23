/**
 * Utility to prefix API paths with the Next.js basePath (/psychiatry).
 *
 * Next.js's basePath only affects <Link> and router.push() — NOT bare fetch() calls.
 * All client-side fetch('/api/...') calls MUST use this helper so the request
 * goes to /psychiatry/api/... instead of /api/... on the root domain.
 */
const BASE_PATH = '/psychiatry';

export function apiPath(path: string): string {
  if (path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}
