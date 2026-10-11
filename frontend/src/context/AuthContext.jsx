import { useState, useEffect, useRef } from "react";
import { refresh } from "../api/auth";
import { decodeJwt } from "../lib/jwt";
import { login as loginRequest, logout as logoutRequest } from "../api/auth";
import { getMe } from "../api/users";
import { AuthContext } from "./AuthContextValue";
import { ApiError } from "../api/client";

const REFRESH_TOKEN_KEY = "refreshToken";
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [status, setStatus] = useState("loading");
  const hasCheckedSession = useRef(false);

  /**
   * Fetches the current user's profile (name, mobile number) and stores it.
   * Fire-and-forget by design: called without awaiting so a slow/failed
   * profile fetch never blocks login or session-restore, which only need
   * the JWT-derived role/email to proceed.
   * @param {string} token
   */
  async function loadProfile(token) {
    try {
      const profile = await getMe(token);
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setMobileNumber(profile.mobileNumber);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }
  useEffect(() => {
    async function restoreSession() {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await refresh(refreshToken);
        const payload = decodeJwt(newAccessToken);
        if (!payload) {
          console.error("Received malformed access token from backend");
          setStatus("unauthenticated");
          return;
        }
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        setAccessToken(newAccessToken);
        setRole(payload.role);
        setUserId(payload.sub);
        setEmail(payload.email);
        setStatus("authenticated");
        loadProfile(newAccessToken);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
          console.error("Error refreshing token:", error);
        }
        setStatus("unauthenticated");
        return;
      }
    }
    if (!hasCheckedSession.current) {
      hasCheckedSession.current = true;
      restoreSession();
    }
  }, []);

  async function login(email, password) {
    const { accessToken, refreshToken } = await loginRequest({
      email,
      password,
    });
    const payload = decodeJwt(accessToken);
    if (!payload) {
      throw new Error("Received malformed access token from backend");
    }
    setAccessToken(accessToken);
    setRole(payload.role);
    setUserId(payload.sub);
    setEmail(payload.email);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setStatus("authenticated");
    loadProfile(accessToken);
    return { role: payload.role, userId: payload.sub };
  }

  /**
   * Revokes the refresh token on the backend, then clears local session
   * state. The revoke call is fire-and-forget: a network failure must never
   * leave the user stuck "logged in" on this device.
   */
  function logout() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      logoutRequest(refreshToken).catch((error) => {
        console.error("Error revoking refresh token:", error);
      });
    }
    setAccessToken(null);
    setRole(null);
    setUserId(null);
    setEmail(null);
    setFirstName(null);
    setLastName(null);
    setMobileNumber(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setStatus("unauthenticated");
  }

  const value = {
    accessToken,
    role,
    userId,
    email,
    firstName,
    lastName,
    mobileNumber,
    status,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
