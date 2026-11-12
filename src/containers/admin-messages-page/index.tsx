import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import AdminAuthService from "@/lib/.services/adminAuthService";
import MessageService from "@/lib/.services/messageService";
import { ContactMessage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import MessagesInbox from "./MessagesInbox";

/** Loads the inbox under the admin's RLS session. */
async function loadMessages(): Promise<{ ok: true; data: ContactMessage[] } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new MessageService(session.client).list() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminMessagesPage() {
    const messages = await loadMessages();

    return (
        <div className={adminStyles.page}>
            <PageHeader
                title="Contact Messages"
                description="Messages sent through your portfolio's contact form. Each one is also emailed to you." />

            {messages.ok
                ? <MessagesInbox messages={messages.data} />
                : <ErrorState message="Couldn't load your messages. Try refreshing the page." />}
        </div>
    );
}
