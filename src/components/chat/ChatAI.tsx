'use client'

import { useState } from "react";

import ChatButton from "./ChatButton";
import ChatBox from "./ChatBox";

import Image from "next/image";
import Styles from "@/styles/general/component.module.css"

export default function ChatAI() {
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [isShowChatContainer, isSetShowChatContainer] = useState<boolean>(false);
    const [styleChatContainer, setStyleChatContainer] = useState<string[]>([
        Styles.none, 
        "unset"
    ]);

    const handleClickChat = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const ANIMATION_DURATION = 500;

        if (isAnimating) return;
        setIsAnimating(true);

        const finishAnimation = () => {
            setIsAnimating(false);
        };

        if (!isShowChatContainer) {
            setStyleChatContainer([Styles.chatAnimateIn, Styles.isClick]);
            isSetShowChatContainer(true);

            setTimeout(finishAnimation, ANIMATION_DURATION);
            return;
        }

        isSetShowChatContainer(false);
        setStyleChatContainer([Styles.chatAnimateOut, "unset"]);

        setTimeout(() => {
            setStyleChatContainer([Styles.none, "unset"]);
            finishAnimation();
        }, ANIMATION_DURATION);
    };


    return (
        <div className={Styles.chatAI} id="chatAI">
            <div className={`${Styles["chat-container"]} ${styleChatContainer[0]}`}>
                <div className={Styles.mg}>
                    <div className={Styles.profile}>
                        <Image
                            src="/images/Avatar.png"
                            width={40}
                            height={40}
                            alt="Avatar"
                        />
                        <section>
                            <h3>Chat with John Carlo</h3>
                            <p>
                                <span className={Styles["online-icon"]}></span>
                                Online • Powered by Google Gemini
                            </p>
                        </section>
                    </div>
                    <hr />
                    <ChatBox />
                </div>
            </div>
           <ChatButton
                isShowChatContainer={isShowChatContainer}
                styleChatContainer={styleChatContainer}
                handleClickChat={handleClickChat}
            />
        </div>
    );
}