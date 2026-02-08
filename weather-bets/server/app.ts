import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/weather";
import resolveRoutes from "./routes/resolve";
import premiumRoutes from "./routes/premium";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/resolve", resolveRoutes);
app.use("/api/premium", premiumRoutes);

export default app;
