import Styles from "@/styles/general/chatAI.module.css"

// SVG
import XMark from "../icons/XMark";
import MessageSquare from "../icons/MessageSquare";

interface ChatButtonProps {
    isShowChatContainer: boolean;
    styleChatContainer: string[];
    handleClickChat: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function chatButton({
    isShowChatContainer,
    styleChatContainer,
    handleClickChat,
}: ChatButtonProps) {

    if (isShowChatContainer) {
        return (
            <a 
                href="#" 
                onClick={handleClickChat} 
                className={Styles.isClick}
            >
                <span className={Styles.icon}>
                    <XMark width="18" height="18" />
                </span>
            </a>
        )
    }

    return (
        <a
            href="#"
            onClick={handleClickChat}
            className={styleChatContainer[1]}
        >
            <span className={Styles.icon}>
                <MessageSquare width="17.5" height="17.5" />
            </span>
            Chat with <b>John</b>
        </a>
    );
}