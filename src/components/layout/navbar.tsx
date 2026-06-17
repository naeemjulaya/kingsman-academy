"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createClient();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const isAdmin = pathname?.startsWith("/admin");
  const isCoordenador = pathname?.startsWith("/coordenador");
  const isExplicador = pathname?.startsWith("/explicador");
  
  let roleTitle = "Painel de Estudante";
  if (isAdmin) roleTitle = "Painel de Administração";
  else if (isCoordenador) roleTitle = "Painel de Coordenação";
  else if (isExplicador) roleTitle = "Painel de Explicador";

  const firstName = user?.fullName?.split(" ")[0] || "Utilizador";
  const greeting = isAdmin ? "Painel de Administração" : `Bom dia, ${firstName}`;

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateStr = new Date().toLocaleDateString("pt-PT", options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-primary/10">
      <div>
        <h2 className="font-playfair text-xl md:text-2xl font-bold text-on-surface">
          {greeting}
        </h2>
        <p className="text-xs text-on-surface-variant/70 font-medium">
          {formatDate()}
        </p>
      </div>

      <div className="flex items-center gap-6 relative">
        {/* Notifications Icon & Panel */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 rounded-full hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all cursor-pointer relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border border-[#0A0A0A] shadow-[0_0_8px_#FF48FF]"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-xl shadow-2xl p-4 z-50 text-sm space-y-3">
              <div className="flex justify-between items-center border-b border-border/10 pb-2">
                <span className="font-bold text-primary">Notificações</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {unreadNotifications} Novas
                  </span>
                  {unreadNotifications > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-[10px] text-on-surface-variant hover:text-primary transition-colors">
                      Ler todas
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center text-on-surface-variant py-4">Sem notificações.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-surface-container/40 ${
                        !notif.is_read ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs">{notif.title}</span>
                        <span className="text-[9px] text-[#808080]">
                          {new Date(notif.created_at).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant/80 mt-0.5 leading-relaxed">
                        {notif.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-outline/20"></div>

        {/* User Account Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors bg-surface-container-low flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src={user.avatarUrl}
                />
              ) : (
                <span className="material-symbols-outlined text-xl text-on-surface-variant">person</span>
              )}
            </div>
            <span className="material-symbols-outlined text-sm text-[#808080] group-hover:text-primary transition-colors">
              keyboard_arrow_down
            </span>
          </button>

          {/* Profile Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 glass-panel rounded-xl shadow-2xl p-2 z-50 text-sm flex flex-col space-y-1">
              <Link
                href="/estudante/perfil"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-all font-semibold text-on-surface-variant flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Perfil
              </Link>
              <Link
                href="/estudante/perfil?tab=security"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-all font-semibold text-on-surface-variant flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">security</span>
                Segurança
              </Link>
              <div className="h-[1px] bg-border/5 my-1"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-red-400 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
