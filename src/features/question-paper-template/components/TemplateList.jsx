import TemplateCard from "./TemplateCard.jsx";
import TemplateEmptyState from "./TemplateEmptyState.jsx";

function TemplateList({
  archivingTemplateId = "",
  hasTemplates,
  isSearching,
  onCreateTemplate,
  onArchiveTemplate,
  onDuplicateTemplate,
  onEditTemplate,
  onUseTemplate,
  templates,
}) {
  if (templates.length === 0) {
    return (
      <TemplateEmptyState
        isSearching={isSearching && hasTemplates}
        onCreateTemplate={onCreateTemplate}
      />
    );
  }

  return (
    <div className="question-paper-template-grid">
      {templates.map((template) => (
        <TemplateCard
          isArchiving={archivingTemplateId === template.id}
          key={template.id}
          onArchiveTemplate={onArchiveTemplate}
          onDuplicateTemplate={onDuplicateTemplate}
          onEditTemplate={onEditTemplate}
          onUseTemplate={onUseTemplate}
          template={template}
        />
      ))}
    </div>
  );
}

export default TemplateList;
