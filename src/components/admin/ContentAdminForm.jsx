import { useState } from "react";

const emptyContent = {
  author: "",
  body: "",
  category: "",
  contentType: "FACT",
  source: "",
  title: "",
};

function getInitialForm(content) {
  if (!content) {
    return emptyContent;
  }

  return {
    author: content.author || "",
    body: content.body,
    category: content.category || "",
    contentType: content.contentType,
    source: content.source || "",
    title: content.title,
  };
}

function ContentAdminForm({ content, onCancel, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(content));
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(content?.id);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function submitContent(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSave(form);
      if (!isEditing) {
        setForm(emptyContent);
      }
    } catch {
      // The page displays the API error.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-content-form" onSubmit={submitContent}>
      <div className="admin-form-heading">
        <div>
          <p className="eyebrow">{isEditing ? "Edit content" : "New content"}</p>
          <h2>{isEditing ? content.title : "Create a feed item"}</h2>
        </div>
        {isEditing ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <label>
        Title
        <input name="title" value={form.title} onChange={updateField} required />
      </label>

      <label>
        Body
        <textarea
          name="body"
          rows="5"
          value={form.body}
          onChange={updateField}
          required
        />
      </label>

      <label>
        Content type
        <select name="contentType" value={form.contentType} onChange={updateField}>
          <option value="FACT">Fact</option>
          <option value="THEORY">Theory</option>
          <option value="QUOTE">Quote</option>
        </select>
      </label>

      <div className="admin-form-grid">
        <label>
          Category
          <input name="category" value={form.category || ""} onChange={updateField} />
        </label>
        <label>
          Author
          <input name="author" value={form.author || ""} onChange={updateField} />
        </label>
        <label>
          Source
          <input name="source" value={form.source || ""} onChange={updateField} />
        </label>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : isEditing ? "Save changes" : "Create content"}
      </button>
    </form>
  );
}

export default ContentAdminForm;
