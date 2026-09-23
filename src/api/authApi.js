import axiosClient from "./axiosClient";

export const loginApi = async (data) => {
  const response = await axiosClient.post("/auth/login", data);
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
};
