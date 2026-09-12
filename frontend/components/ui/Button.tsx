"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
        {
          primary:
            "bg-gradient-brand text-white shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:brightness-[1.05] active:scale-[0.98]",
          outline:
            "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
          subtle:
            "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20",
          ghost:
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
          danger:
            "bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98]",
        }[variant],
        {
          sm: "h-8 px-3 text-xs",
          md: "h-10 px-4 text-sm",
          lg: "h-11 px-6 text-sm",
          icon: "h-9 w-9 p-0",
        }[size],
        className,
      )}
      {...props}
    />
  );
});