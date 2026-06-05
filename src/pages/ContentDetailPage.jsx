import { useEffect, useState } from "react";
import { useLocation, useOutletContext, useParams } from "react-router";
import ContentCard from "../components/feed/ContentCard.jsx";
import BackLink from "../components/layout/BackLink.jsx";
import Header from "../components/layout/Header.jsx";
import eruApi from "../eruApi.js";

function isOppositeReaction(existingType, nextType) {
  return (existingType === "LIKE" && nextType === "DISLIKE")
    || (existingType === "DISLIKE" && nextType === "LIKE");
}

function ContentDetailPage() {
  const {
    currentUser,
    error,
    handleLogout,
    setError,
    setMessage,
  } = useOutletContext();
  const { contentId } = useParams();
  const location = useLocation();
  const backTo = location.state?.backTo || "/explore";
  const backLabel = location.state?.backLabel || "Back to Explore";
  const [content, setContent] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [pendingReactions, setPendingReactions] = useState([]);
  const [viewAttempted, setViewAttempted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");
    setViewAttempted(false);

    Promise.all([eruApi.getContentById(contentId), eruApi.getMyInteractions()])
      .then(([contentData, interactionData]) => {
        if (!ignore) {
          setContent(contentData);
          setInteractions(Array.isArray(interactionData) ? interactionData.filter(Boolean) : []);
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
  }, [contentId, setError]);

  const activeReactions = interactions
    .filter((interaction) => String(interaction.content?.id ?? interaction.contentId) === String(contentId))
    .map((interaction) => interaction.reactionType);
  const hasViewed = activeReactions.includes("VIEW");

  useEffect(() => {
    if (!content || hasViewed || viewAttempted) {
      return;
    }

    setViewAttempted(true);
    eruApi.saveInteraction(content.id, "VIEW")
      .then((savedInteraction) => {
        setInteractions((currentInteractions) => [...currentInteractions, savedInteraction]);
      })
      .catch((apiError) => setError(apiError.message));
  }, [content, hasViewed, setError, viewAttempted]);

  function handleReaction(id, reactionType) {
    if (pendingReactions.includes(reactionType)) {
      return;
    }

    setPendingReactions((current) => [...current, reactionType]);
    setError("");
    setMessage("");

    const active = activeReactions.includes(reactionType);
    const request = active
      ? eruApi.removeInteraction(id, reactionType)
      : eruApi.saveInteraction(id, reactionType);

    request
      .then((savedInteraction) => {
        setInteractions((current) => active
          ? current.filter((interaction) => {
            const existingContentId = interaction.content?.id ?? interaction.contentId;
            return String(existingContentId) !== String(id)
              || interaction.reactionType !== reactionType;
          })
          : [
            ...current.filter((interaction) => {
              const existingContentId = interaction.content?.id ?? interaction.contentId;
              return String(existingContentId) !== String(id)
                || !isOppositeReaction(interaction.reactionType, reactionType);
            }),
            savedInteraction,
          ]);
        setMessage(`${reactionType.toLowerCase()} ${active ? "removed" : "saved"}.`);
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => {
        setPendingReactions((current) => current.filter((type) => type !== reactionType));
      });
  }

  function handleElaborate(id) {
    return eruApi.elaborateContent(id)
      .then((response) => response.explanation)
      .catch((apiError) => {
        setError(apiError.message);
        return "";
      });
  }

  return (
    <main className="feed-page content-detail-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="feed-workspace">
        <BackLink to={backTo}>{backLabel}</BackLink>
        <section className="feed-stage">
          {loading ? <p className="empty-state">Loading content...</p> : null}
          {!loading && content ? (
            <ContentCard
              activeReactions={activeReactions}
              item={content}
              pendingReactions={pendingReactions}
              onElaborate={handleElaborate}
              onReact={handleReaction}
            />
          ) : null}
          {!loading && !content && !error ? (
            <p className="empty-state">Content could not be found.</p>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default ContentDetailPage;
