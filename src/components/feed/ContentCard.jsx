import { useState } from "react";

const reactions = ["LIKE", "BOOKMARK", "DISLIKE"];

function ContentCard({
  item,
  activeReactions = [],
  pendingReactions = [],
  onReact,
  onElaborate,
}) {
  const [explanation, setExplanation] = useState("");
  const [elaborating, setElaborating] = useState(false);
  const { id, title, body, contentType, category, source, author } = item;

  async function handleElaborate() {
    setElaborating(true);

    try {
      const text = await onElaborate(id);
      setExplanation(text);
    } finally {
      setElaborating(false);
    }
  }

  return (
    <article className="content-card">
      <header>
        <span className={`type-badge ${contentType.toLowerCase()}`}>{contentType}</span>
        <span className="category-badge">{category || "General"}</span>
        <span className="author-badge">{author || "Unknown author"}</span>
      </header>

      <h2>{title}</h2>
      <p className="body-text">{body}</p>

      {source ? <p className="content-source">Source: {source}</p> : null}

      <div className="reaction-row">
        {reactions.map((reaction) => {
          const isActive = activeReactions.includes(reaction);
          const isPending = pendingReactions.includes(reaction);

          return (
            <button
              className={isActive ? "reaction-button active" : "reaction-button"}
              disabled={isPending}
              key={reaction}
              type="button"
              onClick={() => onReact(id, reaction)}
            >
              {reaction}
            </button>
          );
        })}
        <button
          className="secondary-button"
          disabled={elaborating}
          type="button"
          onClick={handleElaborate}
        >
          {elaborating ? "Elaborating..." : "Elaborate"}
        </button>
      </div>

      {explanation ? (
        <p className="explanation">
          {explanation}
        </p>
      ) : null}
    </article>
  );
}

export default ContentCard;
