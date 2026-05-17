import ContentCard from "./ContentCard.jsx";

function ContentViewer({ content, loading, reactionMap, onReact, onElaborate, onView }) {
  if (loading) {
    return <p className="empty-state">Loading eru content...</p>;
  }

  if (content.length === 0) {
    return <p className="empty-state">No content matched this filter.</p>;
  }

  return (
    <section className="content-viewer" aria-label="Content feed">
      {content.map((item) => (
        <div className="content-scroll-item" key={item.id}>
          <ContentCard
            item={item}
            activeReactions={reactionMap[item.id]}
            onReact={onReact}
            onElaborate={onElaborate}
            onView={onView}
          />
        </div>
      ))}
    </section>
  );
}

export default ContentViewer;
