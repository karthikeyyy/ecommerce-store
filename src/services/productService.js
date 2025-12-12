const BASE = "http://localhost:4000/api/products";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ---------------- GET ALL PRODUCTS ---------------- */
export const getProducts = async () => {
  try {
    const res = await fetch(BASE, { headers: getHeaders() });
    const data = await res.json().catch(() => null);

    if (!data || data.success === false) return [];

    return data.products || [];
  } catch (err) {
    console.log("GET PRODUCTS ERROR:", err);
    return [];
  }
};

/* ---------------- GET SINGLE PRODUCT ---------------- */
export const getProduct = async (id) => {
  try {
    const res = await fetch(`${BASE}/${id}`, { headers: getHeaders() });
    const data = await res.json().catch(() => null);

    return data?.product || null;
  } catch (err) {
    console.log("GET PRODUCT ERROR:", err);
    return null;
  }
};

/* ---------------- ADD PRODUCT ---------------- */
export const addProduct = async (product) => {
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(product),
    });

    return await res.json();
  } catch (err) {
    console.log("ADD PRODUCT ERROR:", err);
    return { success: false, message: "Network error" };
  }
};

/* ---------------- UPDATE PRODUCT ---------------- */
export const updateProduct = async (id, product) => {
  try {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(product),
    });

    return await res.json();
  } catch (err) {
    console.log("UPDATE PRODUCT ERROR:", err);
    return { success: false };
  }
};

/* ---------------- DELETE PRODUCT ---------------- */
export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    return await res.json();
  } catch (err) {
    console.log("DELETE PRODUCT ERROR:", err);
    return { success: false };
  }
};
