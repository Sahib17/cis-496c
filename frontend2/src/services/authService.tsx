import axios from "axios"

interface RegisterUser {
  name: string,
  email: string,
  phone: string,
  password: string,
}

interface loginUser {
  email: string,
  password: string,
}

export const register = async (user: RegisterUser) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, user);
  return response.data;
}

export const login = async (user: loginUser) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, user);
  return response.data;
}

export const logout = async () => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
  return response.data;
}

export const me = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
  return response.data;
}