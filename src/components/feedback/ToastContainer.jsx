import { useEffect, useState } from "react";

const toastIcons = {
  error: "✕",
  success: "✓",
  warning: "⚠",
};

function Toast({ toast, onRemove }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2400);
    const removeTimer = window.setTimeout(() => onRemove(toast.id), 2800);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onRemove, toast.id]);

  return (
    <div
      className={`toast ${toast.type}${leaving ? " leaving" : ""}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <span className="toast-icon" aria-hidden="true">{toastIcons[toast.type]}</span>
      <span>{toast.text}</span>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <aside className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </aside>
  );
}

export default ToastContainer;
