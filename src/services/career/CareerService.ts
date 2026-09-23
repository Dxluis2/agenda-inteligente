import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';
import { Career } from '../../types';

type CreateCareerData = {
  nombre: string;
  descripcion?: string;
};

export class CareerService {
  static async createCareer(data: CreateCareerData) {
    return addDoc(collection(db, 'careers'), {
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  static async getAllCareers(): Promise<Career[]> {
    const snapshot = await getDocs(collection(db, 'careers'));

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Career, 'id'>),
    }));
  }

  static async updateCareer(
    id: string,
    data: Partial<Career>
  ) {
    return updateDoc(doc(db, 'careers', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deactivateCareer(id: string) {
    return updateDoc(doc(db, 'careers', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }

  static async activateCareer(id: string) {
    return updateDoc(doc(db, 'careers', id), {
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }
  static async deleteCareer(id: string) {
  return updateDoc(doc(db, 'careers', id), {
    active: false,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

}