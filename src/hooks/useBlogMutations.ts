// hooks/useBlogMutations.ts
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import { networkDefine } from "@/config/networkDefine";
import { BlogPatch } from "@/utils/admin/blogSchema";
import { sendJson } from "@/utils/admin/sendJson";
import { BlogRecord } from "@/utils/types";

/**
 * useBlogMutations — quick actions on a blog post (publish, unpublish, delete)
 * shared by the blog list and the edit form. Shows a toast for each outcome
 * and refreshes server data on success.
 *
 * @example
 * const { patch, remove, pendingId } = useBlogMutations();
 * await patch(post, { status: "published" }, "Post published");
 */
export function useBlogMutations() {
    const router = useRouter();
    const [pendingId, setPendingId] = useState<number | null>(null);

    const run = useCallback(async (
        post: BlogRecord,
        method: "PATCH" | "DELETE",
        body: BlogPatch | undefined,
        successTitle: string,
    ): Promise<boolean> => {
        setPendingId(post.id);

        const res = await sendJson<BlogRecord>(networkDefine.ADMIN_BLOG_API(post.id), method, body);
        setPendingId(null);

        if (!res.result) {
            sileo.error({ title: "Couldn't update post", description: res.message });
            return false;
        }

        sileo.success({ title: successTitle, description: post.title });
        router.refresh();
        return true;
    }, [router]);

    const patch = useCallback(
        (post: BlogRecord, changes: BlogPatch, successTitle: string) => run(post, "PATCH", changes, successTitle),
        [run],
    );

    const remove = useCallback(
        (post: BlogRecord) => run(post, "DELETE", undefined, "Post deleted"),
        [run],
    );

    return { patch, remove, pendingId };
}
