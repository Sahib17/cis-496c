import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const PostExpense = async (expenseData) => {
  const response = await axios.post(`${API_URL}/expenses`, expenseData, { withCredentials: true });
  return response.data;
}

export const DeleteExpense = async (expenseId) => {
  const response = await axios.delete(`${API_URL}/expenses/${expenseId}`, { withCredentials: true });
  return response.data;
}