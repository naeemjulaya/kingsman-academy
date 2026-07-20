"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-4", className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" className={cn("inline-flex items-center justify-start rounded-lg bg-surface-container-low/40 p-1 border border-border/10", className)} {...props}>
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger deve ser usado dentro de Tabs");
  const isActive = value === context.value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
        isActive ? "bg-primary/10 text-primary shadow-sm border border-primary/20" : "text-on-surface-variant hover:text-primary hover:bg-primary/5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent deve ser usado dentro de Tabs");
  if (value !== context.value) return null;
  return <div role="tabpanel" className={cn("focus-visible:outline-none", className)} {...props}>{children}</div>;
}
