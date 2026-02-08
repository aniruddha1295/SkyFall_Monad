/**
 * Premium Weather API Routes (x402 Payment-Required Pattern)
 *
 * These endpoints require micropayments via the x402 HTTP payment protocol.
 * When no x-payment header is provided, a 402 response is returned with
 * payment instructions. When payment is present, enriched weather analysis
 * is returned.
 */

import { Router, Request, Response } from "express";
import { fetchCurrentWeather, fetchForecast } from "../services/openweather";
import {
  calculateRainProbability,
  calculateTemperatureTrend,
  calculateRiskScore,
  generateHedgingRecommendation,
} from "../services/weather-analysis";

const router = Router();

const RECEIVE_ADDRESS =
  process.env.X402_RECEIVE_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------
// Helper: build the 402 Payment Required response
// ---------------------------------------------------------------------------
function paymentRequired(
  res: Response,
  price: string,
  resource: string,
  description: string
) {
  return res.status(402).json({
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: "base-sepolia",
        maxAmountRequired: price,
        resource,
        payTo: RECEIVE_ADDRESS,
        description,
        mimeType: "application/json",
      },
    ],
    error: `Payment required: $${price} for ${description}`,
  });
}

// ---------------------------------------------------------------------------
// GET /forecast/:city  —  Price: $0.001
// Returns hourly forecast enriched with analysis data.
// ---------------------------------------------------------------------------
router.get("/forecast/:city", async (req: Request, res: Response) => {
  const city = req.params.city as string;
  const payment = req.headers["x-payment"];

  if (!payment) {
    return paymentRequired(
      res,
      "0.001",
      `/api/premium/forecast/${city}`,
      "Premium weather forecast with analysis"
    );
  }

  try {
    const forecastData = await fetchForecast(city);

    const rainProbability = calculateRainProbability(forecastData);
    const temperatureTrend = calculateTemperatureTrend(forecastData);
    const riskScore = calculateRiskScore(forecastData);
    const hedgingRecommendation = generateHedgingRecommendation(
      forecastData,
      city
    );

    return res.json({
      city,
      forecast: forecastData,
      analysis: {
        rainProbability,
        temperatureTrend,
        riskScore,
        hedgingRecommendation,
      },
      meta: {
        x402: true,
        pricePaid: "0.001",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch premium forecast" });
  }
});

// ---------------------------------------------------------------------------
// GET /historical/:city  —  Price: $0.01
// Returns the latest data point with analysis (simulated historical since
// OpenWeather free tier does not provide true historical data).
// ---------------------------------------------------------------------------
router.get("/historical/:city", async (req: Request, res: Response) => {
  const city = req.params.city as string;
  const payment = req.headers["x-payment"];

  if (!payment) {
    return paymentRequired(
      res,
      "0.01",
      `/api/premium/historical/${city}`,
      "Historical weather data with analysis"
    );
  }

  try {
    const currentData = await fetchCurrentWeather(city);
    const forecastData = await fetchForecast(city);

    const rainProbability = calculateRainProbability(forecastData);
    const temperatureTrend = calculateTemperatureTrend(forecastData);
    const riskScore = calculateRiskScore(currentData);
    const hedgingRecommendation = generateHedgingRecommendation(
      forecastData,
      city
    );

    return res.json({
      city,
      latestDataPoint: currentData,
      analysis: {
        rainProbability,
        temperatureTrend,
        riskScore,
        hedgingRecommendation,
      },
      note: "Historical data simulated using current conditions (OpenWeather free tier). Upgrade to a paid OpenWeather plan for true historical access.",
      meta: {
        x402: true,
        pricePaid: "0.01",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch historical data" });
  }
});

// ---------------------------------------------------------------------------
// GET /alerts/:city  —  Price: $0.005
// Returns risk assessment and weather alerts based on current conditions.
// ---------------------------------------------------------------------------
router.get("/alerts/:city", async (req: Request, res: Response) => {
  const city = req.params.city as string;
  const payment = req.headers["x-payment"];

  if (!payment) {
    return paymentRequired(
      res,
      "0.005",
      `/api/premium/alerts/${city}`,
      "Weather alerts and risk assessment"
    );
  }

  try {
    const currentData = await fetchCurrentWeather(city);
    const forecastData = await fetchForecast(city);

    const riskScore = calculateRiskScore(currentData);
    const rainProbability = calculateRainProbability(forecastData);
    const temperatureTrend = calculateTemperatureTrend(forecastData);

    // Build alerts from current conditions
    const alerts: string[] = [];
    const temp = currentData?.main?.temp;
    const windSpeed = currentData?.wind?.speed;
    const visibility = currentData?.visibility;
    const weather = currentData?.weather ?? [];

    if (temp !== undefined) {
      if (temp > 40) alerts.push(`Extreme heat warning: ${temp}C`);
      else if (temp > 35) alerts.push(`Heat advisory: ${temp}C`);
      if (temp < -10) alerts.push(`Extreme cold warning: ${temp}C`);
      else if (temp < 0) alerts.push(`Frost advisory: ${temp}C`);
    }

    if (windSpeed !== undefined) {
      if (windSpeed > 20) alerts.push(`High wind warning: ${windSpeed} m/s`);
      else if (windSpeed > 15) alerts.push(`Wind advisory: ${windSpeed} m/s`);
    }

    if (visibility !== undefined && visibility < 1000) {
      alerts.push(`Low visibility alert: ${visibility}m`);
    }

    if (rainProbability > 80) {
      alerts.push(`Heavy rain likely: ${rainProbability}% probability`);
    } else if (rainProbability > 50) {
      alerts.push(`Rain expected: ${rainProbability}% probability`);
    }

    // Check for severe weather codes
    const severeIds = [202, 212, 221, 232, 502, 503, 504, 511, 602, 622, 781];
    for (const w of weather) {
      if (severeIds.includes(w.id)) {
        alerts.push(`Severe weather: ${w.description}`);
      }
    }

    if (alerts.length === 0) {
      alerts.push("No active weather alerts for this location.");
    }

    return res.json({
      city,
      riskAssessment: riskScore,
      rainProbability,
      temperatureTrend,
      alerts,
      currentConditions: {
        temperature: currentData?.main?.temp,
        feelsLike: currentData?.main?.feels_like,
        humidity: currentData?.main?.humidity,
        windSpeed: currentData?.wind?.speed,
        visibility: currentData?.visibility,
        weather: weather.map((w: any) => ({
          condition: w.main,
          description: w.description,
          code: w.id,
        })),
      },
      meta: {
        x402: true,
        pricePaid: "0.005",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch weather alerts" });
  }
});

export default router;
