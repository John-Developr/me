import { cache } from "react";

import ExperienceService from "@/lib/.services/experienceService";
import { buildTimeline } from "@/utils/experienceTimeline";
import { TimelineGroup } from "@/utils/types";

/**
 * The home page "Experience." timeline, managed in /admin/experience.
 * Built on the server (durations use today's date) so the client renders
 * plain labels.
 *
 * Throws on database errors: the page is ISR, so a failed refresh keeps
 * serving the last good page.
 */
export const getPublicExperience = cache(async (): Promise<TimelineGroup[]> =>
  buildTimeline(await ExperienceService.getPublic(), new Date())
);
