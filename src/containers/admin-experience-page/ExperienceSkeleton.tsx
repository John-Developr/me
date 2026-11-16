import DashboardCard from "@/components/admin/DashboardCard";
import { PageHeaderSkeleton, SkeletonColumn, TableSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import { EXPERIENCE_SCREENS, ExperienceScreen } from "@/utils/admin/experienceSchema";
import adminStyles from "@/styles/pages/admin.module.css";

/** Loading screen for /admin/experience and /admin/education: same header, card, toolbar and table columns as ExperienceManager. */
export default function ExperienceSkeleton({ screen = "experience" }: { screen?: ExperienceScreen }) {
    const fixedType = EXPERIENCE_SCREENS[screen].type;

    const columns: SkeletonColumn[] = [
        { label: "Entry",    cell: "main" },
        ...(fixedType ? [] : [{ label: "Type", cell: "pill" } as const]),
        { label: "Dates",    cell: "text" },
        { label: "Duration", cell: "text" },
        { label: "Actions",  cell: "actions" },
    ];

    return (
        <div className={adminStyles.page} aria-busy="true" aria-label={`Loading ${screen}`}>
            <PageHeaderSkeleton page={screen} actions={[120]} />
            <DashboardCard title={fixedType ? "Education" : "Timeline"} icon={fixedType ? AdminIcons.GraduationCap : AdminIcons.Briefcase}>
                <ToolbarSkeleton filters={fixedType ? [] : ["All", "Work", "Education", "Milestones"]} search={`Search ${screen}`} />
                <TableSkeleton columns={columns} />
            </DashboardCard>
        </div>
    );
}
