import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-indigo-500 hover:bg-indigo-400 text-white"
      : variant === "secondary"
        ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
        : "bg-transparent hover:bg-slate-900 text-slate-100";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

