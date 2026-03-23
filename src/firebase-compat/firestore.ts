'use client';

import type {
  FirebaseLikeFirestore,
  CollectionReference as StoreCollectionReference,
  DocumentReference as StoreDocumentReference,
  Query as StoreQuery,
  QueryConstraint,
} from './store';
import {
  getFirestoreCompat,
  collectionCompat,
  docCompat,
  queryCompat,
  onSnapshotCompat,
  addDocCompat,
  updateDocCompat,
  deleteDocCompat,
  setDocCompat,
  getDocCompat,
  getCountFromServerCompat,
  whereCompat,
  limitCompat,
  serverTimestampCompat,
} from './store';
import type { FirebaseApp } from './app';
import { getApp } from './app';

export type Firestore = FirebaseLikeFirestore;
export type CollectionReference<T = Record<string, any>> = import('./store').CollectionReference;
export type DocumentReference<T = Record<string, any>> = import('./store').DocumentReference;
export type Query<T = Record<string, any>> = import('./store').Query;
export type DocumentData = Record<string, any>;
export type QuerySnapshot<T = DocumentData> = import('./store').FirestoreQuerySnapshot;
export type DocumentSnapshot<T = DocumentData> = import('./store').FirestoreDocumentSnapshot;
export type FirestoreError = Error;
export type SetOptions = { merge?: boolean };
export type QueryDocumentSnapshot<T = DocumentData> = {
  id: string;
  data: () => T;
};

export type QuerySnapshotTyped<T = DocumentData> = {
  docs: QueryDocumentSnapshot<T>[];
};

export type DocumentSnapshotTyped<T = DocumentData> = {
  id: string;
  exists: () => boolean;
  data: () => T;
};

type SnapshotObserver<T> = {
  next: (snapshot: T) => void;
  error?: (error: FirestoreError) => void;
};

export function getFirestore(app?: FirebaseApp): Firestore {
  return getFirestoreCompat(app ?? getApp());
}

export function collection(firestore: Firestore, ...pathSegments: string[]): CollectionReference {
  return collectionCompat(firestore, ...pathSegments);
}

export function doc(
  firestoreOrCollection: Firestore | CollectionReference,
  ...pathSegments: string[]
): DocumentReference {
  return docCompat(firestoreOrCollection as unknown as FirebaseLikeFirestore | StoreCollectionReference, ...pathSegments);
}

export function query(base: CollectionReference | Query, ...constraints: QueryConstraint[]): Query {
  return queryCompat(base as unknown as StoreCollectionReference | StoreQuery, ...constraints);
}

export function onSnapshot(
  target: DocumentReference,
  onNextOrObserver:
    | ((snapshot: DocumentSnapshotTyped) => void)
    | SnapshotObserver<DocumentSnapshotTyped>,
  onError?: (error: FirestoreError) => void
): () => void;
export function onSnapshot(
  target: CollectionReference | Query,
  onNextOrObserver:
    | ((snapshot: QuerySnapshotTyped) => void)
    | SnapshotObserver<QuerySnapshotTyped>,
  onError?: (error: FirestoreError) => void
): () => void;
export function onSnapshot(
  target: CollectionReference | Query | DocumentReference,
  onNextOrObserver:
    | ((snapshot: QuerySnapshotTyped) => void)
    | ((snapshot: DocumentSnapshotTyped) => void)
    | SnapshotObserver<QuerySnapshotTyped>
    | SnapshotObserver<DocumentSnapshotTyped>,
  onError?: (error: FirestoreError) => void
) {
  const onNext =
    typeof onNextOrObserver === 'function'
      ? onNextOrObserver
      : (onNextOrObserver.next as ((snapshot: QuerySnapshot) => void) | ((snapshot: DocumentSnapshot) => void));
  const errorHandler =
    typeof onNextOrObserver === 'function' ? onError : (onNextOrObserver.error ?? onError);

  return onSnapshotCompat(
    target as unknown as StoreCollectionReference | StoreQuery | StoreDocumentReference,
    onNext as ((snapshot: import('./store').FirestoreQuerySnapshot) => void) | ((snapshot: import('./store').FirestoreDocumentSnapshot) => void),
    errorHandler
  );
}

export function addDoc(colRef: CollectionReference, data: DocumentData) {
  return addDocCompat(colRef, data);
}

export function updateDoc(docRef: DocumentReference, data: DocumentData) {
  return updateDocCompat(docRef, data);
}

export function deleteDoc(docRef: DocumentReference) {
  return deleteDocCompat(docRef);
}

export function setDoc(docRef: DocumentReference, data: DocumentData, options?: SetOptions) {
  return setDocCompat(docRef, data, options);
}

export function getDoc(docRef: DocumentReference) {
  return getDocCompat(docRef);
}

export function getCountFromServer(target: CollectionReference | Query) {
  return getCountFromServerCompat(target);
}

export function where(field: string, op: '>=' | '<=' | '<' | '>' | '==', value: any): QueryConstraint {
  return whereCompat(field, op, value);
}

export function limit(count: number): QueryConstraint {
  return limitCompat(count);
}

export function serverTimestamp() {
  return serverTimestampCompat();
}
