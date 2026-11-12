import DashboardCard from "@/components/admin/DashboardCard";
import { PageHeaderSkeleton, TableSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";

/** Loading screen for /admin/blog: same header, card, toolbar and table columns as BlogManager. */
export default function BlogSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading blog posts">
            <PageHeaderSkeleton page="blog" actions={[116]} />
            <DashboardCard title="Posts" icon={AdminIcons.FileText}>
                <ToolbarSkeleton filters={["All", "Published", "Drafts"]} search="Search posts" />
                <TableSkeleton
                    columns={[
                        { label: "Post",     cell: "main" },
                        { label: "Status",   cell: "status" },
                        { label: "Category", cell: "text" },
                        { label: "Views",    cell: "num" },
                        { label: "Date",     cell: "text" },
                        { label: "Actions",  cell: "actions" },
                    ]} />
            </DashboardCard>
        </div>
    );
}
