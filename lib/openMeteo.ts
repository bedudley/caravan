import type { Stop } from "@/data/itinerary";

export type Current = {
  tempC: number;
  apparentC: number;
  code: number;
  isDay: boolean;
  windKmh: number;
  humidity: number;
};

export type DailyDay = {
  date: string;
  code: number;
  maxC: number;
  minC: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
};

export type HourlyHour = {
  time: string;
  tempC: number;
  code: number;
  precipProb: number;
  isDay: boolean;
};

export type Forecast = {
  timezone: string;
  current: Current;
  daily: DailyDay[];
  hourly: HourlyHour[];
};

type Raw = {
  timezone: string;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: (number | null)[];
    weather_code: number[];
    is_day: number[];
  };
};

const BASE = "https://api.open-meteo.com/v1/forecast";

// Free, keyless. Metric in; we convert to °F in the UI so the unit toggle
// never has to refetch. Revalidated every 30 min by the caller.
export async function fetchForecast(stop: Stop): Promise<Forecast | null> {
  const params = new URLSearchParams({
    latitude: String(stop.lat),
    longitude: String(stop.lon),
    timezone: stop.timezone,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    wind_speed_unit: "kmh",
    forecast_days: "16",
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as Raw;

    return {
      timezone: d.timezone,
      current: {
        tempC: d.current.temperature_2m,
        apparentC: d.current.apparent_temperature,
        code: d.current.weather_code,
        isDay: d.current.is_day === 1,
        windKmh: d.current.wind_speed_10m,
        humidity: d.current.relative_humidity_2m,
      },
      daily: d.daily.time.map((date: string, i: number) => ({
        date,
        code: d.daily.weather_code[i],
        maxC: d.daily.temperature_2m_max[i],
        minC: d.daily.temperature_2m_min[i],
        precipProb: d.daily.precipitation_probability_max[i] ?? 0,
        sunrise: d.daily.sunrise[i],
        sunset: d.daily.sunset[i],
      })),
      hourly: d.hourly.time.map((time: string, i: number) => ({
        time,
        tempC: d.hourly.temperature_2m[i],
        code: d.hourly.weather_code[i],
        precipProb: d.hourly.precipitation_probability[i] ?? 0,
        isDay: d.hourly.is_day[i] === 1,
      })),
    };
  } catch {
    return null;
  }
}

export function dayForecast(fc: Forecast, date: string): DailyDay | undefined {
  return fc.daily.find((d) => d.date === date);
}

export function hoursForDate(fc: Forecast, date: string): HourlyHour[] {
  return fc.hourly.filter((h) => h.time.startsWith(date));
}
