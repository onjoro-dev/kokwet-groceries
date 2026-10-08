import { ReactNode } from "react";

interface BadgeProps { children: ReactNode; color?: "green" | "orange" | "gray" | "red"; tone?: "success" | "warning" | "neutral" | "danger" }
const colors: Record<string, string> = {
  green: "bg-brand-100 text-brand-800",
  orange: "bg-accent-100 text-accent-700",
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-50 text-red-700",
};
export default function Badge({ children, color = "gray", tone }: BadgeProps) {
  const palette = tone ? color === "gray" ? "bg-gray-100 text-gray-700" : colors[color] : colors[color];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-tight ${palette}`}>{children}</span>;
}
