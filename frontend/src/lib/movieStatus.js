/** Tailwind classes for the status pill, keyed by backend MovieStatus. */
export const MOVIE_STATUS_STYLES = {
  SCHEDULABLE: "border-marquee/30 bg-marquee/10 text-marquee",
  UPCOMING: "border-blue-200 bg-blue-50 text-blue-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

/** Fallback pill classes for an unknown/missing status. */
export const MOVIE_STATUS_FALLBACK = "border-hairline text-mist";
