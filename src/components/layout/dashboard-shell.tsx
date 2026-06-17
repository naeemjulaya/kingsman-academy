import React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 relative overflow-hidden bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
};
