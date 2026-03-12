import axios from "axios";

export const UserGroups = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {withCredentials: true});
  console.log(response.data);
  
  return response.data;
}

export const GetExpenses = async (groupId) => {
  const groupExpenses = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`, {withCredentials: true});
  return ({
    expenses: groupExpenses.data,
  });
}

export const GetGroup = async (groupId) => {
  const group = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}`, {withCredentials: true});
  const groupMembers = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/members`, {withCredentials: true});
  return ({
    group: group.data, 
    members: groupMembers.data,
  });
}