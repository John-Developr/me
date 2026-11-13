import DashboardCard from "@/components/admin/DashboardCard";
import PageHeader from "@/components/admin/PageHeader";
import Skeleton from "@/components/admin/Skeleton";
import {
    AssetFieldSkeleton, CheckboxSkeleton, CONTROL_HEIGHT, DangerZoneSkeleton,
    FieldSkeleton, MetaSkeleton, RadiosSkeleton, SaveBarSkeleton,
} from "@/components/admin/FormSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import { PROJECT_LIMITS } from "@/utils/admin/projectSchema";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

/**
 * Loading screen for /admin/projects/[id]/edit: the same header, cards,
 * labels and save bar as ProjectForm, with shimmering controls. (Adding a
 * project has no skeleton: there is no data to wait for.)
 */
export default function ProjectFormSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading project">
            <PageHeader
                title="Edit Project"
                description="Changes go live on your Projects page as soon as you save a published project." />

            <div className={formStyles.form}>
                <div className={formStyles["form-main"]}>
                    <DashboardCard title="Basics" icon={AdminIcons.FileText}>
                        <div className={formStyles.fields}>
                            <FieldSkeleton label="Title" required />
                            <FieldSkeleton label="Slug" required hint="Unique ID used in the page markup. Lowercase letters, numbers and hyphens." />
                            <FieldSkeleton label="Tagline" hint="One line under the title." />
                            <FieldSkeleton label="Description" height={CONTROL_HEIGHT.textarea5} />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Details" icon={AdminIcons.Briefcase} subtitle="Shown on the project card. All optional.">
                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FieldSkeleton label="Type" />
                            <FieldSkeleton label="Period" hint="e.g. 2023 – Present" />
                            <FieldSkeleton label="Your role" />
                            <FieldSkeleton label="Company / school" />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Highlights & tech" icon={AdminIcons.Code}>
                        <div className={formStyles.fields}>
                            <FieldSkeleton
                                label="Highlights"
                                hint={`Short bullet points, up to ${PROJECT_LIMITS.highlights}.`}
                                control={<Skeleton width={130} height={CONTROL_HEIGHT.button} radius={8} />} />
                            <FieldSkeleton label="Built with" hint="Press Enter or comma to add. Known names get their logo on the site." />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Links" icon={AdminIcons.ExternalLink}>
                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FieldSkeleton label="Live site URL" />
                            <FieldSkeleton label="Button label" hint='Default: "Open Live Site"' />
                            <FieldSkeleton label="Source code URL" />
                            <FieldSkeleton label="Button label" hint='Default: "View Source Code"' />
                        </div>
                        <div className={formStyles.fields}>
                            <FieldSkeleton label="Note" hint="Shown under the links, e.g. why the source isn't public." />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Images" icon={AdminIcons.Image} subtitle="Choose from the Media Library, or upload there.">
                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FieldSkeleton label="Logo" note="Square image" control={<AssetFieldSkeleton shape="square" />} />
                            <FieldSkeleton label="Screenshot" note="Shown on the featured card" control={<AssetFieldSkeleton shape="wide" />} />
                        </div>
                    </DashboardCard>
                </div>

                <aside className={formStyles["form-side"]}>
                    <DashboardCard title="Publishing" icon={AdminIcons.Globe}>
                        <RadiosSkeleton options={[
                            { title: "Draft",     text: "Only visible here" },
                            { title: "Published", text: "Shown on your Projects page" },
                        ]} />
                        <CheckboxSkeleton title="Featured project" text="The large card at the top. Replaces the current featured project." />
                        <FieldSkeleton label="Display order" hint="Lower numbers appear first." />
                        <MetaSkeleton labels={["Created", "Last saved"]} />
                    </DashboardCard>

                    <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                        <DangerZoneSkeleton hint="Deleting is permanent. To hide a project, set it to Draft instead." label="Delete project" />
                    </DashboardCard>
                </aside>

                <SaveBarSkeleton edit />
            </div>
        </div>
    );
}
