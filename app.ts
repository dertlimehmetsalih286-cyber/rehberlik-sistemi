
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js"; // Uzantiya dikkat
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API rotalarini bagla
app.use("/api", router);

// Saglik kontrolu (Render icin onemli)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default app;
