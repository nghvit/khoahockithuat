import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { JDTemplate } from '../../types';

const COLLECTION = 'jdHistory';

export class JDHistoryService {
  /**
   * Tự động lưu lịch sử JD (giới hạn 1 bản ghi cho mỗi chức danh/nội dung tương tự nếu muốn, 
   * nhưng để đơn giản ta cứ lưu mỗi lần hoàn thành)
   */
  static async saveHistory(data: Omit<JDTemplate, 'id' | 'name' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    if (!data.uid || !data.jdText) return null;
    
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        name: `Lịch sử: ${data.jobPosition || 'Không tên'}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving JD history:', error);
      return null;
    }
  }

  /**
   * Lấy danh sách lịch sử gần đây (20 bản ghi)
   */
  static async getUserHistory(uid: string): Promise<JDTemplate[]> {
    if (!uid) return [];
    
    try {
      const q = query(
        collection(db, COLLECTION),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const history: JDTemplate[] = [];

      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        } as JDTemplate);
      });

      return history;
    } catch (error) {
      console.error('Error getting user JD history:', error);
      return [];
    }
  }
}
