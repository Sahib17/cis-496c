import mongoose from "mongoose";
import { logger } from "./logger.js";
import env from "./env.js";
import app from "../app.js";

export const connectDB = async () => {
  try {
    mongoose.connect(env.MONGO_URI)
        logger.info("Database Connected");
  } catch (error) {
    logger.error(error, "Database Connection Failed");
    process.exit(1);
  }
};
