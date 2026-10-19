# Changelog

Schema changes of `data/prices.json` / `data/prices.csv`. Dates are UTC+8.

## 1.3.0 (2026-10-19)

Add-only: every 1.2.0 field keeps its name, type, meaning and position; new fields are appended.

- Header: `recheck_days` (14) and `cite_as` (plain-text citation with the UTC+8 snapshot date).
- Rows: `provider_country`, `provider_country_source_url`, `provider_country_basis`, `provider_country_verified_at`
  (country of the model vendor, only when backed by a public source; basis is one of `terms_of_service`, `company_page`,
  `company_registry`, `third_party_reference`; otherwise all four are null).
- Rows: `pending_recheck`, `pending_recheck_reasons` (`age`, `fetch_failed`, `scheduled_change`; joined with `;` in CSV),
  `last_verified_date_utc8`.
- The live site export additionally has `or_discount`, `or_base_*_per_1m`, `or_discount_last_day`, `or_discount_source_url`
  (OpenRouter-only, not in this dataset).
- `CITATION.cff` `version` / `date-released` now use the UTC+8 date of the export (previously the UTC date).
- `usd_cny` / `fx_verified_at` follow the site's FX (previously pinned between syncs).
- `README.md`, `README.zh.md` and `CITATION.bib` are rendered from `templates/` with the snapshot counts and date.

## 1.2.0

Initial public schema: 37 fields, official channels only.
