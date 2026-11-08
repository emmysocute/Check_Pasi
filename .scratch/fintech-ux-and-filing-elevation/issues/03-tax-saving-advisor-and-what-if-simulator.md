# 03: Tax Saving Advisor & What-If Deduction Simulator

**What to build:** In `ResultPanel.jsx` and `taxEngine.js`, introduce a dynamic "What-If" tax simulation widget that allows taxpayers to test incremental tax-deductible investments (e.g. SSF, RMF, life/health insurance) via an interactive slider or preset buttons (฿10,000, ฿30,000, ฿50,000, ฿100,000), calculating exactly how many baht return to the user's pocket in real-time based on their marginal tax rate.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Add `simulateTaxSavings(baseParams, additionalInvestment)` helper in `src/utils/taxEngine.js` calculating exact marginal tax reduction
- [x] Add comprehensive unit tests in `test/taxEngine.test.js` verifying simulation accuracy across 5%, 10%, 15%, 20%, 25%, 30%, and 35% tax brackets
- [x] Integrate an interactive simulation drawer or card in `ResultPanel.jsx` with responsive sliders and quick-preset badges
- [x] Present plain-language Thai microcopy indicating the percentage saved and immediate cash refund boost
