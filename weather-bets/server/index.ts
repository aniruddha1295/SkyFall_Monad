import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weather";
import resolveRoutes from "./routes/resolve";
import premiumRoutes from "./routes/premium";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/resolve", resolveRoutes);
app.use("/api/premium", premiumRoutes);

app.listen(PORT, () => {
  console.log(`WeatherBets server running on port ${PORT}`);
});
