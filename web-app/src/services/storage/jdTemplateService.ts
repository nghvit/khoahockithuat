import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { JDTemplate } from '../../types';

const COLLECTION = 'jdTemplates';

export class JDTemplateService {
  /**
   * Lưu một combo JD + Trọng số mới
   */
  static async saveTemplate(template: Omit<JDTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving JD template:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách các template của người dùng
   */
  static async getUserTemplates(uid: string): Promise<JDTemplate[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('uid', '==', uid),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const templates: JDTemplate[] = [];

      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as JDTemplate);
      });

      return templates;
    } catch (error) {
      console.error('Error getting user JD templates:', error);
      return [];
    }
  }

  /**
   * Cập nhật một template hiện có
   */
  static async updateTemplate(id: string, data: Partial<Omit<JDTemplate, 'id' | 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating JD template:', error);
      throw error;
    }
  }

  /**
   * Xóa một template
   */
  static async deleteTemplate(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting JD template:', error);
      throw error;
    }
  }
}
