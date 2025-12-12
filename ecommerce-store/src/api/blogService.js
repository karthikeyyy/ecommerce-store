import axiosClient from "./axiosClient";

export function getBlogs() {
  console.log("Fetching blogs from:", axiosClient.defaults.baseURL + "/blogs");
  return axiosClient.get("/blogs");
}

export function getBlogById(id) {
  return axiosClient.get(`/blogs/${id}`);
}
