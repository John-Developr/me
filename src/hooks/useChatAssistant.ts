import { useState, useEffect } from "react";
import { assistantConfig, AssistantConfig, Role, filteredRoles } from "@/config/assistantConfig";

export const useChatAssistant = () => {
  const [assistant, setAssistant] = useState<AssistantConfig>(assistantConfig);

  const RESPONDING_TRANSITION_DELAY = 400;
  const FINAL_RESPONSE_DELAY = 1000;

  const handleSendMessage = (message: string, callback?: () => void) => {
    if (!message) return;

    const updated = { ...assistant };
    updated.pushContent("user", message);
    setAssistant(updated);

    callback?.();
  };

  const updateAssistant = (role: Role, message: string) => {
    setTimeout(() => {
      assistant.popLastContent(); // remove "responding"
      assistant.pushContent(role, message);
      setAssistant({ ...assistant });
    }, FINAL_RESPONSE_DELAY);
  };

  useEffect(() => {
    const last = assistant.contents.at(-1);

    if (!last) return;
    if (filteredRoles("user").includes(last.role)) return;

    assistant.pushContent("responding", "");

    setTimeout(() => {
      setAssistant({ ...assistant });
    }, RESPONDING_TRANSITION_DELAY);

    const fetchReply = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: last.parts?.[0]?.text ?? "",
          }),
        });

        const data = await res.json();

        if (data.reply) {
          updateAssistant("model", data.reply);
        } else {
          updateAssistant(
            "warning",
            "Sorry, I'm not able to provide a reply at the moment."
          );
        }
      } catch {
        updateAssistant(
          "error",
          "Oops! Something went wrong. Please try again later."
        );
      }
    };

    fetchReply();
  }, [assistant]);

  return {
    assistant,
    handleSendMessage,
  };
};
