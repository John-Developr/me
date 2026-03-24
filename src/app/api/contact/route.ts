import { NextResponse } from "next/server";
import ContactService from "@/lib/.services/contactService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const service = new ContactService();
    const { message, valid } = await service.index(body);

    if (!valid) {
      return NextResponse.json(
        { status: 400, message, result: false }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully!", result: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: error instanceof Error ? error.message : "Unknown error", result: false },
      { status: 500 }
    );
  }
}