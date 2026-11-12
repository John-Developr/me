import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { ContactMessage, MessageNotifications, MessagePreview, MessageStatus } from "@/utils/types";

const COLUMNS =
  "id, first_name, last_name, email, subject, inquiry_type, budget, message, status, read_at, created_at";

/** The inbox loads the newest messages only; older ones stay in the database. */
const LIST_LIMIT = 500;

// ============================================================
// SERVICE
// ============================================================

/**
 * MessageService — the Contact Messages inbox (`public.contact_messages`).
 *
 * Messages are inserted by ContactService (service role). Everything here
 * takes the **signed-in admin's** client, so RLS applies: admins can read,
 * change the status of, and delete messages, nothing else.
 *
 * @example
 * const service = new MessageService(session.client);
 * await service.setStatus(id, "read");
 */
export default class MessageService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Newest messages first (every status). */
  async list(): Promise<ContactMessage[]> {
    const { data, error } = await this.client
      .from(Table.contactMessages)
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT)
      .returns<ContactMessage[]>();

    if (error) throw this.fail("load the messages", error);
    return data ?? [];
  }

  /** One message, or null if the id doesn't exist. */
  async getById(id: string): Promise<ContactMessage | null> {
    const { data, error } = await this.client
      .from(Table.contactMessages)
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle<ContactMessage>();

    if (error) throw this.fail("load the message", error);
    return data;
  }

  /** Unread count and the latest unread messages, for the notification bell. */
  async getNotifications(limit = 5): Promise<MessageNotifications> {
    const { data, count, error } = await this.client
      .from(Table.contactMessages)
      .select("id, first_name, last_name, email, subject, created_at", { count: "exact" })
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<MessagePreview[]>();

    if (error) throw this.fail("load notifications", error);
    return { count: count ?? 0, latest: data ?? [] };
  }

  /**
   * Moves a message between unread, read and archived.
   * Marking unread clears `read_at`; marking read stamps it.
   */
  async setStatus(id: string, status: MessageStatus): Promise<ContactMessage> {
    const changes =
      status === "new"  ? { status, read_at: null } :
      status === "read" ? { status, read_at: new Date().toISOString() } :
                          { status };

    const { data, error } = await this.client
      .from(Table.contactMessages)
      .update(changes)
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle<ContactMessage>();

    if (error) throw this.fail("update the message", error);
    if (!data)  throw new ServiceError("Message not found.", 404);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.client
      .from(Table.contactMessages)
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw this.fail("delete the message", error);
    if (!data?.length) throw new ServiceError("Message not found.", 404);
  }

  private fail(action: string, error: PostgrestError): ServiceError {
    if (error.code === "42501") return new ServiceError("You don't have permission to manage messages.", 403);

    console.error(`[MessageService] ${action} failed:`, error.message);
    return new ServiceError(`Couldn't ${action}.`, 500);
  }
}
