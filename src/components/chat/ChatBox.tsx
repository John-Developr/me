import Image from "next/image";
import { useEffect, useRef } from "react";

import Styles from "@/styles/general/chatAI.module.css"

import { useChatAssistant } from "@/hooks/useChatAssistant";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatBox() {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const { assistant, handleSendMessage } = useChatAssistant();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [assistant]); 

    return (
        <>
            <div className={Styles["chat-messages"]}>
                <div className={Styles.john}>
                    <div className={Styles["profile-msg"]}>
                        <Image
                            src="/images/avatar.png"
                            width={30}
                            height={30}
                            alt="Avatar"
                        />
                    </div>
                    <div className={Styles.message}>
                        Hi there! 👋🏻 Thanks for visiting my website. 
                        Feel free to ask me anything about programming, web development, or my experiences in tech. 
                        Let me know how I can help!
                    </div>
                </div> 
                {assistant.contents.map((message, idx) => (
                    <MessageBubble key={idx} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput
                onSend={handleSendMessage}
                lastContentRole={assistant.getLastRole()}
            />
        </>
    );
}
