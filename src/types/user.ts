export type UserRole = 'admin' | 'teacher' | 'student';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AppUser {
  id: string;
  uid?: string;
  nombre: string;
  correo: string;
  matricula?: string;
  role: UserRole;
  active: boolean;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}