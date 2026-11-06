/** Reply shape of the admin API routes. */
export interface AdminApiResponse<T = unknown> {
    result:  boolean;
    message: string;
    errors?: Record<string, string>;
    data?:   T;
}

/**
 * Sends JSON to an admin API route and normalizes the reply.
 * Network failures come back as `{ result: false }` with a message.
 */
export async function sendJson<T = unknown>(
    url: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body?: unknown,
): Promise<AdminApiResponse<T> & { status: number }> {
    try {
        const res  = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body:    body === undefined ? undefined : JSON.stringify(body),
        });
        const json = (await res.json().catch(() => null)) as AdminApiResponse<T> | null;

        return {
            status:  res.status,
            result:  res.ok && !!json?.result,
            message: json?.message ?? "Something went wrong. Please try again.",
            errors:  json?.errors,
            data:    json?.data,
        };
    } catch {
        return { status: 0, result: false, message: "Network error. Check your connection and try again." };
    }
}
