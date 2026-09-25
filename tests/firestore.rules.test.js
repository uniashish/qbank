import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  createQuestionPaperDraftDocument,
  createQuestionPaperDraftFields,
} from "../src/features/question-paper/utils/questionPaperDraft.js";

const PROJECT_ID = "qbank-bb945";
const SCHOOL_ID = "school-1";
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
const EXPECTED_APP_DRAFT_KEYS = [
  "academicYear",
  "classId",
  "createdAt",
  "createdBy",
  "difficultySummary",
  "documentContent",
  "durationMinutes",
  "examName",
  "maximumMarks",
  "questions",
  "status",
  "subjectId",
  "term",
  "title",
  "totalMarks",
  "totalQuestions",
  "updatedAt",
];
const EXPECTED_APP_PAPER_QUESTION_KEYS = [
  "blockId",
  "difficulty",
  "marks",
  "questionId",
  "questionNumber",
  "questionType",
  "snapshot",
];

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

function mathDoc(latex = "x^2 + 2x + 1") {
  return {
    type: "doc",
    content: [{ type: "mathBlock", attrs: { latex } }],
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

function paperQuestion(overrides = {}) {
  return {
    blockId: "block-1",
    questionId: "question-1",
    questionNumber: "1",
    marks: 1,
    difficulty: "easy",
    questionType: "true_false",
    snapshot: { prompt: "Prompt" },
    ...overrides,
  };
}

function richSnapshotPaperQuestions() {
  return [
    {
      blockId: "block-1",
      questionId: "question-1",
      questionNumber: "1",
      marks: 1,
      difficulty: "easy",
      questionType: "multiple_choice",
      snapshot: {
        answerData: {
          correctOptionId: "opt-1",
          options: [
            {
              id: "opt-1",
              text: "(x + 1)^2",
              content: mathDoc("(x + 1)^2"),
            },
            {
              id: "opt-2",
              text: "(x - 1)^2",
              content: richTextDoc("(x - 1)^2"),
            },
          ],
        },
        difficulty: "easy",
        image: { storagePath: null, downloadUrl: null },
        instructions: "",
        prompt: "x^2 + 2x + 1",
        promptContent: mathDoc("x^2 + 2x + 1"),
        questionType: "multiple_choice",
        tags: [],
        topicName: "Algebra",
      },
    },
    {
      blockId: "block-2",
      questionId: "question-2",
      questionNumber: "2",
      marks: 1,
      difficulty: "easy",
      questionType: "match_following",
      snapshot: {
        answerData: {
          pairs: [
            {
              id: "pair-1",
              left: "x^2",
              leftContent: mathDoc("x^2"),
              right: "quadratic",
              rightContent: richTextDoc("quadratic"),
            },
            {
              id: "pair-2",
              left: "x^3",
              leftContent: mathDoc("x^3"),
              right: "cubic",
              rightContent: richTextDoc("cubic"),
            },
          ],
        },
        difficulty: "easy",
        image: { storagePath: null, downloadUrl: null },
        instructions: "",
        prompt: "Match expressions",
        promptContent: richTextDoc("Match expressions"),
        questionType: "match_following",
        tags: [],
        topicName: "Algebra",
      },
    },
    {
      blockId: "block-3",
      questionId: "question-3",
      questionNumber: "3",
      marks: 1,
      difficulty: "easy",
      questionType: "short_answer",
      snapshot: {
        answerData: {
          modelAnswer: richTextDoc("Model answer"),
          questionContent: richTextDoc("Explain briefly"),
        },
        difficulty: "easy",
        image: { storagePath: null, downloadUrl: null },
        instructions: "",
        prompt: "Explain briefly",
        promptContent: richTextDoc("Explain briefly"),
        questionType: "short_answer",
        tags: [],
        topicName: "Algebra",
      },
    },
  ];
}

function questionBlockDocWithLeadingParagraph(questions = []) {
  return {
    type: "doc",
    content: [
      { type: "paragraph" },
      ...questions.map((question) => ({
        type: "questionBlock",
        attrs: question,
      })),
    ],
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

function appTeacherProfile(overrides = {}) {
  return {
    uid: TEACHER_ID,
    name: "Teacher One",
    email: TEACHER_EMAIL,
    schoolId: SCHOOL_ID,
    ...overrides,
  };
}

function appQuestionPaperSetup(overrides = {}) {
  return {
    academicYear: "2026",
    classId: CLASS_ID,
    durationMinutes: 60,
    examName: "Exam",
    maximumMarks: 10,
    subjectId: SUBJECT_ID,
    term: "Term 1",
    title: "Midterm",
    ...overrides,
  };
}

function appQuestionPaperDesignerState({
  documentContent,
  questions = [],
  setup = {},
} = {}) {
  return {
    documentContent:
      documentContent ??
      (questions.length ? questionBlockDocWithLeadingParagraph(questions) : emptyPaperDoc()),
    setup: appQuestionPaperSetup(setup),
  };
}

function appQuestionPaperDraftCreateData({
  overrides = {},
  userProfile = appTeacherProfile(),
  ...designerOptions
} = {}) {
  return {
    ...createQuestionPaperDraftDocument({
      designerState: appQuestionPaperDesignerState(designerOptions),
      userProfile,
    }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function appQuestionPaperDraftSeedData({
  overrides = {},
  userProfile = appTeacherProfile(),
  ...designerOptions
} = {}) {
  return {
    ...createQuestionPaperDraftDocument({
      designerState: appQuestionPaperDesignerState(designerOptions),
      userProfile,
    }),
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function appQuestionPaperDraftUpdateFields({ overrides = {}, ...designerOptions } = {}) {
  return {
    ...createQuestionPaperDraftFields(appQuestionPaperDesignerState(designerOptions)),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function assertAppDraftShape(draft) {
  assert.deepEqual(Object.keys(draft).sort(), EXPECTED_APP_DRAFT_KEYS);

  draft.questions.forEach((question) => {
    assert.deepEqual(
      Object.keys(question).sort(),
      EXPECTED_APP_PAPER_QUESTION_KEYS,
    );
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

test("teacher question create allows math-rich visible content fields", async () => {
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-mcq-math`),
      questionCreateData({
        answerData: {
          correctOptionId: "opt-1",
          options: [
            {
              content: mathDoc("(x + 1)^2"),
              id: "opt-1",
              text: "(x + 1)^2",
            },
            {
              content: richTextDoc("(x - 1)^2"),
              id: "opt-2",
              text: "(x - 1)^2",
            },
          ],
        },
        prompt: "x^2 + 2x + 1",
        promptContent: mathDoc("x^2 + 2x + 1"),
        questionType: "multiple_choice",
      }),
    ),
  );

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-fill-math`),
      questionCreateData({
        answerData: {
          blanks: [{ acceptedAnswers: ["2"], id: "blank-1" }],
        },
        prompt: "Solve x + [blank] = 4",
        promptContent: richTextDoc("Solve x + [blank] = 4"),
        questionType: "fill_blanks",
      }),
    ),
  );

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-match-math`),
      questionCreateData({
        answerData: {
          pairs: [
            {
              id: "pair-1",
              left: "x^2",
              leftContent: mathDoc("x^2"),
              right: "quadratic",
              rightContent: richTextDoc("quadratic"),
            },
            {
              id: "pair-2",
              left: "x^3",
              leftContent: mathDoc("x^3"),
              right: "cubic",
              rightContent: richTextDoc("cubic"),
            },
          ],
        },
        prompt: "Match each expression",
        promptContent: richTextDoc("Match each expression"),
        questionType: "match_following",
      }),
    ),
  );

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-true-false-math`),
      questionCreateData({
        answerData: { correctAnswer: true },
        prompt: "x^2 >= 0",
        promptContent: mathDoc("x^2 \\ge 0"),
        questionType: "true_false",
      }),
    ),
  );

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-short-math`),
      questionCreateData({
        answerData: {
          modelAnswer: mathDoc("4"),
          questionContent: mathDoc("2 + 2"),
        },
        prompt: "2 + 2",
        questionType: "short_answer",
      }),
    ),
  );

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), `schools/${SCHOOL_ID}/questions/question-long-math`),
      questionCreateData({
        answerData: {
          modelAnswer: mathDoc("x = 2"),
          questionContent: mathDoc("2x = 4"),
          suggestedWordCount: 120,
        },
        prompt: "2x = 4",
        questionType: "long_answer",
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

test("question paper draft create allows actual app empty draft shape", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-empty`;
  const draft = appQuestionPaperDraftCreateData();
  await seedTeacherQuestionSetup();

  assertAppDraftShape(draft);
  assert.equal(draft.questions.length, 0);
  await assertSucceeds(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft create allows actual app one-question draft shape", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-one-question`;
  const draft = appQuestionPaperDraftCreateData({
    questions: [paperQuestion()],
  });
  await seedTeacherQuestionSetup();

  assertAppDraftShape(draft);
  assert.equal(typeof draft.questions[0].questionNumber, "string");
  assert.equal(draft.questions[0].questionNumber, "1");
  await assertSucceeds(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft update allows actual app one-question update shape", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-update`;
  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(
      doc(teacherDb(), paperPath),
      appQuestionPaperDraftCreateData({ questions: [paperQuestion()] }),
    ),
  );

  await assertSucceeds(
    updateDoc(
      doc(teacherDb(), paperPath),
      appQuestionPaperDraftUpdateFields({
        questions: [paperQuestion()],
        setup: { title: "Updated Midterm" },
      }),
    ),
  );
});

test("question paper draft create allows actual app multi-question draft shape", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-multi`;
  const questions = [
    paperQuestion(),
    paperQuestion({
      blockId: "block-2",
      difficulty: "medium",
      marks: 2,
      questionId: "question-2",
      questionNumber: "2",
      questionType: "short_answer",
      snapshot: {
        answerData: {
          modelAnswer: richTextDoc("Model answer"),
          questionContent: richTextDoc("Explain briefly"),
        },
        difficulty: "medium",
        prompt: "Explain briefly",
        questionType: "short_answer",
        topicName: "Algebra",
      },
    }),
    paperQuestion({
      blockId: "block-3",
      difficulty: "hard",
      marks: 3,
      questionId: "question-3",
      questionNumber: "3",
      questionType: "long_answer",
      snapshot: {
        answerData: {
          modelAnswer: richTextDoc("Model answer"),
          questionContent: richTextDoc("Discuss in detail"),
          suggestedWordCount: 500,
        },
        difficulty: "hard",
        prompt: "Discuss in detail",
        questionType: "long_answer",
        topicName: "Algebra",
      },
    }),
  ];
  const draft = appQuestionPaperDraftCreateData({
    questions,
    setup: { maximumMarks: 6 },
  });
  await seedTeacherQuestionSetup();

  assertAppDraftShape(draft);
  assert.deepEqual(
    draft.questions.map((question) => question.questionNumber),
    ["1", "2", "3"],
  );
  await assertSucceeds(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft create rejects more than twenty questions", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-question-21`;
  const questions = Array.from({ length: 21 }, (_, index) =>
    paperQuestion({
      blockId: `block-${index + 1}`,
      questionId: `question-${index + 1}`,
      questionNumber: String(index + 1),
    }),
  );
  const draft = appQuestionPaperDraftCreateData({
    questions,
    setup: { maximumMarks: 21 },
  });
  await seedTeacherQuestionSetup();

  await assertFails(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft create normalizes integer questionNumber input to app string shape", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-integer-input`;
  const draft = appQuestionPaperDraftCreateData({
    questions: [paperQuestion({ questionNumber: 7 })],
  });
  await seedTeacherQuestionSetup();

  assertAppDraftShape(draft);
  assert.equal(draft.questions[0].questionNumber, "1");
  assert.equal(typeof draft.questions[0].questionNumber, "string");
  await assertSucceeds(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft create rejects persisted integer questionNumber", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-integer-reject`;
  const draft = appQuestionPaperDraftCreateData({
    questions: [paperQuestion()],
  });
  await seedTeacherQuestionSetup();

  await assertFails(
    setDoc(doc(teacherDb(), paperPath), {
      ...draft,
      questions: [
        {
          ...draft.questions[0],
          questionNumber: 1,
        },
      ],
    }),
  );
});

test("question paper draft create allows actual app rich math question snapshot", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-rich-math`;
  const question = richSnapshotPaperQuestions()[0];
  const draft = appQuestionPaperDraftCreateData({
    questions: [question],
    setup: { maximumMarks: 1 },
  });
  await seedTeacherQuestionSetup();

  assertAppDraftShape(draft);
  assert.equal(
    draft.questions[0].snapshot.promptContent.content[0].type,
    "mathBlock",
  );
  await assertSucceeds(setDoc(doc(teacherDb(), paperPath), draft));
});

test("question paper draft update rejects unauthorized teacher", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-other-teacher`;
  await seedTeacherQuestionSetup();
  await seed([`users/${TEACHER_2_ID}`, teacher2UserData()]);
  await assertSucceeds(
    setDoc(
      doc(teacherDb(), paperPath),
      appQuestionPaperDraftCreateData({ questions: [paperQuestion()] }),
    ),
  );

  await assertFails(
    updateDoc(
      doc(teacherDb(TEACHER_2_ID, TEACHER_2_EMAIL), paperPath),
      appQuestionPaperDraftUpdateFields({
        questions: [paperQuestion()],
        setup: { title: "Other teacher edit" },
      }),
    ),
  );
});

test("question paper final paper mutation is rejected", async () => {
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-app-final-mutation`;
  await seedTeacherQuestionSetup();
  await seed([
    paperPath,
    appQuestionPaperDraftSeedData({
      overrides: {
        finalizedAt: NOW,
        status: "final",
      },
      questions: [paperQuestion()],
    }),
  ]);

  await assertFails(
    updateDoc(doc(teacherDb(), paperPath), {
      title: "Edited after finalization",
      updatedAt: serverTimestamp(),
    }),
  );
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

test("question paper draft create and update allow rich question snapshots", async () => {
  const questions = richSnapshotPaperQuestions();
  const documentContent = questionBlockDocWithLeadingParagraph(questions);
  const difficulty = difficultySummary();
  const paperPath = `schools/${SCHOOL_ID}/questionPapers/paper-rich-snapshots`;
  const paper = paperData({
    difficultySummary: {
      ...difficulty,
      distribution: difficulty.distribution.map((item) => ({
        ...item,
        marks: item.difficulty === "easy" ? 3 : 0,
      })),
    },
    documentContent,
    maximumMarks: 3,
    questions,
  });
  const paperUpdateFields = { ...paper };

  delete paperUpdateFields.createdAt;
  delete paperUpdateFields.createdBy;
  delete paperUpdateFields.updatedAt;

  await seedTeacherQuestionSetup();

  await assertSucceeds(
    setDoc(doc(teacherDb(), paperPath), {
      ...paper,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  await assertSucceeds(
    updateDoc(doc(teacherDb(), paperPath), {
      ...paperUpdateFields,
      title: "Updated rich snapshots paper",
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
