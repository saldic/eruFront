function FilterTabs({ options, selectedType, onSelect }) {
  return (
    <div className="filter-tabs">
      {options.map((option) => (
        <button
          className={selectedType === option ? "active" : ""}
          key={option}
          type="button"
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
