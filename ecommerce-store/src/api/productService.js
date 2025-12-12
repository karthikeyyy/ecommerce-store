import axiosClient from "./axiosClient";

export function getProducts(params = {}) {
  return axiosClient.get("/products", { params });
}

export function getProductById(id) {
  return axiosClient.get(`/products/${id}`);
}
