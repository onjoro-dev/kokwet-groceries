import { useState } from "react";

const AREAS = [
  "Kitale Town Centre",
  "Milimani",
  "Bidii",
  "Tuwan",
  "Mitume",
  "Kipsongo",
  "Matisi",
  "Sikhendu",
];

/**
 * Lets the shopper see and change where their order will be delivered, before they
 * even start browsing — the same "deliver to" pattern shoppers expect from Carrefour.
 * The chosen area is only kept in memory here; the real address is captured at checkout.
 */
export default function DeliveryBar() {
  const [area, setArea] = useState(AREAS[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-brand-700 text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 font-medium hover:text-brand-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            Delivering to <span className="underline decoration-dotted">{area}</span>
            <span aria-hidden>▾</span>
          </button>
          {open && (
            <div className="absolute z-30 mt-2 w-56 bg-white text-gray-700 rounded-lg shadow-lg py-1 text-sm">
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setArea(a);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-brand-50 ${
                    a === area ? "text-brand-700 font-semibold" : ""
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="hidden sm:inline text-brand-100">Free delivery on orders over KSh 3,000</span>
      </div>
    </div>
  );
}
