import { z } from "zod";

/* ============================================================
   ACCOUNT VALIDATION
   ------------------------------------------------------------
   Shared by the Account Settings form and the API. Supabase may
   enforce stricter password rules (Auth → Policies); its message
   is shown when it rejects a password these rules allowed.
   ============================================================ */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;   // bcrypt (Supabase Auth) ignores bytes past 72

export const displayNameSchema = z.object({
  displayName: z.string().trim().min(1, "Enter a name.").max(80, "Name must be 80 characters or fewer."),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(200),
  newPassword:     z.string()
                     .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
                     .max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer.`)
                     .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), "Include at least one letter and one number."),
  confirmPassword: z.string(),
  /** Also end every other session (recommended after a password change). */
  signOutOthers:   z.boolean().default(true),
})
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match." })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ["newPassword"], message: "Choose a password different from your current one." });
