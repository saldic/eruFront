function StatusMessage({ message, error }) {
  if (!message && !error) {
    return null;
  }

  return (
    <section className={error ? "status-message error" : "status-message"}>
      {error || message}
    </section>
  );
}

export default StatusMessage;
