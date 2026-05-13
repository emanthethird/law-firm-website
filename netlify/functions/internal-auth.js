// internal-auth.js — bearer-token check shared by internal functions.
// Reads INTERNAL_VIEWER_TOKEN from env. Constant-time comparison.

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function checkAuth(event) {
  const expected = process.env.INTERNAL_VIEWER_TOKEN;
  if (!expected) {
    return { ok: false, status: 500, error: "INTERNAL_VIEWER_TOKEN not configured on server." };
  }
  const header = (event.headers && (event.headers.authorization || event.headers.Authorization)) || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1].trim() : "";
  if (!token) {
    return { ok: false, status: 401, error: "Missing bearer token." };
  }
  if (!safeEqual(token, expected)) {
    return { ok: false, status: 401, error: "Invalid token." };
  }
  return { ok: true };
}

module.exports = { checkAuth };
