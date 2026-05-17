import { useState } from "react";

const reactions = ["LIKE", "BOOKMARK", "DISLIKE"];

function ContentCard({ item, activeReactions = [], onReact, onElaborate, onView }) {
  const [explanation, setExplanation] = useState("");
  const [elaborating, setElaborating] = useState(false);
  const { id, title, body, contentType, category, source, author } = item;

  async function handleElaborate() {
    setElaborating(true);
    const text = await onElaborate(id);
    setExplanation(text);
    setElaborating(false);
  }

  return (
    <article className="content-card">
      <header>
        <span className={`type-badge ${contentType.toLowerCase()}`}>{contentType}</span>
        <span>{category || "General"}</span>
      </header>

      <h2>{title}</h2>
      <p className="body-text">{body}</p>

      <footer>
        <span>{author || "Unknown author"}</span>
        {source ? <span>{source}</span> : null}
      </footer>

      <div className="reaction-row">
        {reactions.map((reaction) => {
          const isActive = activeReactions.includes(reaction);

          return (
            <button
              className={isActive ? "reaction-button active" : "reaction-button"}
              key={reaction}
              type="button"
              onClick={() => onReact(id, reaction)}
            >
              {reaction}
            </button>
          );
        })}
        <button className="secondary-button" type="button" onClick={() => onView(id)}>
          Seen
        </button>
        <button className="secondary-button" type="button" onClick={handleElaborate}>
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
