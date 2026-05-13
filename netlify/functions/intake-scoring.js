// intake-scoring.js — maps E-2 intake form data to the 10-element approvability rubric.
//
// Pure function: scoreIntake(data) -> { disposition, counts, elements, actions, flags }
// Used by submit-intake.js to compute analysis server-side and embed in the attorney email.
// Mirrors the logic of e2-rubric.html (the internal scoring tool). Keep in sync.

function lower(s) { return (typeof s === "string" ? s : "").toLowerCase(); }
function hasAny(haystack, needles) {
  const h = lower(haystack);
  return needles.some(n => h.includes(n));
}
function numericish(s) {
  if (typeof s !== "string") return null;
  const stripped = s.replace(/[^0-9.]/g, "");
  if (!stripped) return null;
  const n = parseFloat(stripped);
  return isNaN(n) ? null : n;
}

// Risk-keyword maps tuned for free-text intake fields.
const LICENSED_PROFESSION_TERMS = [
  "appraisal", "appraiser", "real estate sales", "real estate agent", "realtor",
  "broker", "brokerage", "salon", "barber", "cosmetolog", "esthetic",
  "contractor", "construction", "law firm", "legal practice", "attorney",
  "medical", "doctor", "dentist", "pharmac", "nurs", "veterinar",
  "restaurant", "bar", "liquor", "cannabis", "dispensary", "childcare", "daycare"
];

const PASSIVE_RE_TERMS = [
  "passive", "buy and hold", "buy-and-hold", "holding properties",
  "rental income only", "rental property holding",
  "undeveloped land", "land speculation", "stock", "securities portfolio"
];

const ACTIVE_RE_TERMS = [
  "property management", "property mgmt", "managing properties", "manage properties",
  "development", "dev co", "construction", "flip", "renovation", "rehab",
  "short-term rental", "str", "airbnb", "vrbo"
];

const BUSINESS_LOAN_TERMS = [
  "sba loan", "business loan", "secured by the business", "business collateral",
  "loan against the business", "ucc lien"
];

const PERSONAL_SOURCE_TERMS = [
  "savings", "personal funds", "personal account", "inheritance", "gift",
  "home equity", "heloc", "sale of property", "sold property", "401k", "rrsp",
  "tfsa", "ira", "investments", "stocks sold", "personal loan"
];

const IV_INTENT_TERMS = [
  "green card", "permanent residen", "adjust status", "aos",
  "i-140", "i 140", "i-130", "i 130", "eb-5", "eb5",
  "marry", "marriage-based"
];

const LICENSING_DISCLOSURE_TERMS = [
  "license", "licensure", "credential", "certification", "permit",
  "real estate sales", "broker"
];

function elementResult(grade, note) { return { grade: grade, note: note }; }

function scoreIntake(data) {
  const elements = {};
  const actions = [];
  const flags = [];

  const push = (priority, text) => actions.push({ priority: priority, text: text });
  const flag = (text) => flags.push(text);

  // ── Element 1: Nationality ─────────────────────────────────────────────────
  // The intake form is Canada-scoped but does not directly ask citizenship.
  // Default to WATCH with a confirm-on-call note.
  elements[1] = elementResult("yellow", "Form does not capture citizenship/LPR/ownership structure — confirm on call.");
  push(2, "<strong>Confirm nationality basics on the call.</strong> Canadian citizenship (not PR), no U.S. LPR status, ownership structure if a business will be the investing entity (≥50% Canadian traced to individuals). If dual national, choose nationality of record (Ognibene).");

  // ── Element 2: Bona fide enterprise ─────────────────────────────────────────
  (() => {
    const status = data.business_target_status || "";
    const details = data.target_business_details || "";
    const empRaw = data.business_employees || "";
    const emp = numericish(empRaw);

    const licensedProfession = hasAny(details, LICENSED_PROFESSION_TERMS);
    const passiveRE = hasAny(details, PASSIVE_RE_TERMS);
    const activeRE = hasAny(details, ACTIVE_RE_TERMS);
    const licensingDisclosed = hasAny(data.additional_disclosures || "", LICENSING_DISCLOSURE_TERMS);

    if (status === "Still researching what type of business to pursue") {
      elements[2] = elementResult("red", "No business identified — fails 'real and active' from day one.");
      push(1, "<strong>No target business.</strong> Still researching the business type means there is no enterprise to invest in. Identify and commit before any E-2 filing path opens.");
      return;
    }
    if (status === "Industry and location identified, no specific business") {
      elements[2] = elementResult("red", "Industry/location only — no specific business identified.");
      push(1, "<strong>No specific enterprise.</strong> Industry-level interest is not a 'real and active' enterprise. Identify a specific target and move toward commitment.");
      return;
    }
    if (passiveRE && !activeRE) {
      elements[2] = elementResult("red", "Details suggest passive real estate holding (DOS excludes).");
      push(1, "<strong>Passive real estate exclusion (9 FAM 402.9-6(C)).</strong> Reposition as active management/development with operations, hires, and ongoing services — or this is not an E-2 case.");
      return;
    }
    if (licensedProfession || licensingDisclosed) {
      elements[2] = elementResult("yellow", "Licensed-profession business — licensure path must be solved before launch.");
      push(1, "<strong>Licensing structure required.</strong> The business activity requires a state license. Plan: (a) hire licensed employees in seat from day one as 'responsible licensee'; (b) principal pursues own license in parallel; (c) consider corporate licensure for the entity. Without this, the enterprise is not 'real and active' / fails 'meets applicable legal requirements.'");
      return;
    }
    if (status === "Specific business identified, in negotiations or LOI signed") {
      const note = (emp !== null && emp >= 2)
        ? "Identified business with hires reported — operational shape forming."
        : "Identified business; verify operational status (hires, lease, licenses).";
      elements[2] = elementResult("yellow", note);
      return;
    }
    if (status === "Specific business identified, no formal discussions yet") {
      elements[2] = elementResult("yellow", "Identified but no negotiations — operational status unverified.");
      return;
    }
    elements[2] = elementResult("yellow", "Confirm enterprise is real, active, for-profit, properly formed and licensed.");
  })();

  // ── Element 3: Investment (source) ──────────────────────────────────────────
  (() => {
    const source = data.source_breakdown || "";
    const docs = Array.isArray(data.documentation_available) ? data.documentation_available : [];
    const external = data.external_capital || "";

    const businessLoan = hasAny(source, BUSINESS_LOAN_TERMS);
    const personalSource = hasAny(source, PERSONAL_SOURCE_TERMS);
    const mentionsLoan = /\bloan\b/i.test(source) && !businessLoan;
    const onlyNotSure = docs.length === 1 && docs[0] === "I'm not sure what's available";
    const hasDocs = docs.length > 0 && !onlyNotSure;
    const externalSubstantive = external && external.trim() && !/^(n\/?a|none|no|na)$/i.test(external.trim());

    if (businessLoan) {
      elements[3] = elementResult("red", "Source described as loan secured by the business — does not qualify.");
      push(1, "<strong>Business-collateralized debt does not count (9 FAM 402.9-6(B)(c)).</strong> Restructure to personal-collateral or unsecured personal-signature debt, or replace with qualifying personal capital.");
      return;
    }
    if (!source || source.trim().length < 5) {
      elements[3] = elementResult("yellow", "Source description thin — needs source-of-funds memo.");
      push(2, "<strong>Build source-of-funds memo</strong> with origin → accumulation → commitment paper trail (bank, tax, deeds, gift letters, inheritance/probate records).");
      return;
    }
    if (mentionsLoan) {
      elements[3] = elementResult("yellow", "Source mentions a loan — verify it is personal-collateral, not business-secured.");
      push(2, "<strong>Confirm loan collateral on call.</strong> Personal collateral (second mortgage on home, unsecured personal-signature) qualifies. Business-secured does not. Document with promissory note + collateral records.");
    } else if (personalSource) {
      elements[3] = elementResult("green", "Personal funds (savings/inheritance/gift/home equity) — qualifying source.");
    } else {
      elements[3] = elementResult("yellow", "Source narrative present but ambiguous — confirm origin.");
      push(2, "<strong>Clarify source narrative.</strong> Counsel cover letter should attribute every dollar to a qualifying origin (savings, gift with donor source, inheritance, personal-collateral loan).");
    }

    if (!hasDocs) {
      // Override grade if documentation is entirely missing
      elements[3] = elementResult("red", "No source documentation indicated.");
      push(1, "<strong>No source documentation indicated.</strong> Even qualifying sources fail if undocumented. Reconstruct the wire trail with bank statements, tax returns, asset-sale closings, gift/inheritance records before filing.");
    } else if (onlyNotSure) {
      elements[3] = elementResult("yellow", "Prospect unsure what documentation is available.");
      push(2, "<strong>Inventory available documents on call</strong> — bank statements, tax returns, property-sale records, inheritance/gift records. Set a deadline for delivery.");
    }

    if (externalSubstantive) {
      flag("External capital mentioned: \"" + external.trim().slice(0, 200) + "\" — investigate whether partners/co-investors are involved and how that affects ownership/control.");
    }
  })();

  // ── Element 4: Irrevocable commitment ──────────────────────────────────────
  (() => {
    const status = data.business_target_status || "";
    if (status === "Specific business identified, in negotiations or LOI signed") {
      elements[4] = elementResult("yellow", "LOI / in negotiation — not yet binding.");
      push(2, "<strong>Convert LOI to binding</strong>: executed purchase agreement, signed commercial lease, and escrow with conditional release tied to visa issuance (9 FAM 402.9-6(B)(d) endorses escrow).");
      return;
    }
    if (status === "Specific business identified, no formal discussions yet") {
      elements[4] = elementResult("yellow", "Identified but no negotiations — far from commitment.");
      push(2, "<strong>Begin commitment steps</strong>: move to negotiation, LOI, then escrow. \"Identified\" without negotiations is not yet \"in process of investing.\"");
      return;
    }
    if (status === "Industry and location identified, no specific business" || status === "Still researching what type of business to pursue") {
      elements[4] = elementResult("red", "Mere intent / scouting — fails 'in process of investing' test.");
      push(1, "<strong>No commitment.</strong> Identifying a target and moving to escrow are gating steps before E-2 is filable.");
      return;
    }
    elements[4] = elementResult("yellow", "Commitment status unclear — verify on call.");
  })();

  // ── Element 5: Substantial capital (proportionality) ───────────────────────
  (() => {
    const cap = data.capital_range || "";
    if (cap === "$100K-$150K") {
      elements[5] = elementResult("yellow", "$100K–$150K — workable but proportionality must be ~100% of total cost.");
      push(2, "<strong>Document total enterprise cost</strong> via CPA-built startup-cost projection (trade-association statistics, Chamber estimates, vendor quotes). Aim for capital ≈ 100% of total cost in this zone.");
      return;
    }
    if (cap === "$150K-$200K") {
      elements[5] = elementResult("yellow", "$150K–$200K — typical small-business zone; document proportionality.");
      push(3, "<strong>Confirm proportionality</strong> by sizing total enterprise cost. With $150–200K, comfortable for most service, retail, and franchise businesses.");
      return;
    }
    if (cap === "$200K-$300K" || cap === "$300K-$500K" || cap === "$500K+") {
      elements[5] = elementResult("green", "Capital comfortable for substantiality — document proportionality cleanly.");
      return;
    }
    elements[5] = elementResult("yellow", "Capital range not captured.");
  })();

  // ── Element 6: Not marginal ────────────────────────────────────────────────
  (() => {
    const empRaw = data.business_employees || "";
    const rev = data.business_revenue || "";
    const inc = data.business_net_income || "";
    const emp = numericish(empRaw);
    const empUnsure = /not sure|unknown|n\/?a|tbd/i.test(empRaw) || empRaw.trim() === "";
    const revUnsure = /not sure|unknown|n\/?a|tbd/i.test(rev) || rev.trim() === "";
    const incUnsure = /not sure|unknown|n\/?a|tbd/i.test(inc) || inc.trim() === "";

    const noFinancials = revUnsure && incUnsure;
    const solo = (emp !== null && emp <= 1) || empUnsure;

    if (noFinancials && solo) {
      elements[6] = elementResult("red", "No financials + solo/unknown headcount — marginality risk.");
      push(1, "<strong>Marginality structural risk.</strong> No revenue/income figures and ≤1 employee fits the regulation's express exclusion (self-employment vehicle). Build 5-yr pro forma with hires, OR confirm current revenue numbers, before file is buildable.");
      return;
    }
    if (noFinancials) {
      elements[6] = elementResult("yellow", "No revenue/income figures available.");
      push(2, "<strong>Build 5-year pro forma</strong> with revenue, COGS, OpEx, headcount, net income — assumptions footnoted to industry comps. Required to defeat marginality for new businesses.");
      return;
    }
    if (solo) {
      elements[6] = elementResult("yellow", "Solo or unknown headcount — needs hiring narrative.");
      push(2, "<strong>Add U.S. hires</strong> — get at least one non-investor employee on W-2 payroll before filing. Solo operations frequently fail marginality.");
      return;
    }
    if (emp !== null && emp >= 2) {
      elements[6] = elementResult("green", "Multiple employees + financials reported — non-marginal shape.");
      return;
    }
    elements[6] = elementResult("yellow", "Mixed signals — confirm financials and headcount on call.");
  })();

  // ── Element 7: Develop and direct ──────────────────────────────────────────
  // Form does not directly ask. Default to WATCH.
  elements[7] = elementResult("yellow", "Form does not capture ownership %/operational role — confirm on call.");
  push(3, "<strong>Confirm develop-and-direct.</strong> ≥50% ownership or documented managerial control via operating agreement / bylaws / employment agreement vesting hire/fire, capital deployment, banking, contract signature, and strategy.");

  // ── Element 8: Intent to depart ────────────────────────────────────────────
  (() => {
    const disclosures = data.additional_disclosures || "";
    if (hasAny(disclosures, IV_INTENT_TERMS)) {
      elements[8] = elementResult("yellow", "Disclosures mention immigrant intent (green card / I-140 / I-130 / AOS).");
      push(2, "<strong>Pending IV / immigrant intent.</strong> 8 CFR 214.2(e)(5) allows E with pending IV but officer must be satisfied of intent to depart. Frame E as a separate process from any IV in the cover letter; do not over-emphasize permanent-relocation steps.");
      return;
    }
    elements[8] = elementResult("green", "No competing immigrant intent disclosed.");
  })();

  // ── Element 9: Admissibility ───────────────────────────────────────────────
  (() => {
    const immig = data.prior_immigration_issues || "";
    const crim = data.criminal_history || "";
    const visa = data.prior_us_visa || "";
    const issues = [];
    if (immig && immig !== "No") issues.push("prior immigration issue");
    if (crim && crim !== "No") issues.push("criminal history");
    if (visa && visa !== "No") issues.push("prior U.S. visa");
    if (issues.length === 0) {
      elements[9] = elementResult("green", "No disqualifier gates triggered on intake.");
      return;
    }
    elements[9] = elementResult("yellow", "Disqualifier gate(s) triggered: " + issues.join(", ") + " — details due on call.");
    if (issues.indexOf("prior immigration issue") !== -1) {
      push(1, "<strong>Prior immigration issue — get details before call.</strong> Pull full I-94 history, prior visa stamps, prior denials, prior overstays. Reconcile any anomalies. Evaluate 212(d)(3)(A) waiver path if a bar or finding is involved.");
    }
    if (issues.indexOf("criminal history") !== -1) {
      push(1, "<strong>Criminal history — get certified records.</strong> Certified disposition for every contact (including dropped charges). Run CIMT analysis. DUI history triggers panel-physician possibility.");
    }
    if (issues.indexOf("prior U.S. visa") !== -1) {
      push(2, "<strong>Prior visa details required.</strong> Type, dates, denials, status compliance. Determines whether COS path or consular path applies and surfaces 214(b) overcoming questions.");
    }
  })();

  // ── Element 10: Documentary readiness ──────────────────────────────────────
  elements[10] = elementResult("yellow", "Build to Toronto checklist; PDF ≤50 pages / ≤20 MB; cover letter ≤5 pages, no block-quoted FAM.");
  push(3, "<strong>Toronto packaging.</strong> Single PDF, ≤50 pages (excluding DS-160, DS-156E, G-28, appointment confirmation, civil docs, passport bio, dividers), ≤20 MB, tabbed I–VII. DS-160 confirmation number must match the appointment confirmation number (May 1, 2025 Mission Canada policy).");

  // ── Aggregate ──────────────────────────────────────────────────────────────
  const counts = { green: 0, yellow: 0, red: 0 };
  for (let i = 1; i <= 10; i++) {
    const g = elements[i].grade;
    if (counts[g] !== undefined) counts[g]++;
  }

  let disposition;
  if (counts.red > 0) {
    disposition = {
      level: "red",
      label: "Not currently approvable",
      sub: counts.red + " blocker" + (counts.red > 1 ? "s" : "") + " must be resolved before filing."
    };
  } else if (counts.yellow > 0) {
    disposition = {
      level: "yellow",
      label: "Approvable with fixes",
      sub: counts.yellow + " item" + (counts.yellow > 1 ? "s" : "") + " to strengthen or confirm before filing."
    };
  } else {
    disposition = {
      level: "green",
      label: "Approvable as-is",
      sub: "All ten elements pass on current intake. Build the file."
    };
  }

  actions.sort((a, b) => a.priority - b.priority);

  return {
    disposition: disposition,
    counts: counts,
    elements: elements,
    actions: actions,
    flags: flags
  };
}

// Element metadata for rendering
const ELEMENT_META = [
  { id: 1, name: "Nationality", auth: "22 CFR 41.51(b)(6); 9 FAM 402.9-4(B)" },
  { id: 2, name: "Bona fide enterprise", auth: "8 CFR 214.2(e)(13); 9 FAM 402.9-6(C)" },
  { id: 3, name: "Investment (source)", auth: "8 CFR 214.2(e)(12); 9 FAM 402.9-6(B)" },
  { id: 4, name: "Irrevocable commitment", auth: "9 FAM 402.9-6(B)(d)–(e)" },
  { id: 5, name: "Substantial capital", auth: "9 FAM 402.9-6(D); Walsh & Pollard" },
  { id: 6, name: "Not marginal", auth: "9 FAM 402.9-6(E)" },
  { id: 7, name: "Develop & direct", auth: "9 FAM 402.9-6(F)" },
  { id: 8, name: "Intent to depart", auth: "INA 214(b); 9 FAM 402.9-4(C)" },
  { id: 9, name: "Admissibility", auth: "INA 212(a); 22 CFR Part 40" },
  { id: 10, name: "Documentary readiness", auth: "Mission Canada / Toronto checklist" }
];

function renderAnalysisHTML(analysis) {
  const gradeColor = { green: "#2e7d4f", yellow: "#b8860b", red: "#b23a3a" };
  const gradeBg    = { green: "#e8f3ed", yellow: "#fbf3df", red: "#fbeaea" };
  const gradeLabel = { green: "PASS", yellow: "WATCH", red: "BLOCK" };
  const pri        = { 1: "#b23a3a", 2: "#b8860b", 3: "#2e7d4f" };
  const priBg      = { 1: "#fbeaea", 2: "#fbf3df", 3: "#e8f3ed" };
  const priLabel   = { 1: "HIGH", 2: "MED", 3: "LOW" };

  const d = analysis.disposition;
  const dispColor = gradeColor[d.level];
  const dispBg = gradeBg[d.level];

  let html = `
<div class="section-title">EMAN Internal Analysis</div>
<div style="background:${dispBg}; border-left:5px solid ${dispColor}; padding:14px 18px; border-radius:6px; margin-bottom:16px;">
  <div style="font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:${dispColor}; opacity:0.75; font-weight:700;">Disposition</div>
  <div style="font-size:18px; font-weight:700; color:${dispColor}; margin-top:4px;">${d.label}</div>
  <div style="font-size:13px; color:${dispColor}; opacity:0.85; margin-top:2px;">${d.sub}</div>
</div>

<table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
  <thead>
    <tr style="background:#f3f0ec;">
      <th style="text-align:left; padding:6px 8px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#5a6672; border-bottom:1px solid #e4e0db; width:30px;">#</th>
      <th style="text-align:left; padding:6px 8px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#5a6672; border-bottom:1px solid #e4e0db;">Element</th>
      <th style="text-align:left; padding:6px 8px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#5a6672; border-bottom:1px solid #e4e0db;">Note</th>
      <th style="text-align:center; padding:6px 8px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#5a6672; border-bottom:1px solid #e4e0db; width:70px;">Grade</th>
    </tr>
  </thead>
  <tbody>`;

  for (const m of ELEMENT_META) {
    const r = analysis.elements[m.id];
    if (!r) continue;
    const c = gradeColor[r.grade] || "#8a939c";
    const bg = gradeBg[r.grade] || "#f3f0ec";
    html += `
    <tr>
      <td style="padding:8px; font-size:12px; color:#8a939c; border-bottom:1px solid #f3f0ec; vertical-align:top;">${m.id}.</td>
      <td style="padding:8px; font-size:13px; border-bottom:1px solid #f3f0ec; vertical-align:top;">
        <div style="font-weight:600; color:#1a2638;">${m.name}</div>
        <div style="font-size:11px; color:#8a939c; margin-top:1px;">${m.auth}</div>
      </td>
      <td style="padding:8px; font-size:12px; color:#5a6672; line-height:1.4; border-bottom:1px solid #f3f0ec; vertical-align:top;">${r.note}</td>
      <td style="padding:8px; text-align:center; border-bottom:1px solid #f3f0ec; vertical-align:top;">
        <span style="display:inline-block; padding:3px 9px; border-radius:11px; background:${c}; color:#fff; font-size:10px; font-weight:700; letter-spacing:0.06em;">${gradeLabel[r.grade] || "—"}</span>
      </td>
    </tr>`;
  }

  html += `
  </tbody>
</table>`;

  // Counts
  html += `
<div style="display:flex; gap:8px; margin-bottom:20px;">
  <div style="flex:1; text-align:center; padding:10px; border-radius:6px; background:${gradeBg.green}; color:${gradeColor.green}; font-size:11px; font-weight:600;">
    <div style="font-size:22px; font-weight:700; font-family:Georgia,serif;">${analysis.counts.green}</div>
    Approvable
  </div>
  <div style="flex:1; text-align:center; padding:10px; border-radius:6px; background:${gradeBg.yellow}; color:${gradeColor.yellow}; font-size:11px; font-weight:600;">
    <div style="font-size:22px; font-weight:700; font-family:Georgia,serif;">${analysis.counts.yellow}</div>
    Fixable
  </div>
  <div style="flex:1; text-align:center; padding:10px; border-radius:6px; background:${gradeBg.red}; color:${gradeColor.red}; font-size:11px; font-weight:600;">
    <div style="font-size:22px; font-weight:700; font-family:Georgia,serif;">${analysis.counts.red}</div>
    Blocker
  </div>
</div>`;

  // Actions
  if (analysis.actions && analysis.actions.length) {
    html += `
<div style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#6b9e85; margin: 24px 0 12px; padding-bottom:8px; border-bottom:2px solid #e8e8e8;">Strengthening Actions (Priority Order)</div>`;
    for (const a of analysis.actions) {
      const pc = pri[a.priority] || "#8a939c";
      const pbg = priBg[a.priority] || "#f3f0ec";
      const pl = priLabel[a.priority] || "—";
      html += `
<div style="display:flex; gap:10px; padding:10px 12px; border-radius:6px; margin-bottom:6px; background:${pbg}; font-size:13px; line-height:1.5;">
  <div style="flex-shrink:0; padding:1px 7px; height:18px; background:${pc}; color:#fff; font-size:9px; font-weight:700; letter-spacing:0.06em; border-radius:9px; align-self:flex-start; margin-top:2px;">${pl}</div>
  <div style="flex:1; color:#1a2638;">${a.text}</div>
</div>`;
    }
  }

  // Flags
  if (analysis.flags && analysis.flags.length) {
    html += `
<div style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#6b9e85; margin: 24px 0 12px; padding-bottom:8px; border-bottom:2px solid #e8e8e8;">Notes from Free-Text Fields</div>`;
    for (const f of analysis.flags) {
      html += `<div style="font-size:12px; color:#5a6672; padding:8px 0; line-height:1.5;">• ${f}</div>`;
    }
  }

  html += `
<div style="margin-top:20px; padding:12px; background:#faf8f5; border:1px dashed #e4e0db; border-radius:6px; font-size:11px; color:#8a939c; line-height:1.5;">
  Analysis auto-generated from intake responses against the E-2 Authority Stack (Canada) rubric. Form fields do not capture every dimension — items marked "confirm on call" reflect questions the live form does not ask. Treat the analysis as a prep brief, not as the final read.
</div>`;

  return html;
}

module.exports = {
  scoreIntake: scoreIntake,
  renderAnalysisHTML: renderAnalysisHTML,
  ELEMENT_META: ELEMENT_META
};
