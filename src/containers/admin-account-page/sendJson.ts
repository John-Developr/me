/** Reply shape of the admin account API routes. */
export interface AccountApiResponse {
    result:  boolean;
    message: string;
    errors?: Record<string, string>;
}

/**
 * Sends JSON to an admin API route and normalizes the reply.
 * Network failures come back as `{ result: false }` with a message.
 */
export async function sendJson(url: string, method: "POST" | "PATCH", body?: unknown): Promise<AccountApiResponse & { status: number }> {
    try {
        const res  = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body:    body === undefined ? undefined : JSON.stringify(body),
        });
        const json = (await res.json().catch(() => null)) as AccountApiResponse | null;

        return {
            status:  res.status,
            result:  res.ok && !!json?.result,
            message: json?.message ?? "Something went wrong. Please try again.",
            errors:  json?.errors,
        };
    } catch {
        return { status: 0, result: false, message: "Network error. Check your connection and try again." };
    }
}
