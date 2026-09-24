import DifficultyBadge from "../../../components/question-bank/DifficultyBadge.jsx";
import RichDocumentRenderer from "../../../components/rich-editor/RichDocumentRenderer.jsx";
import QuestionSelectionCheckbox from "../../question-sharing/QuestionSelectionCheckbox.jsx";
import QuestionTypeBadge from "../../../components/question-bank/QuestionTypeBadge.jsx";
import SharedQuestionBadge from "../../question-sharing/SharedQuestionBadge.jsx";
import TagChip from "../../../components/tags/TagChip.jsx";
import { normalizeRichTextContent } from "../../question-designer/utils/richTextContent.js";

const VISIBLE_TAG_COUNT = 3;

function QuestionPickerTags({ tags = [] }) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const hiddenTagCount = Math.max(tags.length - VISIBLE_TAG_COUNT, 0);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tag-list tag-list--compact question-bank-tags">
      {visibleTags.map((tag) => (
        <TagChip key={tag.toLowerCase()} label={tag} readOnly />
      ))}
      {hiddenTagCount > 0 && (
        <TagChip
          className="tag-chip--more"
          label={`+${hiddenTagCount} more`}
          readOnly
          title={tags.slice(VISIBLE_TAG_COUNT).join(", ")}
        />
      )}
    </div>
  );
}

export function QuestionPickerPrompt({ question }) {
  return (
    <div className="question-bank-question">
      <RichDocumentRenderer
        ariaLabel="Question prompt preview"
        className="question-bank-prompt"
        content={normalizeRichTextContent(
          question.promptContent,
          question.prompt,
        )}
      />
      {question.access?.type === "shared" && (
        <SharedQuestionBadge ownerName={question.shareInfo?.ownerName} />
      )}
      <QuestionPickerTags tags={question.tags} />
    </div>
  );
}

function QuestionPickerRow({
  alreadyAdded = false,
  isSelected = false,
  onSelectionChange,
  question,
}) {
  return (
    <tr
      className={[
        "question-picker-row",
        alreadyAdded ? "question-picker-row--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="question-bank-selection-cell">
        <QuestionSelectionCheckbox
          checked={isSelected}
          disabled={alreadyAdded}
          label={`Select question: ${question.prompt}`}
          onChange={(isChecked) => onSelectionChange(question, isChecked)}
        />
      </td>
      <td>
        <QuestionPickerPrompt question={question} />
      </td>
      <td>
        <QuestionTypeBadge label={question.questionTypeLabel} />
      </td>
      <td>{question.className}</td>
      <td>{question.subjectName}</td>
      <td>{question.topicName || "Not set"}</td>
      <td>{question.marks}</td>
      <td>
        <DifficultyBadge
          difficulty={question.difficulty}
          label={question.difficultyLabel}
        />
      </td>
      <td>
        {alreadyAdded ? (
          <span className="question-picker-status">Already in paper</span>
        ) : (
          <span className="question-picker-status question-picker-status--available">
            Available
          </span>
        )}
      </td>
    </tr>
  );
}

export default QuestionPickerRow;
