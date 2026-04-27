import { motion } from "framer-motion";
import { Copy, RotateCcw } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "../hooks/useChat.js";
import { estimateWordsPerMinute } from "../utils/chat.js";

const CodeBlock = lazy(() => import("./CodeBlock.jsx"));

export const MessageBubble = ({ message, canRegenerate }) => {
  const { sendMessage } = useChat();
  const [copied, setCopied] = useState(false);
  const assistant = message.role === "assistant";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${assistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-3xl rounded-[28px] border px-5 py-4 shadow-lg ${
          assistant
            ? "border-white/10 bg-slate-950/40"
            : "border-accent/20 bg-gradient-to-br from-accent/20 to-highlight/20"
        }`}
      >
        <div className="prose prose-invert max-w-none prose-pre:rounded-2xl prose-code:text-emerald-200">
          {assistant ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  return (
                    <Suspense fallback={<code className={props.className}>{props.children}</code>}>
                      <CodeBlock {...props} />
                    </Suspense>
                  );
                }
              }}
            >
              {message.content || (message.pending ? "Thinking..." : "")}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-50">{message.content}</p>
          )}
        </div>

        {assistant ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 hover:text-white">
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
            {canRegenerate ? (
              <button
                type="button"
                onClick={() => sendMessage({ regenerate: true })}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            ) : null}
            {message.metrics ? (
              <span>
                {message.metrics.estimatedTokens} est. tokens • {message.metrics.durationMs} ms •{" "}
                {estimateWordsPerMinute(message.metrics)} wpm
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};
