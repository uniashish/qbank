import { useCallback, useState } from "react";

import Icon from "../../../components/common/Icon.jsx";
import TemplateSectionCard from "./TemplateSectionCard.jsx";
import TemplateSectionEditor from "./TemplateSectionEditor.jsx";
import {
  createEmptyTemplateSection,
  hasMeaningfulTemplateSectionData,
} from "./templateSectionUtils.js";

function createRemoveConfirmationMessage(section) {
  const sectionName = section.title || "this untitled section";

  return `Remove ${sectionName}? This section metadata will be deleted.`;
}

function TemplateSectionList({
  onAddSection,
  onMoveSectionDown,
  onMoveSectionUp,
  onRemoveSection,
  onUpdateSection,
  sections,
}) {
  const [editorState, setEditorState] = useState(null);

  const handleAddSection = useCallback(() => {
    setEditorState({
      mode: "create",
      section: createEmptyTemplateSection(),
    });
  }, []);

  const handleEditSection = useCallback((section) => {
    setEditorState({
      mode: "edit",
      section,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditorState(null);
  }, []);

  const handleSaveSection = useCallback(
    (section) => {
      if (editorState?.mode === "edit") {
        onUpdateSection(editorState.section.id, section);
      } else {
        onAddSection(section);
      }

      setEditorState(null);
    },
    [editorState, onAddSection, onUpdateSection],
  );

  const handleRemoveSection = useCallback(
    (section) => {
      if (
        hasMeaningfulTemplateSectionData(section) &&
        !window.confirm(createRemoveConfirmationMessage(section))
      ) {
        return;
      }

      onRemoveSection(section.id);

      if (editorState?.section.id === section.id) {
        setEditorState(null);
      }
    },
    [editorState, onRemoveSection],
  );

  const isCreatingSection = editorState?.mode === "create";

  return (
    <section
      aria-labelledby="template-sections-title"
      className="template-sections-panel"
    >
      <div className="template-sections-panel__header">
        <div>
          <h2 id="template-sections-title">Sections</h2>
          <p>{sections.length} saved</p>
        </div>
      </div>

      {sections.length === 0 && !isCreatingSection && (
        <p className="template-sections-panel__empty">
          No structured sections yet.
        </p>
      )}

      <div className="template-sections-panel__list">
        {sections.map((section, index) => (
          <div className="template-sections-panel__item" key={section.id}>
            <TemplateSectionCard
              index={index}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              onEdit={() => handleEditSection(section)}
              onMoveDown={() => onMoveSectionDown(section.id)}
              onMoveUp={() => onMoveSectionUp(section.id)}
              onRemove={() => handleRemoveSection(section)}
              section={section}
            />

            {editorState?.mode === "edit" &&
              editorState.section.id === section.id && (
                <TemplateSectionEditor
                  key={`edit-${editorState.section.id}`}
                  onCancel={handleCancelEdit}
                  onSubmit={handleSaveSection}
                  section={editorState.section}
                  submitLabel="Update Section"
                  title="Edit Section"
                />
              )}
          </div>
        ))}
      </div>

      {isCreatingSection ? (
        <TemplateSectionEditor
          key={`create-${editorState.section.id}`}
          onCancel={handleCancelEdit}
          onSubmit={handleSaveSection}
          section={editorState.section}
          submitLabel="Add Section"
          title="Add Section"
        />
      ) : (
        <button
          className="template-sections-panel__add"
          onClick={handleAddSection}
          type="button"
        >
          <Icon name="plus" size={16} />
          Add Section
        </button>
      )}
    </section>
  );
}

export default TemplateSectionList;
