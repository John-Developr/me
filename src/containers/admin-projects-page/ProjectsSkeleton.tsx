import DashboardCard from "@/components/admin/DashboardCard";
import { PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";

/** Loading screen for /admin/projects: same header, card, toolbar and table columns as ProjectsManager. */
export default function ProjectsSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading projects">
            <PageHeaderSkeleton page="projects" actions={[136]} />
            <DashboardCard title="Projects" icon={AdminIcons.Folder}>
                <ToolbarSkeleton filters={["All", "Published", "Drafts"]} search="Search projects" />
                <TableSkeleton
                    columns={[
                        { label: "Project", cell: "main" },
                        { label: "Status",  cell: "status" },
                        { label: "Order",   cell: "num" },
                        { label: "Updated", cell: "text" },
                        { label: "Actions", cell: "actions" },
                    ]} />
            </DashboardCard>
        </div>
    );
}
