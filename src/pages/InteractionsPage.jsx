import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import InteractionListItem from "../components/interactions/InteractionListItem.jsx";
import Header from "../components/layout/Header.jsx";
import eruApi from "../eruApi.js";

const interactionGroups = [
  { reactionType: "LIKE", title: "Liked" },
  { reactionType: "BOOKMARK", title: "Bookmarked" },
  { reactionType: "DISLIKE", title: "Disliked" },
  { reactionType: "VIEW", title: "Viewed" },
];

function InteractionGroupIcon({ reactionType }) {
  if (reactionType === "LIKE") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 10v10H4V10h3Z" />
        <path d="M7 10l4-7c.8 0 1.5.5 1.7 1.3l.2.9c.2.8.1 1.6-.2 2.3L12 9h6.2c1.2 0 2.1 1.1 1.9 2.3l-1.1 6.4c-.2 1-1 1.7-2 1.7H7V10Z" />
      </svg>
    );
  }

  if (reactionType === "BOOKMARK") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M6 4.8C6 3.8 6.8 3 7.8 3h8.4c1 0 1.8.8 1.8 1.8V21l-6-3.8L6 21V4.8Z" />
      </svg>
    );
  }

  if (reactionType === "DISLIKE") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M17 14V4h3v10h-3Z" />
        <path d="M17 14l-4 7c-.8 0-1.5-.5-1.7-1.3l-.2-.9c-.2-.8-.1-1.6.2-2.3L12 15H5.8c-1.2 0-2.1-1.1-1.9-2.3L5 6.3c.2-1 1-1.7 2-1.7h10V14Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function InteractionsPage() {
  const {
    currentUser,
    handleLogout,
    setError,
  } = useOutletContext();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");

    eruApi.getMyInteractions()
      .then((data) => {
        if (!ignore) {
          setInteractions(Array.isArray(data) ? data : []);
        }
      })
      .catch((apiError) => {
        if (!ignore) {
          setError(apiError.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [setError]);

  return (
    <main className="feed-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="interactions-workspace">
        <div className="admin-page-heading">
          <p className="eyebrow">Your activity</p>
          <h1>Interaction overview</h1>
          <p>See the content you have liked, bookmarked, disliked, and viewed.</p>
        </div>

        {loading ? <p className="empty-state">Loading interactions...</p> : null}
        {!loading && interactions.length === 0 ? (
          <p className="empty-state">You have not interacted with any content yet.</p>
        ) : null}

        {!loading && interactions.length > 0 ? (
          <div className="interaction-groups">
            {interactionGroups.map(({ reactionType, title }) => {
              const matchingInteractions = interactions
                .filter((interaction) => interaction?.reactionType === reactionType);

              return (
                <section className="interaction-group" key={reactionType}>
                  <div className="interaction-group-heading">
                    <h2>
                      <span className={`interaction-heading-icon ${reactionType.toLowerCase()}`}>
                        <InteractionGroupIcon reactionType={reactionType} />
                      </span>
                      {title}
                    </h2>
                    <span>{matchingInteractions.length}</span>
                  </div>

                  {matchingInteractions.length === 0 ? (
                    <p className="interaction-empty">No {title.toLowerCase()} content yet.</p>
                  ) : (
                    <div className="interaction-list">
                      {matchingInteractions.map((interaction) => (
                        <InteractionListItem
                          interaction={interaction}
                          key={interaction.id || `${reactionType}-${interaction.contentId}`}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default InteractionsPage;
