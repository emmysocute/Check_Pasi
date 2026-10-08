# 01: Donation 10% Ceiling Indicator & Soft Warning

**What to build:** In the tax calculator deduction section, display a real-time informational indicator of the taxpayer's statutory 10% donation ceiling under Section 47(7) of the Revenue Code. When the entered donation amount (education/sports/hospital at 2x plus general at 1x) exceeds this statutory cap, show a prominent non-blocking soft warning explaining that the deduction is capped at the legal maximum, while still allowing the user to type their actual receipt amounts freely.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Tax calculation engine calculates `maxDonationCap` (10% of income remaining after expenses and non-donation allowances) and exposes it alongside the clamped deduction amount
- [ ] Unit tests in test suite verify the 10% donation ceiling calculation and bounds clamping across multiple income tiers
- [ ] Deduction UI displays a real-time informational badge beneath the donation inputs indicating the active statutory ceiling
- [ ] When the entered donation exceeds the ceiling, the UI displays a soft warning notice without locking, resetting, or blocking user input
- [ ] Responsive design adheres to existing styling tokens and WCAG AA contrast standards
