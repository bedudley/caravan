import type { Unit } from "@/lib/format";

// Presentational toggle — parents own the unit via useUnit() and pass it down,
// so home + day views stay in sync through the shared store.
export default function UnitToggle({
  unit,
  onToggle,
}: {
  unit: Unit;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-card p-0.5 text-xs font-medium"
      aria-label={`Switch to ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
    >
      <span
        className={`rounded-full px-2 py-0.5 transition ${
          unit === "F" ? "bg-line text-ink" : "text-faint"
        }`}
      >
        °F
      </span>
      <span
        className={`rounded-full px-2 py-0.5 transition ${
          unit === "C" ? "bg-line text-ink" : "text-faint"
        }`}
      >
        °C
      </span>
    </button>
  );
}
