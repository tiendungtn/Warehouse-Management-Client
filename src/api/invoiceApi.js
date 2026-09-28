import axiosClient from "./axiosClient";

export const getInvoicesApi = async () => {
  const response = await axiosClient.get("/invoices");

  return response.data;
};

export const getInvoiceApi = async (id) => {
  const response = await axiosClient.get(`/invoices/${id}`);

  return response.data;
};

export const downloadInvoicePdfApi = async (id) => {
  const response = await axiosClient.get(`/invoices/${id}/pdf`, {
    responseType: "blob",
  });

  return response;
};