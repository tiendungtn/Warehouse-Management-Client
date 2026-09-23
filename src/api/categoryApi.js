import axiosClient from "./axiosClient";

export const getCategoriesApi = async () => {
  const response = await axiosClient.get("/categories");

  return response.data;
};

export const getCategoryApi = async (id) => {
  const response = await axiosClient.get(`/categories/${id}`);

  return response.data;
};

export const createCategoryApi = async (data) => {
  const response = await axiosClient.post("/categories", data);

  return response.data;
};

export const updateCategoryApi = async (id, data) => {
  const response = await axiosClient.put(`/categories/${id}`, data);

  return response.data;
};

export const deleteCategoryApi = async (id) => {
  await axiosClient.delete(`/categories/${id}`);
};
