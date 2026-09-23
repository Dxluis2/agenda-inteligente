import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

import { PushNotificationService } from '../notifications/PushNotificationService';

export interface Task {
  id: string;

  courseId: string;
  courseName?: string;
  subjectName?: string;
  group?: string;

  teacherId: string;
  teacherName?: string;

  title: string;
  description?: string;

  dueDate: string;
  dueTime: string;

  active: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export class TaskService {
  static async createTask(
    data: Omit<
      Task,
      'id' | 'active' | 'createdAt'
    >
  ) {
    const createdAt =
      new Date().toISOString();

    const taskRef = await addDoc(
      collection(db, 'tasks'),
      {
        ...data,
        active: true,
        createdAt,
      }
    );

    const studentsQuery = query(
      collection(db, 'courseStudents'),
      where('courseId', '==', data.courseId),
      where('active', '==', true)
    );

    const studentsSnapshot =
      await getDocs(studentsQuery);

    const activeStudents =
      studentsSnapshot.docs.map(
        (studentDocument) => ({
          documentId: studentDocument.id,
          ...studentDocument.data(),
        })
      );

    await Promise.all(
      activeStudents.map(
        async (student: any) => {
          if (!student.studentId) {
            return;
          }

          await addDoc(
            collection(db, 'taskProgress'),
            {
              taskId: taskRef.id,
              courseId: data.courseId,

              studentId: student.studentId,
              studentName:
                student.nombre ||
                student.studentName ||
                '',
              matricula:
                student.matricula || '',

              title: data.title,
              description:
                data.description || '',

              courseName:
                data.courseName ||
                data.subjectName ||
                '',

              subjectName:
                data.subjectName ||
                data.courseName ||
                '',

              dueDate: data.dueDate,
              dueTime: data.dueTime,

              completed: false,
              completedAt: null,

              createdAt,
              updatedAt: createdAt,
            }
          );
        }
      )
    );

    const studentIds = activeStudents
      .map(
        (student: any) =>
          student.studentId
      )
      .filter(
        (studentId: unknown):
          studentId is string =>
            typeof studentId === 'string' &&
            studentId.trim().length > 0
      );

    const pushResult =
      await PushNotificationService
        .sendNewTaskNotification({
          studentIds,
          taskId: taskRef.id,
          courseId: data.courseId,
          subjectName:
            data.subjectName ||
            data.courseName ||
            'Asignatura',
          title: data.title,
          dueDate: data.dueDate,
          dueTime: data.dueTime,
        });

    console.log(
      'Resultado del envío push:',
      pushResult
    );

    return taskRef;
  }

  static async getTasks(
    courseId: string
  ): Promise<Task[]> {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('courseId', '==', courseId),
      where('active', '==', true)
    );

    const snapshot =
      await getDocs(tasksQuery);

    return snapshot.docs.map(
      (document) => {
        const data = document.data();

        return {
          id: document.id,

          courseId:
            data.courseId ?? '',
          courseName:
            data.courseName ?? '',
          subjectName:
            data.subjectName ?? '',
          group:
            data.group ?? '',

          teacherId:
            data.teacherId ?? '',
          teacherName:
            data.teacherName ?? '',

          title:
            data.title ?? 'Sin título',
          description:
            data.description ?? '',

          dueDate:
            data.dueDate ?? '',
          dueTime:
            data.dueTime ?? '',

          active:
            data.active ?? true,
          createdAt:
            data.createdAt ?? '',
          updatedAt:
            data.updatedAt ?? '',
          deletedAt:
            data.deletedAt ?? '',
        };
      }
    );
  }

  static async updateTask(
    id: string,
    data: Partial<Task>
  ) {
    return updateDoc(
      doc(db, 'tasks', id),
      {
        ...data,
        updatedAt:
          new Date().toISOString(),
      }
    );
  }

  static async deleteTask(
    id: string
  ) {
    return updateDoc(
      doc(db, 'tasks', id),
      {
        active: false,
        deletedAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      }
    );
  }
}