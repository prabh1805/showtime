import { useEffect, useId, useState } from "react";
import { INDIAN_CITIES } from "../lib/indianCities";

/**
 * Searchable dropdown for picking a city from INDIAN_CITIES — replaces a
 * free-text input so the value sent to the backend is always one of the
 * fixed list, never arbitrary typed text. Only an explicit pick (click,
 * Enter on a highlighted/exact-matching option) commits `value`; anything
 * else is discarded on blur/escape so the field can't be left in a
 * half-typed, unselected state.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value - the committed city name, or "".
 * @param {(city: string) => void} props.onChange - fires with the picked city, or "" when cleared.
 * @param {() => void} [props.onBlur]
 * @param {string} [props.error] - validation message; renders nothing if absent.
 * @param {string} [props.placeholder="Search for a city…"] - e.g. "All cities" when used as a filter.
 */
export default function CitySelect({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Search for a city…",
}) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listboxId = useId();

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? INDIAN_CITIES.filter((city) => city.toLowerCase().includes(trimmed)).slice(0, 8)
    : INDIAN_CITIES.slice(0, 8);

  function selectCity(city) {
    onChange(city);
    setQuery(city);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleInputChange(e) {
    const next = e.target.value;
    setQuery(next);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (next.trim() === "") {
      onChange("");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (!isOpen) return;
      e.preventDefault();
      const exactMatch = filtered.find((c) => c.toLowerCase() === trimmed);
      const pick = highlightedIndex >= 0 ? filtered[highlightedIndex] : exactMatch;
      if (pick) selectCity(pick);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery(value || "");
    }
  }

  function handleBlur() {
    setIsOpen(false);
    setQuery(value || "");
    onBlur?.();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-ink sm:text-lg">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full rounded-md border bg-surface px-4 py-3 text-base text-ink placeholder:text-mist focus:outline-none focus:ring-1 sm:text-lg ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-hairline focus:border-velvet focus:ring-velvet"
          }`}
        />
        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-hairline bg-surface shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-base text-mist sm:text-lg">
                No matching cities.
              </li>
            ) : (
              filtered.map((city, index) => (
                <li
                  key={city}
                  role="option"
                  aria-selected={city === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectCity(city)}
                  className={`cursor-pointer px-4 py-2.5 text-base sm:text-lg ${
                    index === highlightedIndex
                      ? "bg-velvet text-paper"
                      : "text-ink hover:bg-paper"
                  }`}
                >
                  {city}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 sm:text-base">
          {error}
        </p>
      )}
    </div>
  );
}
