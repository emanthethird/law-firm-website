// delete-case.js — Auth-gated. Hard-deletes a case from the e2-cases blob store.
// Body: { id: "case_..." }
// Prefer archiving (update-case with { archived: true }) over deletion.

const { checkAuth } = require("./internal-auth");
const { getStore } = require("@netlify/blobs");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const auth = checkAuth(event);
  if (!auth.ok) {
    return { statusCode: auth.status, headers: baseHeaders, body: JSON.stringify({ error: auth.error }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Invalid JSON body." }) }; }

  const id = body.id;
  if (!id || !/^case_[A-Za-z0-9_-]+$/.test(id)) {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Missing or invalid id." }) };
  }

  try {
    const store = getStore("e2-cases");
    const existing = await store.get(id, { type: "json" });
    if (!existing) {
      return { statusCode: 404, headers: baseHeaders, body: JSON.stringify({ error: "Case not found." }) };
    }
    await store.delete(id);
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("delete-case failed:", err);
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: "Failed to delete case." }) };
  }
};
