import { useState, useEffect, useCallback } from "react";
import { WEATHER_API_BASE } from "../config/weather";
import type { WeatherData } from "../types";
import { WEATHER_REFRESH_INTERVAL } from "../lib/constants";

export function useWeather(city: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WEATHER_API_BASE}/${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather({
        temp: data.main.temp,
        rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
        windSpeed: Math.round(data.wind.speed * 3.6 * 100) / 100,
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        cityName: data.name,
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Weather unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, WEATHER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, isLoading, error, lastUpdated, refetch: fetchWeather };
}
