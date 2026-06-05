import { useEffect, useRef, useState } from "react";
import ContentCard from "./ContentCard.jsx";

const swipeThreshold = 45;
const wheelThreshold = 35;
const throwDistance = 420;

function isInteractiveElement(target) {
  return Boolean(target.closest("button, a, input, select, textarea"));
}

function isContentCardGesture(target) {
  return Boolean(target.closest(".content-single-item"));
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [elaboratingIds, setElaboratingIds] = useState([]);
  const [explanations, setExplanations] = useState({});
  const [dragOffset, setDragOffset] = useState(0);
  const [throwDirection, setThrowDirection] = useState("");
  const [transitionKey, setTransitionKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState("next");
  const viewerRef = useRef(null);
  const pointerStart = useRef(null);
  const wheelLocked = useRef(false);
  const activeItem = content[activeIndex];
  const contentKey = content.map((item) => item.id).join(":");

  useEffect(() => {
    setActiveIndex(0);
  }, [contentKey]);

  useEffect(() => {
    if (!activeItem) {
      return undefined;
    }

    const alreadyViewed = reactionMap[activeItem.id]?.includes("VIEW")
      || pendingReactionMap[activeItem.id]?.includes("VIEW");

    if (alreadyViewed) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      onView(activeItem.id);
    }, 800);

    return () => window.clearTimeout(timerId);
  }, [activeItem, onView, pendingReactionMap, reactionMap]);

  function showContent(nextIndex) {
    setActiveIndex((currentIndex) => {
      const boundedIndex = Math.max(0, Math.min(nextIndex, content.length - 1));

      if (boundedIndex !== currentIndex) {
        setTransitionDirection(boundedIndex > currentIndex ? "next" : "previous");
        setTransitionKey((currentKey) => currentKey + 1);
      }

      return boundedIndex;
    });
  }

  function showNextContent() {
    showContent(activeIndex + 1);
  }

  function showPreviousContent() {
    showContent(activeIndex - 1);
  }

  function handleWheel(event) {
    if (!isContentCardGesture(event.target)) {
      return;
    }

    if (isInteractiveElement(event.target)) {
      return;
    }

    event.preventDefault();

    const isVerticalGesture = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      && Math.abs(event.deltaY) >= wheelThreshold;

    if (wheelLocked.current || !isVerticalGesture) {
      return;
    }

    wheelLocked.current = true;

    if (event.deltaY > 0) {
      showNextContent();
    } else {
      showPreviousContent();
    }

    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 720);
  }

  useEffect(() => {
    const viewerElement = viewerRef.current;

    if (!viewerElement) {
      return undefined;
    }

    function handleNativeWheel(event) {
      handleWheel(event);
    }

    viewerElement.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      viewerElement.removeEventListener("wheel", handleNativeWheel);
    };
  }, [activeIndex, content.length]);

  function handlePointerDown(event) {
    if (isInteractiveElement(event.target)) {
      pointerStart.current = null;
      return;
    }

    event.preventDefault();
    pointerStart.current = {
      y: event.clientY,
    };
    setThrowDirection("");
    setDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!pointerStart.current) {
      return;
    }

    const deltaY = event.clientY - pointerStart.current.y;

    event.preventDefault();
    setDragOffset(Math.max(-160, Math.min(160, deltaY)));
  }

  function handlePointerUp(event) {
    if (!pointerStart.current) {
      return;
    }

    const deltaY = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (Math.abs(deltaY) < swipeThreshold) {
      setDragOffset(0);
      return;
    }

    const nextDirection = deltaY < 0 ? "up" : "down";
    setThrowDirection(nextDirection);
    setDragOffset(nextDirection === "up" ? -throwDistance : throwDistance);

    window.setTimeout(() => {
      if (nextDirection === "up") {
        showNextContent();
      } else {
        showPreviousContent();
      }

      setThrowDirection("");
      setDragOffset(0);
    }, 260);
  }

  function handlePointerCancel() {
    pointerStart.current = null;
    setThrowDirection("");
    setDragOffset(0);
  }

  async function handleElaborate(contentId) {
    if (explanations[contentId] || elaboratingIds.includes(contentId)) {
      return;
    }

    setElaboratingIds((currentIds) => [...currentIds, contentId]);

    try {
      const explanation = await onElaborate(contentId);

      if (explanation) {
        setExplanations((currentExplanations) => ({
          ...currentExplanations,
          [contentId]: explanation,
        }));
      }
    } finally {
      setElaboratingIds((currentIds) => currentIds
        .filter((id) => id !== contentId));
    }
  }

  if (loading) {
    return <p className="empty-state">Loading eru content...</p>;
  }

  if (content.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <section
      className="content-viewer"
      aria-label="Content feed"
      ref={viewerRef}
    >
      <div className="content-lightning-layer" aria-hidden="true" key={transitionKey} />
      <div
        className={`content-single-item slide-${transitionDirection}${throwDirection ? ` throwing-${throwDirection}` : ""}`}
        key={activeItem.id}
        style={{ "--drag-offset": `${dragOffset}px` }}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <ContentCard
          item={activeItem}
          activeReactions={reactionMap[activeItem.id]}
          elaborating={elaboratingIds.includes(activeItem.id)}
          explanation={explanations[activeItem.id]}
          pendingReactions={pendingReactionMap[activeItem.id]}
          onReact={onReact}
          onElaborate={handleElaborate}
        />
      </div>
    </section>
  );
}

export default ContentViewer;
