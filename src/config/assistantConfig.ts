// src/config/assistantConfig.ts

/**
 * Configuration for the virtual assistant named John.
 * This includes system instructions and optional initial chat contents.
 * The system instruction guides the assistant's behavior and personality.
 */
const objRoles = {
  user: "user",
  model: "model",
  responding: "responding",
  warning: "warning",
  error: "error",
} as const;

type Parts = { text: string }[]

export type Role = keyof typeof objRoles;
export const filteredRoles = (...exclude: Role[]): Role[] =>
(Object.values<Role>(objRoles) as Role[]).filter(role => !exclude.includes(role));

export interface Message {
    role: Role;
    parts: Parts;
}

export interface AssistantConfig {
  model: string;
  config: {
    responseModalities: string[];
    systemInstruction?: string;
  };
  contents: Message[];
  pushContent: (role: Role, message: string) => void;
  popLastContent: () => void;
  getLastRole: () => Role | undefined;
}

export const assistantConfig: AssistantConfig = {
  // System instruction that defines the assistant's role and personality.
  model: "gemini-2.5-flash",
  config: {
      responseModalities: ["text"],
      systemInstruction: ""
  },

  // Initial chat contents (conversation history).
  contents: [] as Message[],
  
  /**
   * Example structure for contents if you want to seed the conversation:
   * 
   * contents: [
   *   {
   *     role: "user",
   *     parts: [{ text: "hello" }]
   *   },
   *   {
   *     role: "model",
   *     parts: [{ text: "Hello there! How can I help you today?" }]
   *   }
   * ]
   */

  /**
   * Pushes new content to the contents array.
   * @param role - The role of the message sender ("user" or "model").
   * @param message - The message content to add.
   */
  pushContent(role: Role, message: string) {
    const newMessage: Message = {
        role,
        parts: [{ text: message }] as Parts
    };
    
    // Push the new message into the contents array
    this.contents.push(newMessage);
  },

  /**
  * Removes the last message from the contents array.
  * Useful for discarding temporary or placeholder messages like "responding".
  */
  popLastContent() {
    this.contents.pop();
  },

  /**
  * Retrieves the role of the last message in the contents array.
  * @returns The role of the last message, or undefined if there are no messages.
  */
  getLastRole() {
    const lastMessage = this.contents.at(-1);
    return lastMessage ? lastMessage.role : undefined;
  }
};
  