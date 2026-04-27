import { Sparkles } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { MODELS } from "../utils/chat.js";

export const ChatHeader = ({ chat }) => {
  const { activeModel, updateModel } = useChat();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Conversation</p>
        <h1 className="mt-2 text-xl font-semibold text-white">
          {chat?.title || "Start a new flow"}
        </h1>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
        <Sparkles className="h-4 w-4 text-accent" />
        <span>Model</span>
        <select
          value={activeModel}
          onChange={(event) => updateModel(event.target.value)}
          className="bg-transparent text-white outline-none"
        >
          {MODELS.map((model) => (
            <option key={model} value={model} className="bg-slate-900">
              {model}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
};
