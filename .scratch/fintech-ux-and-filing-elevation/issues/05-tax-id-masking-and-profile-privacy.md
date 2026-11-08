# 05: Sensitive Tax ID Masking & Profile Privacy Guard

**What to build:** In `ProfilePage.jsx`, protect sensitive personal identification by masking the 13-digit National Tax ID by default (e.g. `1-1002-XXXXX-32-1`). Add an accessible eye toggle button allowing the user to reveal or hide the raw identification number safely.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Add `maskTaxId(id, isRevealed)` utility function in `src/utils/numberInput.js` (or `src/utils/privacy.js`)
- [x] Add unit tests verifying ID masking formats, boundary lengths, and empty states
- [x] Update `ProfilePage.jsx` to render the masked ID with an eye toggle button (`aria-label="แสดง/ซ่อนเลขประจำตัวผู้เสียภาษี"`)
- [x] Maintain seamless update/save capabilities in the user profile form without data corruption
