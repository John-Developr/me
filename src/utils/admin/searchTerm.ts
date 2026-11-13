/** Shortest and longest admin search query worth sending to the database. */
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 80;

/**
 * Turns a typed admin search into a plain-text `ilike` term.
 *
 * Removes characters that are wildcards in `ilike` (`%`, `_`, `\`, `*`) or
 * separators in a PostgREST `or=(…)` filter (`,`, `(`, `)`, `"`), collapses
 * spaces and caps the length, so input can never change the filter itself.
 * Returns "" when what's left is shorter than SEARCH_MIN_LENGTH.
 */
export function toSearchTerm(query: string): string {
  const term = query.replace(/[%_\\,()"*]/g, " ").replace(/\s+/g, " ").trim().slice(0, SEARCH_MAX_LENGTH).trim();
  return term.length < SEARCH_MIN_LENGTH ? "" : term;
}
