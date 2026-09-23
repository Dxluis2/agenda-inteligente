export interface Subject {
  id: string;
  nombre: string;
  codigo: string;

  careerId: string;
  careerName: string;

  descripcion?: string;

  active: boolean;
  createdAt: string;
  updatedAt?: string;
}