import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Insight } from '../types';

export async function saveInsights(uid: string, insightsList: Omit<Insight, 'id' | 'ownerUid' | 'createdAt'>[]): Promise<Insight[]> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const now = Date.now();
  const batch = writeBatch(db);
  const createdInsights: Insight[] = [];

  for (const item of insightsList) {
    const ref = doc(collection(db, `users/${uid}/insights`));
    const insight: Insight = {
      id: ref.id,
      ownerUid: uid,
      ...item,
      createdAt: now
    };
    batch.set(ref, insight);
    createdInsights.push(insight);
  }

  await batch.commit();
  return createdInsights;
}

export async function getInsights(uid: string): Promise<Insight[]> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const insightsCol = collection(db, `users/${uid}/insights`);
  const q = query(insightsCol, orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as Insight));
}

export async function deleteInsight(uid: string, insightId: string): Promise<void> {
  if (!uid || !insightId) throw new Error("Missing UID or insightId");
  await deleteDoc(doc(db, `users/${uid}/insights/${insightId}`));
}
