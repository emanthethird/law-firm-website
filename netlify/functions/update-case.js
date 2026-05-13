// update-case.js — Auth-gated. Patches a single case in the e2-cases blob store.
// Allows updating: notes (string), archived (boolean).
// Body: { id: "case_...", notes?: string, archived?: boolean }

const { checkAuth } = require("./internal-auth");
const { getStore } = require("@netlify/blobs");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const MAX_NOTES_LEN = 20000;

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

    const updated = Object.assign({}, existing);

    if (Object.prototype.hasOwnProperty.call(body, "notes")) {
      if (typeof body.notes !== "string") {
        return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "notes must be a string." }) };
      }
      updated.notes = body.notes.slice(0, MAX_NOTES_LEN);
    }
    if (Object.prototype.hasOwnProperty.call(body, "archived")) {
      updated.archived = !!body.archived;
    }

    updated.updatedAt = new Date().toISOString();

    await store.setJSON(id, updated);

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ success: true, case: { id: updated.id, notes: updated.notes, archived: updated.archived, updatedAt: updated.updatedAt } }),
    };
  } catch (err) {
    console.error("update-case failed:", err);
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: "Failed to update case." }) };
  }
};
