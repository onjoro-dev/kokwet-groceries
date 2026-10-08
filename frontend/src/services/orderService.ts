import api from "./api";
import { Order, OrderStatus, PaymentMethod } from "../types";

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  deliveryAddress: {
    area: string;
    landmark: string;
    phone: string;
    recipientName: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders/mine");
  return data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export interface OrderReceipt {
  orderNumber: string;
  createdAt: string;
  customer: string;
  phone: string;
  items: Array<{ name: string; unit: string; quantity: number; price: number }>;
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  receiptNumber: string;
}

export const getOrderReceipt = async (id: string): Promise<OrderReceipt> => {
  const { data } = await api.get(`/orders/${id}/receipt`);
  return data as OrderReceipt;
};

export const getAllOrders = async (status?: string): Promise<Order[]> => {
  const { data } = await api.get("/orders", { params: status ? { status } : {} });
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export const confirmMpesaPayment = async (id: string): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}/payment`);
  return data;
};

export const getOrderStats = async () => {
  const { data } = await api.get("/orders/admin/stats");
  return data as {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  };
};

export const downloadOrderReceipt = async (id: string) => {
  const receipt = await getOrderReceipt(id);
  const lines = [
    "KOKWET GROCERY RECEIPT",
    `Receipt: ${receipt.orderNumber}`,
    `Issued: ${new Date(receipt.createdAt).toLocaleString("en-KE")}`,
    `Customer: ${receipt.customer}`,
    `Phone: ${receipt.phone}`,
    "",
    ...receipt.items.map((item) => `${item.quantity} × ${item.name} (${item.unit}) — ${item.price * item.quantity}`),
    "",
    `Items subtotal: ${receipt.itemsTotal}`,
    `Delivery fee: ${receipt.deliveryFee}`,
    `Total paid: ${receipt.grandTotal}`,
    `Payment: ${receipt.paymentStatus} / ${receipt.paymentMethod}`,
    `M-Pesa receipt: ${receipt.receiptNumber || "Recorded in order"}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${receipt.orderNumber}-receipt.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};
