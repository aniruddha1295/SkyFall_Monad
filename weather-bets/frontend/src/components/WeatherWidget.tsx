import { useWeather } from "../hooks/useWeather";

interface WeatherWidgetProps {
  city: string;
}

export default function WeatherWidget({ city }: WeatherWidgetProps) {
  const { weather, isLoading, error, lastUpdated } = useWeather(city);

  const minutesAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  // Loading skeleton
  if (isLoading && !weather) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-bg-hover" />
          <div>
            <div className="w-20 h-4 rounded bg-bg-hover mb-1" />
            <div className="w-16 h-3 rounded bg-bg-hover" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="w-full h-10 rounded bg-bg-hover" />
          <div className="w-full h-10 rounded bg-bg-hover" />
          <div className="w-full h-10 rounded bg-bg-hover" />
          <div className="w-full h-10 rounded bg-bg-hover" />
        </div>
      </div>
    );
  }

  // Error fallback
  if (error) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-4">
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm">Weather data unavailable</p>
          <p className="text-slate-600 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4">
      {/* Header with icon and city */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
            className="w-12 h-12"
          />
          <div>
            <p className="font-semibold text-white">{weather.cityName}</p>
            <p className="text-xs text-slate-400">{weather.condition}</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yes opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yes" />
          </span>
          <span className="text-xs font-medium text-yes">Live</span>
        </div>
      </div>

      {/* Weather stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-hover rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Temperature</p>
          <p className="text-base font-bold text-white">{Math.round(weather.temp)}&deg;C</p>
        </div>
        <div className="bg-bg-hover rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Rainfall</p>
          <p className="text-base font-bold text-white">{weather.rainfall} mm</p>
        </div>
        <div className="bg-bg-hover rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Wind Speed</p>
          <p className="text-base font-bold text-white">{weather.windSpeed} km/h</p>
        </div>
        <div className="bg-bg-hover rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Humidity</p>
          <p className="text-base font-bold text-white">{weather.humidity}%</p>
        </div>
      </div>

      {/* Last updated */}
      {minutesAgo !== null && minutesAgo > 0 && (
        <p className="text-xs text-slate-600 text-center mt-3">
          Last updated {minutesAgo} min ago
        </p>
      )}
    </div>
  );
}
