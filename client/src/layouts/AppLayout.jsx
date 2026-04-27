import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-screen overflow-hidden bg-base text-slate-100">
      <div className="absolute inset-0 bg-hero-grid opacity-80" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-300/10 to-transparent" />

      <div className="relative flex min-h-screen">
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {!isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 hidden rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white backdrop-blur-xl lg:block"
          >
            Open Sidebar
          </button>
        ) : null}

        <main className="flex min-h-screen flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((current) => !current)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium uppercase tracking-[0.24em] text-slate-300">
              NovaMind
            </span>
            <div className="w-9" />
          </div>

          <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
        </main>
      </div>
    </div>
  );
};
