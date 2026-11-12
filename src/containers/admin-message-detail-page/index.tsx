import { notFound } from "next/navigation";
import { z } from "zod";

import ErrorState from "@/components/admin/ErrorState";
import AdminAuthService from "@/lib/.services/adminAuthService";
import MessageService from "@/lib/.services/messageService";
import { ContactMessage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import MessageView from "./MessageView";

/** One message under the admin's RLS session; null = doesn't exist. */
async function loadMessage(id: string): Promise<{ ok: true; data: ContactMessage | null } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new MessageService(session.client).getById(id) };
    } catch {
        return { ok: false };
    }
}

export default async function AdminMessageDetailPage({ id }: { id: string }) {
    if (!z.uuid().safeParse(id).success) notFound();

    const message = await loadMessage(id);
    if (message.ok && !message.data) notFound();

    return (
        <div className={adminStyles.page}>
            {message.ok && message.data
                ? <MessageView message={message.data} />
                : <ErrorState message="Couldn't load this message. Try refreshing the page." />}
        </div>
    );
}
