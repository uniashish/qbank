import { doc, getDoc } from "firebase/firestore";

import { db } from "./firebase";

const USERS_COLLECTION = "users";

export async function getUserProfile(uid) {
  if (!uid) {
    return null;
  }

  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  const data = userSnapshot.data();

  return {
    ...data,
    uid: data.uid ?? userSnapshot.id,
  };
}

export async function userProfileExists(uid) {
  const userProfile = await getUserProfile(uid);

  return Boolean(userProfile);
}
