import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble.jsx";

export const ChatMessages = ({ messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 space-y-4 overflow-y-auto px-4 py-5 lg:px-6"
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          canRegenerate={message.role === "assistant" && index === messages.length - 1}
        />
      ))}
    </motion.div>
  );
};
