import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

import supabaseServer, { Table } from "../.supabase/server";
import { ContactFormData } from "@/utils/types";
import { sanitize, isValidEmail } from "@/utils/general/stringHelpers";

// ============================================================
// TYPES
// ============================================================

/**
 * Represents the response returned by ContactService methods.
 */
interface ContactResponse {
  /** Human-readable message describing the result */
  message: string;
  /** Whether the operation was successful */
  valid: boolean;
}

// ============================================================
// TEMPLATE
// ============================================================

/**
 * Resolves the absolute path to the HTML email template.
 * The template uses {{placeholder}} syntax for dynamic content injection.
 */
const templatePath = path.join(process.cwd(), "public/documents/email-template.html");

/**
 * Reads the HTML email template once at module load time.
 * Cached to avoid repeated file system reads on every request.
 */
const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

// ============================================================
// LIMITS
// ============================================================

/** Maximum accepted length per form field, in characters. */
const MAX_FIELD_LENGTHS: Partial<Record<keyof ContactFormData, number>> = {
  fname:   100,
  lname:   100,
  email:   254,
  subject: 200,
  type:    100,
  budget:  100,
  message: 5000,
};

/** Human-readable field names for validation messages. */
const FIELD_LABELS: Record<keyof ContactFormData, string> = {
  fname:   "First name",
  lname:   "Last name",
  email:   "Email",
  subject: "Subject",
  type:    "Inquiry type",
  budget:  "Budget",
  message: "Message",
};

// ============================================================
// SERVICE
// ============================================================

/**
 * ContactService — handles the full lifecycle of a contact form submission.
 *
 * Responsibilities:
 * - Validates incoming form data
 * - Sanitizes user input to prevent HTML injection
 * - Injects sanitized data into the HTML email template
 * - Sends the email via Gmail SMTP using Nodemailer
 * - Saves the submission to `contact_messages` for the admin dashboard
 *
 * @example
 * const service = new ContactService();
 * const result  = await service.index(formData);
 *
 * if (result.valid) {
 *   console.log("Email sent!");
 * } else {
 *   console.error(result.message);
 * }
 */
export default class ContactService {

  /**
   * Entry point for handling a contact form submission.
   * Validates the form data, injects it into the HTML template,
   * and sends the email.
   *
   * @param body - The contact form data submitted by the user
   * @returns    - A ContactResponse indicating success or failure
   */
  async index(body: ContactFormData): Promise<ContactResponse> {
    // Validate first — return early if invalid
    const { message, valid } = this.validate(body);
    if (!valid) return { message, valid: false };

    // ✅ Inject sanitized values into a fresh copy of the template
    // Using a fresh copy per request prevents concurrent mutation bugs
    const html = htmlTemplate
      .replace("{{fname}}",   sanitize(body.fname))
      .replace("{{lname}}",   sanitize(body.lname))
      .replace("{{email}}",   sanitize(body.email))
      .replace("{{subject}}", sanitize(body.subject))
      .replace("{{type}}",    sanitize(body.type))
      .replace("{{message}}", sanitize(body.message))
      .replace("{{budget}}",  sanitize(body.budget || "N/A"));

    const result = await this.sendEmail(html, body);

    // Only store messages the visitor was told were sent (avoids duplicates on retry).
    if (result.valid) await this.saveMessage(body);

    return result;
  }

  /**
   * Stores the submission in `contact_messages` (service role; RLS lets only
   * admins read it). Fail-soft: the email already went out, so a database
   * problem (e.g. migration not applied yet) is logged, not shown to the visitor.
   * No IP address or user agent is stored.
   */
  private async saveMessage(body: ContactFormData): Promise<void> {
    const { error } = await supabaseServer
      .from(Table.contactMessages)
      .insert({
        first_name:   body.fname?.trim()   || null,
        last_name:    body.lname?.trim()   || null,
        email:        body.email.trim(),
        subject:      body.subject.trim(),
        inquiry_type: body.type?.trim()    || null,
        budget:       body.budget?.trim()  || null,
        message:      body.message.trim(),
      });

    if (error) {
      console.error("[ContactService] saveMessage failed:", error.message);
    }
  }

  /**
   * Validates the contact form data.
   * Checks for required fields and validates the email format.
   *
   * Required fields: email, subject, message
   *
   * @param data - The contact form data to validate
   * @returns    - A ContactResponse with valid: true if all checks pass,
   *               or valid: false with a descriptive message if not
   *
   * @example
   * service.validate({ email: "", subject: "Hi", message: "Hello" })
   * // → { message: "Email is required.", valid: false }
   */
  validate(data: ContactFormData): ContactResponse {
    const required: { key: keyof ContactFormData; label: string }[] = [
      { key: "email",   label: "Email"   },
      { key: "subject", label: "Subject" },
      { key: "message", label: "Message" },
    ];

    // Check each required field — return early on first failure
    for (const { key, label } of required) {
      if (!data[key]?.trim()) {
        return { message: `${label} is required.`, valid: false };
      }
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      return { message: "Please enter a valid email address.", valid: false };
    }

    // Cap field lengths so the form can't be used to send huge emails
    for (const [key, max] of Object.entries(MAX_FIELD_LENGTHS) as [keyof ContactFormData, number][]) {
      const value = data[key];

      if (value !== undefined && (typeof value !== "string" || value.length > max)) {
        return { message: `${FIELD_LABELS[key]} must be under ${max} characters.`, valid: false };
      }
    }

    return { message: "Validation passed.", valid: true };
  }

  /**
   * Sends the contact form email via Gmail SMTP using Nodemailer.
   * This method is private — it should only be called after validation passes.
   *
   * The email is sent TO the portfolio owner's Gmail address.
   * The replyTo is set to the sender's email so replies go directly to them.
   *
   * Required environment variables:
   * - GMAIL_USER_EMAIL    → your Gmail address
   * - GMAIL_APP_PASSWORD  → Gmail App Password (not your regular password)
   *
   * @param html - The populated HTML email template
   * @param body - The original form data (used for subject, text, replyTo)
   * @returns    - A ContactResponse indicating success or failure
   */
  private async sendEmail(html: string, body: ContactFormData): Promise<ContactResponse> {
    const from    = `"A7LNX Portfolio" <${process.env.GMAIL_USER_EMAIL}>`;
    const to      = process.env.GMAIL_USER_EMAIL;
    const replyTo = body.email;                          // ✅ replies go to sender
    const subject = `[Portfolio] ${sanitize(body.subject)}`;
    const text    = body.message;                        // plain text fallback

    try {
      // Create a Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from,
        to,
        replyTo,
        subject,
        text,   // plain text fallback for email clients that don't support HTML
        html,   // styled HTML version
      });

      return { message: "Email sent successfully!", valid: true };

    } catch (error) {
      console.error("[ContactService] sendEmail error:", error);
      return {
        // Don't expose SMTP/provider details to visitors; they're logged above.
        message: "Unable to send your message right now.",
        valid:   false,
      };
    }
  }
}