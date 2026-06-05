const searchableFields = [
  "title",
  "body",
  "contentType",
  "category",
  "author",
  "source",
];

function filterContent(content, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return content;
  }

  return content.filter((item) => searchableFields.some((field) => (
    String(item?.[field] || "").toLowerCase().includes(normalizedSearch)
  )));
}

export default filterContent;
