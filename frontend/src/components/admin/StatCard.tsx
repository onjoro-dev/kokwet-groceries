import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "green" | "orange" | "neutral";
}

const tones: Record<string, string> = {
  green: "bg-brand-50 text-brand-700",
  orange: "bg-accent-50 text-accent-600",
  neutral: "bg-gray-100 text-gray-700",
};

/** Big, simple number tile for the admin dashboard home — easy to read at a glance. */
export default function StatCard({ icon, label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-800 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
