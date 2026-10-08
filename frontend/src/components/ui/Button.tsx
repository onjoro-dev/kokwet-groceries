import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  secondary: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  outline: "border border-brand-600 bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100",
  ghost: "text-brand-700 hover:bg-brand-50 active:bg-brand-100",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};
const sizes: Record<string, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm rounded-lg",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
  lg: "min-h-12 px-6 py-3 text-base rounded-xl",
};

export default function Button({ variant = "primary", size = "md", fullWidth, className = "", children, disabled, loading, type = "button", ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button type={type} disabled={isDisabled} aria-busy={loading || undefined} className={`inline-flex items-center justify-center gap-2 font-semibold transition duration-150 hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}
