/** A simple loading spinner. Use inside buttons or to fill an empty content area. */
export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
