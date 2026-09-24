import axiosClient from "./axiosClient";

export const getReceiptsApi = async () => {
  const response = await axiosClient.get("/receipts");
  return response.data;
};

export const getReceiptApi = async (id) => {
  const response = await axiosClient.get(`/receipts/${id}`);
  return response.data;
};

export const createReceiptApi = async (data) => {
  const response = await axiosClient.post("/receipts", data);
  return response.data;
};

export const approveReceiptApi = async (id) => {
  const response = await axiosClient.post(`/receipts/${id}/approve`);
  return response.data;
};
