import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useChat } from "../hooks/useChat.js";

export const ChatComposer = () => {
  const { sendMessage, status } = useChat();
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    const prompt = value.trim();

    if (!prompt || status === "streaming") {
      return;
    }

    setValue("");
    await sendMessage({ prompt });
  };

  return (
    <div className="border-t border-white/10 bg-slate-950/20 p-4 lg:p-5">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-3">
        <textarea
          rows={3}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Message your local AI model..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-slate-500"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Enter to send • Shift+Enter for newline
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "streaming"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-highlight text-slate-950 transition hover:scale-[1.03] disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
