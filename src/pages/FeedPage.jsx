import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import eruApi from "../eruApi.js";
import ContentSearch from "../components/content/ContentSearch.jsx";
import ContentViewer from "../components/feed/ContentViewer.jsx";
import FilterTabs from "../components/feed/FilterTabs.jsx";
import Header from "../components/layout/Header.jsx";
import filterContent from "../utils/contentSearch.js";

const contentTypes = ["ALL", "FACT", "THEORY", "QUOTE"];
const interactionMessages = {
  BOOKMARK: "Bookmark saved.",
  DISLIKE: "Dislike saved.",
  LIKE: "Like saved.",
};
const removedInteractionMessages = {
  BOOKMARK: "Bookmark removed.",
  DISLIKE: "Dislike removed.",
  LIKE: "Like removed.",
};

function isOppositeReaction(existingType, nextType) {
  return (existingType === "LIKE" && nextType === "DISLIKE")
    || (existingType === "DISLIKE" && nextType === "LIKE");
}

function FeedPage() {
  const {
    currentUser,
    handleLogout,
    setError,
    setMessage,
  } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get("type") || "ALL";
  const [content, setContent] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [pendingInteractionKeys, setPendingInteractionKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const filteredContent = filterContent(content, searchTerm);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");

    eruApi.getFeed(selectedType)
      .then((data) => {
        if (!ignore) {
          setContent(data);
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
  }, [selectedType, setError]);

  useEffect(() => {
    let ignore = false;

    eruApi.getMyInteractions()
      .then((data) => {
        if (!ignore) {
          setInteractions(Array.isArray(data) ? data.filter(Boolean) : []);
        }
      })
      .catch((apiError) => {
        if (!ignore) {
          setError(apiError.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [setError]);

  const reactionMap = interactions.reduce((map, interaction) => {
    const contentId = interaction.content?.id ?? interaction.contentId;

    if (contentId === undefined || contentId === null || !interaction.reactionType) {
      return map;
    }

    const existingTypes = map[contentId] || [];

    return {
      ...map,
      [contentId]: [...existingTypes, interaction.reactionType],
    };
  }, {});

  const pendingReactionMap = pendingInteractionKeys.reduce((map, key) => {
    const [contentId, reactionType] = key.split(":");
    const existingTypes = map[contentId] || [];

    return {
      ...map,
      [contentId]: [...existingTypes, reactionType],
    };
  }, {});

  function changeSelectedType(nextType) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextType === "ALL") {
      nextParams.delete("type");
    } else {
      nextParams.set("type", nextType);
    }

    setSearchParams(nextParams);
  }

  function hasInteraction(contentId, reactionType, currentInteractions = interactions) {
    return currentInteractions.some((interaction) => {
      if (!interaction) {
        return false;
      }

      const existingContentId = interaction.content?.id ?? interaction.contentId;
      return String(existingContentId) === String(contentId)
        && interaction.reactionType === reactionType;
    });
  }

  function recordInteraction(contentId, reactionType, showMessage = true) {
    const interactionKey = `${contentId}:${reactionType}`;

    if (
      hasInteraction(contentId, reactionType)
      || pendingInteractionKeys.includes(interactionKey)
    ) {
      return Promise.resolve();
    }

    setPendingInteractionKeys((currentKeys) => [...currentKeys, interactionKey]);

    return eruApi.saveInteraction(contentId, reactionType)
      .then((savedInteraction) => {
        setInteractions((currentInteractions) => {
          if (hasInteraction(contentId, reactionType, currentInteractions)) {
            return currentInteractions;
          }

          const withoutOppositeReaction = currentInteractions.filter((interaction) => {
            const existingContentId = interaction.content?.id ?? interaction.contentId;
            return String(existingContentId) !== String(contentId)
              || !isOppositeReaction(interaction.reactionType, reactionType);
          });

          return [...withoutOppositeReaction, savedInteraction];
        });

        if (showMessage) {
          setMessage(interactionMessages[reactionType] || "Interaction saved.");
        }
        setError("");
      })
      .catch((apiError) => {
        setError(apiError.message);
        setMessage("");
      })
      .finally(() => {
        setPendingInteractionKeys((currentKeys) => currentKeys
          .filter((key) => key !== interactionKey));
      });
  }

  function handleReaction(contentId, reactionType) {
    const interactionKey = `${contentId}:${reactionType}`;

    if (pendingInteractionKeys.includes(interactionKey)) {
      return;
    }

    if (!hasInteraction(contentId, reactionType)) {
      recordInteraction(contentId, reactionType);
      return;
    }

    setPendingInteractionKeys((currentKeys) => [...currentKeys, interactionKey]);
    eruApi.removeInteraction(contentId, reactionType)
      .then(() => {
        setInteractions((currentInteractions) => currentInteractions
          .filter((interaction) => {
            const existingContentId = interaction.content?.id ?? interaction.contentId;
            return String(existingContentId) !== String(contentId)
              || interaction.reactionType !== reactionType;
          }));
        setMessage(removedInteractionMessages[reactionType] || "Interaction removed.");
        setError("");
      })
      .catch((apiError) => {
        setError(apiError.message);
        setMessage("");
      })
      .finally(() => {
        setPendingInteractionKeys((currentKeys) => currentKeys
          .filter((key) => key !== interactionKey));
      });
  }

  function handleView(contentId) {
    recordInteraction(contentId, "VIEW", false);
  }

  function handleElaborate(contentId) {
    return eruApi.elaborateContent(contentId)
      .then((response) => response.explanation)
      .catch((apiError) => {
        setError(apiError.message);
        return "";
      });
  }

  return (
    <main className="feed-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="feed-workspace">
        <section className="toolbar feed-toolbar">
          <div>
            <p className="filter-label">Content type</p>
            <FilterTabs
              options={contentTypes}
              selectedType={selectedType}
              onSelect={changeSelectedType}
            />
          </div>
          <ContentSearch value={searchTerm} onChange={setSearchTerm} />
        </section>

        <section className="feed-stage">
          <div className="feed-stage-header">
            <h1>Did you know?</h1>
          </div>
          <ContentViewer
            content={filteredContent}
            emptyMessage={searchTerm
              ? `No content matched "${searchTerm}".`
              : "No unseen content matched this filter."}
            loading={loading}
            pendingReactionMap={pendingReactionMap}
            reactionMap={reactionMap}
            onReact={handleReaction}
            onElaborate={handleElaborate}
            onView={handleView}
          />
        </section>
      </section>
    </main>
  );
}

export default FeedPage;
