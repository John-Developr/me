import Skeleton from "@/components/admin/Skeleton";
import { CardSkeleton } from "@/containers/admin-dashboard-page/DashboardSkeletons";
import adminStyles from "@/styles/pages/admin.module.css";

export default function Loading() {
  return (
    <div className={adminStyles.page} aria-busy="true" aria-label="Loading skills">
      <Skeleton width={240} height={26} />
      <CardSkeleton rows={4} />
      <CardSkeleton rows={3} />
    </div>
  );
}
