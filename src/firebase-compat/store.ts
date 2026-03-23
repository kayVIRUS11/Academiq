'use client';

import type { SupabaseClient, User as SupabaseUser, AuthError } from '@supabase/supabase-js';

export type Unsubscribe = () => void;

export type FirebaseLikeUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  providerData: Array<{ providerId: string; uid: string }>;
  tenantId: string | null;
  _supabase: SupabaseUser;
};

export type FirebaseLikeAuth = {
  _supabase: SupabaseClient | null;
  currentUser: FirebaseLikeUser | null;
  _listeners: Set<(user: FirebaseLikeUser | null) => void>;
};

export type FirebaseLikeFirestore = {
  _supabase: SupabaseClient | null;
};

export type FirebaseLikeApp = {
  _supabase: SupabaseClient | null;
};

export type SnapshotUnsubscribe = () => void;

export type FirestoreDocumentSnapshot<T = Record<string, any>> = {
  id: string;
  exists: () => boolean;
  data: () => T;
};

export type FirestoreQuerySnapshot<T = Record<string, any>> = {
  docs: Array<{
    id: string;
    data: () => T;
  }>;
};

export type WhereFilterOp = '>=' | '<=' | '<' | '>' | '==';

export type QueryConstraint =
  | { type: 'where'; field: string; op: WhereFilterOp; value: any }
  | { type: 'limit'; count: number };

export type CollectionReference<T = Record<string, any>> = {
  type: 'collection';
  _kind: 'collection';
  _supabase: SupabaseClient | null;
  path: string;
  _segments: string[];
  __memo?: boolean;
};

export type DocumentReference<T = Record<string, any>> = {
  type: 'document';
  _kind: 'document';
  _supabase: SupabaseClient | null;
  path: string;
  _segments: string[];
  id: string;
  __memo?: boolean;
};

export type Query<T = Record<string, any>> = {
  type: 'query';
  _kind: 'query';
  _supabase: SupabaseClient | null;
  path: string;
  _segments: string[];
  constraints: QueryConstraint[];
  __memo?: boolean;
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
};

export type WriteResult = { id: string };

type FirebaseAuthListener = (user: FirebaseLikeUser | null) => void;

const apps: FirebaseLikeApp[] = [];

const authState: FirebaseLikeAuth = {
  _supabase: null,
  currentUser: null,
  _listeners: new Set(),
};

const authSubscription = {
  started: false,
};

function toFirebaseLikeUser(user: SupabaseUser): FirebaseLikeUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? null,
    emailVerified: !!user.email_confirmed_at,
    phoneNumber: user.phone ?? null,
    providerData: [{ providerId: user.app_metadata?.provider ?? 'email', uid: user.id }],
    tenantId: null,
    _supabase: user,
  };
}

function emitAuthChange() {
  for (const listener of authState._listeners) {
    listener(authState.currentUser);
  }
}

async function seedCurrentUser() {
  if (!authState._supabase) return;
  const { data } = await authState._supabase.auth.getUser();
  authState.currentUser = data.user ? toFirebaseLikeUser(data.user) : null;
}

export function initializeAppCompat(supabase: SupabaseClient | null): FirebaseLikeApp {
  if (apps.length) return apps[0];
  const app: FirebaseLikeApp = { _supabase: supabase };
  apps.push(app);
  authState._supabase = supabase;
  return app;
}

export function getAppsCompat(): FirebaseLikeApp[] {
  return apps;
}

export function getAppCompat(): FirebaseLikeApp {
  if (!apps.length) {
    throw new Error('Firebase app has not been initialized.');
  }
  return apps[0];
}

export function getAuthCompat(app: FirebaseLikeApp): FirebaseLikeAuth {
  authState._supabase = app._supabase;
  if (!authSubscription.started && authState._supabase) {
    authSubscription.started = true;
    seedCurrentUser().finally(() => emitAuthChange());
    authState._supabase.auth.onAuthStateChange((_event, session) => {
      authState.currentUser = session?.user ? toFirebaseLikeUser(session.user) : null;
      emitAuthChange();
    });
  }
  return authState;
}

export function getFirestoreCompat(app: FirebaseLikeApp): FirebaseLikeFirestore {
  return { _supabase: app._supabase };
}

export function onAuthStateChangedCompat(
  auth: FirebaseLikeAuth,
  nextOrObserver: FirebaseAuthListener,
  error?: (error: AuthError | Error) => void
): Unsubscribe {
  const listener = (user: FirebaseLikeUser | null) => {
    try {
      nextOrObserver(user);
    } catch (e) {
      error?.(e as Error);
    }
  };

  auth._listeners.add(listener);
  listener(auth.currentUser);
  return () => auth._listeners.delete(listener);
}

export async function createUserWithEmailAndPasswordCompat(auth: FirebaseLikeAuth, email: string, password: string) {
  if (!auth._supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await auth._supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) {
    throw new Error('Sign-up succeeded but no user was returned.');
  }
  auth.currentUser = toFirebaseLikeUser(data.user);
  emitAuthChange();
  return { user: auth.currentUser };
}

export async function signInWithEmailAndPasswordCompat(auth: FirebaseLikeAuth, email: string, password: string) {
  if (!auth._supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await auth._supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) {
    throw new Error('Sign-in succeeded but no user was returned.');
  }
  auth.currentUser = toFirebaseLikeUser(data.user);
  emitAuthChange();
  return { user: auth.currentUser };
}

export async function signOutCompat(auth: FirebaseLikeAuth) {
  if (!auth._supabase) throw new Error('Supabase client is not configured.');
  const { error } = await auth._supabase.auth.signOut();
  if (error) throw error;
  auth.currentUser = null;
  emitAuthChange();
}

export async function updateProfileCompat(
  user: FirebaseLikeUser,
  updates: { displayName?: string }
) {
  const supabase = authState._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: updates.displayName },
  });
  if (error) throw error;
  if (data.user) {
    authState.currentUser = toFirebaseLikeUser(data.user);
    emitAuthChange();
  } else if (authState.currentUser) {
    authState.currentUser = { ...authState.currentUser, displayName: updates.displayName ?? authState.currentUser.displayName };
    emitAuthChange();
  }
  return authState.currentUser ?? user;
}

export async function signInAnonymouslyCompat(auth: FirebaseLikeAuth) {
  if (!auth._supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await auth._supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) {
    throw new Error('Anonymous sign-in succeeded but no user was returned.');
  }
  auth.currentUser = toFirebaseLikeUser(data.user);
  emitAuthChange();
  return { user: auth.currentUser };
}

function collectionNameFromSegments(segments: string[]): string {
  if (segments.length % 2 === 1) return segments[segments.length - 1];
  throw new Error(`Invalid collection path: ${segments.join('/')}`);
}

function docIdFromSegments(segments: string[]): string {
  if (segments.length % 2 === 0) return segments[segments.length - 1];
  throw new Error(`Invalid document path: ${segments.join('/')}`);
}

function ownerIdFromSegments(segments: string[]): string | null {
  if (segments[0] === 'users' && segments[1]) return segments[1];
  return authState.currentUser?.uid ?? null;
}

function tableNameForCollection(segments: string[]): string {
  return collectionNameFromSegments(segments);
}

export function collectionCompat(firestore: FirebaseLikeFirestore, ...pathSegments: string[]): CollectionReference {
  return {
    type: 'collection',
    _kind: 'collection',
    _supabase: firestore._supabase,
    path: pathSegments.join('/'),
    _segments: pathSegments,
  };
}

export function docCompat(
  firestoreOrCollection: FirebaseLikeFirestore | CollectionReference,
  ...pathSegments: string[]
): DocumentReference {
  const isCollection = (firestoreOrCollection as CollectionReference)._kind === 'collection';
  const segments = isCollection
    ? [...(firestoreOrCollection as CollectionReference)._segments, ...pathSegments]
    : pathSegments;
  const supabase = isCollection
    ? (firestoreOrCollection as CollectionReference)._supabase
    : (firestoreOrCollection as FirebaseLikeFirestore)._supabase;

  return {
    type: 'document',
    _kind: 'document',
    _supabase: supabase,
    path: segments.join('/'),
    _segments: segments,
    id: docIdFromSegments(segments),
  };
}

export function whereCompat(field: string, op: WhereFilterOp, value: any): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function limitCompat(count: number): QueryConstraint {
  return { type: 'limit', count };
}

export function queryCompat(base: CollectionReference | Query, ...constraints: QueryConstraint[]): Query {
  const segments = base._segments;
  const path = segments.join('/');
  const allConstraints = base._kind === 'query' ? [...base.constraints, ...constraints] : constraints;

  return {
    type: 'query',
    _kind: 'query',
    _supabase: base._supabase,
    path,
    _segments: segments,
    constraints: allConstraints,
    _query: {
      path: {
        canonicalString: () => path,
        toString: () => path,
      },
    },
  };
}

function createDocumentSnapshot(id: string, data: Record<string, any> | null): FirestoreDocumentSnapshot {
  return {
    id,
    exists: () => data !== null,
    data: () => data ?? {},
  };
}

function createQuerySnapshot(rows: Record<string, any>[]): FirestoreQuerySnapshot {
  return {
    docs: rows.map((row) => ({
      id: String(row.id),
      data: () => row,
    })),
  };
}

function buildSelect(ref: CollectionReference | Query | DocumentReference) {
  const supabase = ref._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const table = tableNameForCollection(ref._kind === 'document' ? ref._segments.slice(0, -1) : ref._segments);
  const ownerId = ownerIdFromSegments(ref._segments);
  let builder: any = supabase.from(table).select('*');
  if (ownerId) builder = builder.eq('uid', ownerId);

  if (ref._kind === 'document') {
    builder = builder.eq('id', ref.id);
  }

  if (ref._kind === 'query') {
    for (const c of ref.constraints) {
      if (c.type === 'where') {
        if (c.op === '==') builder = builder.eq(c.field, c.value);
        if (c.op === '>=') builder = builder.gte(c.field, c.value);
        if (c.op === '<=') builder = builder.lte(c.field, c.value);
        if (c.op === '<') builder = builder.lt(c.field, c.value);
        if (c.op === '>') builder = builder.gt(c.field, c.value);
      }
      if (c.type === 'limit') {
        builder = builder.limit(c.count);
      }
    }
  }

  return builder;
}

export function onSnapshotCompat(
  target: CollectionReference | Query | DocumentReference,
  onNext: ((snapshot: FirestoreQuerySnapshot) => void) | ((snapshot: FirestoreDocumentSnapshot) => void),
  onError?: (error: Error) => void
): SnapshotUnsubscribe {
  let interval: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const poll = async () => {
    if (closed) return;
    try {
      const { data, error } = await buildSelect(target);
      if (error) throw error;
      if (target._kind === 'document') {
        const row = Array.isArray(data) && data.length ? (data[0] as Record<string, any>) : null;
        (onNext as (snapshot: FirestoreDocumentSnapshot) => void)(createDocumentSnapshot(target.id, row));
      } else {
        (onNext as (snapshot: FirestoreQuerySnapshot) => void)(createQuerySnapshot((data ?? []) as Record<string, any>[]));
      }
    } catch (e) {
      onError?.(e as Error);
    }
  };

  poll();
  interval = setInterval(poll, 2000);

  return () => {
    closed = true;
    if (interval) clearInterval(interval);
  };
}

export async function addDocCompat(colRef: CollectionReference, data: Record<string, any>): Promise<WriteResult> {
  const supabase = colRef._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const table = tableNameForCollection(colRef._segments);
  const ownerId = ownerIdFromSegments(colRef._segments);
  const payload = { ...data, uid: data.uid ?? ownerId };
  const { data: inserted, error } = await supabase.from(table).insert(payload).select('id').single();
  if (error) throw error;
  if (!inserted?.id) throw new Error('Insert succeeded but no id was returned.');
  return { id: String(inserted.id) };
}

export async function updateDocCompat(docRef: DocumentReference, data: Record<string, any>): Promise<void> {
  const supabase = docRef._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const table = tableNameForCollection(docRef._segments.slice(0, -1));
  const ownerId = ownerIdFromSegments(docRef._segments);
  let query = supabase.from(table).update(data).eq('id', docRef.id);
  if (ownerId) query = query.eq('uid', ownerId);
  const { error } = await query;
  if (error) throw error;
}

export async function setDocCompat(
  docRef: DocumentReference,
  data: Record<string, any>,
  options?: { merge?: boolean }
): Promise<void> {
  const supabase = docRef._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const table = tableNameForCollection(docRef._segments.slice(0, -1));
  const ownerId = ownerIdFromSegments(docRef._segments);
  const payload = { ...data, id: docRef.id, uid: data.uid ?? ownerId };
  if (options?.merge) {
    const { error } = await supabase.from(table).upsert(payload);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from(table).upsert(payload);
  if (error) throw error;
}

export async function deleteDocCompat(docRef: DocumentReference): Promise<void> {
  const supabase = docRef._supabase;
  if (!supabase) throw new Error('Supabase client is not configured.');
  const table = tableNameForCollection(docRef._segments.slice(0, -1));
  const ownerId = ownerIdFromSegments(docRef._segments);
  let query = supabase.from(table).delete().eq('id', docRef.id);
  if (ownerId) query = query.eq('uid', ownerId);
  const { error } = await query;
  if (error) throw error;
}

export async function getDocCompat(docRef: DocumentReference): Promise<FirestoreDocumentSnapshot> {
  const { data, error } = await buildSelect(docRef);
  if (error) throw error;
  const row = Array.isArray(data) && data.length ? (data[0] as Record<string, any>) : null;
  return createDocumentSnapshot(docRef.id, row);
}

export async function getCountFromServerCompat(colRef: CollectionReference | Query) {
  const { data, error } = await buildSelect(colRef);
  if (error) throw error;
  const count = Array.isArray(data) ? data.length : 0;
  return {
    data: () => ({ count }),
  };
}

export function serverTimestampCompat() {
  return new Date().toISOString();
}
