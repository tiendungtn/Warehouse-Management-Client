import axiosClient from "./axiosClient";

export const getIssuesApi = async () => {
  const response = await axiosClient.get("/issues");
  return response.data;
};

export const getIssueApi = async (id) => {
  const response = await axiosClient.get(`/issues/${id}`);
  return response.data;
};

export const createIssueApi = async (data) => {
  const response = await axiosClient.post("/issues", data);
  return response.data;
};

export const approveIssueApi = async (id, customerName) => {
  const response = await axiosClient.post(`/issues/${id}/approve`, {
    customerName,
  });

  return response.data;
};
