export interface Course {
  id: string;

  careerId: string;
  careerName: string;

  subjectId: string;
  subjectName: string;

  teacherId: string;
  teacherName: string;

  group: string;

  shift: 'MATUTINO' | 'VESPERTINO';

  students: number;

  active: boolean;

  createdAt: string;
  updatedAt?: string;
}