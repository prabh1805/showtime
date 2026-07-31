import { createContext, useContext, useEffect, useRef, useState } from "react";
import { decodeJwt } from "../lib/jwt";
import { login as loginRequest, refresh as refreshRequest } from "../api/auth";

const REFRESH_TOKEN_KEY = "showtime_refresh_token";

const AuthContext = createContext(null);

/**
 * Provides auth state to the whole app: the in-memory access token, the
 * decoded role/userId, and a status flag so route guards can distinguish
 * "haven't checked for a session yet" from "checked, there isn't one".
 *
 * On mount, silently re-authenticates using the refresh token in
 * localStorage (if any) by calling POST /api/v1/users/refresh — this is
 * what keeps a user logged in across a page reload, since the access token
 * itself is never persisted.
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  // Guards against React StrictMode's dev-mode double-invoke firing two
  // concurrent /refresh calls on the same stored token.
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    // TODO:
    // 1. Read the refresh token from localStorage (REFRESH_TOKEN_KEY).
    // 2. If there isn't one, setStatus("unauthenticated") and return.
    // 3. Otherwise call refreshRequest(refreshToken). On success: decode
    //    the new accessToken via decodeJwt, store the new refreshToken in
    //    localStorage (rotation), and set accessToken/role/userId + status
    //    "authenticated".
    // 4. On failure: remove the stored refresh token (it's invalid), and
    //    setStatus("unauthenticated") either way.
  }, []);

  /**
   * Logs a user in: calls the login API, decodes the returned access token
   * for role/userId, persists the refresh token, and updates auth state.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ role: string, userId: string }>} so the caller can
   *   navigate to the right dashboard without a second read of context state.
   * @throws {import("../api/client").ApiError} propagated for the Login page to render.
   */
  async function login(email, password) {
    const { accessToken, refreshToken } = await loginRequest({
      email,
      password,
    });
    const decoded = decodeJwt(accessToken);
    if (!decoded) {
      throw new Error("Failed to decode access token");
    }
    const { sub, role } = decoded;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setAccessToken(accessToken);
    setRole(role);
    setUserId(sub);
    setStatus("authenticated");
    return { role, userId: sub };
  }

  /**
   * Logs the user out: clears in-memory state and the stored refresh
   * token. No backend call — there's no logout/blacklist endpoint.
   */
  function logout() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setRole(null);
    setUserId(null);
    setStatus("unauthenticated");
  }

  const value = { accessToken, role, userId, status, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Reads the current auth state/actions. Must be called from within an
 * AuthProvider.
 *
 * @returns {{ accessToken: string|null, role: string|null, userId: string|null, status: "loading"|"authenticated"|"unauthenticated", login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
