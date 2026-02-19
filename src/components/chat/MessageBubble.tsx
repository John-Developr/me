import Image from "next/image";
import Styles from "@/styles/general/component.module.css";
import { Message, filteredRoles, assistantConfig } from "@/config/assistantConfig";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import Synchronize from "@/components/icons/Synchronize";
import { useRef } from "react";

interface MessageBubbleProps {
    message: Message;
    handleNewConversation: (callback?: () => void) => void;
}

export default function MessageBubble({ message, handleNewConversation }: MessageBubbleProps) {
    const { role, parts } = message;  
    const newConvoBtnRef = useRef<HTMLButtonElement>(null);

    const handleClickNewConversation = () => {
        let ref = newConvoBtnRef.current;
        
        if (!ref) 
            return;

        ref.classList.add(Styles["animate-spin-icon"]);
        handleNewConversation(() => {
            ref.classList.remove(Styles["animate-spin-icon"]);
        });
    }

    return (
        <div className={filteredRoles("user").includes(role) ? Styles.john : Styles.user}>
            {(filteredRoles("user").includes(role)) && (
                <div className={Styles["profile-msg"]}>
                    <Image
                        src="/images/avatar.png"
                        width={30}
                        height={30}
                        alt="Avatar"
                    />
                </div>
            )}
            <div className={Styles.message}>
                {role === "responding" && (
                    <div className={Styles["typing-indicator"]}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {role === "limit" && (
                    <div className={Styles["limit-container"]}>
                        <div className={Styles["limit-message"]}>
                            <p>
                                ⚠️ Sorry, You've reached the maximum conversation limit. 
                                A new conversation will start if you click the button below.
                            </p>
                        </div>
                        <button 
                            className={Styles["new-convo-btn"]}
                            onClick={handleClickNewConversation} // your function to clear & reset
                            ref={newConvoBtnRef}
                        >
                            <Synchronize width={13} height={13} /> Start New Conversation
                        </button>
                    </div>
                )}

                {parts.map(({ text }, idx) => (
                    <Markdown
                        key={idx}
                        remarkPlugins={[remarkGfm]}
                        children={text}
                        components={{
                        code(props) {
                            const {children, className, node, ...rest} = props
                            const match = /language-(\w+)/.exec(className || '')

                            return match ? (
                                <SyntaxHighlighter
                                    PreTag="div"
                                    children={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                    style={dracula}
                                />
                            ) : (
                                <code {...rest} className={className}>
                                    {children}
                                </code>
                            )
                        }
                        }}
                    />
                ))}
            </div>
        </div>
    );
}