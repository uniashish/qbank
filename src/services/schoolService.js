import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { SCHOOL_STATUSES } from "../constants/schoolStatus.js";
import { db } from "./firebase";

const SCHOOLS_COLLECTION = "schools";

function normalizeSchoolSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createSchool(data, createdByUid) {
  const schoolsRef = collection(db, SCHOOLS_COLLECTION);
  const schoolPayload = {
    name: data.name,
    code: data.code,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    country: data.country,
    status: data.status || SCHOOL_STATUSES.ACTIVE,
    primaryAdminId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: createdByUid,
  };

  const schoolRef = await addDoc(schoolsRef, schoolPayload);

  return schoolRef.id;
}

export async function getSchools() {
  const schoolsRef = collection(db, SCHOOLS_COLLECTION);
  const schoolsQuery = query(schoolsRef, orderBy("createdAt", "desc"));
  const schoolsSnapshot = await getDocs(schoolsQuery);

  return schoolsSnapshot.docs.map(normalizeSchoolSnapshot);
}

export async function getSchoolById(id) {
  if (!id) {
    return null;
  }

  const schoolRef = doc(db, SCHOOLS_COLLECTION, id);
  const schoolSnapshot = await getDoc(schoolRef);

  if (!schoolSnapshot.exists()) {
    return null;
  }

  return normalizeSchoolSnapshot(schoolSnapshot);
}

export function updateSchool(id, data) {
  const schoolRef = doc(db, SCHOOLS_COLLECTION, id);

  return updateDoc(schoolRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function updateSchoolStatus(id, status) {
  return updateSchool(id, { status });
}
