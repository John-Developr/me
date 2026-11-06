'use client'

import { useCallback, useEffect, useRef, useState } from "react";

import Styles from "@/styles/general/component.module.css"
import ChatButton from "@/components/chat/ChatButton";
import ChatBox from "@/components/chat/ChatBox";
import SkeletonImage from "@/components/custom/SkeletonImage";

const ANIMATION_DURATION = 500;

export default function ChatAI() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const isAnimatingRef = useRef<boolean>(false);
    const [isShowChatContainer, isSetShowChatContainer] = useState<boolean>(false);
    const [styleChatContainer, setStyleChatContainer] = useState<string[]>([
        Styles.none, 
        "unset"
    ]);

    // ─── Open / close ───────────────────────────────────────────────

    const openChat = useCallback(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        setStyleChatContainer([Styles.chatAnimateIn, Styles.isClick]);
        isSetShowChatContainer(true);

        setTimeout(() => {
            isAnimatingRef.current = false;
        }, ANIMATION_DURATION);
    }, []);

    const closeChat = useCallback(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        isSetShowChatContainer(false);
        setStyleChatContainer([Styles.chatAnimateOut, "unset"]);

        setTimeout(() => {
            setStyleChatContainer([Styles.none, "unset"]);
            isAnimatingRef.current = false;
        }, ANIMATION_DURATION);
    }, []);

    const handleClickChat = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (isShowChatContainer) closeChat();
        else openChat();
    };

    // ─── Close on outside click / Escape ────────────────────────────

    useEffect(() => {
        if (!isShowChatContainer) return;

        // pointerdown (not click) so the check runs before React re-renders
        // anything inside the chat and detaches the clicked element.
        const handlePointerDown = (e: PointerEvent) => {
            // The root itself only "receives" clicks in the empty gap between
            // the box and the button — treat that as outside too.
            const root = rootRef.current;
            const target = e.target as Node | null;
            if (root && target && target !== root && root.contains(target)) return;
            closeChat();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeChat();
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isShowChatContainer, closeChat]);


    return (
        <div ref={rootRef} className={Styles.chatAI} id="chatAI">
            <div className={`${Styles["chat-container"]} ${styleChatContainer[0]}`}>
                <div className={Styles.mg}>
                    <div className={Styles.profile}>
                        <SkeletonImage
                            className={Styles.avatar}
                            path="/images/Avatar.jpg"
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
