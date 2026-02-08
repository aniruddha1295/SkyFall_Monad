# Story 5.1: Weather Data Backend & Display

Status: review

## Story

As a user,
I want to see current weather conditions for a market's city,
So that I can make better-informed bets.

## Acceptance Criteria

**Given** the Express backend needs to be set up
**When** I create `server/index.ts`
**Then** it runs an Express server on port `process.env.PORT` (default 3001) with:
- CORS enabled for `http://localhost:5173` (Vite dev server)
- JSON body parsing middleware
- Routes mounted: `app.use('/api/weather', weatherRoutes)` and `app.use('/api/resolve', resolveRoutes)`
- Console log on startup: "WeatherBets API server running on port {PORT}"

**Given** the weather route exists at `server/routes/weather.ts`
**When** a GET request is made to `/api/weather/:city` (e.g., `/api/weather/Nagpur`)
**Then** the server calls the OpenWeather API: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric`
**And** the API key is read from `process.env.OPENWEATHER_API_KEY` (never sent to the frontend)
**And** the response is transformed and returned as:
```json
{
  "city": "Nagpur",
  "temperature": 28.5,
  "rainfall": 0,
  "windSpeed": 12.4,
  "humidity": 45,
  "condition": "Clear",
  "icon": "01d",
  "iconUrl": "https://openweathermap.org/img/wn/01d@2x.png"
}
```
**And** `rainfall` is extracted from `response.rain?.["1h"] || response.rain?.["3h"] || 0`
**And** `windSpeed` is converted from m/s to km/h by multiplying by 3.6 and rounding to 1 decimal

**Given** the OpenWeather API call fails (network error, invalid key, rate limit)
**When** the server catches the error
**Then** it returns HTTP 500 with `{ "error": "Failed to fetch weather data", "message": error.message }`

**Given** the frontend `useWeather` hook exists in `frontend/src/hooks/useWeather.ts`
**When** it is called with a city name: `useWeather(city: string)`
**Then** it fetches from `http://localhost:3001/api/weather/{city}` on mount and every 60 seconds using `setInterval`
**And** it returns `{ data: WeatherData | null, loading: boolean, error: string | null, lastUpdated: Date | null }`
**And** it cleans up the interval on unmount

**Given** I am viewing a MarketPage
**When** the `WeatherWidget` component renders in the right column (replacing the placeholder from Story 2.3)
**Then** it displays:
- Header: "{City} Weather" with a green pulsing dot and "Live" text
- Weather icon: `<img src="{iconUrl}" alt="{condition}" />` at 64x64px
- Current condition text: e.g., "Clear"
- Temperature: "{temperature}C" with a thermometer icon
- Rainfall: "{rainfall} mm" with a rain droplet icon
- Wind Speed: "{windSpeed} km/h" with a wind icon
- Humidity: "{humidity}%" with a humidity icon
**And** the widget has `bg-bg-surface rounded-xl border border-border p-4` styling
**And** a "Last updated: {time}" footer in muted text (`text-text-muted text-xs`)

**Given** the weather API fails
**When** `useWeather` returns an error
**Then** the WeatherWidget shows:
- The last successful data if available, with "Last updated X min ago" in amber text
- If no data was ever fetched: "Unable to load weather data" with a retry button

**Given** the widget must respect the free tier limit
**When** the 60-second interval fires
**Then** only one API call is made per city per interval (no duplicate calls from re-renders)
**And** the `useWeather` hook uses `useRef` to track the interval and prevent duplicates

## Tasks / Subtasks

- [x] Create server/index.ts with Express server, CORS, JSON parsing, route mounting
- [x] Create server/routes/weather.ts with GET /api/weather/:city endpoint
- [x] Implement OpenWeather API call with API key from env
- [x] Transform response: extract rainfall, convert windSpeed m/s to km/h
- [x] Return formatted JSON response with city, temperature, rainfall, windSpeed, humidity, condition, icon, iconUrl
- [x] Handle API errors with HTTP 500 response
- [x] Create server/services/openweather.ts service for API calls
- [x] Create frontend/src/hooks/useWeather.ts hook
- [x] Fetch weather data on mount and every 60 seconds
- [x] Return { data, loading, error, lastUpdated } from hook
- [x] Clean up interval on unmount, use useRef to prevent duplicates
- [x] Create frontend/src/components/WeatherWidget.tsx
- [x] Display city weather header with green pulsing "Live" dot
- [x] Show weather icon, condition, temperature, rainfall, wind speed, humidity
- [x] Show "Last updated" footer in muted text
- [x] Handle error state: show last data or "Unable to load" with retry
- [x] Create frontend/src/config/weather.ts for weather API configuration

## Dev Notes

- Implementation completed outside formal BMAD workflow
- Retroactive review being performed

### References

- [Source: _bmad-output/planning-artifacts/epics.md]
- [Source: _bmad-output/planning-artifacts/architecture.md]

## Dev Agent Record

### Agent Model Used

Claude (pre-BMAD workflow)

### File List

- `weather-bets/server/index.ts`
- `weather-bets/server/routes/weather.ts`
- `weather-bets/server/services/openweather.ts`
- `weather-bets/frontend/src/hooks/useWeather.ts`
- `weather-bets/frontend/src/components/WeatherWidget.tsx`
- `weather-bets/frontend/src/config/weather.ts`
