const cardReactions = ["LIKE", "DISLIKE"];
const reactionLabels = {
  BOOKMARK: {
    active: "Remove bookmark",
    idle: "Bookmark",
  },
  DISLIKE: {
    active: "Remove dislike",
    idle: "Dislike",
  },
  LIKE: {
    active: "Remove like",
    idle: "Like",
  },
};

function LikeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 10v10H4V10h3Z" />
      <path d="M7 10l4-7c.8 0 1.5.5 1.7 1.3l.2.9c.2.8.1 1.6-.2 2.3L12 9h6.2c1.2 0 2.1 1.1 1.9 2.3l-1.1 6.4c-.2 1-1 1.7-2 1.7H7V10Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 4.8C6 3.8 6.8 3 7.8 3h8.4c1 0 1.8.8 1.8 1.8V21l-6-3.8L6 21V4.8Z" />
    </svg>
  );
}

function DislikeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M17 14V4h3v10h-3Z" />
      <path d="M17 14l-4 7c-.8 0-1.5-.5-1.7-1.3l-.2-.9c-.2-.8-.1-1.6.2-2.3L12 15H5.8c-1.2 0-2.1-1.1-1.9-2.3L5 6.3c.2-1 1-1.7 2-1.7h10V14Z" />
    </svg>
  );
}

function ElaborateIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M18 14l.9 2.2L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.8L18 14Z" />
      <path d="M5 15l.7 1.6L7 17l-1.3.4L5 19l-.7-1.6L3 17l1.3-.4L5 15Z" />
    </svg>
  );
}

const reactionIcons = {
  BOOKMARK: <BookmarkIcon />,
  DISLIKE: <DislikeIcon />,
  LIKE: <LikeIcon />,
};

function ContentCard({
  item,
  activeReactions = [],
  elaborating = false,
  explanation = "",
  pendingReactions = [],
  onReact,
  onElaborate,
}) {
  const { id, title, body, contentType, category, source, author } = item;
  const hasBookmark = activeReactions.includes("BOOKMARK");
  const bookmarkPending = pendingReactions.includes("BOOKMARK");
  const hasExplanation = Boolean(explanation);

  return (
    <article className="content-card">
      <button
        aria-label={hasBookmark ? "Remove bookmark" : "Bookmark"}
        aria-pressed={hasBookmark}
        className={hasBookmark
          ? "reaction-button content-bookmark-button reaction-bookmark active"
          : "reaction-button content-bookmark-button reaction-bookmark"}
        disabled={bookmarkPending}
        title={hasBookmark ? "Remove bookmark" : "Bookmark"}
        type="button"
        onClick={() => onReact(id, "BOOKMARK")}
      >
        <BookmarkIcon />
        <span className="visually-hidden">Bookmark</span>
      </button>

      <header className="content-card-meta">
        <span className={`type-badge ${contentType.toLowerCase()}`}>
          {contentType}
        </span>
        <span className="category-badge">
          {category || "General"}
        </span>
        <span className="author-badge">
          {author || "Unknown author"}
        </span>
      </header>

      <div className="content-card-main">
        <h2>{title}</h2>
        <p className="body-text">{body}</p>

        {source ? (
          <p className="content-source">
            <span>Source</span>
            {source}
          </p>
        ) : null}

        {elaborating || explanation ? (
          <section
            className={elaborating ? "explanation loading" : "explanation ready"}
            aria-label="AI elaboration"
            aria-live="polite"
          >
            <p className="explanation-label">
              {elaborating ? "Generating elaboration" : "AI elaboration"}
            </p>
            {elaborating ? (
              <div className="explanation-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <p className="explanation-text">{explanation}</p>
            )}
          </section>
        ) : null}
      </div>

      <footer className="content-card-actions">
        <div className="reaction-row" aria-label="Content reactions">
          {cardReactions.map((reaction) => {
            const isActive = activeReactions.includes(reaction);
            const isPending = pendingReactions.includes(reaction);
            const label = reactionLabels[reaction];

            return (
              <button
                aria-label={isActive ? label.active : label.idle}
                aria-pressed={isActive}
                className={isActive
                  ? `reaction-button reaction-${reaction.toLowerCase()} active`
                  : `reaction-button reaction-${reaction.toLowerCase()}`}
                disabled={isPending}
                key={reaction}
                title={isActive ? label.active : label.idle}
                type="button"
                onClick={() => onReact(id, reaction)}
              >
                {reactionIcons[reaction]}
                <span className="visually-hidden">{label.idle}</span>
              </button>
            );
          })}
        </div>
        <button
          className="secondary-button elaborate-button"
          disabled={elaborating || hasExplanation}
          type="button"
          onClick={() => onElaborate(id)}
        >
          <ElaborateIcon />
          <span>
            {hasExplanation ? "Elaborated" : elaborating ? "Elaborating..." : "Elaborate"}
          </span>
        </button>
      </footer>
    </article>
  );
}

export default ContentCard;
