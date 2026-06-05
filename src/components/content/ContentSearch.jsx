function ContentSearch({ value, onChange, placeholder = "Search content..." }) {
  return (
    <label className="content-search">
      <span className="filter-label">Search</span>
      <span className="content-search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          aria-label="Search content"
          placeholder={placeholder}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

export default ContentSearch;
