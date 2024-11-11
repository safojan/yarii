export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: number;
}
export interface Irole {
  id: number;
  name: string;
  description?: string;
}
export interface Ipermission {
  id: number | null;
  user: number | null;
  permission: number | null;
  permissionName: string | null;
}
