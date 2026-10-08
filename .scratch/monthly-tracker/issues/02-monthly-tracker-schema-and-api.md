# 02: Monthly Tracker Persistence Schema & API Endpoints

**What to build:** Database tables and authenticated REST API endpoints to save, retrieve, and update 12 monthly income records per user per tax year, alongside user preferences for which columns to show or hide.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Database migration creates `monthly_income_records` table with columns for user ID, tax year, month (1-12), income, withholding tax, social security, and note, enforcing a unique constraint per (user, year, month)
- [x] Database migration creates `monthly_tracker_settings` table to store user column visibility preferences (`show_withholding`, `show_social_security`, `show_note`)
- [x] Endpoint `GET /api/monthly-tracker?year=YYYY` returns the 12 records for the requested tax year (with zeroes for unrecorded months) and the user's column preferences
- [x] Endpoint `POST /api/monthly-tracker` performs a bulk upsert of 12 monthly records and persists updated column preferences for authenticated users
- [x] Endpoints validate numeric bounds and require valid authentication credentials
