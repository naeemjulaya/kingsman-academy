"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface MenuItem {
  title: string;
  href: string;
  icon: string;
}

const MENU_ITEMS: Record<string, MenuItem[]> = {
  ESTUDANTE: [
    { title: "Dashboard", href: "/estudante", icon: "dashboard" },
    { title: "Minhas Cadeiras", href: "/estudante/cadeiras", icon: "book" },
    { title: "Aulas", href: "/estudante/aulas", icon: "play_circle" },
    { title: "Pagamentos", href: "/estudante/pagamento", icon: "payments" },
    { title: "Redes Sociais", href: "/estudante/redes-sociais", icon: "share" },
    { title: "Perfil", href: "/estudante/perfil", icon: "account_circle" },
  ],
  EXPLICADOR: [
    { title: "Dashboard", href: "/explicador", icon: "co_present" },
    { title: "Minhas Cadeiras", href: "/explicador/cadeiras", icon: "book" },
    { title: "Aulas", href: "/explicador/aulas", icon: "play_circle" },
    { title: "Estudantes", href: "/explicador/estudantes", icon: "group" },
    { title: "Materiais", href: "/explicador/materiais", icon: "folder" },
    { title: "Perfil", href: "/explicador/perfil", icon: "account_circle" },
  ],
  COORDENADOR: [
    { title: "Dashboard", href: "/coordenador", icon: "analytics" },
    { title: "Cadeiras", href: "/coordenador/cadeiras", icon: "book" },
    { title: "Explicadores", href: "/coordenador/explicadores", icon: "co_present" },
    { title: "Estudantes", href: "/coordenador/estudantes", icon: "group" },
    { title: "Pagamentos", href: "/coordenador/pagamentos", icon: "payments" },
    { title: "Inscrições", href: "/coordenador/inscricoes", icon: "assignment" },
    { title: "Mensagens", href: "/coordenador/mensagens", icon: "chat" },
    { title: "Perfil", href: "/coordenador/perfil", icon: "account_circle" },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/admin", icon: "admin_panel_settings" },
    { title: "Utilizadores", href: "/admin/utilizadores", icon: "manage_accounts" },
    { title: "Cadeiras", href: "/admin/cadeiras", icon: "menu_book" },
    { title: "Explicadores", href: "/admin/explicadores", icon: "diversity_3" },
    { title: "Vídeos", href: "/admin/videos", icon: "video_library" },
    { title: "Materiais", href: "/explicador/materiais", icon: "folder" },
    { title: "Pagamentos", href: "/admin/pagamentos", icon: "receipt_long" },
    { title: "Inscrições", href: "/admin/inscricoes", icon: "assignment" },
    { title: "Métricas", href: "/admin/metricas", icon: "analytics" },
    { title: "Configurações", href: "/admin/configuracoes", icon: "settings" },
  ],
};

export function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = MENU_ITEMS[user.role] || MENU_ITEMS.ESTUDANTE;

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const linkClass = (href: string) => {
    // The role dashboard is the parent of every role route, so it must only
    // match exactly. Nested navigation items may continue matching by prefix.
    const isDashboard = href === menuItems[0]?.href;
    const isActive = isDashboard
      ? pathname === href
      : pathname === href || pathname?.startsWith(href + "/");
    return cn(
      "flex items-center gap-3 rounded-lg p-2.5 transition-all text-sm font-semibold select-none cursor-pointer",
      {
        "bg-[rgba(255,72,255,0.08)] text-[#FF48FF] border-l-2 border-[#FF48FF]": isActive,
        "text-[#808080] hover:text-[#FF48FF] hover:bg-[rgba(255,72,255,0.05)]": !isActive,
      }
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1b1019] border border-border/10 rounded-lg text-primary cursor-pointer"
      >
        <span className="material-symbols-outlined">
          {isOpen ? "close" : "menu"}
        </span>
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "flex flex-col h-screen fixed left-0 top-0 z-40 bg-[#150b14] md:bg-[#150b14]/90 backdrop-blur-xl border-r border-primary/10 shadow-xl w-[260px] transition-transform duration-300 md:translate-x-0",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          }
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-primary/10">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
            <span className="font-playfair text-[#FF48FF] font-bold text-lg">K</span>
          </div>
          <span className="font-playfair text-[#FF48FF] tracking-widest font-bold text-lg">KINGSMAN</span>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={linkClass(item.href)}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-primary/10 bg-surface-container-lowest/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center bg-gradient-to-br from-[#2E0D2E] to-[#641C63]">
              {user.avatarUrl ? (
                <img
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  src={user.avatarUrl}
                />
              ) : (
                <span className="text-sm font-bold text-[#E8E8E8]">
                  {user.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                </span>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-on-surface truncate">{user.fullName}</p>
              <p className="text-[10px] text-[#808080] uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#808080] transition-all duration-200 hover:bg-[rgba(255,72,255,0.05)] hover:text-[#FF48FF] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
}
