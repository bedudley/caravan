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
      className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-card p-1 text-sm font-semibold"
      aria-label={`Switch to ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
    >
      <span
        className={`rounded-full px-2.5 py-1 transition ${
          unit === "F" ? "bg-accent text-white" : "text-muted"
        }`}
      >
        °F
      </span>
      <span
        className={`rounded-full px-2.5 py-1 transition ${
          unit === "C" ? "bg-accent text-white" : "text-muted"
        }`}
      >
        °C
      </span>
    </button>
  );
}
