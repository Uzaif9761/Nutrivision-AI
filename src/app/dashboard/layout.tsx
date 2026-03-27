"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Apple,
  LayoutDashboard,
  Camera,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/scan", label: "Scan Food", icon: Camera },
    { href: "/log", label: "Food Log", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ═══ Sidebar ═══ */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[rgba(56,239,125,0.06)] bg-[rgba(5,10,14,0.95)] backdrop-blur-xl fixed h-full z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-[rgba(56,239,125,0.06)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#11998e] to-[#38ef7d] flex items-center justify-center">
            <Apple className="w-5 h-5 text-[#050a0e]" />
          </div>
          <span className="text-lg font-bold gradient-text">NutriVision</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(56,239,125,0.1)] text-[var(--accent)] border border-[rgba(56,239,125,0.15)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[rgba(56,239,125,0.06)]">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[rgba(248,81,73,0.06)] transition-all w-full">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ Mobile Bottom Nav ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[rgba(5,10,14,0.95)] border-t border-[rgba(56,239,125,0.06)]">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-xs transition-all ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══ Content ═══ */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
