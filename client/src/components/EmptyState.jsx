import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="grid flex-1 place-items-center px-6 py-10"
  >
    <div className="max-w-xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-accent/10 text-accent">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-white">Prompt into the future</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Your conversations stream directly from your local Ollama models, with light
        MongoDB metadata on the backend and full transcripts stored in your browser.
      </p>
    </div>
  </motion.div>
);
