import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import ChatService from "@/lib/.services/chatService";
import RateLimitService from "@/lib/.services/rateLimitService";

/** Longest chat message accepted, in characters. */
const MAX_MESSAGE_LENGTH = 1000;

// Load system instruction server-side
const instruction = fs.readFileSync(
    path.join(process.cwd(), "src/docs/system-instruction.md"),
    "utf-8"
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { warning: `That message is too long — please keep it under ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const limiter = new RateLimitService();

    if (!(await limiter.isAllowed("chat", req))) {
      return NextResponse.json(
        { warning: "You're sending messages a little fast. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const assistant = new ChatService(instruction);
    return NextResponse.json({
      reply: await assistant.index(message) 
    });
  } catch (error) {
    // Log details server-side; don't expose internal/provider errors to visitors.
    console.error("[api/chat] POST failed:", error);

    return NextResponse.json(
      { error: "Unable to reply right now." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
      await ChatService.clearChatCookie();
      return NextResponse.json({ status: true });
  } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "An unknown error occurred" },
        { status: 500 }
      );
  }     
}
