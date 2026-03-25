import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const UserGroups = async () => {
  const response = await axios.get(`${API_URL}/groups`, { withCredentials: true });
  return response.data;
}

export const CreateGroup = async (groupData) => {
  const response = await axios.post(`${API_URL}/groups`, groupData, { withCredentials: true });
  return response.data;
}

export const GetGroup = async (groupId) => {
  const group = await axios.get(`${API_URL}/groups/${groupId}`, { withCredentials: true });
  const groupMembers = await axios.get(`${API_URL}/groups/${groupId}/members`, { withCredentials: true });
  return {
    group: group.data.data, 
    members: groupMembers.data.data,
  };
}

// AFTER (simpler)
export const GetExpenses = async (groupId) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`, {withCredentials: true});
  return res.data.data; // returns the expenses array directly
}

export const AcceptInvite = async (groupId) => {
  const response = await axios.patch(`${API_URL}/groups/${groupId}/acceptInvitation`, {}, { withCredentials: true });
  return response.data;
}

export const RejectInvite = async (groupId) => {
  const response = await axios.delete(`${API_URL}/groups/${groupId}/rejectInvitation`, { withCredentials: true });
  return response.data;
}