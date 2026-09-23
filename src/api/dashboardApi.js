import axiosClient from "./axiosClient";

export const getDashboardApi = async () => {
  const response = await axiosClient.get("/dashboard");

  return response.data;
};
