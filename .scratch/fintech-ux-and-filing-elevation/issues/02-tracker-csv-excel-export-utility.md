# 02: 12-Month Freelance Accounting Export (CSV / Excel)

**What to build:** In `MonthlyTrackerPage.jsx`, provide a prominent "ดาวน์โหลดรายงาน 12 เดือน (CSV / Excel)" action that generates a client-side downloadable spreadsheet of all 12 monthly freelance records. Format the export with UTF-8 BOM (`\uFEFF`) to ensure Thai typography renders perfectly in Microsoft Excel and Numbers, itemizing Month, Employer/Payer, Gross Income, WHT Rate (3%), Tax Withheld, and Net Received.

**Blocked by:** 01 (Monthly Tracker Quarterly Grouping & Sticky Summary Bar)

**Status:** completed

- [x] Create a reusable pure utility function `exportMonthlyTrackerToCSV(records, year)` that generates CSV formatted string with UTF-8 BOM
- [x] Add unit tests in `test/exportUtils.test.js` verifying CSV headers, column alignment, numerical formatting, and special character sanitization
- [x] Add an export button to `MonthlyTrackerPage.jsx` header that triggers immediate file download (`check-pasi-tracker-2569.csv`)
- [x] Verify seamless compatibility with Microsoft Excel, Google Sheets, and Apple Numbers without character encoding corruption
