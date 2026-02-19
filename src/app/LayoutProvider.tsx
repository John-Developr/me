import Preloader from "@/containers/preloader-page/Preloader";
import ChatAI from "@/components/chat/ChatAI";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <Preloader>
      <div className="wrapper">
        <main className="content">
          {children}
        </main>
        <ChatAI />
      </div>
    </Preloader>
  );
}