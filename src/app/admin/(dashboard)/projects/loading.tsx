import Skeleton from "@/components/admin/Skeleton";
import { CardSkeleton } from "@/containers/admin-dashboard-page/DashboardSkeletons";
import adminStyles from "@/styles/pages/admin.module.css";

export default function Loading() {
  return (
    <div className={adminStyles.page} aria-busy="true" aria-label="Loading projects">
      <Skeleton width={180} height={26} />
      <CardSkeleton rows={5} />
    </div>
  );
}
