import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import AdminContentItem from "../components/admin/AdminContentItem.jsx";
import ContentAdminForm from "../components/admin/ContentAdminForm.jsx";
import ContentSearch from "../components/content/ContentSearch.jsx";
import StatusMessage from "../components/feedback/StatusMessage.jsx";
import Header from "../components/layout/Header.jsx";
import eruApi from "../eruApi.js";
import filterContent from "../utils/contentSearch.js";

const pageSize = 20;

function AdminPage() {
  const {
    currentUser,
    error,
    handleLogout,
    message,
    setError,
    setMessage,
  } = useOutletContext();
  const [content, setContent] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const formRef = useRef(null);
  const libraryRef = useRef(null);
  const filteredContent = filterContent(content, searchTerm);
  const pageCount = Math.max(1, Math.ceil(filteredContent.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedContent = filteredContent.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");

    eruApi.getContent("ALL", false)
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
  }, [setError]);

  useEffect(() => {
    if (editingContent) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingContent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  function changePage(nextPage) {
    setCurrentPage(nextPage);
    libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveContent(contentForm) {
    setError("");
    setMessage("");

    try {
      if (editingContent) {
        const updatedContent = await eruApi.updateContent(editingContent.id, contentForm);
        setContent((currentContent) => currentContent
          .map((item) => item.id === updatedContent.id ? updatedContent : item));
        setEditingContent(null);
        setMessage("Content updated.");
        return;
      }

      const createdContent = await eruApi.createContent(contentForm);
      setContent((currentContent) => [createdContent, ...currentContent]);
      setMessage("Content created.");
    } catch (apiError) {
      setError(apiError.message);
      throw apiError;
    }
  }

  async function deleteContent(item) {
    const confirmed = window.confirm(`Delete "${item.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError("");
    setMessage("");

    try {
      await eruApi.deleteContent(item.id);
      setContent((currentContent) => currentContent
        .filter((contentItem) => contentItem.id !== item.id));
      if (editingContent?.id === item.id) {
        setEditingContent(null);
      }
      setMessage("Content deleted.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="feed-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="admin-workspace">
        <div className="admin-page-heading">
          <p className="eyebrow">Admin area</p>
          <h1>Manage ERU content</h1>
          <p>Create, edit, and delete the items shown in the learning feed.</p>
        </div>

        <StatusMessage message={message} error={error} />

        <div className="admin-form-anchor" ref={formRef}>
          <ContentAdminForm
            key={editingContent?.id || "new-content"}
            content={editingContent}
            onCancel={() => setEditingContent(null)}
            onSave={saveContent}
          />
        </div>

        <section className="admin-content-section" ref={libraryRef}>
          <div className="admin-list-heading">
            <h2>Content library</h2>
            <span>
              {filteredContent.length > 0
                ? `Showing ${pageStart + 1}-${Math.min(pageStart + pageSize, filteredContent.length)} of ${filteredContent.length}`
                : "0 items"}
            </span>
          </div>

          <ContentSearch
            placeholder="Search the content library..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {loading ? <p className="empty-state">Loading content...</p> : null}
          {!loading && content.length === 0 ? (
            <p className="empty-state">No content has been created yet.</p>
          ) : null}
          {!loading && content.length > 0 && filteredContent.length === 0 ? (
            <p className="empty-state">No content matched "{searchTerm}".</p>
          ) : null}

          <div className="admin-content-list">
            {paginatedContent.map((item) => (
              <AdminContentItem
                content={item}
                deleting={deletingId === item.id}
                key={item.id}
                onDelete={deleteContent}
                onEdit={setEditingContent}
              />
            ))}
          </div>

          {filteredContent.length > pageSize ? (
            <nav className="admin-pagination" aria-label="Content library pages">
              <button
                className="secondary-button"
                disabled={currentPage === 1}
                type="button"
                onClick={() => changePage(currentPage - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage} of {pageCount}</span>
              <button
                className="secondary-button"
                disabled={currentPage === pageCount}
                type="button"
                onClick={() => changePage(currentPage + 1)}
              >
                Next
              </button>
            </nav>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default AdminPage;
