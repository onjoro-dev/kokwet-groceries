import api from "./api";
import { Category } from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get("/categories");
  return data;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const { data } = await api.get(`/categories/${slug}`);
  return data;
};

export const createCategory = async (payload: Partial<Category>) => {
  const { data } = await api.post("/categories", payload);
  return data;
};

export const updateCategory = async (id: string, payload: Partial<Category>) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
