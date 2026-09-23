import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export interface Teacher {
  id: string;
  uid: string;
  nombre: string;
  correo: string;
}

export class TeacherService {
  static async getTeachers(): Promise<Teacher[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.data().uid,
      nombre: doc.data().nombre,
      correo: doc.data().correo,
    }));
  }
}