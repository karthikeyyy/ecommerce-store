const BASE_URL = "http://localhost:4000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data?.message || "Something went wrong",
      };
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      message: "Network error",
    };
  }
};
