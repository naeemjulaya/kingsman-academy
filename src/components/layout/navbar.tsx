"use client";

import React, { useCallback, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  metadata: { href?: string; payment_id?: string } | null;
  created_at: string;
};

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json() as { notifications?: NotificationItem[] };
      setNotifications(result.notifications || []);
    } catch {
      // Notifications must never interrupt the rest of the dashboard.
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    void fetchNotifications();
    const interval = window.setInterval(() => void fetchNotifications(), 30_000);
    const refreshOnFocus = () => void fetchNotifications();
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [fetchNotifications, user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
    setNotifications((current) => current.map((notification) =>
      notification.id === id ? { ...notification, is_read: true } : notification
    ));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => undefined);
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  };

  const openNotification = async (notification: NotificationItem) => {
    await handleMarkAsRead(notification.id);
    setNotificationsOpen(false);
    if (notification.metadata?.href) router.push(notification.metadata.href);
  };

  const isAdmin = pathname?.startsWith("/admin");
  const isCoordenador = pathname?.startsWith("/coordenador");
  const isExplicador = pathname?.startsWith("/explicador");
  
  let roleTitle = "Painel de Estudante";
  if (isAdmin) roleTitle = "Painel de Administração";
  else if (isCoordenador) roleTitle = "Painel de Coordenação";
  else if (isExplicador) roleTitle = "Painel de Explicador";

  const firstName = user?.fullName?.split(" ")[0] || "Utilizador";
  const greeting = loading ? "A carregar perfil…" : isAdmin ? "Painel de Administração" : `Bom dia, ${firstName}`;

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
            type="button"
            aria-label={unreadNotifications ? `${unreadNotifications} notificações não lidas` : "Notificações"}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 rounded-full hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all cursor-pointer relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-primary px-1 text-[9px] font-black leading-none text-black shadow-[0_0_10px_#FF48FF]">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
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
                      onClick={() => void openNotification(notif)}
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
