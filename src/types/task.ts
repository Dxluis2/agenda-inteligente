export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  subjectId: string;
  teacherId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  horaEntrega?: string;
  prioridad: TaskPriority;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}