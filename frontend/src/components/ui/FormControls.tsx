import { forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  id?: string;
}

function FieldShell({ label, hint, error, children, id }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error ? <p id={`${id || label}-error`} className="text-xs font-medium text-red-600" role="alert">{error}</p> : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

const inputClass = (error?: string) => `mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-4 focus:ring-brand-50 ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-brand-500"}`;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }>(
  ({ label, hint, error, id, className = "", ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
    return <FieldShell label={label} hint={hint} error={error} id={fieldId}><input id={fieldId} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined} className={`${inputClass(error)} ${className}`} {...props} /></FieldShell>;
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }>(
  ({ label, hint, error, id, className = "", ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
    return <FieldShell label={label} hint={hint} error={error} id={fieldId}><textarea id={fieldId} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined} className={`${inputClass(error)} min-h-24 resize-y ${className}`} {...props} /></FieldShell>;
  }
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string }>(
  ({ label, hint, error, id, children, className = "", ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
    return <FieldShell label={label} hint={hint} error={error} id={fieldId}><select id={fieldId} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined} className={`${inputClass(error)} appearance-none ${className}`} {...props}>{children}</select></FieldShell>;
  }
);
Select.displayName = "Select";
