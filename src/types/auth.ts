export type UserRole = "customer" | "artisan" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type StoredAuth = {
  token?: string;
  user?: User;
};