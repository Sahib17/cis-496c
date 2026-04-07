import User from "../models/User.js";
import { password } from "../utils/password.js";

const register = async (data) => {
  try {
    const { name, email, phone, password, defaultCurrency, language } = data;
    const user = await User.create({
      name,
      email,
      phone,
      password,
      defaultCurrency,
      language,
    });
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error("Email already exists");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};

const login = async (data) => {
  try {
    const user = await User.findOne({ email: data.email }).select("+password");;
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const isMatch = await password.compare(data.password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    return user;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

const me = async (data) => {
  try {
    const user = User.findById(data);
    return user;
  } catch (err) {
    if (err.code === 404) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
};

export const authService = {
  register,
  login,
  me,
};
