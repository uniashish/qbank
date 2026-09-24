import { createQuestionBlockExtension } from "../nodes/QuestionBlockNode.js";
import PrintQuestionBlock from "./PrintQuestionBlock.jsx";

export const QUESTION_PAPER_PRINT_EXTENSIONS = [
  createQuestionBlockExtension(PrintQuestionBlock),
];
