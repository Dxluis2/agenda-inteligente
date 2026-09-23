import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

import { AppUser } from '../../types';

export class UserService {
  static async getAllUsers(): Promise<AppUser[]> {
    const snapshot = await getDocs(collection(db, 'users'));

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<AppUser, 'id'>),
    }));
  }

  static async suspendUser(id: string) {
    return updateDoc(doc(db, 'users', id), {
      active: false,
      status: 'SUSPENDED',
      updatedAt: new Date().toISOString(),
    });
  }

  static async activateUser(id: string) {
    return updateDoc(doc(db, 'users', id), {
      active: true,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteUser(id: string) {
    return updateDoc(doc(db, 'users', id), {
      active: false,
      status: 'DELETED',
      deletedAt: new Date().toISOString(),
    });
  }
}
