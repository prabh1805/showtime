/**
 * Decodes a JWT's payload without verifying its signature. Signature
 * verification is the backend's job — this only reads claims client-side
 * so the UI knows which role/user it's dealing with.
 *
 * @param {string} token - raw "header.payload.signature" JWT string.
 * @returns {{ sub: string, role: string, [claim: string]: any } | null}
 *   the decoded payload object, or null if the token is malformed.
 */
export function decodeJwt(token) {
  // TODO: split token on ".", base64url-decode the payload segment
  // (replace "-"->"+", "_"->"/", pad with "="), atob() + JSON.parse().
  // Wrap in try/catch and return null on any failure.
}
