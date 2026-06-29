interface SortOption {
  value: string;
  label: string;
}

interface TableQueryControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  size: number;
  onSizeChange: (value: number) => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
}

export function TableQueryControls({
  search,
  onSearchChange,
  sort,
  onSortChange,
  size,
  onSizeChange,
  sortOptions,
  searchPlaceholder = "Search",
}: TableQueryControlsProps) {
  return (
    <div className="table-controls-row">
      <input
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        value={search}
      />
      <select onChange={(event) => onSortChange(event.target.value)} value={sort}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select onChange={(event) => onSizeChange(Number(event.target.value))} value={size}>
        <option value={10}>10 / page</option>
        <option value={20}>20 / page</option>
        <option value={50}>50 / page</option>
        <option value={100}>100 / page</option>
      </select>
    </div>
  );
}
