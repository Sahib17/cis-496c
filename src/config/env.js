import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "IMGKIT_PUBLIC", "IMGKIT_PRIVATE", "IMGKIT_ENDPOINT", "RESEND_SMTP_PASS"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  IMGKIT_PUBLIC: process.env.IMGKIT_PUBLIC,
  IMGKIT_PRIVATE: process.env.IMGKIT_PRIVATE,
  IMGKIT_ENDPOINT: process.env.IMGKIT_ENDPOINT,
  RESEND_API_KEY: process.env.RESEND_SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM
};

export default env;
