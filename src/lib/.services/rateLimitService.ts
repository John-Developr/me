import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { RPC, Table } from "../.supabase/server";

/**
 * Per-visitor request limits for public endpoints that cost money or send email.
 */
const RATE_LIMITS = {
    chat:    { limit: 20, windowSeconds: 10 * 60 }, // 20 messages per 10 minutes
    contact: { limit: 3,  windowSeconds: 60 * 60 }, // 3 submissions per hour
} as const;

export type RateLimitScope = keyof typeof RATE_LIMITS;

/**
 * RateLimitService — counts requests per visitor in Supabase
 * (`check_rate_limit` RPC, see supabase/migrations/20261105_rate_limits.sql).
 *
 * Visitors are keyed by a SHA-256 hash of scope + IP, so raw IPs are never stored.
 * Fails open: if the database check errors (e.g. migration not run yet),
 * the request is allowed so the site keeps working.
 *
 * @example
 * const limiter = new RateLimitService();
 * if (!(await limiter.isAllowed("chat", req))) {
 *   return NextResponse.json({ ... }, { status: 429 });
 * }
 */
export default class RateLimitService {
    private server: SupabaseClient;

    constructor() {
        this.server = supabaseServer;
    }

    /**
     * Records a request and returns whether it is within the scope's limit.
     *
     * @param scope - Which endpoint's limit to apply
     * @param req   - Incoming request (used for the client IP)
     */
    async isAllowed(scope: RateLimitScope, req: Request): Promise<boolean> {
        const { limit, windowSeconds } = RATE_LIMITS[scope];

        const { data, error } = await this.server.rpc(RPC.checkRateLimit, {
            p_key:            this.getKey(scope, req),
            p_limit:          limit,
            p_window_seconds: windowSeconds,
        });

        if (error) {
            console.error(`[RateLimitService] check failed for "${scope}", allowing request:`, error.message);
            return true;
        }

        return data === true;
    }

    /**
     * Deletes counters older than a day so the table stays small.
     * Called from the daily keep-alive cron.
     */
    async cleanup(): Promise<void> {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { error } = await this.server
            .from(Table.rateLimits)
            .delete()
            .lt("window_start", cutoff);

        if (error) {
            console.error("[RateLimitService] cleanup failed:", error.message);
        }
    }

    /**
     * Builds the storage key: hash of scope + client IP.
     * On Vercel, the first `x-forwarded-for` entry is the real client IP.
     */
    private getKey(scope: RateLimitScope, req: Request): string {
        const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const ip        = forwarded || req.headers.get("x-real-ip") || "unknown";

        return createHash("sha256").update(`${scope}:${ip}`).digest("hex");
    }
}
