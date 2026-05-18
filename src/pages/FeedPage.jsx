import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import eruApi from "../eruApi.js";
import { contentTypes } from "../constants/contentTypes.js";
import ContentViewer from "../components/feed/ContentViewer.jsx";
import FilterTabs from "../components/feed/FilterTabs.jsx";
import StatusMessage from "../components/feedback/StatusMessage.jsx";
import Header from "../components/layout/Header.jsx";

function FeedPage() {
  const {
    currentUser,
    error,
    handleLogout,
    message,
    setError,
    setMessage,
  } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get("type") || "ALL";
  const [content, setContent] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setInteractions(data);
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
    const existingTypes = map[contentId] || [];

    return {
      ...map,
      [contentId]: [...existingTypes, interaction.reactionType],
    };
  }, {});

  function changeSelectedType(nextType) {
    if (nextType === "ALL") {
      setSearchParams({});
      return;
    }

    setSearchParams({ type: nextType });
  }

  function hasInteraction(contentId, reactionType, currentInteractions = interactions) {
    return currentInteractions.some((interaction) => {
      const existingContentId = interaction.content?.id ?? interaction.contentId;
      return String(existingContentId) === String(contentId) && interaction.reactionType === reactionType;
    });
  }

  function recordInteraction(contentId, reactionType, silent = false) {
    if (hasInteraction(contentId, reactionType)) {
      return Promise.resolve();
    }

    return eruApi.saveInteraction(contentId, reactionType)
      .then((savedInteraction) => {
        setInteractions((currentInteractions) => {
          if (hasInteraction(contentId, reactionType, currentInteractions)) {
            return currentInteractions;
          }

          return [...currentInteractions, savedInteraction];
        });

        if (reactionType === "VIEW") {
          setContent((currentContent) => currentContent.filter((item) => item.id !== contentId));
        }

        if (!silent) {
          setMessage(`${reactionType.toLowerCase()} saved.`);
          setError("");
        }
      })
      .catch((apiError) => {
        if (!silent) {
          setError(apiError.message);
        }
      });
  }

  function handleReaction(contentId, reactionType) {
    recordInteraction(contentId, reactionType);
  }

  function handleView(contentId) {
    recordInteraction(contentId, "VIEW", true);
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
        <StatusMessage message={message} error={error} />

        <section className="toolbar feed-toolbar">
          <FilterTabs
            options={contentTypes}
            selectedType={selectedType}
            onSelect={changeSelectedType}
          />
        </section>

        <section className="feed-stage">
          <div className="feed-stage-header">
            <h1>Did you know?</h1>
          </div>
          <ContentViewer
            content={content}
            loading={loading}
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
