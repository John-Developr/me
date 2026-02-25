import type { Metadata } from "next";
import NotFoundPage from "@/containers/404-page";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been removed.",
};

export default function NotFound() {
  return <NotFoundPage />;
}