export type UserRole = "customer" | "artisan" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
};

export type StoredAuth = {
  token?: string;
  user?: User;
};