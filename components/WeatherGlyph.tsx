import { createElement } from "react";
import { weatherIcon } from "@/lib/weather";

// Renders the right lucide icon for a weather code via a stable component,
// so we never alias a dynamic component to <Icon> during render.
export default function WeatherGlyph({
  code,
  isDay,
  size,
  strokeWidth,
  className,
}: {
  code: number;
  isDay: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return createElement(weatherIcon(code, isDay), {
    size,
    strokeWidth,
    className,
    "aria-hidden": true,
  });
}
