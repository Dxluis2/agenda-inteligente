import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';



import { db } from '../firebase/firebaseConfig';

export interface CourseStudent {
  id: string;
  courseId: string;
  studentId: string;
  nombre: string;
  matricula: string;
  correo?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type AddStudentData = Omit<
  CourseStudent,
  'id' | 'createdAt' | 'updatedAt'
>;

export class CourseStudentService {
  static async studentExists(
    courseId: string,
    studentId: string
  ): Promise<boolean> {
    const studentQuery = query(
      collection(db, 'courseStudents'),
      where('courseId', '==', courseId),
      where('studentId', '==', studentId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(studentQuery);

    return !snapshot.empty;
  }

  static async progressExists(
    taskId: string,
    studentId: string
  ): Promise<boolean> {
    const progressQuery = query(
      collection(db, 'taskProgress'),
      where('taskId', '==', taskId),
      where('studentId', '==', studentId)
    );

    const snapshot = await getDocs(progressQuery);

    return !snapshot.empty;
  }

  static async assignExistingTasks(
    student: AddStudentData
  ) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('courseId', '==', student.courseId),
      where('active', '==', true)
    );

    const tasksSnapshot = await getDocs(tasksQuery);

    await Promise.all(
      tasksSnapshot.docs.map(async (taskDocument) => {
        const task = taskDocument.data();

        const alreadyAssigned =
          await this.progressExists(
            taskDocument.id,
            student.studentId
          );

        if (alreadyAssigned) {
          return;
        }

        await addDoc(collection(db, 'taskProgress'), {
          taskId: taskDocument.id,
          courseId: student.courseId,

          studentId: student.studentId,
          studentName: student.nombre,
          matricula: student.matricula,

          title: task.title || 'Sin título',
          description: task.description || '',

          courseName:
            task.courseName ||
            task.subjectName ||
            '',

          subjectName:
            task.subjectName ||
            task.courseName ||
            '',

          dueDate: task.dueDate || '',
          dueTime: task.dueTime || '',

          completed: false,
          completedAt: null,

          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      })
    );
  }

  static async addStudent(data: AddStudentData) {
    const exists = await this.studentExists(
      data.courseId,
      data.studentId
    );

    if (exists) {
      throw new Error(
        'Este alumno ya está agregado al curso.'
      );
    }

    const enrollmentReference = await addDoc(
      collection(db, 'courseStudents'),
      {
        ...data,
        active: true,
        createdAt: new Date().toISOString(),
      }
    );

    await this.assignExistingTasks(data);

    return enrollmentReference;
  }

  static async getStudents(
    courseId: string
  ): Promise<CourseStudent[]> {
    const studentsQuery = query(
      collection(db, 'courseStudents'),
      where('courseId', '==', courseId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(studentsQuery);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<CourseStudent, 'id'>),
    }));
  }

  static async updateStudent(
    enrollmentId: string,
    data: {
      nombre: string;
      matricula: string;
    }
  ) {
    return updateDoc(
      doc(db, 'courseStudents', enrollmentId),
      {
        nombre: data.nombre.trim(),
        matricula: data.matricula.trim(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  static async removeStudent(
    enrollmentId: string
  ) {
    return deleteDoc(
      doc(db, 'courseStudents', enrollmentId)
    );
  }
  static async getCoursesByStudent(
  studentId: string
) {
  const enrollmentsQuery = query(
    collection(db, 'courseStudents'),
    where('studentId', '==', studentId),
    where('active', '==', true)
  );

  const enrollmentsSnapshot = await getDocs(
    enrollmentsQuery
  );

  const courses = await Promise.all(
    enrollmentsSnapshot.docs.map(
      async (enrollmentDocument) => {
        const enrollment =
          enrollmentDocument.data();

        const courseReference = doc(
          db,
          'courses',
          enrollment.courseId
        );

        const courseSnapshot = await getDoc(
          courseReference
        );

        if (!courseSnapshot.exists()) {
          return null;
        }

        return {
          id: courseSnapshot.id,
          ...courseSnapshot.data(),
        };
      }
    )
  );

  return courses.filter(Boolean);
}
}