'use client';

import type { ImageAsset } from './types';

// imagens (logos e capturas de tela) ficam no indexeddb para contornar
// o limite de ~5mb do localstorage. o resto do estado segue no localstorage.

const DB_NAME = 'rovex-db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// chaves para migracao sem perda de dados
export const LEGACY_IMAGES_LOCALSTORAGE_KEY = 'rovex-images-v4';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponivel'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllImages(): Promise<ImageAsset[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as ImageAsset[]);
    req.onerror = () => reject(req.error);
  });
}

// sincroniza todas as imagens no banco indexeddb
export async function saveAllImages(images: ImageAsset[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    images.forEach((img) => store.put(img));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllImages(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// le dados legados do localstorage caso existam para migracao
export function readLegacyLocalStorageImages(): ImageAsset[] | null {
  try {
    const raw = window.localStorage.getItem(LEGACY_IMAGES_LOCALSTORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLegacyLocalStorageImages(): void {
  try {
    window.localStorage.removeItem(LEGACY_IMAGES_LOCALSTORAGE_KEY);
  } catch {
    // ignora erro silencioso
  }
}
