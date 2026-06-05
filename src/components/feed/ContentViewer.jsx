import { useEffect, useRef } from "react";
import ContentCard from "./ContentCard.jsx";

function ViewedContentItem({ children, contentId, viewed, onView }) {
  const itemRef = useRef(null);

  useEffect(() => {
    if (viewed || !itemRef.current) {
      return undefined;
    }

    let viewTimer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(viewTimer);

        if (entry.isIntersecting) {
          viewTimer = window.setTimeout(() => {
            onView(contentId);
            observer.disconnect();
          }, 800);
        }
      },
      {
        root: itemRef.current.closest(".content-viewer"),
        threshold: 0.65,
      },
    );

    observer.observe(itemRef.current);

    return () => {
      window.clearTimeout(viewTimer);
      observer.disconnect();
    };
  }, [contentId, onView, viewed]);

  return (
    <div className="content-scroll-item" ref={itemRef}>
      {children}
    </div>
  );
}

function ContentViewer({
  content,
  emptyMessage,
  loading,
  pendingReactionMap,
  reactionMap,
  onReact,
  onElaborate,
  onView,
}) {
  if (loading) {
    return <p className="empty-state">Loading eru content...</p>;
  }

  if (content.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <section className="content-viewer" aria-label="Content feed">
      {content.map((item) => (
        <ViewedContentItem
          contentId={item.id}
          key={item.id}
          onView={onView}
          viewed={
            reactionMap[item.id]?.includes("VIEW")
            || pendingReactionMap[item.id]?.includes("VIEW")
          }
        >
          <ContentCard
            item={item}
            activeReactions={reactionMap[item.id]}
            pendingReactions={pendingReactionMap[item.id]}
            onReact={onReact}
            onElaborate={onElaborate}
          />
        </ViewedContentItem>
      ))}
    </section>
  );
}

export default ContentViewer;
