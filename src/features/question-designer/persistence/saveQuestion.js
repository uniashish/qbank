import { assertQuestionCanBeSaved } from "../validation/questionPersistenceValidation.js";
import {
  createQuestion,
  createQuestionDocument,
  createQuestionReference,
} from "../services/questionService.js";
import {
  deleteQuestionImage,
  uploadQuestionImage,
} from "../services/questionImageService.js";

export async function saveQuestion({ draft, teacherProfile }) {
  assertQuestionCanBeSaved({ draft, teacherProfile });

  const schoolId = teacherProfile.schoolId;
  const questionRef = createQuestionReference(schoolId);
  let uploadedImage = {
    downloadUrl: null,
    storagePath: null,
  };

  try {
    uploadedImage = await uploadQuestionImage({
      file: draft.questionImage?.file,
      questionId: questionRef.id,
      schoolId,
    });

    const questionData = createQuestionDocument({
      draft,
      image: uploadedImage,
      teacherProfile,
    });

    return await createQuestion({
      questionData,
      questionRef,
    });
  } catch (error) {
    if (uploadedImage.storagePath) {
      try {
        await deleteQuestionImage(uploadedImage.storagePath);
      } catch (cleanupError) {
        console.error("[Question designer] Failed to clean up question image.", {
          cleanupError,
          storagePath: uploadedImage.storagePath,
        });
      }
    }

    throw error;
  }
}
