import api from "./api";
import { User } from "../types";

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<User> => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const fetchMe = async (): Promise<User> => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const fetchUserByToken = async (token: string): Promise<User> => {
  const { data } = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const updateProfile = async (payload: {
  name: string;
  email: string;
  phone: string;
  password?: string;
}) => {
  const { data } = await api.put("/auth/profile", payload);
  return data;
};

export const getSocialConfig = async () => {
  const { data } = await api.get("/auth/social/config");
  return data;
};

export const addAddress = async (payload: {
  label: string;
  area: string;
  landmark: string;
  phone: string;
  recipientName: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const { data } = await api.put("/auth/addresses", payload);
  return data;
};
