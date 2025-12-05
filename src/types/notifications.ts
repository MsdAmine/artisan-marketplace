export interface Notification {
  _id: string;
  userId: string;
  artisanId?: string;
  productId?: string;
  productName?: string;
  type?: "new_product" | string;
  read: boolean;
  createdAt: string;
}
