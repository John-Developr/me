import { z } from "zod";

import { optionalAssetRef, optionalText } from "./fieldSchemas";

/* ============================================================
   EXPERIENCE VALIDATION
   ------------------------------------------------------------
   Shared by the Work Experience form and the API. Months come
   from <input type="month"> ("2024-01") and are stored as the
   first day of the month ("2024-01-01").
   ============================================================ */

export const EXPERIENCE_TYPES = ["work", "education", "milestone"] as const;
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"] as const;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2024-01" → "2024-01-01"; also accepts a full date from the API. */
const monthField = (label: string) =>
  z.string()
    .trim()
    .transform((v) => v.slice(0, 7))
    .refine((v) => MONTH.test(v), `${label} must be a month, e.g. 2024-01.`)
    .transform((v) => `${v}-01`);

/** Empty string / missing → null (e.g. "I currently work here"). */
const optionalMonth = (label: string) =>
  z.preprocess((v) => (v === "" || v === undefined ? null : v), monthField(label).nullable());

/** First day of the current month, for "not in the future" checks. */
const thisMonth = () => `${new Date().toISOString().slice(0, 7)}-01`;

export const experienceInputSchema = z.object({
  entry_type:      z.enum(EXPERIENCE_TYPES, "Choose a type."),
  company:         z.string().trim().min(1, "This field is required.").max(160, "Use 160 characters or fewer."),
  position:        z.string().trim().min(1, "This field is required.").max(160, "Use 160 characters or fewer."),
  employment_type: z.preprocess((v) => (v === "" ? null : v), z.enum(EMPLOYMENT_TYPES).nullable().optional())
                     .transform((v) => v ?? null),
  location:        optionalText(120, "Location"),
  start_date:      monthField("Start"),
  end_date:        optionalMonth("End"),
  description:     optionalText(5000, "Description"),
  logo_url:        optionalAssetRef("Logo"),
})
  .superRefine((d, ctx) => {
    if (d.entry_type === "milestone" && d.end_date) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "A milestone has a single date. Remove the end date." });
    }
    if (d.end_date && d.end_date < d.start_date) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "The end can't be before the start." });
    }
    if (d.start_date > thisMonth()) {
      ctx.addIssue({ code: "custom", path: ["start_date"], message: "The start can't be in the future." });
    }
    if (d.end_date && d.end_date > thisMonth()) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "The end can't be in the future. Leave it empty if this is current." });
    }
  })
  // Employment type only means something for jobs.
  .transform((d) => ({ ...d, employment_type: d.entry_type === "work" ? d.employment_type : null }));

export type ExperienceInput = z.output<typeof experienceInputSchema>;

/** Wording that changes with the entry type (form labels, list badges). */
export const EXPERIENCE_LABELS = {
  work:      { type: "Work",      company: "Company",   position: "Role",            plural: "Work" },
  education: { type: "Education", company: "School",    position: "Degree / course", plural: "Education" },
  milestone: { type: "Milestone", company: "Title",     position: "Description",     plural: "Milestones" },
} as const;
