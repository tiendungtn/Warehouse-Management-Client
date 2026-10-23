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

export const searchStockReportApi = async (filters = {}) => {
  const params = {};

  const stringKeys = ["search", "stockFilter", "sortBy", "sortOrder"];

  for (const key of stringKeys) {
    const value = filters[key];

    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  }

  const numericKeys = [
    "categoryId",
    "minPrice",
    "maxPrice",
    "minStock",
    "maxStock",
    "page",
    "pageSize",
  ];

  for (const key of numericKeys) {
    const value = filters[key];

    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  }

  const response = await axiosClient.get("/reports/stock/search", {
    params,
  });

  return response.data;
};
