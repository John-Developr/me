import { sileo } from "sileo";

import { networkDefine } from "@/config/networkDefine";
import { sendJson } from "@/utils/admin/sendJson";
import { MessageStatus } from "@/utils/types";

/* ============================================================
   MESSAGE ACTIONS (client)
   ------------------------------------------------------------
   Shared by the inbox rows and the message screen. Each shows
   its own toast and resolves to whether the change was saved.
   ============================================================ */

const STATUS_TOASTS: Record<MessageStatus, string> = {
    new:      "Marked as unread",
    read:     "Marked as read",
    archived: "Message archived",
};

/**
 * Moves a message to unread, read or archived.
 * @param quiet - No success toast (e.g. marking read on open).
 * @param toast - Success title to use instead of the default.
 */
export async function updateMessageStatus(id: string, status: MessageStatus, { quiet = false, toast }: { quiet?: boolean; toast?: string } = {}): Promise<boolean> {
    const res = await sendJson(networkDefine.ADMIN_MESSAGE_API(id), "PATCH", { status });

    if (!res.result) {
        sileo.error({ title: "Couldn't update message", description: res.message });
        return false;
    }
    if (!quiet) sileo.success({ title: toast ?? STATUS_TOASTS[status] });
    return true;
}

export async function deleteMessage(id: string, subject: string): Promise<boolean> {
    const res = await sendJson(networkDefine.ADMIN_MESSAGE_API(id), "DELETE");

    if (!res.result) {
        sileo.error({ title: "Couldn't delete message", description: res.message });
        return false;
    }
    sileo.success({ title: "Message deleted", description: subject });
    return true;
}
