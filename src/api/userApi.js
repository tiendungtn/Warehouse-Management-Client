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

// effectivePermissions và rolePermissions.
export const getUserPermissionsApi = async (id) => {
  const response = await axiosClient.get(`/users/${id}/permissions`);
  return response.data;
};

// Lưu chế độ phân quyền và danh sách override.
export const updateUserPermissionsApi = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}/permissions`, data);

  return response.data;
};
