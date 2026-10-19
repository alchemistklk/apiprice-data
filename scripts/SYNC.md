# Sync

`node scripts/sync.mjs` (Node >= 18, no dependencies) downloads
<https://apiprice.app/data/prices.json>, keeps only rows with
`channel` in `official_cn` / `official_intl`, keeps the dataset fields for the export's `schema_version` (1.2.0: 37
fields; 1.3.0: the same 37 plus, appended, `provider_country`,
`provider_country_source_url`, `provider_country_basis`,
`provider_country_verified_at`, `pending_recheck`, `pending_recheck_reasons`,
`last_verified_date_utc8`, and the `recheck_days` header; OpenRouter-only
`or_*` (including `or_discount*`), `quantized_min_*`, `licensed_cloud_*` are
dropped), and rewrites `data/prices.json`, `data/prices.csv` and the
`version` / `date-released` lines of `CITATION.cff`. All dates written are
the **UTC+8** date of the export's `generated_at`. `usd_cny` /
`fx_verified_at` are the site's FX, as published on the website.
In `prices.csv`, array fields (`pending_recheck_reasons`) are joined with `;`.

Templates: if `templates/README.md`, `templates/README.zh.md` or
`templates/CITATION.bib` exist, they are rendered to the repository root
with these placeholders: `{{ROWS}}` (official rows), `{{MODELS}}`,
`{{PROVIDERS}}`, `{{AS_OF}}` (UTC+8 date of `generated_at`), `{{YEAR}}`,
`{{SCHEMA_VERSION}}`. A token wrapped in backticks is left as is (for
documenting the placeholders); any other unknown `{{NAME}}` refuses (exit 2).
Files without a template are not touched.

It refuses to write (exit 2) if: `schema_version` is not `1.2.0` or `1.3.0`, `count`
does not match the rows, a dataset field is missing, the export gained a new
non-OpenRouter field, a `model_id:channel` is duplicated, a row lacks
`source_url` / `verified_at` / `currency`, currency does not match channel,
a price is negative, zero official rows remain, or (1.3.0) a
`provider_country` lacks any of its three source fields (or a source field is
set without a country), a basis is not one of `terms_of_service`,
`company_page`, `company_registry`, `third_party_reference`,
`pending_recheck` disagrees with its reasons, or `recheck_days` is missing.

Options: `--src <url|path>` (or env `APIPRICE_SRC`) to read another export
(e.g. the site's `dist/data/prices.json`); `--check` to exit 1 if files would
change, without writing.

## Daily update (after site deploy)

Only because this repository is **public**. After the site's daily update and
deploy succeed:

```bash
cd /workspace/apiprice-data && git pull --ff-only && node scripts/sync.mjs && git add data CITATION.cff CITATION.bib README.md README.zh.md 2>/dev/null; (git diff --cached --quiet || git commit -m "data: sync $(TZ=Asia/Shanghai date +%F)") && git push
```

Without templates, README statistics and `CITATION.bib` are not regenerated;
update them by hand when counts or field tables change (e.g. schema bump).
The site's `scripts/dataset-sync.mjs` runs this after each deploy.
