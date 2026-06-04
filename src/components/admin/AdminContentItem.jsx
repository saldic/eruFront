function AdminContentItem({ content, deleting, onDelete, onEdit }) {
  return (
    <article className="admin-content-item">
      <div className="admin-content-copy">
        <div className="admin-content-meta">
          <span className={`type-badge ${content.contentType.toLowerCase()}`}>
            {content.contentType}
          </span>
          <span className="category-badge">{content.category || "General"}</span>
          <span className="author-badge">{content.author || "Unknown author"}</span>
          <span className={`status-badge ${content.active ? "active" : "inactive"}`}>
            {content.active ? "Active" : "Inactive"}
          </span>
        </div>
        <h3>{content.title}</h3>
        <p>{content.body}</p>
      </div>

      <div className="admin-content-actions">
        <button className="secondary-button" type="button" onClick={() => onEdit(content)}>
          Edit
        </button>
        <button
          className="danger-button"
          disabled={deleting}
          type="button"
          onClick={() => onDelete(content)}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default AdminContentItem;
