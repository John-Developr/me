/**
 * Only allow post-login redirects back into the admin area.
 * Rejects absolute and protocol-relative URLs ("//evil.com") to prevent open redirects.
 */
export function safeAdminRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return "/admin";
  return next.startsWith("/admin/login") ? "/admin" : next;
}
