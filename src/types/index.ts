export interface Settings {
  id: string;
  cafeName: string;
  language?: 'ar' | 'en' | 'fr';
  currency: string;
  logo?: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimaryColor: string;
  openingHours?: string | null;
  closingHours?: string | null;
  phone?: string | null;
  address?: string | null;
  welcomeMessage?: string | null;
  siteDescription?: string | null;
  acceptOrders: boolean;
  enableTableService: boolean;
  enableDelivery: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  image?: string | null;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  image?: string | null;
  available: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  description?: string | null;
  active: boolean;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string | null;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

// Updated order statuses with full workflow
export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';

export interface Order {
  id: string;
  orderCode?: string | null;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  total: number;
  notes?: string | null;
  table?: Table;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

// Arabic labels for order statuses
export const ORDER_STATUS_AR: Record<OrderStatus, string> = {
  NEW: 'طلب جديد',
  ACCEPTED: 'تم القبول',
  PREPARING: 'قيد التحضير',
  READY: 'جاهز',
  SERVED: 'تم التقديم',
  PAID: 'تم الدفع',
  CANCELLED: 'ملغي'
};

// Color classes for order statuses
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  NEW: 'bg-gradient-to-r from-amber-500 to-orange-500',
  ACCEPTED: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  PREPARING: 'bg-gradient-to-r from-purple-500 to-pink-500',
  READY: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  SERVED: 'bg-gradient-to-r from-indigo-500 to-violet-500',
  PAID: 'bg-gradient-to-r from-slate-500 to-gray-500',
  CANCELLED: 'bg-gradient-to-r from-red-500 to-rose-500'
};

// Valid status transitions - prevents skipping steps
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: []
};

export interface Reports {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByStatus: {
    new: number;
    accepted: number;
    preparing: number;
    ready: number;
    served: number;
    paid: number;
    cancelled: number;
  };
  hourlySales: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  today: {
    orders: number;
    revenue: number;
  };
}
