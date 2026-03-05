import { useState, useEffect, useCallback } from "react";
import { assistantConfig, AssistantConfig, Role, filteredRoles } from "@/config/assistantConfig";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Delay (ms) before the "responding" indicator appears after a user message. */
const RESPONDING_TRANSITION_DELAY = 400;

/**
 * Delay (ms) before the final AI reply replaces the "responding" placeholder.
 * Gives a natural feel instead of an instant text swap.
 */
const FINAL_RESPONSE_DELAY = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return value of `useChatAssistant`.
 */
interface UseChatAssistantReturn {
  /** Current snapshot of the assistant, including all conversation contents. */
  assistant: AssistantConfig;

  /**
   * Appends a user message to the conversation and triggers an AI reply.
   *
   * @param message  - The text typed by the user.
   * @param callback - Optional function called immediately after the message is pushed
   *                   (e.g. clearing the input field).
   */
  handleSendMessage: (message: string, callback?: () => void) => void;

  /**
   * Deletes the current conversation server-side, waits for confirmation,
   * then resets the local assistant state.
   *
   * @param callback - Optional function called after the reset completes
   *                   (e.g. navigating back to the welcome screen).
   */
  handleNewConversation: (callback?: () => void) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `useChatAssistant` — core hook for managing an AI chat session.
 *
 * ### Responsibilities
 * - Holds the full conversation state (`AssistantConfig`) in React state.
 * - Sends user messages and streams role-aware content updates.
 * - Displays a transient "responding" indicator while awaiting the AI reply.
 * - Handles API errors and rate-limit (`"limit"`) responses gracefully.
 * - Provides a `handleNewConversation` action that clears both server and
 *   client state atomically.
 *
 * ### Message lifecycle
 * ```
 * User types → handleSendMessage()
 *   → push "user" content
 *   → useEffect detects new "user" message
 *   → push "responding" placeholder  (after RESPONDING_TRANSITION_DELAY)
 *   → POST /api/chat
 *   → replace placeholder with real reply  (after FINAL_RESPONSE_DELAY)
 *      ├─ "model"   — successful AI reply
 *      ├─ "limit"   — rate-limit reached
 *      ├─ "warning" — empty/unexpected response
 *      └─ "error"   — network / fetch failure
 * ```
 *
 * ### Usage
 * ```tsx
 * const { assistant, handleSendMessage, handleNewConversation } = useChatAssistant();
 *
 * // Send a message and clear the input
 * handleSendMessage(inputValue, () => setInputValue(""));
 *
 * // Start a fresh conversation
 * handleNewConversation(() => router.push("/"));
 * ```
 *
 * @returns {UseChatAssistantReturn} State and action handlers for the chat UI.
 */
export const useChatAssistant = (): UseChatAssistantReturn => {
  const [assistant, setAssistant] = useState<AssistantConfig>(assistantConfig);

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Pushes a user message into the conversation history and optionally
   * executes a callback (e.g. resetting an input field).
   * No-ops silently when `message` is an empty string.
   */
  const handleSendMessage = (message: string, callback?: () => void) => {
    if (!message) return;

    const updated = { ...assistant };
    updated.pushContent("user", message);
    setAssistant(updated);
    callback?.();
  };

  /**
   * Starts a fresh conversation by:
   * 1. Calling `DELETE /api/chat` to remove the session server-side.
   * 2. Waiting 1.5 s for any in-flight server cleanup to finish.
   * 3. Clearing `assistantConfig` contents and resetting React state.
   * 4. Invoking the optional `callback` (e.g. UI navigation).
   *
   * Logs errors to the console if the DELETE request fails; does not throw.
   */
  const handleNewConversation = async (callback?: () => void) => {
    try {
      const response = await fetch("/api/chat", { method: "DELETE" });

      if (!response.ok) {
        console.error("Failed to delete conversation:", response.statusText);
        return;
      }

      // Brief pause to let the server finish cleanup before clearing local state.
      await new Promise(resolve => setTimeout(resolve, 1500));

      assistantConfig.clearContents();
      setAssistant({ ...assistantConfig });
      callback?.();
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  // ─── Internal helpers ──────────────────────────────────────────────────────

  /**
   * Replaces the last entry in the conversation (the "responding" placeholder)
   * with the final role + message from the AI.
   * Wrapped in `useCallback` so `useEffect` dependency array stays stable.
   *
   * @param role    - The role to assign to the final message (e.g. `"model"`, `"error"`).
   * @param message - The text content of the final message.
   */
  const updateAssistant = useCallback(
    (role: Role, message: string) => {
      setTimeout(() => {
        setAssistant(prev => {
          const copy = { ...prev };
          copy.popLastContent();          // Remove "responding" placeholder
          copy.pushContent(role, message); // Insert real reply
          return copy;
        });
      }, FINAL_RESPONSE_DELAY);
    },
    []
  );

  // ─── Side effect: fetch AI reply on new user message ───────────────────────

  /**
   * Watches `assistant.contents` for incoming user messages.
   *
   * When the last content entry belongs to a non-user role (i.e. the message
   * was not already handled), it:
   *  1. Pushes a transient "responding" bubble.
   *  2. Fires `POST /api/chat` with the user's text.
   *  3. Resolves to one of: `"model"`, `"limit"`, `"warning"`, or `"error"`.
   *
   * Roles included in `filteredRoles("user")` short-circuit the effect to
   * prevent recursive triggers after the assistant updates state.
   */
  useEffect(() => {
    const last = assistant.contents.at(-1);

    // Nothing to respond to yet.
    if (!last) return;

    // The last message is already from a non-user role — skip to avoid loops.
    if (filteredRoles("user").includes(last.role)) return;

    // Show the "responding" indicator after a short visual delay.
    assistant.pushContent("responding", "");
    setTimeout(() => {
      setAssistant({ ...assistant });
    }, RESPONDING_TRANSITION_DELAY);

    const fetchReply = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: last.parts?.[0]?.text ?? "",
          }),
        });

        const data = await res.json();

        if (data.reply) {
          if (data.reply === "limit") {
            // Rate-limit reached — clear message and signal the UI.
            updateAssistant(data.reply, "");
            return;
          }
          updateAssistant("model", data.reply);
        } else {
          // Received a response but with no usable reply payload.
          updateAssistant(
            "warning",
            "Sorry, I'm not able to provide a reply at the moment."
          );
        }
      } catch {
        // Network error or unexpected exception.
        updateAssistant(
          "error",
          "Oops! Something went wrong. Please try again later."
        );
      }
    };

    fetchReply();
  }, [assistant, updateAssistant]);

  // ─── Public API ────────────────────────────────────────────────────────────

  return {
    assistant,
    handleSendMessage,
    handleNewConversation,
  };
};