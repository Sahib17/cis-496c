import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "IMGKIT_PUBLIC",
  "IMGKIT_PRIVATE",
  "IMGKIT_ENDPOINT",
  "RESEND_SMTP_PASS",
];

// Only enforce in non-test environments
if (process.env.NODE_ENV !== "test") {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

// Provide safe fallbacks for tests
const env = {
  PORT: process.env.PORT || "5000",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test",
  JWT_SECRET: process.env.JWT_SECRET || "test-secret",
  IMGKIT_PUBLIC: process.env.IMGKIT_PUBLIC || "test_public",
  IMGKIT_PRIVATE: process.env.IMGKIT_PRIVATE || "test_private",
  IMGKIT_ENDPOINT: process.env.IMGKIT_ENDPOINT || "https://ik.imagekit.io/test",
  RESEND_API_KEY: process.env.RESEND_SMTP_PASS || "test_key",
  EMAIL_FROM: process.env.EMAIL_FROM || "test@example.com",
};

export default env;
