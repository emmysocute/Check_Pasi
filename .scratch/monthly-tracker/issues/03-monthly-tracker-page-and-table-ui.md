# 03: 12-Month Part-time Income Tracker Page & Interactive UI

**What to build:** A dedicated `/monthly-tracker` page accessible from the sidebar navigation, providing customizable column toggle pills, a 12-month data entry table with mobile-responsive card view, a one-tap `[⚡ 3%]` calculation shortcut, a `[📋 คัดลอก]` copy button, and a sticky annual summary displaying accumulated totals and estimated tax refund potential, connected to the backend API.

**Blocked by:** 02: Monthly Tracker Persistence Schema & API Endpoints

**Status:** ready-for-agent

- [ ] Sidebar menu contains a new navigation link `📅 บันทึกรายได้ 12 เดือน` linking to `/monthly-tracker` with active state indicators
- [ ] Header includes a tax year selector (e.g. 2569 / 2026, 2568 / 2025) which loads corresponding monthly records from the backend API
- [ ] Column toggle selector pills allow users to independently show or hide Withholding Tax, Social Security, and Note columns (Income always visible)
- [ ] Each month row permits free direct numeric typing, with a one-click `[⚡ 3%]` helper button that computes 3% of the monthly income without locking the input
- [ ] A `[📋 คัดลอก]` button copies values from the current month to the subsequent month for quick data entry of recurring wages
- [ ] A sticky annual summary banner computes and shows total annual income, total withholding tax, total social security, and an estimated tax refund callout
- [ ] A "บันทึกข้อมูล" button persists the current 12 months and column settings via the backend API with feedback notifications
- [ ] Responsive design gracefully transitions from a multi-column table on desktop to compact card rows on mobile devices (< 768px)
