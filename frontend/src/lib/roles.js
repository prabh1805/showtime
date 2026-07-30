/** Maps each backend Role to the path its dashboard lives at. */
export const ROLE_HOME_PATHS = {
  ADMIN: "/admin",
  OWNER: "/owner",
  STAFF: "/staff",
  CUSTOMER: "/customer",
};

/**
 * Resolves the landing path for a given role.
 *
 * @param {string} role - one of ROLE_HOME_PATHS' keys (e.g. "CUSTOMER").
 * @returns {string} the role's dashboard path, or "/" if the role is
 *   unrecognized.
 */
export function roleHomePath(role) {
  // TODO: look up `role` in ROLE_HOME_PATHS, fall back to "/".
}
