import { NextResponse } from "next/server";
import ContactService from "@/lib/.services/contactService";
import RateLimitService from "@/lib/.services/rateLimitService";

export async function POST(req: Request) {
  try {
    const limiter = new RateLimitService();

    if (!(await limiter.isAllowed("contact", req))) {
      return NextResponse.json(
        { status: 429, message: "Too many messages — please try again in an hour.", result: false },
        { status: 429 }
      );
    }

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
    // Log details server-side; don't expose internal errors to visitors.
    console.error("[api/contact] POST failed:", error);

    return NextResponse.json(
      { status: 500, message: "Something went wrong sending your message.", result: false },
      { status: 500 }
    );
  }
}
