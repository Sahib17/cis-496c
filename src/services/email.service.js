import env from "../config/env.js";
import resend from "../utils/mailer.js";

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "Splitr <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};
