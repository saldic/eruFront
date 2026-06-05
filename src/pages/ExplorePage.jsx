import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import ContentSearch from "../components/content/ContentSearch.jsx";
import Header from "../components/layout/Header.jsx";
import eruApi from "../eruApi.js";
import filterContent from "../utils/contentSearch.js";

const contentTypes = ["ALL", "FACT", "THEORY", "QUOTE"];

function uniqueValues(content, field) {
  return [...new Set(content.map((item) => item[field]).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
}

function ExplorePage() {
  const { currentUser, handleLogout, setError } = useOutletContext();
  const [content, setContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");

    eruApi.getContent("ALL")
      .then((data) => {
        if (!ignore) {
          setContent(Array.isArray(data) ? data : []);
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

  const authors = useMemo(() => uniqueValues(content, "author"), [content]);
  const categories = useMemo(() => uniqueValues(content, "category"), [content]);
  const filteredContent = filterContent(content, searchTerm).filter((item) => (
    (selectedAuthor === "ALL" || item.author === selectedAuthor)
    && (selectedCategory === "ALL" || item.category === selectedCategory)
    && (selectedType === "ALL" || item.contentType === selectedType)
  ));

  function clearFilters() {
    setSearchTerm("");
    setSelectedAuthor("ALL");
    setSelectedCategory("ALL");
    setSelectedType("ALL");
  }

  return (
    <main className="feed-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="explore-workspace">
        <div className="admin-page-heading">
          <p className="eyebrow">Explore</p>
          <h1>Find your content</h1>
          <p>Combine search, author, category, and content type to create your own view.</p>
        </div>

        <section className="explore-filters">
          <ContentSearch
            placeholder="Search..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <label>
            Author
            <select value={selectedAuthor} onChange={(event) => setSelectedAuthor(event.target.value)}>
              <option value="ALL">All authors</option>
              {authors.map((author) => <option key={author} value={author}>{author}</option>)}
            </select>
          </label>

          <label>
            Category
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="ALL">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>

          <label>
            Content type
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              {contentTypes.map((type) => (
                <option key={type} value={type}>{type === "ALL" ? "All types" : type}</option>
              ))}
            </select>
          </label>

          <button className="secondary-button" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </section>

        <div className="explore-results-heading">
          <h2>Results</h2>
          <span>{filteredContent.length} items</span>
        </div>

        {loading ? <p className="empty-state">Loading content...</p> : null}
        {!loading && filteredContent.length === 0 ? (
          <p className="empty-state">No content matched your filters.</p>
        ) : null}

        <section className="explore-results">
          {filteredContent.map((item) => (
            <Link
              className="explore-content-link"
              key={item.id}
              state={{ backLabel: "Back to Explore", backTo: "/explore" }}
              to={`/content/${item.id}`}
            >
              <article className="explore-content-item">
                <div className="admin-content-meta">
                  <span className={`type-badge ${item.contentType.toLowerCase()}`}>
                    {item.contentType}
                  </span>
                  <span className="category-badge">{item.category || "General"}</span>
                  <span className="author-badge">{item.author || "Unknown author"}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.source ? <p className="explore-source">Source: {item.source}</p> : null}
              </article>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}

export default ExplorePage;
