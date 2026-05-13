// export-cases.js — Auth-gated. Returns all cases as a CSV download.
// GET /.netlify/functions/export-cases  → text/csv

const { checkAuth } = require("./internal-auth");
const { getStore } = require("@netlify/blobs");

function csvField(v) {
  if (v === null || v === undefined) return "";
  let s;
  if (Array.isArray(v)) s = v.join("; ");
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  if (/[",\n\r]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const COLUMNS = [
  { key: "id",                label: "Case ID" },
  { key: "submittedAt",       label: "Submitted At" },
  { key: "legalName",         label: "Legal Name" },
  { key: "relocationTarget",  label: "Relocation Target" },
  { key: "capitalRange",      label: "Capital Range" },
  { key: "dispositionLevel",  label: "Disposition" },
  { key: "countGreen",        label: "PASS" },
  { key: "countYellow",       label: "WATCH" },
  { key: "countRed",          label: "BLOCK" },
  { key: "archived",          label: "Archived" },
  { key: "businessTargetStatus", label: "Business Target Status" },
  { key: "targetBusinessDetails", label: "Target Business Details" },
  { key: "businessRevenue",   label: "Annual Revenue" },
  { key: "businessNetIncome", label: "Net Income" },
  { key: "businessEmployees", label: "Employees" },
  { key: "relevantExperience", label: "Relevant Experience" },
  { key: "sourceBreakdown",   label: "Source Breakdown" },
  { key: "documentation",     label: "Documentation Available" },
  { key: "externalCapital",   label: "External Capital" },
  { key: "priorImmigration",  label: "Prior Immigration Issues" },
  { key: "criminalHistory",   label: "Criminal History" },
  { key: "priorUsVisa",       label: "Prior US Visa" },
  { key: "additionalDisclosures", label: "Additional Disclosures" },
  { key: "notes",             label: "Attorney Notes" },
];

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const auth = checkAuth(event);
  if (!auth.ok) {
    return {
      statusCode: auth.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: auth.error }),
    };
  }

  try {
    const store = getStore("e2-cases");
    const { blobs } = await store.list();
    const rows = [];
    for (const b of blobs) {
      try {
        const c = await store.get(b.key, { type: "json" });
        if (!c) continue;
        const intake = c.intake || {};
        const counts = c.counts || {};
        rows.push({
          id: c.id || b.key,
          submittedAt: c.submittedAt || "",
          legalName: c.legalName || "",
          relocationTarget: c.relocationTarget || "",
          capitalRange: c.capitalRange || "",
          dispositionLevel: c.dispositionLevel || "",
          countGreen: counts.green || 0,
          countYellow: counts.yellow || 0,
          countRed: counts.red || 0,
          archived: c.archived ? "yes" : "no",
          businessTargetStatus: intake.business_target_status || "",
          targetBusinessDetails: intake.target_business_details || "",
          businessRevenue: intake.business_revenue || "",
          businessNetIncome: intake.business_net_income || "",
          businessEmployees: intake.business_employees || "",
          relevantExperience: intake.relevant_experience || "",
          sourceBreakdown: intake.source_breakdown || "",
          documentation: intake.documentation_available || [],
          externalCapital: intake.external_capital || "",
          priorImmigration: intake.prior_immigration_issues || "",
          criminalHistory: intake.criminal_history || "",
          priorUsVisa: intake.prior_us_visa || "",
          additionalDisclosures: intake.additional_disclosures || "",
          notes: c.notes || "",
        });
      } catch (err) {
        console.error("export read failed", b.key, err);
      }
    }

    rows.sort((a, b) => Date.parse(b.submittedAt || 0) - Date.parse(a.submittedAt || 0));

    const lines = [];
    lines.push(COLUMNS.map(c => csvField(c.label)).join(","));
    for (const r of rows) {
      lines.push(COLUMNS.map(c => csvField(r[c.key])).join(","));
    }
    const csv = lines.join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="e2-cases-${stamp}.csv"`,
        "Access-Control-Allow-Origin": "*",
      },
      body: csv,
    };
  } catch (err) {
    console.error("export-cases failed:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to export cases." }),
    };
  }
};
