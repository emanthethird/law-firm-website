// get-case.js — Auth-gated. Returns a single E-2 intake case (intake + analysis +
// rendered analysis HTML for the email-style detail view).

const { checkAuth } = require("./internal-auth");
const { renderAnalysisHTML } = require("./intake-scoring");
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

  const id = (event.queryStringParameters && event.queryStringParameters.id) || "";
  if (!id || !/^case_[A-Za-z0-9_-]+$/.test(id)) {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Missing or invalid id." }) };
  }

  try {
    const store = getStore("e2-cases");
    const data = await store.get(id, { type: "json" });
    if (!data) {
      return { statusCode: 404, headers: baseHeaders, body: JSON.stringify({ error: "Case not found." }) };
    }

    let analysisHtml = "";
    if (data.analysis) {
      try { analysisHtml = renderAnalysisHTML(data.analysis); } catch (err) { console.error("render failed:", err); }
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ case: data, analysisHtml }),
    };
  } catch (err) {
    console.error("get-case failed:", err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ error: "Failed to load case." }),
    };
  }
};
