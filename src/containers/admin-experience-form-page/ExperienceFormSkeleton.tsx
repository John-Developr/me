import DashboardCard from "@/components/admin/DashboardCard";
import PageHeader from "@/components/admin/PageHeader";
import Skeleton from "@/components/admin/Skeleton";
import {
    AssetFieldSkeleton, CheckboxSkeleton, CONTROL_HEIGHT, DangerZoneSkeleton,
    FieldSkeleton, MetaSkeleton, RadiosSkeleton, SaveBarSkeleton,
} from "@/components/admin/FormSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminExperience.module.css";

/**
 * Loading screen for /admin/experience/[id]/edit: the same header, cards,
 * labels and save bar as ExperienceForm, laid out for a Work entry (the most
 * common type). Adding an entry has no skeleton: there is no data to wait for.
 */
export default function ExperienceFormSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading experience">
            <PageHeader
                title="Edit Experience"
                description="Saved changes appear on your home page right away." />

            <div className={formStyles.form}>
                <div className={formStyles["form-main"]}>
                    <DashboardCard title="Type" icon={AdminIcons.Layers}>
                        <RadiosSkeleton row options={[
                            { title: "Work",      text: "A role at a company" },
                            { title: "Education", text: "A degree or course" },
                            { title: "Milestone", text: "A single moment" },
                        ]} />
                    </DashboardCard>

                    <DashboardCard title="Details" icon={AdminIcons.Briefcase}>
                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FieldSkeleton label="Company" required hint="Use the same name for each role to group them." />
                            <FieldSkeleton label="Role" required />
                            <FieldSkeleton label="Employment type" />
                            <FieldSkeleton label="Location" hint="Optional, e.g. Cebu City or Remote" />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Dates" icon={AdminIcons.Clock}>
                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FieldSkeleton label="Start" required />
                            <FieldSkeleton label="End" />
                        </div>
                        <CheckboxSkeleton title="I currently work here" text="Shows “Present” and counts the duration up to this month." />
                    </DashboardCard>

                    <DashboardCard title="More" icon={AdminIcons.FileText}>
                        <div className={formStyles.fields}>
                            <FieldSkeleton label="Logo" note="Square image" control={<AssetFieldSkeleton shape="square" />} />
                            <FieldSkeleton label="Description" hint="Optional notes. Not shown on the home page yet." height={CONTROL_HEIGHT.textarea4} />
                        </div>
                    </DashboardCard>
                </div>

                <aside className={formStyles["form-side"]}>
                    <DashboardCard title="Preview" icon={AdminIcons.Eye} subtitle="How this line reads on the home page.">
                        <div className={styles.preview}>
                            <span className={styles["preview-logo"]} aria-hidden="true">
                                <AdminIcons.Briefcase width={14} height={14} />
                            </span>
                            <div>
                                <h4><Skeleton width={120} height={14} /></h4>
                                <p className={styles.position}><Skeleton width={90} height={12} /></p>
                                <p><Skeleton width={140} height={12} /></p>
                            </div>
                        </div>
                        <p className={formStyles["field-hint"]}>
                            Several roles at the same company show together, each with its duration.
                        </p>
                        <MetaSkeleton labels={["Created", "Last saved"]} />
                    </DashboardCard>

                    <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                        <DangerZoneSkeleton hint="Deleting removes this line from your timeline. It can't be undone." label="Delete entry" />
                    </DashboardCard>
                </aside>

                <SaveBarSkeleton edit />
            </div>
        </div>
    );
}
