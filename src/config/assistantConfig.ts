// src/config/assistantConfig.ts

/**
 * Configuration module for the virtual assistant named John.
 * 
 * This module defines the structure, roles, and behavior of the assistant.
 * It also manages the conversation history (contents) and provides
 * utility methods to manipulate it.
 */

/** Predefined roles for messages exchanged with the assistant */
export const objRoles = {
  user: "user",           // Messages sent by the user
  model: "model",         // Messages sent by the assistant
  responding: "responding", // Placeholder when the assistant is generating a response
  warning: "warning",     // Warning messages
  error: "error",         // Error messages
  limit: "limit"          // Limit-related notifications (e.g., conversation limit reached)
} as const;

/** Type representing the textual parts of a message */
type Parts = { text: string }[]

/** Type representing the role of a message */
export type Role = keyof typeof objRoles;

/**
 * Returns a filtered array of roles excluding the specified ones.
 * @param exclude - Roles to exclude from the returned list
 * @returns Array of roles excluding the specified ones
 */
export const filteredRoles = (...exclude: Role[]): Role[] =>
  (Object.values<Role>(objRoles) as Role[]).filter(role => !exclude.includes(role));

/** Interface representing a single message in the assistant's conversation */
export interface Message {
  role: Role;     // The role of the sender
  parts: Parts;   // Array of textual content parts
}

/** Interface representing the assistant's configuration and its methods */
export interface AssistantConfig {
  /** Array of conversation messages */
  contents: Message[];

  /**
   * Adds a new message to the conversation.
   * @param role - The role of the message sender
   * @param message - The message content
   */
  pushContent: (role: Role, message: string) => void;

  /** Removes the last message from the conversation */
  popLastContent: () => void;

  /**
   * Retrieves the role of the last message in the conversation.
   * @returns The role of the last message, or undefined if the conversation is empty
   */
  getLastRole: () => Role | undefined;

  /** Clears all messages from the conversation */
  clearContents: () => void;
}

/**
 * Default configuration object for the assistant.
 * 
 * Example usage:
 * ```ts
 * assistantConfig.pushContent("user", "Hello!");
 * assistantConfig.pushContent("model", "Hi there! How can I help?");
 * console.log(assistantConfig.getLastRole()); // "model"
 * ```
 */
export const assistantConfig: AssistantConfig = {
  contents: [] as Message[],

  pushContent(role: Role, message: string) {
    const newMessage: Message = {
      role,
      parts: [{ text: message }] as Parts
    };
    this.contents.push(newMessage);
  },

  popLastContent() {
    this.contents.pop();
  },

  getLastRole() {
    const lastMessage = this.contents.at(-1);
    return lastMessage ? lastMessage.role : undefined;
  },

  clearContents() {
    this.contents = [];
  }
};
