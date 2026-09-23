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
import { Course } from '../../types';

type CreateCourseData = {
  careerId: string;
  careerName: string;

  subjectId: string;
  subjectName: string;

  teacherId: string;
  teacherName: string;

  group: string;

  shift: 'MATUTINO' | 'VESPERTINO';

  students?: number;
};

export class CourseService {
  static async createCourse(data: CreateCourseData) {
    return await addDoc(collection(db, 'courses'), {
      ...data,
      students: 0,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  static async getCoursesBySubject(subjectId: string) {
    const q = query(
      collection(db, 'courses'),
      where('subjectId', '==', subjectId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Course, 'id'>),
    }));
  }

static async updateCourse(
  id: string,
  data: Partial<Course>
) {
  return updateDoc(doc(db, 'courses', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

  static async deactivateCourse(id: string) {
    return updateDoc(doc(db, 'courses', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }

  static async activateCourse(id: string) {
    return updateDoc(doc(db, 'courses', id), {
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }

  static async updateStudentsCount(
  id: string,
  total: number
) {
  return updateDoc(doc(db, 'courses', id), {
    students: total,
    updatedAt: new Date().toISOString(),
  });
}
static async deleteCourse(id: string) {
  return updateDoc(doc(db, 'courses', id), {
    active: false,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
static async getCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
  const coursesQuery = query(
    collection(db, 'courses'),
    where('teacherId', '==', teacherId),
    where('active', '==', true)
  );

  const snapshot = await getDocs(coursesQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Course, 'id'>),
  }));
}
}