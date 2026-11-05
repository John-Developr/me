// ----------------------
// In-memory JSON fetch cache (client-side)
// ----------------------
/**
 * Remembers successful JSON GET responses for the lifetime of the tab,
 * so navigating back to a page renders instantly instead of refetching.
 * Concurrent requests for the same URL share one network call.
 * Failed responses are never cached. Cleared on full page reload.
 */
const responses = new Map<string, unknown>();
const inflight  = new Map<string, Promise<unknown>>();

/**
 * Returns the cached response for a URL synchronously, if any.
 * Useful for initial state so cached pages skip their skeleton.
 *
 * @param url - The exact URL previously passed to `fetchJsonCached`
 */
export function getCached<T>(url: string): T | undefined {
    return responses.get(url) as T | undefined;
}

/**
 * Fetches JSON from a URL, returning the cached response when available.
 *
 * @param url           - Endpoint to fetch (built from `networkDefine`)
 * @param options.fresh - Skip the cache and refetch (still updates it)
 * @throws When the response is not OK
 */
export function fetchJsonCached<T>(url: string, options: { fresh?: boolean } = {}): Promise<T> {
    if (!options.fresh && responses.has(url)) {
        return Promise.resolve(responses.get(url) as T);
    }

    const pending = inflight.get(url);
    if (pending) {
        return pending as Promise<T>;
    }

    const request = fetch(url)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data: T = await response.json();
            responses.set(url, data);
            return data;
        })
        .finally(() => inflight.delete(url));

    inflight.set(url, request);
    return request;
}
