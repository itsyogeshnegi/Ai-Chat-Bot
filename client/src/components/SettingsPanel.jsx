import { Download, Eraser, FileText, MonitorCog } from "lucide-react";
import { exportChatAsPdf, exportChatAsTxt } from "../utils/export.js";

export const SettingsPanel = ({ activeChat, messages, onClearLocalChats }) => (
  <aside className="hidden w-[320px] border-l border-white/10 bg-slate-950/40 p-4 xl:block">
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-accent">
          <MonitorCog className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Workspace settings</p>
          <p className="text-xs text-slate-400">Local-first controls</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => exportChatAsTxt({ title: activeChat?.title, messages })}
          disabled={!messages.length}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Export as TXT
        </button>
        <button
          type="button"
          onClick={() => exportChatAsPdf({ title: activeChat?.title, messages })}
          disabled={!messages.length}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export as PDF
        </button>
        <button
          type="button"
          onClick={onClearLocalChats}
          className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
        >
          <Eraser className="h-4 w-4" />
          Clear All Local Chats
        </button>
      </div>
    </div>
  </aside>
);
