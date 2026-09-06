import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Summary } from '../types';

export async function saveSummary(uid: string, summaryData: Omit<Summary, 'id' | 'ownerUid' | 'createdAt'>): Promise<Summary> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const summaryRef = doc(collection(db, `users/${uid}/summaries`));
  const summary: Summary = {
    id: summaryRef.id,
    ownerUid: uid,
    ...summaryData,
    createdAt: Date.now()
  };

  await setDoc(summaryRef, summary);
  return summary;
}

export async function getSummaries(uid: string): Promise<Summary[]> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const summariesCol = collection(db, `users/${uid}/summaries`);
  const q = query(summariesCol, orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as Summary));
}

export async function getSummaryForConversation(uid: string, conversationId: string): Promise<Summary | null> {
  if (!uid || !conversationId) return null;

  const summariesCol = collection(db, `users/${uid}/summaries`);
  const q = query(summariesCol, where("conversationId", "==", conversationId), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Summary;
}

export async function deleteSummary(uid: string, summaryId: string): Promise<void> {
  if (!uid || !summaryId) throw new Error("Missing UID or summaryId");
  await deleteDoc(doc(db, `users/${uid}/summaries/${summaryId}`));
}
