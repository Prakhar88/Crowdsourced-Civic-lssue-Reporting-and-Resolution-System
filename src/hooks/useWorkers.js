// src/hooks/useWorkers.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";

// ---------------------------------------------------------------------------
// Real-time listener for all workers
// ---------------------------------------------------------------------------
export function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "workers"));
    const unsub = onSnapshot(q, (snap) => {
      setWorkers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { workers, loading };
}

// ---------------------------------------------------------------------------
// Create a new worker (Firebase Auth account + Firestore profile)
// ---------------------------------------------------------------------------
export async function createWorker({ name, email, password, zone, phone }) {
  // Create Firebase Auth account for the worker
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Save worker profile to Firestore
  await setDoc(doc(db, "workers", cred.user.uid), {
    name,
    email,
    phone,
    zone,
    isAvailable: true,
    assignedTasks: [],
    completedTasks: [],
    createdAt: serverTimestamp(),
  });
  return cred.user.uid;
}