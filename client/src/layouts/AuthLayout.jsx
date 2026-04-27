import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <div className="relative min-h-screen overflow-hidden bg-base text-white">
    <div className="absolute inset-0 bg-hero-grid opacity-90" />
    <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />
    <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <Outlet />
    </div>
  </div>
);
