import { NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { assistantConfig, filteredRoles, Role } from "@/config/assistantConfig";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Clone base config (server-only)
    const assistant = { ...assistantConfig };

    // Push user message
    assistant.pushContent("user", message);

    // Filter roles (same logic you had)
    const filteredAssistant = {
      ...assistant,
      contents: assistant.contents.filter(
        ({ role }: { role: Role }) =>
          !filteredRoles("user", "model").includes(role)
      ),
    };

    // 🔒 Gemini call (hidden)
    const response = await generateContent(filteredAssistant);

    const reply = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      reply:
        reply ||
        "Sorry, I'm not able to provide a reply at the moment.",
    });
  } catch (error) {
    console.error("Assistant error:", error);

    return NextResponse.json(
      { error: "Assistant failed to respond" },
      { status: 500 }
    );
  }
}
