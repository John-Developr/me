import type { Metadata } from "next";
import ContactPage from "@/containers/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Me for questions, collaborations, or feedback. Reach out via email or social media and start a conversation today.",
};

export default function Contact() {
  return <ContactPage />;
}