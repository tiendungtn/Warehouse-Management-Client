import axiosClient from "./axiosClient";

export const getUsersApi = async () => {
  const response = await axiosClient.get("/users");

  return response.data;
};

export const createUserApi = async (data) => {
  const response = await axiosClient.post("/users", data);

  return response.data;
};

export const updateUserApi = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);

  return response.data;
};

export const deleteUserApi = async (id) => {
  await axiosClient.delete(`/users/${id}`);
};
