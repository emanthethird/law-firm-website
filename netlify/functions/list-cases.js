// list-cases.js — Auth-gated. Returns a summary list of E-2 intake cases
// from the e2-cases blob store, most recent first.

const { checkAuth } = require("./internal-auth");
const { getStore } = require("@netlify/blobs");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const auth = checkAuth(event);
  if (!auth.ok) {
    return { statusCode: auth.status, headers: baseHeaders, body: JSON.stringify({ error: auth.error }) };
  }

  // ?archived=true  → only archived
  // ?archived=all   → both
  // (default)       → only non-archived
  const archivedParam = (event.queryStringParameters && event.queryStringParameters.archived) || "false";

  try {
    const store = getStore("e2-cases");
    const { blobs } = await store.list();

    // Fetch each blob to extract summary fields. Sequential is fine for low volume.
    const cases = [];
    for (const b of blobs) {
      try {
        const data = await store.get(b.key, { type: "json" });
        if (!data) continue;
        const isArchived = !!data.archived;
        if (archivedParam === "true" && !isArchived) continue;
        if (archivedParam === "false" && isArchived) continue;
        // "all" → include everything
        cases.push({
          id: data.id || b.key,
          submittedAt: data.submittedAt,
          legalName: data.legalName || "",
          relocationTarget: data.relocationTarget || "",
          capitalRange: data.capitalRange || "",
          dispositionLevel: data.dispositionLevel || null,
          dispositionLabel: data.dispositionLabel || null,
          counts: data.counts || null,
          archived: isArchived,
          hasNotes: !!(data.notes && data.notes.trim()),
        });
      } catch (err) {
        console.error("Failed to read blob", b.key, err);
      }
    }

    cases.sort((a, b) => {
      const ta = a.submittedAt ? Date.parse(a.submittedAt) : 0;
      const tb = b.submittedAt ? Date.parse(b.submittedAt) : 0;
      return tb - ta;
    });

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ cases }),
    };
  } catch (err) {
    console.error("list-cases failed:", err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ error: "Failed to list cases." }),
    };
  }
};
