/**
 * Slug-to-UUID mapping for backward-compatible URL routing.
 *
 * The frontend uses human-readable slugs in URLs (e.g. /leagues/epl).
 * The backend uses UUIDs. This map translates known slugs to their
 * corresponding backend UUIDs so existing links keep working.
 *
 * HOW TO ADD A MAPPING:
 * 1. Find the UUID from the live API: GET https://ethioleague.vercel.app/api/fan/leagues
 * 2. Add an entry: "your-slug": "the-uuid-from-the-api"
 *
 * If a slug is not found here, resolveId() passes it through as-is
 * (treating it as a UUID directly). A 404 from the API will render
 * the not-found page.
 */
const SLUG_MAP: Record<string, string> = {
  // Leagues — populate with real UUIDs from the live API
  // Example: "epl": "a6824ec9-1c71-4a4a-8314-61eafcf32af1",
};

/**
 * Resolves a URL parameter to a backend UUID.
 * - If the value matches a known slug, returns the mapped UUID.
 * - Otherwise, returns the value unchanged (assumed to already be a UUID).
 */
export function resolveId(slugOrUuid: string): string {
  return SLUG_MAP[slugOrUuid] ?? slugOrUuid;
}
