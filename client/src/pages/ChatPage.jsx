import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "../hooks/useChat.js";
import { ChatComposer } from "../components/ChatComposer.jsx";
import { ChatHeader } from "../components/ChatHeader.jsx";
import { ChatMessages } from "../components/ChatMessages.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { SettingsPanel } from "../components/SettingsPanel.jsx";

export const ChatPage = () => {
  const {
    messages,
    history,
    activeChatId,
    status,
    streamError,
    clearLocalChats
  } = useChat();

  const activeChat = history.find((chat) => chat.id === activeChatId);

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-1 flex-col lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-3 lg:px-6">
        <ChatHeader chat={activeChat} />

        <motion.div
          layout
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-glow backdrop-blur-2xl"
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <ChatMessages key={activeChatId || "messages"} messages={messages} />
            )}
          </AnimatePresence>

          <ChatComposer />
        </motion.div>

        {streamError ? (
          <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {streamError}
          </div>
        ) : null}

        {status === "streaming" ? (
          <div className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            Streaming response...
          </div>
        ) : null}
      </section>

      <SettingsPanel
        activeChat={activeChat}
        messages={messages}
        onClearLocalChats={clearLocalChats}
      />
    </div>
  );
};
