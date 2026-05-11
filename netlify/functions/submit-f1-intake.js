// submit-f1-intake.js — Netlify serverless function for F-1 intake form submissions

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
  "citizenship",
  "country_of_residence",
  "current_status",
  "status_expiry",
  "time_in_country",
  "age",
  "highest_education",
  "us_school",
  "i20_issued",
  "degree_level",
  "program_start",
  "annual_cost",
  "funding_source",
  "total_funds",
  "funds_location",
  "documentation_available",
  "prior_visa_refusal",
  "prior_overstay",
  "criminal_history",
  "prior_immigrant_petition",
  "pending_petition",
  "intent_to_remain",
  "family_location",
  "post_study_plans",
  "career_path",
  "affirmation_confirmed",
];

const CONDITIONALLY_REQUIRED = {
  sponsor_occupation: (data) =>
    data.funding_source === "Parents" || data.funding_source === "Other sponsor",
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
  const hasFlag =
    data.prior_visa_refusal !== "No" ||
    data.prior_overstay !== "No" ||
    data.criminal_history !== "No" ||
    data.prior_immigrant_petition !== "No" ||
    data.pending_petition !== "No" ||
    data.intent_to_remain === "Yes";

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
    <h1>F-1 Strategy Call Intake</h1>
    <p>Submitted: ${now}</p>
  </div>
  <div class="body">

    <div class="section-title">Section 1: Basics</div>
    <div class="field"><div class="field-label">Legal Name</div><div class="field-value">${sanitize(data.legal_name)}</div></div>
    <div class="field"><div class="field-label">Citizenship</div><div class="field-value">${sanitize(data.citizenship)}</div></div>
    <div class="field"><div class="field-label">Currently Residing In</div><div class="field-value">${sanitize(data.country_of_residence)}</div></div>
    <div class="field"><div class="field-label">Current Immigration Status</div><div class="field-value">${sanitize(data.current_status)}</div></div>
    <div class="field"><div class="field-label">Status Expiry</div><div class="field-value">${sanitize(data.status_expiry)}</div></div>
    <div class="field"><div class="field-label">Time in Country</div><div class="field-value">${sanitize(data.time_in_country)}</div></div>
    <div class="field"><div class="field-label">Age</div><div class="field-value">${sanitize(String(data.age))}</div></div>
    <div class="field"><div class="field-label">Highest Education</div><div class="field-value">${sanitize(data.highest_education)}</div></div>

    <div class="section-title">Section 2: The Program</div>
    <div class="field"><div class="field-label">U.S. School</div><div class="field-value">${sanitize(data.us_school)}</div></div>
    <div class="field"><div class="field-label">I-20 Issued</div><div class="field-value">${sanitize(data.i20_issued)}</div></div>
    <div class="field"><div class="field-label">Degree Level + Major</div><div class="field-value">${sanitize(data.degree_level)}</div></div>
    <div class="field"><div class="field-label">Program Start Date</div><div class="field-value">${sanitize(data.program_start)}</div></div>
    <div class="field"><div class="field-label">Annual Cost</div><div class="field-value">${sanitize(data.annual_cost)}</div></div>

    <div class="section-title">Section 3: Funding</div>
    <div class="field"><div class="field-label">Funding Source</div><div class="field-value">${sanitize(data.funding_source)}</div></div>
    <div class="field"><div class="field-label">Total Funds (First Year)</div><div class="field-value">${sanitize(data.total_funds)}</div></div>
    <div class="field"><div class="field-label">Funds Location / Currency</div><div class="field-value">${sanitize(data.funds_location)}</div></div>
    <div class="field"><div class="field-label">Sponsor Occupation &amp; Income</div><div class="field-value">${data.sponsor_occupation ? sanitize(data.sponsor_occupation) : "<em>N/A</em>"}</div></div>
    <div class="field"><div class="field-label">Documentation Available</div><div class="field-value">${bulletList(data.documentation_available)}</div></div>

    <div class="section-title">Section 4: Qualification Gates</div>
    <div class="field"><div class="field-label">Prior U.S. Visa Refusal</div><div class="field-value">${sanitize(data.prior_visa_refusal)}</div></div>
    <div class="field"><div class="field-label">Prior U.S. Overstay / Status Violation</div><div class="field-value">${sanitize(data.prior_overstay)}</div></div>
    <div class="field"><div class="field-label">Criminal History</div><div class="field-value">${sanitize(data.criminal_history)}</div></div>
    <div class="field"><div class="field-label">Prior Immigrant Petition Filed</div><div class="field-value">${sanitize(data.prior_immigrant_petition)}</div></div>
    <div class="field"><div class="field-label">Pending Family/Employment Petition</div><div class="field-value">${sanitize(data.pending_petition)}</div></div>
    <div class="field"><div class="field-label">Intent to Remain After Studies</div><div class="field-value">${sanitize(data.intent_to_remain)}</div></div>
    ${hasFlag ? '<div class="flag">&#9888;&#65039; FLAG FOR REVIEW &mdash; One or more qualification gate responses require attorney attention.</div>' : ""}

    <div class="section-title">Section 5: Ties Snapshot</div>
    <div class="field"><div class="field-label">Immediate Family Location</div><div class="field-value">${sanitize(data.family_location)}</div></div>
    <div class="field"><div class="field-label">Property Owned</div><div class="field-value">${data.property_owned ? sanitize(data.property_owned) : "<em>Not provided</em>"}</div></div>
    <div class="field"><div class="field-label">Current Employment</div><div class="field-value">${data.current_employment ? sanitize(data.current_employment) : "<em>Not provided</em>"}</div></div>
    <div class="field"><div class="field-label">Post-Study Plans (Where)</div><div class="field-value">${sanitize(data.post_study_plans)}</div></div>
    <div class="field"><div class="field-label">Career Path After Studies</div><div class="field-value">${nl2br(data.career_path)}</div></div>

    <div class="section-title">Additional Information</div>
    <div class="field"><div class="field-value">${data.additional_info ? nl2br(data.additional_info) : "<em>None</em>"}</div></div>

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
  const subject = `F-1 Intake: ${sanitize(data.legal_name)} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

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
            "Failed to send email. Your data has not been lost. Please try again.",
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
          "Failed to send email. Your data has not been lost. Please try again.",
      }),
    };
  }
};
