import { Router } from "express";
import { resolveMarket } from "../services/resolver";

const router = Router();

router.post("/:marketId", async (req, res) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const marketId = parseInt(req.params.marketId as string);
    if (isNaN(marketId)) {
      return res.status(400).json({ error: "Invalid market ID" });
    }
    const result = await resolveMarket(marketId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to resolve market" });
  }
});

export default router;
