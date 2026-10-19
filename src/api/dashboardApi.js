import axiosClient from "./axiosClient";

export const getDashboardApi = async () => {
  const response = await axiosClient.get("/dashboard");

  return response.data;
};
export const getDashboardAnalyticsApi = async () => {
  const response = await axiosClient.get("/dashboard/analytics");

  return response.data;
};
