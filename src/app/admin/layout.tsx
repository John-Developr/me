import type { Metadata } from "next";

// Private area: keep every admin page out of search engines.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Portfolio CMS" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
