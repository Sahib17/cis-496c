import axios from "axios";

export const getUserById = async (targetId: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/users/${targetId}`,
  );
  return response.data;
};

export const getUserByMail = async (targetMail: string) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/`, {
    targetMail,
  });
  return response.data;
};

interface user {
    name: string,
    phone: string
}

export const patchUser = async (user: user) => {
    const response = await axios.patch(`${import.meta.env.BASE_URL}/users/`, {user});
    return response.data;
}

export const deleteUser = async () => {
  const response = await axios.patch(`${import.meta.env.BASE_URL}/users/delete`);
  return response.data;
}