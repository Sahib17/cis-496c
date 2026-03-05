import axios from "axios"

export const register = async (user) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, user, {withCredentials: true});
  console.log(response.data);
  
  return response.data;
}

export const login = async (user) => {
  
//   console.log(response.status);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, user, {withCredentials: true});
  console.log(response.data);
  return response.data;
}

export const logout = async () => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {withCredentials: true});
  return response.data;
}

export const me = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {withCredentials: true});
  return response.data;
}