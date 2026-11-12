import DashboardCard from "@/components/admin/DashboardCard";
import ErrorState from "@/components/admin/ErrorState";
import EmptyState from "@/components/admin/EmptyState";
import LineChart from "@/components/admin/LineChart";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";
import AdminAuthService from "@/lib/.services/adminAuthService";
import AnalyticsService from "@/lib/.services/analyticsService";
import { ServiceError } from "@/lib/.services/serviceError";
import { parseRangeParams, presetToRange, TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { formatLongDay, formatNumber, percentChange } from "@/utils/admin/format";
import { RecentVisitor, TrafficBreakdowns, TrafficRange, TrafficResult } from "@/utils/types";
import { ADMIN_PAGE_HEADERS } from "@/utils/admin/pageHeaders";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminAnalytics.module.css";

import AnalyticsFrame from "./AnalyticsFrame";
import BreakdownCard from "./BreakdownCard";
import RecentVisitorsTable from "./RecentVisitorsTable";
import { BREAKDOWN_ICONS, breakdownLabel } from "./labels";

export interface AnalyticsSearchParams {
    range?: string;
    from?:  string;
    to?:    string;
}

type Loaded = { traffic: TrafficResult; breakdowns: TrafficBreakdowns; recent: RecentVisitor[] };

async function load(range: TrafficRange): Promise<{ ok: true; data: Loaded } | { ok: false; message: string }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false, message: "Not authorized." };
        const service = new AnalyticsService(session.client);
        const [traffic, breakdowns, recent] = await Promise.all([
            service.getTraffic(range),
            service.getBreakdowns(range),
            service.getRecentVisitors(50),
        ]);
        return { ok: true, data: { traffic, breakdowns, recent } };
    } catch (error) {
        return { ok: false, message: error instanceof ServiceError ? error.message : "Couldn't load analytics." };
    }
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: AnalyticsSearchParams }) {
    const parsed   = parseRangeParams(searchParams);
    const range    = parsed.ok ? parsed.range : presetToRange("30d");
    const preset   = (Object.keys(TRAFFIC_PRESETS) as (keyof typeof TRAFFIC_PRESETS)[])
        .find((p) => !searchParams.from && (searchParams.range ?? "30d") === p);
    const result   = await load(range);
    const today    = presetToRange("7d").to;

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title={ADMIN_PAGE_HEADERS.analytics.title}
                    description={ADMIN_PAGE_HEADERS.analytics.description} />

                <AnalyticsFrame key={`${range.from}:${range.to}`} preset={preset ?? null} from={range.from} to={range.to} today={today}>
                    <p className={styles.period}>
                        Showing <strong>{formatLongDay(range.from)}</strong> – <strong>{formatLongDay(range.to)}</strong>
                    </p>

                    {!parsed.ok && <ErrorState message={`${parsed.error} Showing the last 30 days.`} />}

                    {!result.ok ? (
                        <ErrorState message={result.message} />
                    ) : !result.data.traffic.available ? (
                        <div className={adminStyles.card}>
                            <EmptyState icon={AdminIcons.BarChart} title="Analytics is turned off" description={result.data.traffic.reason} />
                        </div>
                    ) : (
                        <AnalyticsBody data={result.data} />
                    )}
                </AnalyticsFrame>
            </div>
        </DashboardRefreshProvider>
    );
}

function AnalyticsBody({ data }: { data: Loaded }) {
    const t = data.traffic as Extract<TrafficResult, { available: true }>;
    const visitorsChange = percentChange(t.total, t.previousTotal);
    const viewsChange    = percentChange(t.totalViews, t.previousViews);
    const topCountry     = data.breakdowns.country.find((r) => r.label);
    const trend = (c: number | null) => (c === null ? "No earlier data to compare" : `${c > 0 ? "+" : ""}${c}% vs previous period`);

    return (
        <>
            <div className={styles.stats}>
                <StatCard label="Visitors" icon={AdminIcons.User} value={t.total} hint={trend(visitorsChange)} trend={(visitorsChange ?? 0) > 0 ? "up" : "neutral"} />
                <StatCard label="Page views" icon={AdminIcons.Eye} value={t.totalViews} hint={trend(viewsChange)} trend={(viewsChange ?? 0) > 0 ? "up" : "neutral"} />
                <StatCard
                    label="Pages per visit"
                    icon={AdminIcons.FileText}
                    value={null}
                    display={t.total ? (t.totalViews / t.total).toFixed(1) : undefined}
                    hint={t.total ? "Average pages a visitor opens" : "No visits yet"} />
                <StatCard
                    label="Top country"
                    icon={AdminIcons.Globe}
                    value={null}
                    display={topCountry ? breakdownLabel("country", topCountry.label) : undefined}
                    hint={topCountry ? `${formatNumber(topCountry.visitors)} visitors` : "No location data yet"} />
            </div>

            <DashboardCard title="Visitors per day" icon={AdminIcons.BarChart} subtitle={`${formatNumber(t.total)} visitors · ${formatNumber(t.totalViews)} page views`}>
                <LineChart points={t.points} unit="visitors" ariaLabel={`Daily visitors from ${formatLongDay(t.range.from)} to ${formatLongDay(t.range.to)}.`} />
            </DashboardCard>

            <div className={styles.grid}>
                {(["country", "city", "referrer", "device", "browser", "os"] as const).map((d) => (
                    <BreakdownCard key={d} dimension={d} rows={data.breakdowns[d]} icon={BREAKDOWN_ICONS[d]} />
                ))}
            </div>

            <BreakdownCard dimension="path" rows={data.breakdowns.path} icon={BREAKDOWN_ICONS.path} />

            <RecentVisitorsTable visitors={data.recent} />

            <p className={styles.note}>
                Location is Vercel&apos;s estimate from the connection (country/region/city only); browser and OS are
                family names. IP addresses, full user agents and cookies are never stored, and a visitor can&apos;t be
                recognised across days. Visits before this update show &ldquo;Unknown&rdquo;.
            </p>
        </>
    );
}
