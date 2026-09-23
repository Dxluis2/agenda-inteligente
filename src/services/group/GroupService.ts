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
import { Group } from '../../types';

type CreateGroupData = Omit<Group, 'id' | 'active' | 'createdAt' | 'updatedAt'>;

export class GroupService {
  static async createGroup(data: CreateGroupData) {
    return addDoc(collection(db, 'groups'), {
      ...data,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  static async getActiveGroups(): Promise<Group[]> {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(groupsQuery);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Group, 'id'>),
    }));
  }

  static async getAllGroups(): Promise<Group[]> {
    const snapshot = await getDocs(collection(db, 'groups'));

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Group, 'id'>),
    }));
  }

  static async updateGroup(id: string, data: Partial<Group>) {
    return updateDoc(doc(db, 'groups', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deactivateGroup(id: string) {
    return updateDoc(doc(db, 'groups', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }

  static async activateGroup(id: string) {
    return updateDoc(doc(db, 'groups', id), {
      active: true,
      updatedAt: new Date().toISOString(),
    });
  }
}