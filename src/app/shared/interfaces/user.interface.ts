export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'user';
  permissions: { [key: string]: boolean };
}
