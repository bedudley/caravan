import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

export type Mood = "clear" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

type Desc = { label: string; mood: Mood };

// WMO weather interpretation codes → human label + mood bucket
const TABLE: Record<number, Desc> = {
  0: { label: "Clear sky", mood: "clear" },
  1: { label: "Mainly clear", mood: "clear" },
  2: { label: "Partly cloudy", mood: "partly" },
  3: { label: "Overcast", mood: "cloud" },
  45: { label: "Fog", mood: "fog" },
  48: { label: "Rime fog", mood: "fog" },
  51: { label: "Light drizzle", mood: "rain" },
  53: { label: "Drizzle", mood: "rain" },
  55: { label: "Heavy drizzle", mood: "rain" },
  56: { label: "Freezing drizzle", mood: "rain" },
  57: { label: "Freezing drizzle", mood: "rain" },
  61: { label: "Light rain", mood: "rain" },
  63: { label: "Rain", mood: "rain" },
  65: { label: "Heavy rain", mood: "rain" },
  66: { label: "Freezing rain", mood: "rain" },
  67: { label: "Freezing rain", mood: "rain" },
  71: { label: "Light snow", mood: "snow" },
  73: { label: "Snow", mood: "snow" },
  75: { label: "Heavy snow", mood: "snow" },
  77: { label: "Snow grains", mood: "snow" },
  80: { label: "Light showers", mood: "rain" },
  81: { label: "Showers", mood: "rain" },
  82: { label: "Violent showers", mood: "rain" },
  85: { label: "Snow showers", mood: "snow" },
  86: { label: "Snow showers", mood: "snow" },
  95: { label: "Thunderstorm", mood: "storm" },
  96: { label: "Thunderstorm, hail", mood: "storm" },
  99: { label: "Thunderstorm, hail", mood: "storm" },
};

export function describeWeather(code: number): Desc {
  return TABLE[code] ?? { label: "—", mood: "cloud" };
}

export function weatherIcon(code: number, isDay: boolean): LucideIcon {
  const { mood } = describeWeather(code);
  switch (mood) {
    case "clear":
      return isDay ? Sun : Moon;
    case "partly":
      return isDay ? CloudSun : CloudMoon;
    case "cloud":
      return Cloud;
    case "fog":
      return CloudFog;
    case "rain":
      return code >= 80 ? CloudRainWind : CloudRain;
    case "snow":
      return CloudSnow;
    case "storm":
      return CloudLightning;
  }
}

export type MoodTheme = {
  gradient: string;
  /** true → background is dark, use light text on top */
  onDark: boolean;
};

// Background gradient that matches the conditions, so each card feels "placed".
export function moodTheme(mood: Mood, isDay: boolean): MoodTheme {
  if (!isDay) {
    const stormy = mood === "rain" || mood === "storm" || mood === "fog";
    return {
      gradient: stormy
        ? "linear-gradient(160deg,#3a4150,#1b2027)"
        : "linear-gradient(160deg,#243353,#101830)",
      onDark: true,
    };
  }
  switch (mood) {
    case "clear":
      return { gradient: "linear-gradient(160deg,#ffd98a,#f2a04c)", onDark: false };
    case "partly":
      return { gradient: "linear-gradient(160deg,#dbe9f6,#f6cf8e)", onDark: false };
    case "cloud":
      return { gradient: "linear-gradient(160deg,#e1e6ec,#b6c0cb)", onDark: false };
    case "fog":
      return { gradient: "linear-gradient(160deg,#dddbd3,#b1afa6)", onDark: false };
    case "rain":
      return { gradient: "linear-gradient(160deg,#aebfce,#6d8497)", onDark: true };
    case "snow":
      return { gradient: "linear-gradient(160deg,#eef3f7,#ccd8e2)", onDark: false };
    case "storm":
      return { gradient: "linear-gradient(160deg,#6b7280,#3a4150)", onDark: true };
  }
}
