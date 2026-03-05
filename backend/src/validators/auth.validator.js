import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { z } from "zod";

const auth = (email, userId) => {
  const token = jwt.sign({ email, userId }, env.JWT_SECRET);
  return token;
};

const register = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email().trim().toLowerCase().min(1, "Email is required"),
  phone: z.string().trim().min(10, "Phone is required and needs to be of 10 digits"),
  password: z.string().min(5, "Password must be atleast 5 characters"),
});

const login = z.object({
    email: z.email().trim().min(1, "Email is required"),
    password: z.string().min(5, "Password must be atleast 5 characters"),
})

export const authValidator = { auth, register, login };
