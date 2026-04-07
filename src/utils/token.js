import jwt from "jsonwebtoken";
import env from "../config/env.js";

const create = (email, sub) => {
  return jwt.sign({ email, sub }, env.JWT_SECRET);
};

const verify = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
};

export const token = { create, verify };
