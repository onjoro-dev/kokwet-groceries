import Button from "../ui/Button";
import BrandVisual from "../ui/BrandVisual";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A plain-language "are you sure?" popup used before any destructive admin action (like deleting a product). */
export default function ConfirmDialog({ title, message, confirmLabel = "Yes, continue", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/40" onClick={onCancel} aria-label="Cancel" />
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <BrandVisual slot="confirmWarning" fallback="⚠️" className="mb-3 h-12 w-12 text-4xl" imageClassName="h-full w-full object-cover" />
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
