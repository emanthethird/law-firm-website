// submit-intake.js — Netlify serverless function for E-2 intake form submissions

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function nl2br(str) {
  return sanitize(str).replace(/\n/g, "<br>");
}

function bulletList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "<em>None selected</em>";
  return "<ul>" + arr.map((item) => `<li>${sanitize(item)}</li>`).join("") + "</ul>";
}

const REQUIRED_FIELDS = [
  "legal_name",
  "has_spouse",
  "has_children",
  "relocation_target",
  "capital_range",
  "source_breakdown",
  "documentation_available",
  "external_capital",
  "business_target_status",
  "business_revenue",
  "business_net_income",
  "business_employees",
  "relevant_experience",
  "prior_immigration_issues",
  "criminal_history",
  "prior_us_visa",
  "additional_disclosures",
  "affirmation_confirmed",
];

const CONDITIONALLY_REQUIRED = {
  target_business_details: (data) =>
    data.business_target_status ===
      "Specific business identified, in negotiations or LOI signed" ||
    data.business_target_status ===
      "Specific business identified, no formal discussions yet",
  number_of_children: (data) => data.has_children === "Yes",
};

function validate(data) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    const val = data[field];
    if (field === "documentation_available") {
      if (!Array.isArray(val) || val.length === 0) {
        errors.push(`${field} is required (at least one option).`);
      }
    } else if (field === "affirmation_confirmed") {
      if (val !== true && val !== "true") {
        errors.push("You must confirm the affirmation to submit.");
      }
    } else if (!val || (typeof val === "string" && val.trim() === "")) {
      errors.push(`${field} is required.`);
    }
  }

  for (const [field, condFn] of Object.entries(CONDITIONALLY_REQUIRED)) {
    if (condFn(data)) {
      const val = data[field];
      if (!val || (typeof val === "string" && val.trim() === "")) {
        errors.push(`${field} is required based on your selections.`);
      }
    }
  }

  return errors;
}

function buildEmail(data) {
  const now = new Date().toISOString();
  const hasDisqualifierFlag =
    data.prior_immigration_issues !== "No" ||
    data.criminal_history !== "No" ||
    data.prior_us_visa !== "No";
  const hasBudgetFlag = false;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: #1a2638; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
  .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #1a2638; color: #fff; padding: 28px 32px; }
  .header h1 { font-size: 20px; margin: 0 0 4px; font-weight: 600; }
  .header p { font-size: 13px; opacity: 0.7; margin: 0; }
  .body { padding: 28px 32px; }
  .section-title { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b9e85; margin: 28px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #e8e8e8; }
  .section-title:first-child { margin-top: 0; }
  .field { margin-bottom: 14px; }
  .field-label { font-size: 12px; font-weight: 600; color: #8a939c; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
  .field-value { font-size: 14px; color: #1a2638; }
  .flag { background: #fff3cd; border-left: 4px solid #e6a817; padding: 10px 14px; margin: 14px 0; font-size: 13px; font-weight: 600; color: #856404; }
  ul { margin: 4px 0; padding-left: 20px; }
  li { font-size: 14px; margin-bottom: 2px; }
  .footer { padding: 18px 32px; background: #faf8f5; font-size: 12px; color: #8a939c; border-top: 1px solid #e8e8e8; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>E-2 Strategy Call Intake</h1>
    <p>Submitted: ${now}</p>
  </div>
  <div class="body">

    <div class="section-title">Section 1: Basics</div>
    <div class="field"><div class="field-label">Legal Name</div><div class="field-value">${sanitize(data.legal_name)}</div></div>
    <div class="field"><div class="field-label">Spouse</div><div class="field-value">${sanitize(data.has_spouse)}</div></div>
    <div class="field"><div class="field-label">Dependent Children</div><div class="field-value">${data.has_children === "Yes" ? "Yes (" + sanitize(data.number_of_children || "not specified") + ")" : "No"}</div></div>
    <div class="field"><div class="field-label">Relocation Target</div><div class="field-value">${sanitize(data.relocation_target)}</div></div>

    <div class="section-title">Section 2: Capital &amp; Source of Funds</div>
    <div class="field"><div class="field-label">Capital Range</div><div class="field-value">${sanitize(data.capital_range)}</div></div>
    <div class="field"><div class="field-label">Source Breakdown</div><div class="field-value">${nl2br(data.source_breakdown)}</div></div>
    <div class="field"><div class="field-label">Documentation Available</div><div class="field-value">${bulletList(data.documentation_available)}</div></div>
    <div class="field"><div class="field-label">External Capital</div><div class="field-value">${nl2br(data.external_capital)}</div></div>

    <div class="section-title">Section 3: Business Target</div>
    <div class="field"><div class="field-label">Target Status</div><div class="field-value">${sanitize(data.business_target_status)}</div></div>
    <div class="field"><div class="field-label">Target Business Details</div><div class="field-value">${data.target_business_details ? nl2br(data.target_business_details) : "<em>N/A</em>"}</div></div>
    <div class="field"><div class="field-label">Annual Revenue</div><div class="field-value">${sanitize(data.business_revenue)}</div></div>
    <div class="field"><div class="field-label">Net Income</div><div class="field-value">${sanitize(data.business_net_income)}</div></div>
    <div class="field"><div class="field-label">Employees</div><div class="field-value">${sanitize(data.business_employees)}</div></div>
    <div class="field"><div class="field-label">Relevant Experience</div><div class="field-value">${nl2br(data.relevant_experience)}</div></div>

    <div class="section-title">Section 4: Disqualifier Gates</div>
    <div class="field"><div class="field-label">Prior Immigration Issues</div><div class="field-value">${sanitize(data.prior_immigration_issues)}</div></div>
    <div class="field"><div class="field-label">Criminal History</div><div class="field-value">${sanitize(data.criminal_history)}</div></div>
    <div class="field"><div class="field-label">Prior US Visa</div><div class="field-value">${sanitize(data.prior_us_visa)}</div></div>
    ${hasDisqualifierFlag ? '<div class="flag">&#9888;&#65039; FLAG FOR REVIEW &mdash; One or more disqualifier gate responses require attorney attention.</div>' : ""}

    <div class="section-title">Section 5: Additional Information</div>
    <div class="field"><div class="field-label">Additional Disclosures</div><div class="field-value">${nl2br(data.additional_disclosures)}</div></div>

    <div class="section-title">Affirmation</div>
    <div class="field"><div class="field-value">Confirmed: Yes (${now})</div></div>
  </div>
  <div class="footer">
    EMAN &amp; Associates P.C. &mdash; Confidential Intake Submission
  </div>
</div>
</body>
</html>`;

  return html;
}

exports.handler = async function (event) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  const errors = validate(data);
  if (errors.length > 0) {
    return {
      statusCode: 422,
      headers,
      body: JSON.stringify({ error: "Validation failed.", details: errors }),
    };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || "e@emanlegal.com";
  const SENDER_EMAIL = process.env.SENDER_EMAIL || "intake@emanlegal.com";

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured.");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Server configuration error. Please try again later.",
      }),
    };
  }

  const emailHtml = buildEmail(data);
  const subject = `E-2 Intake: ${sanitize(data.legal_name)} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [RECIPIENT_EMAIL],
        subject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend API error:", res.status, errBody);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error:
            "Failed to send email. Your data has not been lost — please try again.",
        }),
      };
    }

    const result = await res.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Intake submitted successfully.",
        id: result.id,
      }),
    };
  } catch (err) {
    console.error("Network error sending email:", err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error:
          "Failed to send email. Your data has not been lost — please try again.",
      }),
    };
  }
};
