import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Conversation, Message, UserRole } from '../types';

/**
 * Service providing strictly UID-scoped Firestore operations for Conversations and Messages.
 * Every operation targets paths under /users/{uid}/ to enforce zero cross-user access.
 */

export async function createConversation(uid: string, initialTitle?: string): Promise<Conversation> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const conversationRef = doc(collection(db, `users/${uid}/conversations`));
  const now = Date.now();
  const conversation: Conversation = {
    id: conversationRef.id,
    ownerUid: uid,
    title: initialTitle || "New Journal Entry",
    createdAt: now,
    updatedAt: now,
    messageCount: 0
  };

  await setDoc(conversationRef, conversation);
  return conversation;
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  if (!uid) throw new Error("Authenticated user UID is required");

  const conversationsCol = collection(db, `users/${uid}/conversations`);
  const q = query(conversationsCol, orderBy("updatedAt", "desc"), limit(50));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as Conversation));
}

export async function getConversation(uid: string, conversationId: string): Promise<Conversation | null> {
  if (!uid || !conversationId) return null;

  const convRef = doc(db, `users/${uid}/conversations/${conversationId}`);
  const snap = await getDoc(convRef);
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() } as Conversation;
}

export async function updateConversationTitle(uid: string, conversationId: string, title: string): Promise<void> {
  if (!uid || !conversationId) throw new Error("Missing UID or conversationId");

  const convRef = doc(db, `users/${uid}/conversations/${conversationId}`);
  await updateDoc(convRef, {
    title,
    updatedAt: Date.now()
  });
}

export async function deleteConversation(uid: string, conversationId: string): Promise<void> {
  if (!uid || !conversationId) throw new Error("Missing UID or conversationId");

  // Delete all nested messages first
  const messagesCol = collection(db, `users/${uid}/conversations/${conversationId}/messages`);
  const messageSnaps = await getDocs(messagesCol);
  
  const batch = writeBatch(db);
  messageSnaps.forEach(mDoc => {
    batch.delete(mDoc.ref);
  });
  
  // Delete conversation doc
  const convRef = doc(db, `users/${uid}/conversations/${conversationId}`);
  batch.delete(convRef);

  await batch.commit();
}

export async function getMessages(uid: string, conversationId: string): Promise<Message[]> {
  if (!uid || !conversationId) return [];

  const messagesCol = collection(db, `users/${uid}/conversations/${conversationId}/messages`);
  const q = query(messagesCol, orderBy("createdAt", "asc"), limit(100));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as Message));
}

export async function saveMessage(
  uid: string, 
  conversationId: string, 
  role: UserRole, 
  content: string
): Promise<Message> {
  if (!uid || !conversationId) throw new Error("Missing UID or conversationId");

  const messagesCol = collection(db, `users/${uid}/conversations/${conversationId}/messages`);
  const messageRef = doc(messagesCol);
  const now = Date.now();

  const msg: Message = {
    id: messageRef.id,
    conversationId,
    role,
    content,
    createdAt: now
  };

  await setDoc(messageRef, msg);

  // Update conversation updatedAt timestamp
  const convRef = doc(db, `users/${uid}/conversations/${conversationId}`);
  await updateDoc(convRef, {
    updatedAt: now
  }).catch(() => {
    // Non-critical if updateDoc encounters race
  });

  return msg;
}

export async function clearAllUserData(uid: string): Promise<void> {
  if (!uid) throw new Error("Missing UID");

  // Fetch all user conversations
  const conversations = await getConversations(uid);
  for (const conv of conversations) {
    await deleteConversation(uid, conv.id);
  }

  // Fetch and delete summaries
  const summariesCol = collection(db, `users/${uid}/summaries`);
  const summarySnaps = await getDocs(summariesCol);
  const batch1 = writeBatch(db);
  summarySnaps.forEach(s => batch1.delete(s.ref));
  await batch1.commit();

  // Fetch and delete insights
  const insightsCol = collection(db, `users/${uid}/insights`);
  const insightSnaps = await getDocs(insightsCol);
  const batch2 = writeBatch(db);
  insightSnaps.forEach(i => batch2.delete(i.ref));
  await batch2.commit();
}
