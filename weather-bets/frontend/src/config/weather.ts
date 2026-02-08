export const WEATHER_API_BASE = "/api/weather";

export const CONDITION_LABELS: Record<number, string> = {
  0: "Rainfall",
  1: "Temperature",
  2: "Wind Speed",
};

export const CONDITION_UNITS: Record<number, string> = {
  0: "mm",
  1: "°C",
  2: "km/h",
};

export const CONDITION_ICONS: Record<number, string> = {
  0: "🌧️",
  1: "🌡️",
  2: "💨",
};

export const OPERATOR_LABELS: Record<number, string> = {
  0: "above",
  1: "below",
};
