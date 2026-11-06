// hooks/useProjectMutations.ts
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import { networkDefine } from "@/config/networkDefine";
import { ProjectPatch } from "@/utils/admin/projectSchema";
import { ProjectRecord } from "@/utils/types";

/** API reply for project writes. */
export interface ProjectApiResponse {
    result:   boolean;
    message:  string;
    data?:    ProjectRecord;
    errors?:  Record<string, string>;
}

/**
 * useProjectMutations — quick actions on a project (publish, feature, delete)
 * shared by the projects list and the edit form. Shows a toast for each
 * outcome and refreshes server data on success.
 *
 * @example
 * const { patch, remove, pendingId } = useProjectMutations();
 * await patch(project, { status: "published" }, "Project published.");
 */
export function useProjectMutations() {
    const router = useRouter();
    const [pendingId, setPendingId] = useState<string | null>(null);

    const send = useCallback(async (
        project: ProjectRecord,
        init: RequestInit,
        successTitle: string,
    ): Promise<boolean> => {
        setPendingId(project.id);

        try {
            const res  = await fetch(networkDefine.ADMIN_PROJECT_API(project.id), {
                ...init,
                headers: { "Content-Type": "application/json" },
            });
            const json = (await res.json().catch(() => null)) as ProjectApiResponse | null;

            if (!res.ok || !json?.result) {
                sileo.error({ title: "Couldn't update project", description: json?.message ?? "Please try again." });
                return false;
            }

            sileo.success({ title: successTitle, description: project.title });
            router.refresh();
            return true;
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
            return false;
        } finally {
            setPendingId(null);
        }
    }, [router]);

    const patch = useCallback(
        (project: ProjectRecord, changes: ProjectPatch, successTitle: string) =>
            send(project, { method: "PATCH", body: JSON.stringify(changes) }, successTitle),
        [send],
    );

    const remove = useCallback(
        (project: ProjectRecord) => send(project, { method: "DELETE" }, "Project deleted"),
        [send],
    );

    return { patch, remove, pendingId };
}
