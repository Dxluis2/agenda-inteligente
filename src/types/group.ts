export interface Group {
  id: string;

  nombre: string;

  careerId: string;
  careerName: string;

  cuatrimestre: string;

  turno: 'MATUTINO' | 'VESPERTINO';

  active: boolean;

  createdAt: string;
  updatedAt?: string;
}