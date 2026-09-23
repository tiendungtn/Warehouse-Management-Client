import axiosClient from "./axiosClient";

export const getProductsApi = async (search = "") => {
  const response = await axiosClient.get("/products", {
    params: search.trim() ? { search: search.trim() } : {},
  });

  return response.data;
};

export const getProductApi = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);

  return response.data;
};

export const createProductApi = async (data) => {
  const response = await axiosClient.post("/products", data);

  return response.data;
};

export const updateProductApi = async (id, data) => {
  const response = await axiosClient.put(`/products/${id}`, data);

  return response.data;
};

export const deleteProductApi = async (id) => {
  await axiosClient.delete(`/products/${id}`);
};
