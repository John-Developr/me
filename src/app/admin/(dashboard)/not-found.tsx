import Link from "next/link";

import EmptyState from "@/components/admin/EmptyState";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";

/** Shown inside the admin shell for unknown ids (e.g. a deleted project). */
export default function AdminNotFound() {
  return (
    <div className={adminStyles.card}>
      <EmptyState
        icon={AdminIcons.AlertCircle}
        title="Not found"
        description="This item doesn't exist or was deleted."
        action={
          <Link href="/admin/projects" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}>
            Back to projects
          </Link>
        } />
    </div>
  );
}
