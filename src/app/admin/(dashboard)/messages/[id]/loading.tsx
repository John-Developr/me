import MessageDetailSkeleton from "@/containers/admin-message-detail-page/MessageDetailSkeleton";

/** Same toolbar and email card as the message view, so nothing jumps when it loads. */
export default function Loading() {
  return <MessageDetailSkeleton />;
}
