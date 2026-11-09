import type { Metadata } from "next";
import { buildPageMetadata } from "../seoMetadata";
import ContactPage from "@/containers/contact-page";


/** Title, description, keywords and social cards come from Admin → SEO Settings. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact");
}

export default function Contact() {
  return <ContactPage />;
}