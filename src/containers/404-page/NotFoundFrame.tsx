'use client'
import { usePathname } from "next/navigation";

/**
 * LayoutProvider gives /admin paths no content column (the admin has its own
 * shell). An unknown /admin/* URL falls through to the public 404, so add the
 * column back here or the page renders full-width and unstyled.
 */
export default function NotFoundFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (!isAdmin) return <>{children}</>;

  return (
    <div className="wrapper">
      <div className="content">
        {children}
      </div>
    </div>
  );
}
