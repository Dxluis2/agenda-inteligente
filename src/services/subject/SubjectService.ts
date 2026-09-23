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
import { Subject } from '../../types';

type CreateSubjectData = {
  nombre: string;
  codigo: string;
  careerId: string;
  careerName: string;
  descripcion?: string;
};

export class SubjectService {
  static async createSubject(data: CreateSubjectData) {
    return addDoc(collection(db, 'subjects'), {
      nombre: data.nombre,
      codigo: data.codigo,
      careerId: data.careerId,
      careerName: data.careerName,
      descripcion: data.descripcion || '',
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  static async getSubjectsByCareer(
    careerId: string
  ): Promise<Subject[]> {
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('careerId', '==', careerId)
    );

    const snapshot = await getDocs(subjectsQuery);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Subject, 'id'>),
    }));
  }

  static async updateSubject(
    id: string,
    data: Partial<Subject>
  ) {
    return updateDoc(doc(db, 'subjects', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deactivateSubject(id: string) {
    return updateDoc(doc(db, 'subjects', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }

  static async activateSubject(id: string) {
    return updateDoc(doc(db, 'subjects', id), {
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }
  static async deleteSubject(id: string) {
  return updateDoc(doc(db, 'subjects', id), {
    active: false,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
}