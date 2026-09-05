import apiRequest from "./api";

export const getCategories = async () => {
  return apiRequest("/categories");
};

export const getCategoryById = async (categoryId) => {
  return apiRequest(`/categories/${categoryId}`);
};

export const createCategory = async (categoryData) => {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const updateCategory = async (
  categoryId,
  categoryData
) => {
  return apiRequest(`/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async (categoryId) => {
  return apiRequest(`/categories/${categoryId}`, {
    method: "DELETE",
  });
};