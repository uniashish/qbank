import { collection, getDocs, limit, query, where } from "firebase/firestore";

import { USER_ROLES } from "../constants/roles.js";
import { db } from "./firebase";

const USERS_COLLECTION = "users";

function normalizeTeacherSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    uid: data.uid ?? snapshot.id,
  };
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

function sortByCreatedAtDescending(records) {
  return [...records].sort((firstRecord, secondRecord) => {
    const firstTime = toDate(firstRecord.createdAt)?.getTime() ?? 0;
    const secondTime = toDate(secondRecord.createdAt)?.getTime() ?? 0;

    return secondTime - firstTime;
  });
}

export async function getTeachersForSchool(schoolId) {
  if (!schoolId) {
    return [];
  }

  const usersRef = collection(db, USERS_COLLECTION);
  const teachersQuery = query(
    usersRef,
    where("schoolId", "==", schoolId),
    where("role", "==", USER_ROLES.TEACHER),
    limit(100),
  );
  const teachersSnapshot = await getDocs(teachersQuery);
  const teachers = teachersSnapshot.docs.map(normalizeTeacherSnapshot);

  return sortByCreatedAtDescending(teachers);
}
