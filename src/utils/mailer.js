import { Resend } from "resend";
import env from "../config/env.js";

if (!env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing in environment variables");
}

const resend = new Resend(env.RESEND_API_KEY);

export default resend;