# 04: One-Click Bridge from Monthly Tracker to Tax Calculator

**What to build:** An interactive action button on the Monthly Tracker page allowing users to seamlessly transmit their 12-month aggregated sums (total income, total withholding tax, and total social security) into the Tax Calculator page (`/calculator`), automatically prefilling inputs and triggering real-time tax liability and refund calculations.

**Blocked by:** 01: Donation 10% Ceiling Indicator & Soft Warning, 03: 12-Month Part-time Income Tracker Page & Interactive UI

**Status:** ready-for-agent

- [ ] Sticky summary section on `/monthly-tracker` includes a prominent call-to-action button: `🚀 ส่งยอดไปคำนวณภาษีประจำปี`
- [ ] Clicking the button packages annual sums into navigation state (`location.state.prefill`) and redirects to `/calculator`
- [ ] Tax Calculator page checks for incoming prefill state on mount and populates corresponding income (salary / freelance), withholding tax, and social security fields
- [ ] Real-time tax calculation immediately executes with the prefilled values, displaying accurate net taxable income, progressive brackets, and refund or payable amounts
- [ ] Users can edit or add additional deductions (such as insurance or donations) in `/calculator` normally after handover
