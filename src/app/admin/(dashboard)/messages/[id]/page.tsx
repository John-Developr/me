import type { Metadata } from "next";
import AdminMessageDetailPage from "@/containers/admin-message-detail-page";

export const metadata: Metadata = {
  title: "Message",
};

interface MessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMessage({ params }: MessagePageProps) {
  const { id } = await params;
  return <AdminMessageDetailPage id={id} />;
}
