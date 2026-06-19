export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  text: string;
  images?: string[];
  reply?: string;
}

export interface ColorVariation {
  name: string;
  hex: string;
}

export interface ProductSpecifications {
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  vendorId: string;
  description: string;
  specifications: ProductSpecifications;
  images: string[];
  videoUrl?: string;
  sizes: string[];
  colors: ColorVariation[];
  inventory: number;
  weight: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  sales: number;
  ordersCount: number;
  rating: number;
  commissionRate: number;
  joinedDate: string;
  logo: string;
  bio?: string;
}

export interface OrderedProduct {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  products: OrderedProduct[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  deliveryMethod: string;
  paymentGateway: string;
  status: "Pending" | "Confirmed" | "Processing" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Refunded";
  createdAt: string;
  shippingAddress: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: ColorVariation;
}

export interface SupportTicketMessage {
  sender: "customer" | "admin";
  text: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  subject: string;
  status: string;
  date: string;
  messages: SupportTicketMessage[];
}

export interface SystemSettings {
  globalCommissionDefault: number;
  loyaltyCashbackRate: number;
  referralRewardAmount: number;
  supportTickets: SupportTicket[];
}
