import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { ContactFormData } from "@/utils/types";

const templatePath = path.join(process.cwd(), "public/documents/email-template.html");
let html = fs.readFileSync(templatePath, "utf-8");

export async function POST(req: Request) {
  const body: ContactFormData = await req.json();

  if (!body.email) {
    return NextResponse.json({ 
        status: 200, 
        message: "Email is Required.",
        result: false
    });
  }

  if (!body.subject) {
    return NextResponse.json({ 
        status: 200, 
        message: "Subject is Required.",
        result: false
    });
  }

  if (!body.message) {
    return NextResponse.json({ 
        status: 200, 
        message: "Message is Required.",
        result: false
    });
  }

  html = html
    .replace("{{fname}}", body.fname)
    .replace("{{lname}}", body.lname)
    .replace("{{email}}", body.email)
    .replace("{{subject}}", body.subject)
    .replace("{{type}}", body.type)
    .replace("{{message}}", body.message)
    .replace("{{budget}}", body.budget || "N/A");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER_EMAIL, // your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"Portfolio" <${process.env.GMAIL_USER_EMAIL}>`,
      to: body.email, // or multiple recipients
      subject: body.subject,
      text: body.message,
      html: html,
    });

    return NextResponse.json({ status: 200, message: "Email sent successfully!", result: true });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: error instanceof Error ? error.message : "Unknown error", result: false },
      { status: 500 }
    );
  }
}