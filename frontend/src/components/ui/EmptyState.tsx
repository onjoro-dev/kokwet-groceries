import { ReactNode } from "react";
import BrandVisual, { VisualSlot } from "./BrandVisual";

interface EmptyStateProps {
  slot?: VisualSlot;
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shown wherever a list has nothing in it yet — an empty cart, no search results, no orders. */
export default function EmptyState({ slot = "emptyCart", icon = "🛒", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <BrandVisual slot={slot} fallback={icon} className="mb-4 h-20 w-20 text-5xl" imageClassName="h-full w-full rounded-lg object-cover" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
