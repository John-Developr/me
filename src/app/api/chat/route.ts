import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import ChatService from "@/lib/.services/chatService";

// Load system instruction server-side
const instruction = fs.readFileSync(
    path.join(process.cwd(), "src/docs/system-instruction.md"),
    "utf-8"
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const assistant = new ChatService(instruction);
    return NextResponse.json({
      reply: await assistant.index(message) 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
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