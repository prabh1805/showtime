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
  const [_header, payload, _signature] = token.split(".");

  const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");

  const rem = base64.length % 4;
  let padded = base64;
  if (rem > 0) {
    padded += "=".repeat(4 - rem);
  }
  try {
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
