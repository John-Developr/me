import type { Metadata } from "next";
import AdminAnalyticsPage, { AnalyticsSearchParams } from "@/containers/admin-analytics-page";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AdminAnalytics({ searchParams }: { searchParams: Promise<AnalyticsSearchParams> }) {
  return <AdminAnalyticsPage searchParams={await searchParams} />;
}
