import DashboardCard from "@/components/admin/DashboardCard";
import { PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";

/** Loading screen for /admin/experience: same header, card, toolbar and table columns as ExperienceManager. */
export default function ExperienceSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading experience">
            <PageHeaderSkeleton page="experience" actions={[120]} />
            <DashboardCard title="Timeline" icon={AdminIcons.Briefcase}>
                <ToolbarSkeleton filters={["All", "Work", "Education", "Milestones"]} search="Search experience" />
                <TableSkeleton
                    columns={[
                        { label: "Entry",    cell: "main" },
                        { label: "Type",     cell: "pill" },
                        { label: "Dates",    cell: "text" },
                        { label: "Duration", cell: "text" },
                        { label: "Actions",  cell: "actions" },
                    ]} />
            </DashboardCard>
        </div>
    );
}
