import api from "./api";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "storekeeper" | "delivery_officer";
  employment?: { employeeId?: string; jobTitle?: string; startDate?: string; salary?: number; motorcyclePlate?: string };
  createdAt: string;
  loginPath: string;
}

export interface StoreSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  highlightColor: string;
  visualImages: Record<string, string>;
  lowStockThreshold: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaLabel: string;
  heroCtaLink: string;
}

export const getStaff = async (): Promise<StaffMember[]> => (await api.get("/auth/staff")).data;
export const createStaff = async (payload: Record<string, unknown>): Promise<StaffMember> => (await api.post("/auth/staff", payload)).data;
export const getSettings = async (): Promise<StoreSettings> => (await api.get("/admin/settings")).data;
export const updateSettings = async (payload: StoreSettings): Promise<StoreSettings> => (await api.put("/admin/settings", payload)).data;
export const getBusinessStats = async () => (await api.get("/admin/statistics")).data as {
  orders: { _id: string; count: number }[];
  revenue: { total: number; count: number };
  topProducts: { _id: string; name: string; units: number; sales: number }[];
  lowStock: { _id: string; name: string; stock: number; lowStockThreshold: number; unit: string }[];
  daily: { _id: string; revenue: number; orders: number }[];
};

export interface AuditEvent {
  _id: string;
  actor?: { _id: string; name: string; role: string } | string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  ip?: string;
  createdAt: string;
}

export const getAuditEvents = async (): Promise<AuditEvent[]> => (await api.get("/admin/activity")).data;

export interface InventoryMovement {
  _id: string;
  product: { _id: string; name: string; unit: string } | string;
  order?: { _id: string; orderNumber: string } | string;
  actor?: { _id: string; name: string; role: string } | string;
  kind: string;
  delta: number;
  before: number;
  after: number;
  note?: string;
  createdAt: string;
}

export const getInventoryMovements = async (): Promise<InventoryMovement[]> => (await api.get("/admin/inventory-movements")).data;

export interface FinancialRecord {
  _id: string;
  orderNumber: string;
  createdAt: string;
  user: { name?: string; email?: string; phone?: string } | string;
  items: { product: string; name: string; price: number; unit: string; quantity: number }[];
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
}

export interface FinancialData {
  records: FinancialRecord[];
  totals: { revenue: number; orders: number; items: number; deliveryFees: number };
}

export const getFinancialRecords = async (): Promise<FinancialData> => {
  const { data } = await api.get("/admin/financial-records");
  return data as FinancialData;
};
