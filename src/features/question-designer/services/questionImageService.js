import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "../../../services/firebase.js";

const DEFAULT_IMAGE_FILE_NAME = "question-image";

function sanitizeFileName(fileName) {
  const normalizedName = String(fileName || DEFAULT_IMAGE_FILE_NAME)
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return normalizedName || DEFAULT_IMAGE_FILE_NAME;
}

export function getQuestionImageStoragePath({ schoolId, questionId, fileName }) {
  return [
    "schools",
    schoolId,
    "questions",
    questionId,
    "question-image",
    sanitizeFileName(fileName),
  ].join("/");
}

export async function uploadQuestionImage({ schoolId, questionId, file }) {
  if (!file) {
    return {
      downloadUrl: null,
      storagePath: null,
    };
  }

  const storagePath = getQuestionImageStoragePath({
    fileName: file.name,
    questionId,
    schoolId,
  });
  const imageRef = ref(storage, storagePath);

  if (file.type) {
    await uploadBytes(imageRef, file, { contentType: file.type });
  } else {
    await uploadBytes(imageRef, file);
  }

  return {
    downloadUrl: await getDownloadURL(imageRef),
    storagePath,
  };
}

export async function deleteQuestionImage(storagePath) {
  if (!storagePath) {
    return;
  }

  await deleteObject(ref(storage, storagePath));
}
