
import { openDB, DBSchema } from 'idb';

const DB_NAME = 'academiq-offline-db';
const STORE_NAME = 'pending-requests';
const DB_VERSION = 1;

interface OfflineRequest {
  id: number;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: any;
  headers: Record<string, string>;
  timestamp: number;
}

interface AcademiqDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: OfflineRequest;
    indexes: { 'timestamp': number };
  };
}

const dbPromise = openDB<AcademiqDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, {
      keyPath: 'id',
      autoIncrement: true,
    });
    store.createIndex('timestamp', 'timestamp');
  },
});

export async function queueRequest(url: string, method: 'POST' | 'PUT' | 'DELETE', body: any, headers: Record<string, string>) {
  const db = await dbPromise;
  await db.add(STORE_NAME, {
    url,
    method,
    body,
    headers,
    timestamp: Date.now(),
  } as Omit<OfflineRequest, 'id'> as any); // Type assertion to satisfy idb library
}

export async function syncOfflineRequests() {
  const db = await dbPromise;
  const requests = await db.getAll(STORE_NAME);
  
  if (requests.length === 0) {
    console.log("No offline requests to sync.");
    return;
  }

  console.log(`Syncing ${requests.length} offline requests...`);
  
  for (const req of requests) {
    try {
        const response = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            // If server returns an error, something is wrong with the request itself.
            // We might want to keep it for inspection or handle it differently.
            // For now, we'll log and remove to prevent getting stuck.
            console.error(`Failed to sync request ${req.id} to ${req.url}. Server responded with ${response.status}`);
            await db.delete(STORE_NAME, req.id); // Or move to a 'failed_requests' store
        } else {
            // Request was successful, remove it from the queue
            await db.delete(STORE_NAME, req.id);
        }
    } catch (error) {
        // This is likely a network error, so we stop and retry next time we're online.
        console.error(`Network error while syncing request ${req.id}. Will retry later.`, error);
        break; // Stop processing further requests
    }
  }
}
