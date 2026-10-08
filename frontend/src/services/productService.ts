import api from "./api";
import { Product, ProductListResponse, ProductPromotions } from "../types";

export interface ProductQuery {
  search?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  offer?: boolean;
  new?: boolean;
  brand?: string;
  dietary?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (query: ProductQuery = {}): Promise<ProductListResponse> => {
  const { data } = await api.get("/products", { params: query });
  return data;
};

export const getProductPromotions = async (): Promise<ProductPromotions> => (await api.get("/products/promotions")).data;

export const getProductBySlug = async (
  slug: string
): Promise<{ product: Product; related: Product[] }> => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};

export const getAdminProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products/admin/all");
  return data;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const { data } = await api.post("/products/upload-image", file, {
    headers: { "Content-Type": file.type },
  });
  return data.imageUrl as string;
};

export const createProduct = async (payload: Partial<Product>) => {
  const { data } = await api.post("/products", payload);
  return data;
};

export const updateProduct = async (id: string, payload: Partial<Product>) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
