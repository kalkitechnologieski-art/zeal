"use client";
import { createContext, useContext, useState, ReactNode, MouseEvent } from "react";
import { cn } from "./utils";

interface TabsContextType {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  value: "",
  setValue: () => {},
});

export interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({ defaultValue, children, className = "", onValueChange }: TabsProps) => {
  const [value, setValue] = useState(defaultValue);

  const handleSetValue = (newValue: string) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, setValue: handleSetValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export const TabsList = ({ className = "", children }: TabsListProps) => (
  <div className={cn("flex bg-[#F4E8F7] rounded-xl p-1", className)}>{children}</div>
);

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const TabsTrigger = ({ value, children, className = "", onClick }: TabsTriggerProps) => {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    ctx.setValue(value);
    if (onClick) onClick(e);
  };

  return (
    <button
      className={cn(
        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
        active ? "bg-white shadow-sm text-[#5E4B8B]" : "text-[#B8A1D9] hover:text-[#5E4B8B]",
        className
      )}
      onClick={handleClick}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = ({ value, children, className = "" }: TabsContentProps) => {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
};
