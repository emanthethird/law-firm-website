# E-2 Authority Stack - Collateral Authorities

Compiled 2026-05-12 for the Canada-scoped E-2 treaty investor authority library. This file collects the tax, BSA/AML, entity-formation, and federal economic-data authorities that intersect with E-2 practice. None of these are E-2 adjudication authorities, but each is a recurring touchpoint in Canadian-investor matters - tax compliance on the back end of the visa, structuring on the front end, and rebuttal evidence on marginality during adjudication.

A note on access: public agency pages on irs.gov, fincen.gov, bea.gov, and bls.gov were pulled live from the browser session. Statutory and regulatory text underlying each program is cited but not reproduced. Treat the live agency pages and the underlying Code provisions as controlling.

## Table of Contents

1. IRS Form 5472 - Reporting by 25% Foreign-Owned U.S. Corporations and Foreign-Owned U.S. Disregarded Entities
2. FBAR - FinCEN Form 114 (Report of Foreign Bank and Financial Accounts)
3. FATCA - IRS Form 8938 (Statement of Specified Foreign Financial Assets)
4. FinCEN Beneficial Ownership Information (BOI) Reporting - Current Status 2026
5. State Entity Formation for E-2 Investment Vehicles - Delaware, Nevada, Wyoming, and State of Operation
6. Department of Commerce Bureau of Economic Analysis (BEA) - Data for Rebutting Marginality
7. Bureau of Labor Statistics (BLS) - Wage, Employment, and Industry Data
8. U.S. Census Bureau County Business Patterns and NAICS Industry Statistics

---

## 1. IRS Form 5472 - Reporting by 25% Foreign-Owned U.S. Corporations and Foreign-Owned U.S. Disregarded Entities

Source URL: https://www.irs.gov/forms-pubs/about-form-5472
Form and instructions: linked from the page above ("Form 5472 PDF" and "Instructions for Form 5472 (Print Version PDF)")
Underlying statutes: IRC sections 6038A and 6038C
Underlying regulations: Treas. Reg. 1.6038A-1 through 1.6038A-7; Treas. Reg. 301.7701-2(c)(2)(vi) (treating foreign-owned U.S. disregarded entities as corporations for section 6038A reporting)

What the IRS page says: "Corporations file Form 5472 to provide information required under sections 6038A and 6038C when reportable transactions occur with a foreign or domestic related party."

Reporting trigger. Form 5472 is filed by a "reporting corporation" - either (a) a U.S. corporation that is 25 percent foreign-owned (one foreign person directly or constructively owns at least 25 percent of the vote or value of any class of stock), or (b) a foreign corporation engaged in a U.S. trade or business - that has a "reportable transaction" with a foreign or domestic related party during the tax year. Reportable transactions are defined broadly in Treas. Reg. 1.6038A-2 and include sales, leases, licenses, loans, capital contributions, distributions, and amounts paid or received for services or for the use of property.

Foreign-owned U.S. disregarded entities. Under Treas. Reg. 301.7701-2(c)(2)(vi), a domestic single-member LLC wholly owned (directly or indirectly) by a foreign person is treated as a corporation for purposes of section 6038A reporting. The result is that a Canadian-owned U.S. single-member LLC must obtain an EIN, file Form 5472, and attach it to a pro forma Form 1120, even if the LLC is otherwise tax-transparent for U.S. federal income tax purposes. Reportable transactions for these entities include contributions from and distributions to the foreign owner.

Penalties. Failure to file a timely and substantially complete Form 5472 carries a base penalty of $25,000 per reportable corporation per year (per Form 5472 not filed), with an additional $25,000 for each 30-day period after IRS notice if the failure continues. Penalties also attach to failure to maintain the underlying records required by section 6038A(a).

Why it matters for E-2 (Canadian investors). The classic Canadian E-2 structure pairs a Canadian parent corporation (or a Canadian individual) with a newly formed U.S. operating entity. Where the U.S. entity is a single-member LLC, that LLC is a foreign-owned U.S. disregarded entity and falls squarely within the Treas. Reg. 301.7701-2(c)(2)(vi) Form 5472 regime - this is non-obvious to investors who assume the SMLLC's pass-through treatment means no separate federal filing. Capital contributions used to satisfy the E-2 "substantial investment" requirement are themselves reportable transactions; so are subsequent intercompany payments (management fees, royalties, intercompany loans) between the U.S. LLC and the Canadian parent. The 5472 obligation should be flagged at the structuring stage and again whenever the E-2 file documents source-of-funds capital flows from the Canadian parent.

---

## 2. FBAR - FinCEN Form 114 (Report of Foreign Bank and Financial Accounts)

Source URL (FinCEN): https://www.fincen.gov/report-foreign-bank-and-financial-accounts
Source URL (IRS): https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar
Filing portal: BSA E-Filing System (https://bsaefiling.fincen.treas.gov)
Underlying statute: 31 USC 5314; 31 USC 5321 (civil penalties); 31 USC 5322 (criminal penalties)
Underlying regulations: 31 CFR 1010.350 (filing); 31 CFR 1010.306 (when, where, and how to file); 31 CFR 1010.420 (records)

What the FinCEN page says: "A United States person that has a financial interest in or signature authority over foreign financial accounts must file an FBAR if the aggregate value of the foreign financial accounts exceeds $10,000 at any time during the calendar year."

Who must file. A "United States person" - U.S. citizens; U.S. residents (including resident aliens under the substantial presence test); entities organized or formed in the United States, including corporations, partnerships, LLCs, trusts, and estates - with either (a) a financial interest in, or (b) signature or other authority over one or more foreign financial accounts, where the aggregate maximum value of all such accounts exceeds $10,000 at any time during the calendar year. The aggregate test is across all accounts, even if no single account ever reaches $10,000.

Mechanics. FBAR is filed electronically through the BSA E-Filing System on FinCEN Form 114 (not on the federal income tax return). It is due April 15 with an automatic extension to October 15.

Penalties. Non-willful: up to $10,000 per violation, adjusted for inflation. Willful: the greater of $100,000 (inflation-adjusted) or 50 percent of the account balance at the time of the violation, per account per year. Criminal penalties up to $250,000 / 5 years (or $500,000 / 10 years if part of certain other violations). The Supreme Court in Bittner v. United States, 598 U.S. 85 (2023), held that the non-willful FBAR penalty is per-report, not per-account.

Why it matters for E-2 (Canadian investors). FBAR catches Canadian E-2 visa holders the moment they become "U.S. persons" for FBAR purposes - which, for resident aliens, occurs once the substantial presence test is met (typically by the second full year in E-2 status, sometimes earlier depending on day counts). At that point any Canadian RRSP, TFSA, RRIF, Canadian brokerage account, Canadian operating account, or Canadian personal checking account becomes potentially reportable on FBAR if the aggregate $10,000 threshold is hit. Practitioners should flag this at the initial E-2 consultation, particularly for clients moving family operating capital through Canadian accounts. Note that FBAR coverage is broader than FATCA's Form 8938 in some respects (no income test, signature authority alone triggers reporting) but the two are not mutually exclusive - a single account can be reportable on both.

---

## 3. FATCA - IRS Form 8938 (Statement of Specified Foreign Financial Assets)

Source URL: https://www.irs.gov/businesses/corporations/foreign-account-tax-compliance-act-fatca
Form 8938 page: https://www.irs.gov/forms-pubs/about-form-8938
Underlying statute: IRC section 6038D (specified domestic entities); IRC chapter 4 (sections 1471-1474) (FFI withholding regime)
Underlying regulations: Treas. Reg. 1.6038D-1 through 1.6038D-8

What the IRS page says: "The Foreign Account Tax Compliance Act (FATCA), which was passed as part of the HIRE Act, generally requires that foreign financial Institutions and certain other non-financial foreign entities report on the foreign assets held by their U.S. account holders or be subject to withholding on withholdable payments. The HIRE Act also contained legislation requiring U.S. persons to report, depending on the value, their foreign financial accounts and foreign assets."

What Form 8938 reports. "Specified foreign financial assets" - foreign deposit and custodial accounts, foreign stock or securities not held in a financial account, foreign partnership interests, foreign mutual funds, certain foreign pension and deferred-compensation arrangements, and any other foreign financial instrument or contract with a non-U.S. issuer or counterparty. Reported on Form 8938 attached to the U.S. federal income tax return (Form 1040 or 1120).

Reporting thresholds (taxpayer-side). For an unmarried U.S. taxpayer living in the United States: assets exceed $50,000 on the last day of the year or $75,000 at any time during the year. For married filing jointly in the United States: $100,000 / $150,000. Thresholds roughly quadruple for taxpayers living abroad. Domestic entities meeting the "specified domestic entity" definition under Treas. Reg. 1.6038D-6 also file Form 8938.

Penalties. $10,000 initial failure-to-file penalty under section 6038D(d), plus continuation penalties up to an additional $50,000, plus a 40 percent accuracy-related penalty on understatements attributable to undisclosed specified foreign financial assets under section 6662(j).

Why it matters for E-2 (Canadian investors). Once the Canadian E-2 holder becomes a U.S. resident for tax purposes, Form 8938 reporting kicks in on the same Canadian accounts that drive FBAR, and also on Canadian-side investment products that FBAR does not always cover cleanly (certain non-account-form interests in Canadian private companies, partnership interests in Canadian operating entities the investor retained, Canadian mutual funds and ETFs). The FBAR / 8938 comparison chart on the IRS FATCA page (linked under "Comparison of Form 8938 and FBAR requirements") is the cleanest one-page reference for explaining the overlap and differences to a Canadian client. Note also that Canadian RRSPs and RRIFs have specific reporting treatment under the U.S.-Canada Income Tax Convention and Rev. Proc. 2014-55 (electing out of certain reporting), but the underlying 8938 disclosure obligation remains.

---

## 4. FinCEN Beneficial Ownership Information (BOI) Reporting - Current Status 2026

Source URL: https://www.fincen.gov/boi
Underlying statute: Corporate Transparency Act, 31 USC 5336
Underlying regulations: 31 CFR 1010.380

Current status as of May 2026 (pulled live from https://www.fincen.gov/boi). FinCEN updated its alert on March 26, 2025. The page states verbatim: "All entities created in the United States - including those previously known as 'domestic reporting companies' - and their beneficial owners are now exempt from the requirement to report beneficial ownership information (BOI) to FinCEN. Existing foreign companies that must report their beneficial ownership information have at least an additional 30 days from March 26, 2025 - until April 25, 2025, for most companies - to do so."

What this means in operative terms. The final interim rule promulgated by FinCEN in March 2025 (following the litigation track that included Texas Top Cop Shop v. Garland, National Small Business United v. Yellen, and the Supreme Court's January 2025 stay order in McHenry v. Texas Top Cop Shop) narrowed the reporting regime to "foreign reporting companies" - entities formed under the law of a foreign country and registered to do business in any U.S. state or tribal jurisdiction. U.S.-formed entities (domestic corporations, LLCs, LPs, and other state-formed entities) are no longer required to file BOI reports, regardless of who owns them, and U.S. persons are no longer required to report BOI as beneficial owners of foreign reporting companies. Ongoing litigation under NSBU v. Yellen is noted on the page as still active.

Why it matters for E-2 (Canadian investors). This is a 180-degree shift from the 2024 posture and changes the structuring conversation materially:

- A U.S.-formed Delaware (or Wyoming, Nevada, etc.) corporation or LLC owned by a Canadian parent corporation or by Canadian individuals is currently not required to file a BOI report. The fact of foreign ownership does not pull a domestic reporting company into the regime under the March 2025 rule.
- A Canadian-formed corporation (e.g., an Ontario or BC company) that registers to do business in a U.S. state by filing as a foreign entity remains a "foreign reporting company" and is subject to BOI reporting on its non-U.S.-person beneficial owners.
- The practical upshot for the typical Canadian E-2 structure (Canadian parent or individual investor -> newly formed Delaware/state LLC or corp) is that BOI filing is not currently required on the U.S. operating entity. If, however, the client also registers their Canadian parent corporation as a foreign entity in the U.S. state of operation (rather than working through a wholly owned U.S. subsidiary), the Canadian parent becomes a foreign reporting company.
- This is an actively contested area. Counsel should verify the live status of the rule before relying on the exemption in any specific filing - the March 26, 2025 alert remains posted as of pull date but the underlying litigation and any congressional or rulemaking action could change the position again. The FinCEN BOI page is the right authoritative URL to recheck.

---

## 5. State Entity Formation for E-2 Investment Vehicles - Delaware, Nevada, Wyoming, and State of Operation

This section is a structural orientation, not a recitation of state corporate statutes. Verify current state filing requirements through each Secretary of State portal before forming.

Delaware. Source: Delaware Division of Corporations, https://corp.delaware.gov. Governing law: Delaware General Corporation Law (8 Del. C. chs. 1 et seq.) for corporations; Delaware Limited Liability Company Act (6 Del. C. ch. 18) for LLCs. Delaware remains the default jurisdiction for U.S.-formed operating entities owned by sophisticated foreign investors due to its developed body of corporate case law, the specialized Chancery Court, the well-known LLC Act, and broad freedom-of-contract in operating agreements. Filing is electronic; LLCs require a registered agent in Delaware. Annual franchise tax applies for corporations; flat annual tax for LLCs.

Nevada. Source: Nevada Secretary of State, https://www.nvsos.gov. Governing law: Nevada Revised Statutes chs. 78 (corporations) and 86 (LLCs). Nevada has historically marketed itself on the absence of state corporate income tax and strong director protections, but for an E-2 vehicle that will actually operate from another state, Nevada formation generally creates foreign-qualification requirements in the state of operation and offers little practical benefit over Delaware.

Wyoming. Source: Wyoming Secretary of State, https://sos.wyo.gov. Governing law: Wyoming Statutes Title 17. Wyoming pioneered the modern U.S. LLC statute (1977) and continues to offer competitive LLC features, no state corporate or personal income tax, and lower formation and annual fees than Delaware or Nevada. It is sometimes selected for holding-entity layers above a state-of-operation operating entity.

State of operation. Source: Secretary of State of the state where the business will physically operate. Where the E-2 enterprise will lease space, hire employees, and serve customers in a single state (the common pattern for first-time Canadian E-2 investors opening a single U.S. location), forming the operating entity in the state of operation is often simpler and cheaper than forming in Delaware and then foreign-qualifying back into the state of operation. It also reduces the "where is the principal place of business" question that occasionally surfaces in marginality and source-of-funds analysis.

Why it matters for E-2 (Canadian investors). Two recurring issues in Canadian matters:

1. The "U.S. enterprise" for E-2 purposes must be the entity actually operating in the United States. The choice of state is a planning matter, not an adjudication issue per se - 9 FAM 402.9-6 and 8 CFR 214.2(e)(15) ask whether the enterprise is real, active, operating, and bona fide, not where it was incorporated. But the formation documents (certificate of formation/incorporation, operating agreement or bylaws, EIN application, state business license, lease) are core source-of-funds and bona fide enterprise exhibits, and they must hang together: the entity named in the E-2 application is the entity holding the lease, employing personnel, and receiving the invested capital. Mismatches between formation state, qualification state, and operating address are the source of avoidable RFEs.

2. The nationality of the entity for E-2 purposes is determined by the nationality of the owners (50 percent treaty-country ownership), not by the state of incorporation. So a Delaware LLC owned 100 percent by Canadian individuals or by a Canadian corporation is a "Canadian" entity for E-2 purposes notwithstanding its Delaware filing. This is consistent with USCIS Policy Manual Volume 2, Part G (see file 04 in this stack) and 9 FAM 402.9-4(B).

---

## 6. Department of Commerce Bureau of Economic Analysis (BEA) - Data for Rebutting Marginality

Source URL: https://www.bea.gov

What BEA is. The Bureau of Economic Analysis is the Department of Commerce statistical agency responsible for producing the United States' core economic accounts: GDP, personal income and outlays, the international transactions accounts (current account, international trade in goods and services), the foreign direct investment statistics, and the industry economic accounts. BEA publishes monthly and quarterly news releases, regional data (state and local GDP, state personal income), and the GDP-by-industry tables.

Key data products useful in E-2 marginality and economic-impact arguments:

- Industry GDP / value added by industry. The annual and quarterly GDP-by-industry tables decompose U.S. GDP into roughly 70 industry groupings aligned to NAICS. Useful for documenting that the E-2 enterprise's industry sector is itself growing and not a marginal slice of the U.S. economy.
- Regional economic accounts (state GDP, state personal income, real personal income for states and metropolitan areas). Useful for showing economic-context evidence about the state where the E-2 investment will operate.
- International transactions and foreign direct investment statistics (BEA's series on inward FDI position and activities of multinational enterprises). Useful in some cases for documenting cross-border capital flows context for Canadian-origin investment.
- Supply and Use Tables. Useful for showing supply-chain linkages between the E-2 enterprise's industry and downstream U.S. industries.

Why it matters for E-2 (Canadian investors). 9 FAM 402.9-7(B) and USCIS Policy Manual Volume 2, Part G both allow marginality to be rebutted not only by showing present non-marginal income but also by showing a five-year projection of capacity to generate more than minimal income, or - alternatively - that the investment will make a significant economic contribution. BEA industry statistics, regional GDP data, and FDI statistics are the standard federal data sources cited in the economic-impact narrative in a Canadian E-2 business plan. They are particularly valuable in startup matters where the present-income rebuttal is not yet available and the practitioner must rely on industry growth and economic-contribution arguments.

---

## 7. Bureau of Labor Statistics (BLS) - Wage, Employment, and Industry Data

Source URL: https://www.bls.gov

What BLS is. The Bureau of Labor Statistics is the Department of Labor's principal statistical agency, producing the Consumer Price Index, the Producer Price Index, the Employment Situation report (monthly payrolls and unemployment), the Occupational Employment and Wage Statistics (OEWS) survey, the Quarterly Census of Employment and Wages (QCEW), the Job Openings and Labor Turnover Survey (JOLTS), and the Occupational Outlook Handbook.

Key data products useful in E-2 practice:

- OEWS - Occupational Employment and Wage Statistics. National, state, metropolitan-area, and nonmetropolitan-area employment counts and wage estimates by SOC occupation. Useful for benchmarking proposed E-2 employee compensation and for showing that the E-2 enterprise will hire at non-marginal wage levels.
- QCEW - Quarterly Census of Employment and Wages. Comprehensive count of employment and wages for workers covered by state unemployment insurance laws, published by NAICS industry at the national, state, and county level. The single best source for industry-and-county employment counts.
- Industries at a Glance. NAICS-organized industry profiles with employment, hours, earnings, productivity, and other statistics.
- Occupational Outlook Handbook. Career-track descriptions and ten-year employment projections by occupation. Useful for documenting industry growth trajectory.

Why it matters for E-2 (Canadian investors). On the front end, BLS OEWS wage data anchors the compensation projections in an E-2 business plan and supports the "creating U.S. jobs at meaningful wages" piece of the economic-contribution argument. On the back end, QCEW industry-and-county employment numbers support the "this is a real, operating sector in this market" piece of bona-fide-enterprise narrative. Both are commonly cited in the executive summary of a Canadian E-2 business plan and in the marginality rebuttal section.

---

## 8. U.S. Census Bureau County Business Patterns and NAICS Industry Statistics

Source URL: https://www.census.gov/programs-surveys/cbp.html (County Business Patterns)
NAICS reference: https://www.census.gov/naics/

What County Business Patterns is. An annual Census Bureau series providing subnational economic data by industry. CBP covers most of the U.S. economy, providing the number of establishments, employment during the week of March 12, first-quarter payroll, and annual payroll, broken down by detailed NAICS industry and by geography (national, state, county, metro area, and ZIP code).

Why it matters for E-2 (Canadian investors). CBP fills a niche that BEA and BLS do not: establishment counts and payroll by detailed NAICS code at the county and ZIP code level. For a Canadian E-2 investor opening a single location in, say, Travis County, Texas or Maricopa County, Arizona, CBP gives the practitioner the count of comparable establishments and the average payroll-per-establishment in the same county - directly supporting both bona-fide-enterprise context and the marginality rebuttal. It also provides the natural cross-reference point for tying the E-2 enterprise's NAICS code to the operating environment in the chosen state and county.

---

End of file. Verify all citations against the live agency pages and underlying statutes/regulations before filing.
