import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getUserById = async (targetId) => {
  const response = await axios.get(`${API_URL}/users/${targetId}`, { withCredentials: true });
  return response.data;
};

export const getUserByMail = async (targetMail) => {
  const response = await axios.post(`${API_URL}/users/`, { targetMail }, { withCredentials: true });
  return response.data;
};

export const patchUser = async (user) => {
  const response = await axios.patch(`${API_URL}/users/`, { user }, { withCredentials: true });
  return response.data;
};

export const deleteUser = async () => {
  const response = await axios.patch(`${API_URL}/users/delete`, {}, { withCredentials: true });
  return response.data;
};