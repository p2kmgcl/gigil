import * as pkg from '../../../package.json';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
} from 'firebase/auth';
import {
  CollectionReference,
  DocumentReference,
  enableMultiTabIndexedDbPersistence,
  Firestore,
  FirestoreDataConverter,
  getDoc,
  getDocFromCache,
  getFirestore,
  initializeFirestore,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

const INITIALIZED_KEY = `${pkg.name}-${pkg.version}-firestone-initialized`;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export async function init() {
  app = initializeApp({
    apiKey: 'AIzaSyDbPzrRLhwS397moYsZuRQfCmn_CUxrIMw',
    authDomain: 'gigil-5ac9c.firebaseapp.com',
    projectId: 'gigil-5ac9c',
    storageBucket: 'gigil-5ac9c.appspot.com',
    messagingSenderId: '660164657539',
    appId: '1:660164657539:web:24c58b0740963d69b5b6b6',
  });

  await new Promise<void>((resolve) => {
    onAuthStateChanged(getAuth(app), async () => {
      if (!(globalThis as any)[INITIALIZED_KEY]) {
        const firestore = initializeFirestore(app, {});
        await enableMultiTabIndexedDbPersistence(firestore);
      }

      (globalThis as any)[INITIALIZED_KEY] = true;
      auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      db = getFirestore(app);
      resolve();
    });
  });
}

export function getMaybeCurrentUser() {
  return getAuth(app).currentUser;
}

export function getDB() {
  return db;
}

export function signIn() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export interface ExtendedConverter<K extends string, T> {
  createCollection(fieldPath: string[]): CollectionReference<T>;
  createReference(fieldPath: string[]): Reference<T>;
  toFirestore(modelObject: T): { [key in keyof Omit<T, K>]: any };
  fromFirestore(snapshot: QueryDocumentSnapshot<T>): T;
}

export class Reference<T> {
  private _cachedValue: T | null = null;
  public readonly doc: DocumentReference<T>;

  constructor(
    _doc: DocumentReference,
    _converter: FirestoreDataConverter<T>,
    private readonly _options = { defaultToCache: false },
  ) {
    this.doc = _doc.withConverter(_converter);
  }

  async load() {
    if (!this._cachedValue) {
      const getRemoteDoc = async () => {
        this._cachedValue = await getDoc(this.doc).then(
          (snapshot) => snapshot.data() || null,
        );
      };

      if (this._options.defaultToCache) {
        try {
          this._cachedValue = await getDocFromCache(this.doc).then(
            (snapshot) => snapshot.data() || null,
          );
        } catch (error) {
          await getRemoteDoc();
        }
      } else {
        await getRemoteDoc();
      }
    }
  }

  get() {
    if (!this._cachedValue) {
      throw new ReferenceError(
        `Value not resolved for "${this.doc.path}", did you call load() first?`,
      );
    }

    return this._cachedValue;
  }
}
