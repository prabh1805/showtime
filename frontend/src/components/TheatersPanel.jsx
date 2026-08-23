import { useEffect, useState } from "react";
import FormField from "./FormField";
import CitySelect from "./CitySelect";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { filterTheaters } from "../api/admin";
import { ApiError } from "../api/client";
import { formatEnumLabel } from "../lib/format";
import { useAuth } from "../context/useAuth";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
  { field: "name", label: "Theater" },
  { field: "city", label: "City" },
  { field: "owner.firstName", label: "Owner" },
  { field: "status", label: "Status" },
  { field: "createdAt", label: "Created" },
];

const STATUS_STYLES = {
  OPERATIONAL: "border-marquee/30 bg-marquee/10 text-marquee",
  UNDER_CONSTRUCTION: "border-blue-200 bg-blue-50 text-blue-700",
  TEMPORARILY_CLOSED: "border-amber-200 bg-amber-50 text-amber-700",
  PERMANENTLY_CLOSED: "border-red-200 bg-red-50 text-red-700",
};

const EMPTY_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  first: true,
  last: true,
};

/** ISO instant -> "23 Aug 2026" */
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Admin's paginated/filterable/sortable theater listing —
 * GET /api/v1/admin/theaters. Self-contained: owns its own filter, sort,
 * and page state and re-fetches whenever any of them change. Filter text
 * inputs are debounced so typing doesn't fire a request per keystroke.
 *
 * @param {{ refreshKey?: number }} props
 */
export default function TheatersPanel({ refreshKey = 0 }) {
  const { accessToken } = useAuth();
  const [filters, setFilters] = useState({
    theaterName: "",
    ownerName: "",
    city: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState({ field: "createdAt", direction: "desc" });
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(0);
    }, 350);
    return () => clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await filterTheaters(
          {
            ...debouncedFilters,
            page,
            size: pageSize,
            sort: `${sort.field},${sort.direction}`,
          },
          accessToken,
        );
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load theaters. Please try again.",
          );
          setData(EMPTY_PAGE);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, page, pageSize, sort, accessToken, refreshKey]);

  function updateFilter(field) {
    return (value) => setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
    setPage(0);
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(0);
  }

  return (
    <section className="w-full max-w-5xl rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
            Theaters
          </h2>
          <p className="mt-1 text-sm text-mist">
            {data.totalElements} theater{data.totalElements === 1 ? "" : "s"}{" "}
            total
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField
          id="filter-theaterName"
          label="Theater name"
          value={filters.theaterName}
          onChange={(e) => updateFilter("theaterName")(e.target.value)}
          placeholder="Search by theater name…"
        />
        <FormField
          id="filter-ownerName"
          label="Owner name"
          value={filters.ownerName}
          onChange={(e) => updateFilter("ownerName")(e.target.value)}
          placeholder="Search by owner name…"
        />
        <CitySelect
          id="filter-city"
          label="City"
          value={filters.city}
          onChange={updateFilter("city")}
          placeholder="All cities"
        />
      </div>

      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-md border border-hairline">
        <table className="w-full min-w-180 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-mist">
              {COLUMNS.map((col) => {
                const isActive = sort.field === col.field;
                return (
                  <th key={col.field} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.field)}
                      className={`flex items-center gap-1 transition-colors hover:text-velvet ${
                        isActive ? "text-velvet" : ""
                      }`}
                    >
                      {col.label}
                      <span aria-hidden="true" className="text-[10px]">
                        {isActive ? (sort.direction === "asc" ? "▲" : "▼") : "⇅"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-2">
                  <LoadingBlock label="Loading theaters…" />
                </td>
              </tr>
            ) : data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-mist"
                >
                  No theaters match your filters.
                </td>
              </tr>
            ) : (
              data.content.map((theater) => (
                <tr
                  key={theater.id}
                  className="border-b border-hairline last:border-0 hover:bg-paper/60"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{theater.name}</p>
                    {theater.address && (
                      <p className="text-xs text-mist">{theater.address}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{theater.city}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{theater.ownerName}</p>
                    <p className="text-xs text-mist">{theater.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[theater.status] ??
                        "border-hairline text-mist"
                      }`}
                    >
                      {formatEnumLabel(theater.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {formatDate(theater.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-mist">
            Page {data.totalPages === 0 ? 0 : data.number + 1} of{" "}
            {data.totalPages}
          </p>
          <label className="flex items-center gap-2 text-sm text-mist">
            Rows per page
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
              className="rounded-md border border-hairline bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-velvet-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={data.first || loading}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-velvet hover:text-velvet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={data.last || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-velvet hover:text-velvet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
