import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import redis from "./config/redis.js";
import errorHandler from "./02-middleware/errorHandler.js";
import authRoutes from "./01-routes/auth.routes.js";
import productsRoutes from "./01-routes/products.routes.js";
import usersRoutes from "./01-routes/users.routes.js";
import interactionsRoutes from "./01-routes/interactions.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) || 3000;

const dbcheck = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to the database");
    return true;
  } catch (e) {
    console.error("Connection to the database failed", e);
    return false;
  }
};

const rdcheck = async () => {
  try {
    await redis.ping();
    console.log("Connected to redis");
    return true;
  } catch (e) {
    console.error("Connection to the redis failed", e);
    return false;
  }
};

import { cleanupQueue } from "./workers/interactionCleanup.worker.js";

async function start() {
  const [db, redis] = await Promise.all([dbcheck(), rdcheck()]);

  if (db && redis) {
    // Schedule background workers
    await cleanupQueue.upsertJobScheduler(
      "daily-cleanup-job",
      { every: 24 * 60 * 60 * 1000 },
      { name: "daily-cleanup", data: {} }
    );
    
    // Pre-compute recommendations every 6 hours
    await cleanupQueue.upsertJobScheduler(
      "compute-recommendations-job",
      { every: 6 * 60 * 60 * 1000 },
      { name: "compute-recommendations", data: {} }
    );
    console.log("Cleanup and recommendation workers scheduled.");

    app.listen(port, () => {
      console.log(`Server running on port :${port}`);
    });
  } else {
    console.log("Startup Failed..");
    process.exit(1);
  }
}

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/interactions", interactionsRoutes);

app.use(errorHandler);
start();
