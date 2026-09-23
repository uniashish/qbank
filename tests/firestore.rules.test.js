import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const PROJECT_ID = "qbank-bb945";
const SCHOOL_ID = "school-1";
const OTHER_SCHOOL_ID = "school-2";
const CLASS_ID = "class-1";
const SUBJECT_ID = "subject-1";
const ADMIN_ID = "admin-1";
const TEACHER_ID = "teacher-1";
const TEACHER_2_ID = "teacher-2";
const TEACHER_EMAIL = "teacher1@example.com";
const TEACHER_2_EMAIL = "teacher2@example.com";
const ADMIN_EMAIL = "admin@example.com";
const NOW = Timestamp.fromMillis(1700000000000);
const FUTURE = Timestamp.fromMillis(4102444800000);

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: await readFile("firestore.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

function authedDb(uid, email) {
  return testEnv
    .authenticatedContext(uid, {
      email,
      email_verified: true,
      firebase: { sign_in_provider: "password" },
    })
    .firestore();
}

function teacherDb(uid = TEACHER_ID, email = TEACHER_EMAIL) {
  return authedDb(uid, email);
}

function adminDb() {
  return authedDb(ADMIN_ID, ADMIN_EMAIL);
}

async function seed(...entries) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(
      entries.map(([path, data]) => setDoc(doc(db, path), data)),
    );
  });
}

function schoolData(overrides = {}) {
  return {
    name: "Test School",
    code: "TS",
    email: "school@example.com",
    phone: "",
    address: "",
    city: "",
    country: "",
    status: "active",
    adminIds: [ADMIN_ID],
    allowJoinRequests: true,
    primaryAdminId: ADMIN_ID,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: ADMIN_ID,
    ...overrides,
  };
}

function userData(uid, overrides = {}) {
  return {
    uid,
    name: uid,
    email: `${uid}@example.com`,
    role: "teacher",
    status: "active",
    schoolId: SCHOOL_ID,
    photoURL: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function adminUserData(overrides = {}) {
  return userData(ADMIN_ID, {
    name: "Admin One",
    email: ADMIN_EMAIL,
    role: "school_admin",
    ...overrides,
  });
}

function teacherUserData(overrides = {}) {
  return userData(TEACHER_ID, {
    name: "Teacher One",
    email: TEACHER_EMAIL,
    ...overrides,
  });
}

function teacher2UserData(overrides = {}) {
  return userData(TEACHER_2_ID, {
    name: "Teacher Two",
    email: TEACHER_2_EMAIL,
    ...overrides,
  });
}

function assignmentId(teacherId = TEACHER_ID) {
  return `${teacherId}__${CLASS_ID}__${SUBJECT_ID}`;
}

function assignmentData(teacherId = TEACHER_ID) {
  return {
    teacherId,
    classId: CLASS_ID,
    subjectId: SUBJECT_ID,
    status: "active",
    createdBy: ADMIN_ID,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function creatorData(overrides = {}) {
  return {
    uid: TEACHER_ID,
    name: "Teacher One",
    email: TEACHER_EMAIL,
    ...overrides,
  };
}

function questionData(overrides = {}) {
  return {
    questionType: "true_false",
    classId: CLASS_ID,
    subjectId: SUBJECT_ID,
    topicName: "Topic",
    prompt: "Prompt",
    marks: 1,
    difficulty: "easy",
    instructions: "",
    image: { storagePath: null, downloadUrl: null },
    answerData: { correctAnswer: true },
    createdBy: creatorData(),
    createdAt: NOW,
    updatedAt: NOW,
    status: "active",
    ...overrides,
  };
}

function questionCreateData(overrides = {}) {
  return questionData({
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  });
}

function shareId(questionId, teacherId = TEACHER_2_ID) {
  return `${questionId}__${teacherId}`;
}

function shareData(questionId, overrides = {}) {
  return {
    questionId,
    ownerId: TEACHER_ID,
    sharedWithTeacherId: TEACHER_2_ID,
    sharedByTeacherId: TEACHER_ID,
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
    revokedAt: null,
    ...overrides,
  };
}

function richTextDoc(text = "Paper") {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function questionBlockDoc(question = paperQuestion()) {
  return {
    type: "doc",
    content: [
      {
        type: "questionBlock",
        attrs: question,
      },
    ],
  };
}

function delayedQuestionBlockDoc(question = paperQuestion()) {
  return {
    type: "doc",
    content: [
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      { type: "paragraph" },
      {
        type: "questionBlock",
        attrs: question,
      },
    ],
  };
}

function emptyPaperDoc() {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

function paperQuestion() {
  return {
    blockId: "block-1",
    questionId: "question-1",
    questionNumber: "1",
    marks: 1,
    difficulty: "easy",
    questionType: "true_false",
    snapshot: { prompt: "Prompt" },
  };
}

function difficultySummary() {
  return {
    averageWeight: 1,
    distribution: [
      { difficulty: "easy", label: "Easy", marks: 1 },
      { difficulty: "medium", label: "Medium", marks: 0 },
      { difficulty: "hard", label: "Hard", marks: 0 },
    ],
    overallDifficulty: "Easy",
  };
}

function emptyDifficultySummary() {
  return {
    averageWeight: 0,
    distribution: [
      { difficulty: "easy", label: "Easy", marks: 0 },
      { difficulty: "medium", label: "Medium", marks: 0 },
      { difficulty: "hard", label: "Hard", marks: 0 },
    ],
    overallDifficulty: "Not set",
  };
}

function paperData(overrides = {}) {
  const questions = overrides.questions ?? [paperQuestion()];
  return {
    title: "Midterm",
    classId: CLASS_ID,
    subjectId: SUBJECT_ID,
    examName: "Exam",
    term: "Term 1",
    academicYear: "2026",
    durationMinutes: 60,
    maximumMarks: 10,
    documentContent: richTextDoc(),
    questions,
    totalQuestions: questions.length,
    totalMarks: questions.reduce((sum, question) => sum + question.marks, 0),
    difficultySummary: difficultySummary(),
    status: "draft",
    createdBy: creatorData(),
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function templateDefaultSetup(overrides = {}) {
  return {
    examName: "Exam",
    term: "Term 1",
    academicYear: "2026",
    durationMinutes: 60,
    maximumMarks: 100,
    ...overrides,
  };
}

function templateSettings(overrides = {}) {
  return {
    showSchoolName: true,
    showExamName: true,
    showClass: true,
    showSubject: true,
    showDuration: true,
    showMaximumMarks: true,
    ...overrides,
  };
}

function templateData(overrides = {}) {
  const { defaultSetup, settings, ...rest } = overrides;

  return {
    name: "Balanced Midterm Paper",
    description: "Reusable paper structure.",
    defaultSetup: templateDefaultSetup(defaultSetup),
    documentContent: { type: "doc", content: [] },
    sections: [],
    settings: templateSettings(settings),
    status: "active",
    createdBy: creatorData(),
    createdAt: NOW,
    updatedAt: NOW,
    ...rest,
  };
}

function templateCreateData(overrides = {}) {
  return templateData({
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  });
}

async function seedTeacherQuestionSetup() {
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [`users/${TEACHER_ID}`, teacherUserData()],
    [
      `schools/${SCHOOL_ID}/teacherAssignments/${assignmentId()}`,
      assignmentData(),
    ],
  );
}

async function seedTeacherTemplateSetup() {
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [`users/${TEACHER_ID}`, teacherUserData()],
  );
}

test("teacher question create allows assigned active teacher and denies missing assignment", async () => {
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-1`),
      questionCreateData(),
    ),
  );

  await seed([`users/${TEACHER_2_ID}`, teacher2UserData()]);

  await assertFails(
    setDoc(
      doc(
        teacherDb(TEACHER_2_ID, TEACHER_2_EMAIL),
        `schools/${SCHOOL_ID}/questions/question-2`,
      ),
      questionCreateData({
        createdBy: creatorData({
          uid: TEACHER_2_ID,
          name: "Teacher Two",
          email: TEACHER_2_EMAIL,
        }),
      }),
    ),
  );
});

test("teacher question update allows owner and denies another teacher", async () => {
  await seedTeacherQuestionSetup();
  await seed(
    [`users/${TEACHER_2_ID}`, teacher2UserData()],
    [
      `schools/${SCHOOL_ID}/teacherAssignments/${assignmentId(TEACHER_2_ID)}`,
      assignmentData(TEACHER_2_ID),
    ],
    [`schools/${SCHOOL_ID}/questions/question-1`, questionData()],
  );

  await assertSucceeds(
    updateDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-1`),
      {
        topicName: "Updated topic",
        updatedAt: serverTimestamp(),
      },
    ),
  );

  await assertFails(
    updateDoc(
      doc(
        teacherDb(TEACHER_2_ID, TEACHER_2_EMAIL),
        `schools/${SCHOOL_ID}/questions/question-1`,
      ),
      {
        createdBy: creatorData({
          uid: TEACHER_2_ID,
          name: "Teacher Two",
          email: TEACHER_2_EMAIL,
        }),
        updatedAt: serverTimestamp(),
      },
    ),
  );
});

test("question share create, revoke, and reactivate preserve owner and target checks", async () => {
  const questionId = "question-1";
  const path = `schools/${SCHOOL_ID}/questionShares/${shareId(questionId)}`;
  await seedTeacherQuestionSetup();
  await seed(
    [`users/${TEACHER_2_ID}`, teacher2UserData()],
    [`schools/${SCHOOL_ID}/questions/${questionId}`, questionData()],
  );

  await assertSucceeds(
    setDoc(doc(teacherDb(), path), {
      ...shareData(questionId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  await assertSucceeds(
    updateDoc(
      doc(teacherDb(), path),
      {
        status: "revoked",
        updatedAt: serverTimestamp(),
        revokedAt: serverTimestamp(),
      },
    ),
  );

  await assertSucceeds(
    updateDoc(
      doc(teacherDb(), path),
      {
        status: "active",
        updatedAt: serverTimestamp(),
        revokedAt: null,
      },
    ),
  );
});

test("question share preflight read allows missing target share document", async () => {
  const questionId = "question-preflight";
  const path = `schools/${SCHOOL_ID}/questionShares/${shareId(questionId)}`;
  await seedTeacherQuestionSetup();
  await seed([`users/${TEACHER_2_ID}`, teacher2UserData()]);

  await assertSucceeds(getDoc(doc(teacherDb(), path)));
});

test("join request approval requires matching teacher profile update", async () => {
  const requesterId = "pending-teacher";
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [`users/${ADMIN_ID}`, adminUserData()],
    [
      `users/${requesterId}`,
      userData(requesterId, {
        name: "Pending Teacher",
        email: "pending@example.com",
        status: "pending_approval",
      }),
    ],
    [
      `schools/${SCHOOL_ID}/joinRequests/${requesterId}`,
      {
        userId: requesterId,
        name: "Pending Teacher",
        email: "pending@example.com",
        requestedRole: "teacher",
        status: "pending",
        createdAt: NOW,
        updatedAt: NOW,
        reviewedAt: null,
        reviewedBy: null,
      },
    ],
  );

  const db = adminDb();
  const batch = writeBatch(db);
  batch.update(doc(db, `schools/${SCHOOL_ID}/joinRequests/${requesterId}`), {
    status: "approved",
    reviewedAt: serverTimestamp(),
    reviewedBy: ADMIN_ID,
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, `users/${requesterId}`), {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  await assertSucceeds(batch.commit());
});

test("role change teacher to school_admin and back requires roster update", async () => {
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [`users/${ADMIN_ID}`, adminUserData()],
    [`users/${TEACHER_ID}`, teacherUserData()],
  );

  const db = adminDb();
  const promote = writeBatch(db);
  promote.update(doc(db, `users/${TEACHER_ID}`), {
    role: "school_admin",
    updatedAt: serverTimestamp(),
  });
  promote.update(doc(db, `schools/${SCHOOL_ID}`), {
    adminIds: [ADMIN_ID, TEACHER_ID],
    updatedAt: serverTimestamp(),
  });
  await assertSucceeds(promote.commit());

  const demote = writeBatch(db);
  demote.update(doc(db, `users/${TEACHER_ID}`), {
    role: "teacher",
    updatedAt: serverTimestamp(),
  });
  demote.update(doc(db, `schools/${SCHOOL_ID}`), {
    adminIds: [ADMIN_ID],
    updatedAt: serverTimestamp(),
  });
  await assertSucceeds(demote.commit());
});

test("question paper draft create, update, and finalize are allowed for owner", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-1`;
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paperData(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  await assertSucceeds(
    updateDoc(doc(teacherDb(), paperPath), {
      title: "Updated Midterm",
      updatedAt: serverTimestamp(),
    }),
  );

  await assertSucceeds(
    updateDoc(doc(teacherDb(), paperPath), {
      status: "final",
      finalizedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("question paper draft create allows question block document content", async () => {
  const paperQuestionBlock = paperQuestion();
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-block-content`;
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paperData({
        documentContent: questionBlockDoc(paperQuestionBlock),
        questions: [paperQuestionBlock],
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("question paper draft create allows empty editor document content", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-empty-content`;
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paperData({
        difficultySummary: emptyDifficultySummary(),
        documentContent: emptyPaperDoc(),
        questions: [],
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("question paper finalization allows replacing legacy draft with normalized final payload", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-legacy-finalize`;
  await seedTeacherQuestionSetup();
  await seed([
    paperPath,
    {
      ...paperData(),
      legacyField: "remove me during finalization",
    },
  ]);

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paperData({
        status: "final",
      }),
      finalizedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("question paper finalization allows valid questions after leading blank editor nodes", async () => {
  const paperQuestionBlock = paperQuestion();
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-delayed-question`;
  await seedTeacherQuestionSetup();
  await seed([
    paperPath,
    paperData({
      documentContent: delayedQuestionBlockDoc(paperQuestionBlock),
      questions: [paperQuestionBlock],
    }),
  ]);

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paperData({
        documentContent: delayedQuestionBlockDoc(paperQuestionBlock),
        questions: [paperQuestionBlock],
        status: "final",
      }),
      finalizedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("question paper delete allows owner and denies another teacher", async () => {
  const ownerPaperPath = `schools/${SCHOOL_ID}/questionPapers/paper-delete-owner`;
  const otherTeacherPaperPath = `schools/${SCHOOL_ID}/questionPapers/paper-delete-other`;
  await seedTeacherQuestionSetup();
  await seed(
    [`users/${TEACHER_2_ID}`, teacher2UserData()],
    [
      `schools/${SCHOOL_ID}/teacherAssignments/${assignmentId(TEACHER_2_ID)}`,
      assignmentData(TEACHER_2_ID),
    ],
    [
      ownerPaperPath,
      paperData({
        finalizedAt: NOW,
        status: "final",
      }),
    ],
    [
      otherTeacherPaperPath,
      paperData({
        finalizedAt: NOW,
        status: "final",
      }),
    ],
  );

  await assertFails(
    deleteDoc(doc(teacherDb(TEACHER_2_ID, TEACHER_2_EMAIL), otherTeacherPaperPath)),
  );

  await assertSucceeds(deleteDoc(doc(teacherDb(), ownerPaperPath)));
});

test("teacher creates own question paper template", async () => {
  await seedTeacherTemplateSetup();

  await assertSucceeds(
    setDoc(
      doc(
        teacherDb(),
        `schools/${SCHOOL_ID}/questionPaperTemplates/template-create`,
      ),
      templateCreateData(),
    ),
  );
});

test("teacher lists own question paper templates", async () => {
  await seedTeacherTemplateSetup();
  await seed(
    [`users/${TEACHER_2_ID}`, teacher2UserData()],
    [
      `schools/${SCHOOL_ID}/questionPaperTemplates/template-own`,
      templateData(),
    ],
    [
      `schools/${SCHOOL_ID}/questionPaperTemplates/template-other`,
      templateData({
        createdBy: creatorData({
          uid: TEACHER_2_ID,
          name: "Teacher Two",
          email: TEACHER_2_EMAIL,
        }),
      }),
    ],
  );

  const templatesQuery = query(
    collection(teacherDb(), `schools/${SCHOOL_ID}/questionPaperTemplates`),
    where("createdBy.uid", "==", TEACHER_ID),
  );
  const templatesSnapshot = await assertSucceeds(getDocs(templatesQuery));

  assert.equal(templatesSnapshot.docs.length, 1);
});

test("teacher updates own question paper template", async () => {
  const templatePath = `schools/${SCHOOL_ID}/questionPaperTemplates/template-update`;
  await seedTeacherTemplateSetup();
  await seed([templatePath, templateData()]);

  await assertSucceeds(
    updateDoc(doc(teacherDb(), templatePath), {
      name: "Updated Template",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("teacher archives own question paper template", async () => {
  const templatePath = `schools/${SCHOOL_ID}/questionPaperTemplates/template-archive`;
  await seedTeacherTemplateSetup();
  await seed([templatePath, templateData()]);

  await assertSucceeds(
    updateDoc(doc(teacherDb(), templatePath), {
      status: "archived",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("teacher cannot read another teacher's question paper template", async () => {
  const templatePath = `schools/${SCHOOL_ID}/questionPaperTemplates/template-other-read`;
  await seedTeacherTemplateSetup();
  await seed([
    templatePath,
    templateData({
      createdBy: creatorData({
        uid: TEACHER_2_ID,
        name: "Teacher Two",
        email: TEACHER_2_EMAIL,
      }),
    }),
  ]);

  await assertFails(getDoc(doc(teacherDb(), templatePath)));
});

test("teacher cannot write question paper templates across schools", async () => {
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [`schools/${OTHER_SCHOOL_ID}`, schoolData({ code: "OS" })],
    [`users/${TEACHER_ID}`, teacherUserData()],
  );

  await assertFails(
    setDoc(
      doc(
        teacherDb(),
        `schools/${OTHER_SCHOOL_ID}/questionPaperTemplates/template-cross-school`,
      ),
      templateCreateData(),
    ),
  );
});

test("inactive or pending teacher cannot create question paper templates", async () => {
  await seed(
    [`schools/${SCHOOL_ID}`, schoolData()],
    [
      `users/${TEACHER_ID}`,
      teacherUserData({
        status: "pending_approval",
      }),
    ],
    [
      `users/${TEACHER_2_ID}`,
      teacher2UserData({
        status: "disabled",
      }),
    ],
  );

  await assertFails(
    setDoc(
      doc(
        teacherDb(),
        `schools/${SCHOOL_ID}/questionPaperTemplates/template-pending`,
      ),
      templateCreateData(),
    ),
  );
  await assertFails(
    setDoc(
      doc(
        teacherDb(TEACHER_2_ID, TEACHER_2_EMAIL),
        `schools/${SCHOOL_ID}/questionPaperTemplates/template-disabled`,
      ),
      templateCreateData({
        createdBy: creatorData({
          uid: TEACHER_2_ID,
          name: "Teacher Two",
          email: TEACHER_2_EMAIL,
        }),
      }),
    ),
  );
});

test("invitation redemption commits invitation, invitee profile, and school roster", async () => {
  const inviteeId = "invitee-admin";
  const inviteeEmail = "invitee@example.com";
  const invitationId = "invitation-1";

  await seed(
    [
      `schools/${SCHOOL_ID}`,
      schoolData({ adminIds: [], primaryAdminId: null, createdBy: "platform" }),
    ],
    [
      `invitations/${invitationId}`,
      {
        token: invitationId,
        email: inviteeEmail,
        name: "Invitee Admin",
        role: "school_admin",
        schoolId: SCHOOL_ID,
        schoolName: "Test School",
        status: "pending",
        invitedBy: "platform-admin",
        createdAt: NOW,
        updatedAt: NOW,
        expiresAt: FUTURE,
        acceptedAt: null,
        acceptedBy: null,
      },
    ],
  );

  const db = authedDb(inviteeId, inviteeEmail);
  const batch = writeBatch(db);
  batch.update(doc(db, `invitations/${invitationId}`), {
    status: "accepted",
    updatedAt: serverTimestamp(),
    acceptedAt: serverTimestamp(),
    acceptedBy: inviteeId,
  });
  batch.set(doc(db, `users/${inviteeId}`), {
    uid: inviteeId,
    name: "Invitee Admin",
    email: inviteeEmail,
    role: "school_admin",
    status: "active",
    schoolId: SCHOOL_ID,
    photoURL: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    invitationId,
  });
  batch.update(doc(db, `schools/${SCHOOL_ID}`), {
    adminIds: [inviteeId],
    primaryAdminId: inviteeId,
    updatedAt: serverTimestamp(),
  });

  await assertSucceeds(batch.commit());
});

test("teacher invitations cannot be created", async () => {
  const platformAdminId = "platform-1";
  const invitationId = "teacher-invitation-1";

  await seed(
    [
      `users/${platformAdminId}`,
      userData(platformAdminId, {
        name: "Platform Admin",
        email: "platform@example.com",
        role: "platform_admin",
        schoolId: "",
      }),
    ],
    [`users/${ADMIN_ID}`, adminUserData()],
    [
      `schools/${SCHOOL_ID}`,
      schoolData({ adminIds: [], primaryAdminId: null, createdBy: platformAdminId }),
    ],
  );

  const invitationPayload = {
    token: invitationId,
    email: "newteacher@example.com",
    name: "New Teacher",
    role: "teacher",
    schoolId: SCHOOL_ID,
    schoolName: "Test School",
    status: "pending",
    invitedBy: platformAdminId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: FUTURE,
    acceptedAt: null,
    acceptedBy: null,
  };

  await assertFails(
    setDoc(
      doc(authedDb(platformAdminId, "platform@example.com"), `invitations/${invitationId}`),
      invitationPayload,
    ),
  );

  await assertFails(
    setDoc(
      doc(adminDb(), `invitations/${invitationId}`),
      {
        ...invitationPayload,
        invitedBy: ADMIN_ID,
      },
    ),
  );
});
