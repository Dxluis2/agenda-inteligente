import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export interface StudentTaskProgress {
  id: string;
  taskId: string;
  courseId: string;
  studentId: string;
  studentName?: string;
  matricula?: string;

  title: string;
  description?: string;
  courseName?: string;
  subjectName?: string;

  dueDate: string;
  dueTime: string;

  completed: boolean;
  completedAt: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export class TaskProgressService {
  static async getStudentTasks(
    studentId: string
  ): Promise<StudentTaskProgress[]> {
    const studentTasksQuery = query(
      collection(db, 'taskProgress'),
      where('studentId', '==', studentId)
    );

    const snapshot = await getDocs(studentTasksQuery);

    return snapshot.docs.map((document) => {
      const data = document.data();

      return {
        id: document.id,
        taskId: data.taskId ?? '',
        courseId: data.courseId ?? '',
        studentId: data.studentId ?? '',
        studentName: data.studentName ?? '',
        matricula: data.matricula ?? '',

        title: data.title ?? 'Sin título',
        description: data.description ?? '',
        courseName: data.courseName ?? '',
        subjectName: data.subjectName ?? '',

        dueDate: data.dueDate ?? '',
        dueTime: data.dueTime ?? '',

        completed: data.completed ?? false,
        completedAt: data.completedAt ?? null,

        createdAt: data.createdAt ?? '',
        updatedAt: data.updatedAt ?? '',
      };
    });
  }

  static async getProgress(
    taskId: string
  ): Promise<StudentTaskProgress[]> {
    const progressQuery = query(
      collection(db, 'taskProgress'),
      where('taskId', '==', taskId)
    );

    const snapshot = await getDocs(progressQuery);

    return snapshot.docs.map((document) => {
      const data = document.data();

      return {
        id: document.id,
        taskId: data.taskId ?? '',
        courseId: data.courseId ?? '',
        studentId: data.studentId ?? '',
        studentName: data.studentName ?? '',
        matricula: data.matricula ?? '',

        title: data.title ?? 'Sin título',
        description: data.description ?? '',
        courseName: data.courseName ?? '',
        subjectName: data.subjectName ?? '',

        dueDate: data.dueDate ?? '',
        dueTime: data.dueTime ?? '',

        completed: data.completed ?? false,
        completedAt: data.completedAt ?? null,

        createdAt: data.createdAt ?? '',
        updatedAt: data.updatedAt ?? '',
      };
    });
  }

  static async completeTask(progressId: string) {
    return updateDoc(doc(db, 'taskProgress', progressId), {
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
static async updateTaskInformation(
  taskId: string,
  data: any
) {
  const q = query(
    collection(db, 'taskProgress'),
    where('taskId', '==', taskId)
  );

  const snapshot = await getDocs(q);

  await Promise.all(
    snapshot.docs.map(docSnap =>
      updateDoc(docSnap.ref, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    )
  );
}
}