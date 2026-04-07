import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DB_NAME = "tofrance-offline";
const DB_VERSION = 1;
const EXERCISES_STORE = "exercises";
const PENDING_RESULTS_STORE = "pending_results";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(EXERCISES_STORE)) {
        db.createObjectStore(EXERCISES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PENDING_RESULTS_STORE)) {
        db.createObjectStore(PENDING_RESULTS_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function useOfflineExercises(moduleId?: string) {
  const { user } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedExercises, setCachedExercises] = useState<any[] | null>(null);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Pre-cache exercises for a module
  const cacheModuleExercises = useCallback(async (modId: string) => {
    try {
      const { data } = await supabase
        .from("fle_exercises")
        .select("*")
        .eq("module_id", modId)
        .order("sort_order");

      if (!data || data.length === 0) return;

      const db = await openDB();
      const tx = db.transaction(EXERCISES_STORE, "readwrite");
      const store = tx.objectStore(EXERCISES_STORE);
      for (const ex of data) {
        store.put({ ...ex, _moduleId: modId, _cachedAt: Date.now() });
      }
    } catch (err) {
      console.warn("[offline] Failed to cache exercises:", err);
    }
  }, []);

  // Load cached exercises for current module
  const loadCachedExercises = useCallback(async (modId: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction(EXERCISES_STORE, "readonly");
      const store = tx.objectStore(EXERCISES_STORE);
      const all: any[] = [];

      return new Promise<any[]>((resolve) => {
        const cursor = store.openCursor();
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (c) {
            if (c.value._moduleId === modId) all.push(c.value);
            c.continue();
          } else {
            resolve(all.sort((a, b) => a.sort_order - b.sort_order));
          }
        };
        cursor.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }, []);

  // Save a result locally when offline
  const savePendingResult = useCallback(async (result: any) => {
    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_RESULTS_STORE, "readwrite");
      tx.objectStore(PENDING_RESULTS_STORE).put({ ...result, _savedAt: Date.now() });
    } catch (err) {
      console.warn("[offline] Failed to save pending result:", err);
    }
  }, []);

  // Sync pending results when back online
  const syncPendingResults = useCallback(async () => {
    if (!user) return 0;
    try {
      const db = await openDB();
      const tx = db.transaction(PENDING_RESULTS_STORE, "readwrite");
      const store = tx.objectStore(PENDING_RESULTS_STORE);

      return new Promise<number>((resolve) => {
        const all: any[] = [];
        const cursor = store.openCursor();
        cursor.onsuccess = async () => {
          const c = cursor.result;
          if (c) {
            all.push({ key: c.key, value: c.value });
            c.continue();
          } else {
            let synced = 0;
            for (const item of all) {
              const { _savedAt, id, ...rest } = item.value;
              const { error } = await supabase.from("fle_exercise_results").insert(rest);
              if (!error) {
                const delTx = db.transaction(PENDING_RESULTS_STORE, "readwrite");
                delTx.objectStore(PENDING_RESULTS_STORE).delete(item.key);
                synced++;
              }
            }
            resolve(synced);
          }
        };
        cursor.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }, [user]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isOffline && user) {
      syncPendingResults().then((count) => {
        if (count > 0) console.log(`[offline] Synced ${count} pending results`);
      });
    }
  }, [isOffline, user, syncPendingResults]);

  // Auto-cache current module exercises
  useEffect(() => {
    if (moduleId && !isOffline) {
      cacheModuleExercises(moduleId);
    }
  }, [moduleId, isOffline, cacheModuleExercises]);

  // Load cached exercises when offline
  useEffect(() => {
    if (isOffline && moduleId) {
      loadCachedExercises(moduleId).then(setCachedExercises);
    } else {
      setCachedExercises(null);
    }
  }, [isOffline, moduleId, loadCachedExercises]);

  return {
    isOffline,
    cachedExercises,
    cacheModuleExercises,
    savePendingResult,
    syncPendingResults,
  };
}
