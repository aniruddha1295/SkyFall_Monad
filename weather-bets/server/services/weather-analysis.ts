/**
 * Weather Analysis Service
 *
 * Provides premium analysis functions that enrich raw OpenWeather API data
 * with computed insights for the x402 premium endpoints.
 */

/**
 * Calculate the probability of rain (0-100) from forecast data.
 *
 * Uses the "pop" (probability of precipitation) field when available,
 * cloud coverage, humidity, and weather condition codes as fallbacks.
 */
export function calculateRainProbability(data: any): number {
  // If forecast list is present, average the pop values from the next entries
  if (data?.list && Array.isArray(data.list)) {
    const upcoming = data.list.slice(0, 8); // next ~24 hours (3-hour intervals)
    if (upcoming.length > 0) {
      const avgPop =
        upcoming.reduce((sum: number, entry: any) => {
          return sum + (entry.pop ?? 0);
        }, 0) / upcoming.length;

      // pop is 0-1 from OpenWeather, convert to 0-100
      return Math.round(avgPop * 100);
    }
  }

  // Fallback for current weather data (no pop field)
  if (data?.weather && Array.isArray(data.weather)) {
    const rainyConditions = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232, // thunderstorm
      300, 301, 302, 310, 311, 312, 313, 314, 321, // drizzle
      500, 501, 502, 503, 504, 511, 520, 521, 522, 531]; // rain

    const hasRainCondition = data.weather.some((w: any) =>
      rainyConditions.includes(w.id)
    );

    if (hasRainCondition) {
      // Use humidity to scale: rain condition + high humidity = higher probability
      const humidity = data?.main?.humidity ?? 50;
      return Math.min(100, Math.round(50 + humidity * 0.5));
    }

    // No rain conditions, derive from clouds + humidity
    const clouds = data?.clouds?.all ?? 0;
    const humidity = data?.main?.humidity ?? 0;
    return Math.round((clouds * 0.3 + humidity * 0.2));
  }

  return 0;
}

/**
 * Determine the temperature trend from forecast data.
 * Returns "rising", "falling", or "stable".
 */
export function calculateTemperatureTrend(data: any): string {
  if (data?.list && Array.isArray(data.list) && data.list.length >= 4) {
    const temps = data.list.slice(0, 8).map((entry: any) => entry?.main?.temp ?? 0);

    // Compare first half average to second half average
    const mid = Math.floor(temps.length / 2);
    const firstHalf = temps.slice(0, mid);
    const secondHalf = temps.slice(mid);

    const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (diff > 1.5) return "rising";
    if (diff < -1.5) return "falling";
    return "stable";
  }

  // If only current weather, we cannot determine a trend
  return "stable";
}

/**
 * Calculate a risk score (0-100) and risk level for weather conditions.
 * Considers wind speed, extreme temps, visibility, and severe weather codes.
 */
export function calculateRiskScore(data: any): { score: number; level: string } {
  let score = 0;

  // Extract relevant fields from current weather or first forecast entry
  const main = data?.main ?? data?.list?.[0]?.main ?? {};
  const wind = data?.wind ?? data?.list?.[0]?.wind ?? {};
  const weather = data?.weather ?? data?.list?.[0]?.weather ?? [];
  const visibility = data?.visibility ?? data?.list?.[0]?.visibility ?? 10000;

  // Temperature extremes
  const temp = main.temp ?? 20;
  if (temp > 40) score += 25;
  else if (temp > 35) score += 15;
  else if (temp < -10) score += 25;
  else if (temp < 0) score += 15;
  else if (temp < 5) score += 5;

  // Wind speed (m/s)
  const windSpeed = wind.speed ?? 0;
  if (windSpeed > 20) score += 30;
  else if (windSpeed > 15) score += 20;
  else if (windSpeed > 10) score += 10;
  else if (windSpeed > 5) score += 5;

  // Visibility (meters) — low visibility is risky
  if (visibility < 200) score += 20;
  else if (visibility < 1000) score += 10;
  else if (visibility < 3000) score += 5;

  // Severe weather condition codes
  const severeIds = [202, 212, 221, 232, 502, 503, 504, 511, 602, 622, 781];
  const moderateIds = [200, 201, 210, 211, 230, 231, 302, 312, 314, 501, 521, 522, 531, 601, 621];

  for (const w of weather) {
    if (severeIds.includes(w.id)) {
      score += 25;
      break;
    }
    if (moderateIds.includes(w.id)) {
      score += 10;
      break;
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: string;
  if (score >= 75) level = "extreme";
  else if (score >= 50) level = "high";
  else if (score >= 25) level = "medium";
  else level = "low";

  return { score, level };
}

/**
 * Generate a hedging recommendation based on weather data and city context.
 */
export function generateHedgingRecommendation(data: any, city: string): string {
  const rainProb = calculateRainProbability(data);
  const trend = calculateTemperatureTrend(data);
  const risk = calculateRiskScore(data);

  const parts: string[] = [];

  parts.push(`Weather risk assessment for ${city}: ${risk.level.toUpperCase()} (score ${risk.score}/100).`);

  if (rainProb > 70) {
    parts.push(
      `Rain probability is high at ${rainProb}%. Consider hedging outdoor event exposure. Recommend purchasing rain protection contracts.`
    );
  } else if (rainProb > 40) {
    parts.push(
      `Moderate rain probability (${rainProb}%). A partial hedge on rain-sensitive positions is advisable.`
    );
  } else {
    parts.push(
      `Rain probability is low (${rainProb}%). Minimal rain-related hedging needed.`
    );
  }

  if (trend === "rising") {
    parts.push(
      "Temperature trend is rising. If holding temperature-under bets, consider closing or hedging."
    );
  } else if (trend === "falling") {
    parts.push(
      "Temperature trend is falling. If holding temperature-over bets, consider closing or hedging."
    );
  } else {
    parts.push("Temperature is stable. Current temperature positions can be maintained.");
  }

  if (risk.level === "extreme") {
    parts.push(
      "ALERT: Extreme weather risk detected. Strongly recommend reducing all weather-exposed positions immediately."
    );
  } else if (risk.level === "high") {
    parts.push(
      "Elevated risk conditions. Review open positions and tighten stop-losses on weather bets."
    );
  }

  return parts.join(" ");
}
