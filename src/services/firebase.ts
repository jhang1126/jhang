import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Ticket, Technician, UserAccount } from '../types/ticket';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with ignoreUndefinedProperties to prevent crashes on optional fields
export const db = initializeFirestore(
  app, 
  { ignoreUndefinedProperties: true }, 
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Deep clean utility: removes undefined keys recursively so Firestore payloads are always valid
export function sanitizeData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Test Connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}
testConnection();

// Background anonymous auth if supported
export async function tryAutoAuth(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch {
    return null;
  }
}

// Google Sign-In with popup
export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In failed', err);
    throw err;
  }
}

// Logout from Firebase
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

// Real-time listener for Tickets
export function subscribeToTickets(
  onUpdate: (tickets: Ticket[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'tickets';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const tickets: Ticket[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Ticket;
        tickets.push({ ...data, id: docSnap.id });
      });
      // Sort by creation date descending
      tickets.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(tickets);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
  return unsubscribe;
}

// Real-time listener for Technicians
export function subscribeToTechnicians(
  onUpdate: (techs: Technician[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'technicians';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const techs: Technician[] = [];
      snapshot.forEach((docSnap) => {
        techs.push(docSnap.data() as Technician);
      });
      onUpdate(techs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
  return unsubscribe;
}

// Real-time listener for Accounts
export function subscribeToAccounts(
  onUpdate: (accounts: UserAccount[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'accounts';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const accounts: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        accounts.push(docSnap.data() as UserAccount);
      });
      onUpdate(accounts);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
  return unsubscribe;
}

// Write a single ticket to Firestore
export async function setFirestoreTicket(ticket: Ticket): Promise<void> {
  const path = `tickets/${ticket.id}`;
  try {
    const cleanTicket = sanitizeData(ticket);
    await setDoc(doc(db, 'tickets', ticket.id), cleanTicket, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Delete a ticket from Firestore
export async function deleteFirestoreTicket(ticketId: string): Promise<void> {
  const path = `tickets/${ticketId}`;
  try {
    await deleteDoc(doc(db, 'tickets', ticketId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Write a technician to Firestore
export async function setFirestoreTechnician(tech: Technician): Promise<void> {
  const path = `technicians/${tech.id}`;
  try {
    const cleanTech = sanitizeData(tech);
    await setDoc(doc(db, 'technicians', tech.id), cleanTech, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Delete a technician from Firestore
export async function deleteFirestoreTechnician(techId: string): Promise<void> {
  const path = `technicians/${techId}`;
  try {
    await deleteDoc(doc(db, 'technicians', techId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Write an account to Firestore
export async function setFirestoreAccount(account: UserAccount): Promise<void> {
  const path = `accounts/${account.id}`;
  try {
    const cleanAcc = sanitizeData(account);
    await setDoc(doc(db, 'accounts', account.id), cleanAcc, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Delete an account from Firestore
export async function deleteFirestoreAccount(accountId: string): Promise<void> {
  const path = `accounts/${accountId}`;
  try {
    await deleteDoc(doc(db, 'accounts', accountId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Check and seed initial data if Firestore is currently empty
export async function seedFirestoreIfEmpty(
  initialTickets: Ticket[],
  initialTechs: Technician[],
  initialAccounts: UserAccount[]
): Promise<void> {
  try {
    const seedFlag = localStorage.getItem('firestore_initially_seeded');
    const ticketsSnap = await getDocs(collection(db, 'tickets'));
    
    // Only seed if both Firestore has no tickets AND we haven't already marked this client as initialized
    if (ticketsSnap.empty && !seedFlag) {
      console.log('Seeding initial tickets to Firestore...');
      const batch = writeBatch(db);
      initialTickets.forEach((t) => {
        batch.set(doc(db, 'tickets', t.id), sanitizeData(t));
      });
      initialTechs.forEach((tech) => {
        batch.set(doc(db, 'technicians', tech.id), sanitizeData(tech));
      });
      initialAccounts.forEach((acc) => {
        batch.set(doc(db, 'accounts', acc.id), sanitizeData(acc));
      });
      await batch.commit();
      localStorage.setItem('firestore_initially_seeded', 'true');
    }
  } catch (err) {
    console.warn('Seeding check note:', err);
  }
}
