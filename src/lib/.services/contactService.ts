import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

import { ContactFormData } from "../../utils/types";

interface ContactResponse {
  message: string;
  valid: boolean;
}

const templatePath = path.join(process.cwd(), "public/documents/email-template.html");
const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

const sanitize = (str: string = ""): string => str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default class ContactService {
    async index(body: ContactFormData): Promise<ContactResponse> {
        const { message, valid } = this.validate(body);
        
        if (!valid) return { 
            message, 
            valid: false 
        };

        const html = htmlTemplate
            .replace("{{fname}}",   sanitize(body.fname))
            .replace("{{lname}}",   sanitize(body.lname))
            .replace("{{email}}",   sanitize(body.email))
            .replace("{{subject}}", sanitize(body.subject))
            .replace("{{type}}",    sanitize(body.type))
            .replace("{{message}}", sanitize(body.message))
            .replace("{{budget}}",  sanitize(body.budget || "N/A"));

        return this.sendEmail(html, body);
    }

    validate(data: ContactFormData): ContactResponse {
        const required: { key: keyof ContactFormData; label: string }[] = [
            { key: "email",   label: "Email"   },
            { key: "subject", label: "Subject" },
            { key: "message", label: "Message" },
        ];

        for (const { key, label } of required) {
            if (!data[key]?.trim()) {
                return { 
                    message: `${label} is required.`, 
                    valid: false 
                };
            }
        }

        if (!isValidEmail(data.email)) {
            return { 
                message: "Please enter a valid email address.", 
                valid: false 
            };
        }

        return { 
            message: "Validation passed.", 
            valid: true 
        };
    }

    private async sendEmail(html: string, body: ContactFormData): Promise<ContactResponse> {
        const from    = `"A7LNX Portfolio" <${process.env.GMAIL_USER_EMAIL}>`;
        const to      = process.env.GMAIL_USER_EMAIL;
        const replyTo = body.email;
        const subject = `[Portfolio] ${sanitize(body.subject)}`;
        const text    = body.message;

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER_EMAIL,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from    : from,
                to      : to,
                replyTo : replyTo,
                subject : subject,
                text    : text,
                html,
            });

            return { 
                message: "Email sent successfully!", 
                valid: true 
            };

        } catch (error) {
            console.error("[ContactService] sendEmail error:", error);

            return {
                message: error instanceof Error ? error.message : "Unknown error",
                valid: false,
            };
        }
    }
}