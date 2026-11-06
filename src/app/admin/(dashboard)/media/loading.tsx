import Skeleton from "@/components/admin/Skeleton";
import { CardSkeleton } from "@/containers/admin-dashboard-page/DashboardSkeletons";
import adminStyles from "@/styles/pages/admin.module.css";

export default function Loading() {
  return (
    <div className={adminStyles.page} aria-busy="true" aria-label="Loading media">
      <Skeleton width={180} height={26} />
      <Skeleton height={90} radius={12} />
      <CardSkeleton rows={4} />
    </div>
  );
}
