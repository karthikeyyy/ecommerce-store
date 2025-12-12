import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addProduct } from "../services/productService";
import { apiRequest } from "../api/api";

const AddProduct = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    sku: "",
    price: "",
    costPrice: "",
    salePrice: "",
    quantity: "",
    brand: "",
    category: [],
    shortDescription: "",
    description: "",
    discount: "",
    tags: [],
    status: "Published",
    stockStatus: "In Stock",
    mainImage: "",
    galleryImages: [],
    attributes: [],
  });

  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, tagRes, attrRes] = await Promise.all([
          apiRequest("/categories"),
          apiRequest("/tags"),
          apiRequest("/attributes"),
        ]);
        setCategories(Array.isArray(catRes) ? catRes : catRes.data || []);
        setAvailableTags(Array.isArray(tagRes) ? tagRes : tagRes.data || []);
        setAttributesList(Array.isArray(attrRes) ? attrRes : attrRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadMeta();
  }, []);

  // Auto-calculate discount when price and salePrice change
  useEffect(() => {
    const basePrice = Number(data.price);
    const salePrice = Number(data.salePrice);

    if (basePrice > 0 && salePrice > 0 && salePrice < basePrice) {
      const calculatedDiscount = Math.round(((basePrice - salePrice) / basePrice) * 100);
      setData(prev => ({ ...prev, discount: calculatedDiscount }));
    } else if (salePrice === 0 || salePrice >= basePrice) {
      setData(prev => ({ ...prev, discount: 0 }));
    }
  }, [data.price, data.salePrice]);

  const convertToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setData((prev) => ({ ...prev, mainImage: base64 }));
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const base64Files = await Promise.all(files.map(convertToBase64));
    setData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...base64Files],
    }));
  };

  const toggleCategory = (id) => {
    setData((prev) => {
      const exists = prev.category.includes(id);
      return {
        ...prev,
        category: exists
          ? prev.category.filter((c) => c !== id)
          : [...prev.category, id],
      };
    });
  };

  const toggleTag = (id) => {
    setData((prev) => {
      const exists = prev.tags.includes(id);
      return {
        ...prev,
        tags: exists
          ? prev.tags.filter((t) => t !== id)
          : [...prev.tags, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!data.price) {
      alert("Price is required");
      return;
    }

    setLoading(true);

    const images = [data.mainImage, ...data.galleryImages].filter(Boolean);
    const sku =
      data.sku.trim() ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const payload = {
      ...data,
      sku,
      price: Number(data.price) || 0,
      costPrice: Number(data.costPrice) || 0,
      salePrice: Number(data.salePrice) || 0,
      quantity: Number(data.quantity) || 0,
      discount: Number(data.discount) || 0,
      images,
    };

    delete payload.mainImage;
    delete payload.galleryImages;

    try {
      const res = await addProduct(payload);
      if (!res?.success) {
        alert(res?.message || "Failed to add product");
        setLoading(false);
        return;
      }
      navigate("/product");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Add Product
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Create a new product with rich details, pricing, and media.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/product")}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm font-medium bg-white hover:bg-gray-100 transition dark:border-slate-600 dark:text-slate-100 dark:bg-transparent dark:hover:bg-slate-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-product-form"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-md hover:bg-emerald-400 transition disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>

            <form
              id="add-product-form"
              onSubmit={handleSubmit}
              className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]"
            >
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                        General
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        Product overview
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Product name"
                      placeholder="Nike Air Zoom Pegasus 41"
                      value={data.name}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                    <TextField
                      label="SKU (optional)"
                      placeholder="PEG-41-BLK-9"
                      value={data.sku}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, sku: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Brand"
                      placeholder="Nike"
                      value={data.brand}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, brand: e.target.value }))
                      }
                    />
                    <NumberField
                      label="Stock quantity"
                      placeholder="0"
                      value={data.quantity}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <LabelText>Short description</LabelText>
                    <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/60">
                      <CKEditor
                        editor={ClassicEditor}
                        data={data.shortDescription}
                        onChange={(event, editor) =>
                          setData((prev) => ({
                            ...prev,
                            shortDescription: editor.getData(),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                        Pricing
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        Price & discounts
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <NumberField
                      label="Base price"
                      placeholder="0.00"
                      value={data.price}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                    <NumberField
                      label="Cost price"
                      placeholder="0.00"
                      value={data.costPrice}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          costPrice: e.target.value,
                        }))
                      }
                    />
                    <NumberField
                      label="Sale price"
                      placeholder="0.00"
                      value={data.salePrice}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          salePrice: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <NumberField
                      label="Discount (%)"
                      placeholder="0"
                      value={data.discount}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                    />
                    <SelectField
                      label="Status"
                      value={data.status}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      options={["Published", "Draft"]}
                    />
                    <SelectField
                      label="Stock status"
                      value={data.stockStatus}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          stockStatus: e.target.value,
                        }))
                      }
                      options={["In Stock", "Out of Stock"]}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                        Content
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        Full description
                      </h2>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/60">
                    <CKEditor
                      editor={ClassicEditor}
                      data={data.description}
                      onChange={(event, editor) =>
                        setData((prev) => ({
                          ...prev,
                          description: editor.getData(),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                      Variants
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Product Attributes
                    </h2>
                  </div>

                  {attributesList.length === 0 ? (
                    <p className="text-sm text-gray-500">No attributes found. Create them in Products &gt; Attributes.</p>
                  ) : (
                    <div className="space-y-4">
                      {attributesList.map((attr) => {
                        const selectedAttr = data.attributes.find(
                          (a) => a.attribute === attr._id
                        );
                        const isAttrSelected = !!selectedAttr;

                        return (
                          <div
                            key={attr._id}
                            className={`rounded-xl border p-4 transition ${isAttrSelected
                              ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-500/5"
                              : "border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950/40"
                              }`}
                          >
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                                checked={isAttrSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setData((prev) => ({
                                      ...prev,
                                      attributes: [
                                        ...prev.attributes,
                                        {
                                          attribute: attr._id,
                                          name: attr.name,
                                          values: [],
                                        },
                                      ],
                                    }));
                                  } else {
                                    setData((prev) => ({
                                      ...prev,
                                      attributes: prev.attributes.filter(
                                        (a) => a.attribute !== attr._id
                                      ),
                                    }));
                                  }
                                }}
                              />
                              <span className="font-medium text-gray-900 dark:text-slate-100">
                                {attr.name}
                              </span>
                            </label>

                            {isAttrSelected && (
                              <div className="mt-3 pl-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {attr.values.map((val) => {
                                  const isValueSelected = selectedAttr.values.includes(val);
                                  return (
                                    <label
                                      key={val}
                                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer hover:text-gray-900 dark:hover:text-slate-200"
                                    >
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                                        checked={isValueSelected}
                                        onChange={() => {
                                          const newValues = isValueSelected
                                            ? selectedAttr.values.filter((v) => v !== val)
                                            : [...selectedAttr.values, val];

                                          const newAttributes = data.attributes.map((a) =>
                                            a.attribute === attr._id
                                              ? { ...a, values: newValues }
                                              : a
                                          );
                                          setData((prev) => ({
                                            ...prev,
                                            attributes: newAttributes,
                                          }));
                                        }}
                                      />
                                      {val}
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">


                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                      Media
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">Images</h2>
                  </div>

                  <div className="space-y-3">
                    <LabelText>Main image</LabelText>
                    {data.mainImage ? (
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-950/60">
                        <img
                          src={data.mainImage}
                          alt="Main"
                          className="h-56 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                          <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow">
                            Change image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleMainImageUpload}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-emerald-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:bg-slate-900/70">
                        <ImagePlus className="mb-2 h-8 w-8" />
                        <span className="text-xs font-medium">
                          Click to upload main image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-3">
                    <LabelText>Gallery images</LabelText>
                    <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-xs transition hover:border-emerald-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:bg-slate-900/70">
                      <ImagePlus className="mb-1 h-6 w-6" />
                      <span className="font-medium">
                        Click to upload gallery images
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                      />
                    </label>
                    {data.galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {data.galleryImages.map((img, index) => (
                          <button
                            key={index}
                            type="button"
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-950/50"
                          >
                            <img
                              src={img}
                              alt=""
                              className="h-20 w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setData((prev) => ({
                                    ...prev,
                                    galleryImages:
                                      prev.galleryImages.filter(
                                        (_, i) => i !== index
                                      ),
                                  }));
                                }}
                                className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                              >
                                Remove
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur dark:shadow-xl dark:shadow-slate-950/60">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                      Taxonomy
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      Categories & tags
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <LabelText>Categories</LabelText>
                    <div className="flex flex-wrap gap-2">
                      {categories.length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-slate-500">
                          No categories found.
                        </span>
                      )}
                      {categories.map((cat) => {
                        const active = data.category.includes(cat._id);
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => toggleCategory(cat._id)}
                            className={
                              "rounded-full px-3 py-1 text-xs font-medium border transition " +
                              (active
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-slate-500")
                            }
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <LabelText>Tags</LabelText>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-slate-500">
                          No tags found.
                        </span>
                      )}
                      {availableTags.map((tag) => {
                        const active = data.tags.includes(tag._id);
                        const bg = tag.color || "#22c55e";
                        return (
                          <button
                            key={tag._id}
                            type="button"
                            onClick={() => toggleTag(tag._id)}
                            className={
                              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition " +
                              (active
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-slate-500")
                            }
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: bg }}
                            />
                            <span>{tag.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const LabelText = ({ children }) => (
  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
    {children}
  </p>
);

const TextField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <LabelText>{label}</LabelText>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-0 transition placeholder:text-gray-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500"
    />
  </div>
);

const NumberField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <LabelText>{label}</LabelText>
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-0 transition placeholder:text-gray-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <LabelText>{label}</LabelText>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-0 transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-emerald-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AddProduct;
