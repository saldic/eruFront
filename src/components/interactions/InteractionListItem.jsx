import { Link } from "react-router";

function formatInteractionDate(createdAt) {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function InteractionListItem({ interaction }) {
  const { content, createdAt } = interaction;
  const contentId = content?.id ?? interaction.contentId;
  const contentType = content?.contentType || "CONTENT";
  const formattedDate = formatInteractionDate(createdAt);

  const item = (
    <article className="interaction-list-item">
      <div className="admin-content-meta">
        <span className={`type-badge ${contentType.toLowerCase()}`}>
          {contentType}
        </span>
        <span>{content?.category || "General"}</span>
        {formattedDate ? <time dateTime={createdAt}>{formattedDate}</time> : null}
      </div>
      <h3>{content?.title || `Content #${interaction.contentId || "unknown"}`}</h3>
      <p>{content?.body || "Content details are not available for this interaction."}</p>
    </article>
  );

  if (contentId === undefined || contentId === null) {
    return item;
  }

  return (
    <Link
      className="interaction-list-link"
      state={{ backLabel: "Back to Interactions", backTo: "/interactions" }}
      to={`/content/${contentId}`}
    >
      {item}
    </Link>
  );
}

export default InteractionListItem;
