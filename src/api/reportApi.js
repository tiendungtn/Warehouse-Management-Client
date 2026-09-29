import axiosClient from "./axiosClient";

export const getStockReportApi = async ({
  search = "",
  categoryId = "",
  stockFilter = "",
} = {}) => {
  const params = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  if (categoryId) {
    params.categoryId = categoryId;
  }

  if (stockFilter) {
    params.stockFilter = stockFilter;
  }

  const response = await axiosClient.get("/reports/stock", {
    params,
  });

  return response.data;
};

export const exportStockReportApi = async () => {
  const response = await axiosClient.get("/reports/stock/export", {
    responseType: "blob",
  });

  return response;
};

export const getRevenueReportApi = async ({
  fromDate = "",
  toDate = "",
} = {}) => {
  const params = {};

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  const response = await axiosClient.get("/reports/revenue", {
    params,
  });

  return response.data;
};
