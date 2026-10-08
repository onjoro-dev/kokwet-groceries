interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  size?: "sm" | "md";
}

/** The +/- control used on product cards and in the cart to adjust how many of an item to buy. */
export default function QuantityStepper({ quantity, onChange, max, size = "md" }: QuantityStepperProps) {
  const btnClass =
    size === "sm"
      ? "w-7 h-7 text-sm"
      : "w-9 h-9 text-base";

  return (
    <div className="inline-flex items-center border border-brand-200 rounded-lg overflow-hidden">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(quantity - 1)}
        className={`${btnClass} flex items-center justify-center text-brand-700 hover:bg-brand-50 font-bold`}
      >
        −
      </button>
      <span className={`${size === "sm" ? "w-6 text-sm" : "w-8 text-sm"} text-center font-semibold text-gray-800`}>
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        disabled={max !== undefined && quantity >= max}
        className={`${btnClass} flex items-center justify-center text-brand-700 hover:bg-brand-50 font-bold disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        +
      </button>
    </div>
  );
}
