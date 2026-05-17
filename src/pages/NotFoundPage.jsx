import { Link, useParams } from "react-router";

function NotFoundPage() {
  const params = useParams();
  const missingPath = params["*"] || "this route";

  return (
    <main className="feed-page">
      <section className="not-found-panel">
        <p className="eyebrow">404</p>
        <h1>Route not found</h1>
        <p>The route "{missingPath}" does not exist.</p>
        <Link className="text-link" to="/">
          Go home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
