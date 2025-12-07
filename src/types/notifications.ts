export interface Notification {
  _id: string;
  userId: string;
  artisanId?: string;
  followerId?: string;
  followerName?: string;
  productId?: string;
  productName?: string;
  type?: "new_product" | "new_follower" | string;
  read: boolean;
  createdAt: string;
}
