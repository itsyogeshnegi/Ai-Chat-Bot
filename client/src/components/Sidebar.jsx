import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useChat } from "../hooks/useChat.js";

export const Sidebar = ({ open, onClose }) => {
  const { logout, user } = useAuth();
  const {
    history,
    activeChatId,
    selectChat,
    createNewChat,
    renameChat,
    toggleFavorite,
    deleteChat,
    search,
    updateSearch
  } = useChat();
  const [renamingId, setRenamingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const favorites = useMemo(
    () => history.filter((chat) => chat.isFavorite),
    [history]
  );

  const commitRename = async () => {
    if (!renamingId || !draftTitle.trim()) {
      setRenamingId(null);
      return;
    }

    await renameChat(renamingId, draftTitle);
    setRenamingId(null);
    setDraftTitle("");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          className="fixed inset-y-0 left-0 z-30 flex w-[310px] flex-col border-r border-white/10 bg-slate-950/70 p-4 backdrop-blur-2xl lg:static"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">NovaMind</p>
              <p className="mt-2 text-lg font-semibold text-white">Local AI cockpit</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300 lg:hidden"
            >
              Close
            </button>
          </div>

          <button
            type="button"
            onClick={() => createNewChat()}
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <SectionLabel icon={Heart} title="Saved Chats" count={favorites.length} />
            <div className="space-y-2">
              {favorites.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  active={activeChatId === chat.id}
                  renamingId={renamingId}
                  draftTitle={draftTitle}
                  onDraftTitle={setDraftTitle}
                  onStartRename={() => {
                    setRenamingId(chat.id);
                    setDraftTitle(chat.title);
                  }}
                  onCommitRename={commitRename}
                  onSelect={() => selectChat(chat.id)}
                  onToggleFavorite={() => toggleFavorite(chat)}
                  onDelete={() => deleteChat(chat.id)}
                />
              ))}
            </div>

            <SectionLabel icon={Settings} title="Chat History" count={history.length} />
            <div className="space-y-2">
              {history.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  active={activeChatId === chat.id}
                  renamingId={renamingId}
                  draftTitle={draftTitle}
                  onDraftTitle={setDraftTitle}
                  onStartRename={() => {
                    setRenamingId(chat.id);
                    setDraftTitle(chat.title);
                  }}
                  onCommitRename={commitRename}
                  onSelect={() => selectChat(chat.id)}
                  onToggleFavorite={() => toggleFavorite(chat)}
                  onDelete={() => deleteChat(chat.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="mt-1 text-xs text-slate-400">{user?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 flex items-center gap-2 text-sm text-slate-300"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

const SectionLabel = ({ icon: Icon, title, count }) => (
  <div className="mb-3 mt-6 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </div>
    <span>{count}</span>
  </div>
);

const ChatRow = ({
  chat,
  active,
  renamingId,
  draftTitle,
  onDraftTitle,
  onStartRename,
  onCommitRename,
  onSelect,
  onToggleFavorite,
  onDelete
}) => (
  <div
    className={`rounded-2xl border px-3 py-3 transition ${
      active
        ? "border-accent/40 bg-accent/10"
        : "border-white/10 bg-white/5 hover:bg-white/10"
    }`}
  >
    <button type="button" onClick={onSelect} className="w-full text-left">
      {renamingId === chat.id ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(event) => onDraftTitle(event.target.value)}
          onBlur={onCommitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onCommitRename();
            }
          }}
          className="w-full rounded-xl bg-slate-950/60 px-2 py-1 text-sm text-white outline-none"
        />
      ) : (
        <p className="truncate text-sm font-medium text-white">{chat.title}</p>
      )}
      <p className="mt-2 truncate text-xs text-slate-400">{chat.lastMessagePreview || "No messages yet"}</p>
    </button>

    <div className="mt-3 flex items-center gap-3 text-slate-400">
      <button type="button" onClick={onStartRename} className="hover:text-white">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={onToggleFavorite} className="hover:text-white">
        <Heart className={`h-4 w-4 ${chat.isFavorite ? "fill-current text-accent" : ""}`} />
      </button>
      <button type="button" onClick={onDelete} className="hover:text-rose-200">
        <Trash2 className="h-4 w-4" />
      </button>
      <span className="ml-auto rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {chat.model}
      </span>
    </div>
  </div>
);
