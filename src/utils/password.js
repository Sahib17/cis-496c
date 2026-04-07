import bcrypt from "bcrypt";
import env from "../config/env.js";

const hash = async (password) => {
  return await bcrypt.hash(password, 10);
};

const compare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const password = {
  hash,
  compare,
};
