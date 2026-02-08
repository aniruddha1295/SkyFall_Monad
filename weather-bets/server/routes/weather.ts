import { Router } from "express";
import { fetchCurrentWeather, fetchForecast } from "../services/openweather";

const router = Router();

router.get("/:city", async (req, res) => {
  try {
    const data = await fetchCurrentWeather(req.params.city);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch weather" });
  }
});

router.get("/:city/forecast", async (req, res) => {
  try {
    const data = await fetchForecast(req.params.city);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch forecast" });
  }
});

export default router;
