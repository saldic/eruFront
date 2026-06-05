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
                    <h2>{title}</h2>
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
