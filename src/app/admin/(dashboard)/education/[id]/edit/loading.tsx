import ExperienceFormSkeleton from "@/containers/admin-experience-form-page/ExperienceFormSkeleton";

/** Same layout as the edit education form, so nothing jumps when it loads. */
export default function Loading() {
  return <ExperienceFormSkeleton screen="education" />;
}
