import { useState } from "react";
import Styles from "@/styles/general/component.module.css";
import ArrowUp from "../icons/ArrowUp";
import { Role } from "@/config/assistantConfig";

type Props = {
    onSend: (input: string, callback: () => void) => void;
    lastContentRole: Role | undefined
};

export default function MessageInput({ onSend, lastContentRole }: Props) {
    const isLastMessageUserRole = lastContentRole === "user" || lastContentRole === "responding" || lastContentRole === "limit";
    const [inputValue, setInputValue] = useState<string>("")

    const handleOnInput = (e: React.FormEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);
    };

    const handleSendMessage = () => {
        if (inputValue.trim() !== "") {
            onSend(inputValue, () => {
                setInputValue("");
            })
        }
    };
    
    return (
        <div className={Styles.form}>
            <input
                type="text"
                value={inputValue}
                placeholder="Text message  •  ( John )"
                onInput={handleOnInput}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault(); 
                        onSend(inputValue, () => {
                            setInputValue("");
                        })
                    }
                }}
                disabled={isLastMessageUserRole}
            />
            <button 
                className={inputValue.trim() !== "" ? "unset" : Styles.none} 
                onClick={handleSendMessage}
            >
                <ArrowUp width="19" height="19" />
            </button>
        </div>
    );
}
