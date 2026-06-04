import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import AdminContentItem from "../components/admin/AdminContentItem.jsx";
import ContentAdminForm from "../components/admin/ContentAdminForm.jsx";
import StatusMessage from "../components/feedback/StatusMessage.jsx";
import Header from "../components/layout/Header.jsx";
import eruApi from "../eruApi.js";

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
  const formRef = useRef(null);

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

        <section className="admin-content-section">
          <div className="admin-list-heading">
            <h2>Content library</h2>
            <span>{content.length} items</span>
          </div>

          {loading ? <p className="empty-state">Loading content...</p> : null}
          {!loading && content.length === 0 ? (
            <p className="empty-state">No content has been created yet.</p>
          ) : null}

          <div className="admin-content-list">
            {content.map((item) => (
              <AdminContentItem
                content={item}
                deleting={deletingId === item.id}
                key={item.id}
                onDelete={deleteContent}
                onEdit={setEditingContent}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default AdminPage;
