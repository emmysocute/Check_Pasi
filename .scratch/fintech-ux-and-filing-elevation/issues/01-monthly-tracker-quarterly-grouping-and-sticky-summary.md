# 01: Monthly Tracker Quarterly Grouping & Sticky Summary Bar

**What to build:** In `MonthlyTrackerPage.jsx`, group the 12-month income logging table into accessible quarterly segmented views: `[Q1 (ม.ค.-มี.ค.)]`, `[Q2 (เม.ย.-มิ.ย.)]`, `[Q3 (ก.ค.-ก.ย.)]`, `[Q4 (ต.ค.-ธ.ค.)]`, and `[แสดงทั้งปี (12 เดือน)]`. Eliminate the overwhelming 48-input wall by default while keeping data fully preserved. Implement a persistent floating sticky summary bar at the bottom displaying real-time year-to-date gross income, total 3% withholding tax deducted, and potential tax refund impact, accessible on all screen sizes.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Implement quarterly tab navigation (`Q1`, `Q2`, `Q3`, `Q4`, `All`) with accessible ARIA tablist/tab roles and keyboard navigation
- [x] Group monthly record cards/rows by the active quarter while keeping the underlying 12-month state synchronized
- [x] Add a persistent sticky summary footer at the bottom of the tracker showing total gross income, withholding tax deducted, and active months
- [x] Add unit tests in `test/monthlyTracker.test.js` verifying quarterly data partitioning and quarter-level subtotal calculations
- [x] Responsive design verified for mobile screen widths with touch-friendly controls
