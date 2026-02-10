import Image from "next/image";
import Styles from "@/styles/general/chatAI.module.css";
import { Message, filteredRoles } from "@/config/assistantConfig";

// import { formatMessageBubbleString } from "@/utils/string";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MessageBubble({ message }: { message: Message }) {
    const { role, parts } = message;

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