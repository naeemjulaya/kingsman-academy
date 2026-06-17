import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const Tabs = ({ value, onValueChange, className, children, ...props }: TabsProps) => {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ className, children, value, onValueChange, ...props }: any) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start rounded-lg bg-surface-container-low/40 p-1 border border-border/10",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onClick: onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({ className, value, activeValue, onClick, children, ...props }: any) => {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all cursor-pointer",
        {
          "bg-primary/10 text-primary shadow-sm border border-primary/20": isActive,
          "text-on-surface-variant hover:text-primary hover:bg-primary/5": !isActive,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ className, value, activeValue, children, ...props }: any) => {
  if (value !== activeValue) return null;
  return (
    <div
      className={cn(
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
