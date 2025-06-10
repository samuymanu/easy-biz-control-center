export type UserRole = "admin" | "administrador" | "vendedor";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: "active" | "inactive";
}