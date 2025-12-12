import axiosClient from "../api/axiosClient";

const analyticsService = {
  getSalesAnalytics: (period = "30d") => {
    return axiosClient.get(`/analytics/sales?period=${period}`);
  },
  getTopProducts: (limit = 5) => {
    return axiosClient.get(`/analytics/products/top?limit=${limit}`);
  },
  getCustomerAnalytics: () => {
    return axiosClient.get("/analytics/customers");
  },
  getRevenueForecast: () => {
    return axiosClient.get("/analytics/forecast");
  },
};

export default analyticsService;
