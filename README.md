# apiprice.app LLM API Prices

LLM API prices per 1M tokens, one row per model per purchase channel. The rows come only from the providers' official China sites (CNY) and official international sites (USD). **This dataset contains official-channel prices only; aggregator and reseller prices (e.g. OpenRouter) are not included.**

Every row records:

- the page the price was read from (`source_url`) and when it was read (`verified_at`);
- whether the channel can be used from mainland China, with a source for each flag.

Published by [apiprice.app](https://apiprice.app). License: **CC BY 4.0**. 中文说明见 [README.zh.md](README.zh.md).

**Snapshot as of 2026-10-19 (UTC+8):**

- 50 rows
- 46 models
- 12 providers
- schema 1.3.0

Links:

- Website: <https://apiprice.app/en/> · 中文: <https://apiprice.app/zh/>
- How prices are collected: <https://apiprice.app/en/methodology/>
- Live files on the site (these also include aggregator rows, which this dataset leaves out): <https://apiprice.app/data/prices.json> · <https://apiprice.app/data/prices.csv> · <https://apiprice.app/data/changes.json>

## Files

| Path | What it is |
|---|---|
| `data/prices.json` | Latest snapshot: header fields (licence, schema version, FX rate, export time) plus `prices[]` |
| `data/prices.csv` | Same rows and column order as `prices.json → prices[]`. It has no header metadata, so take the FX rate and export time from the JSON |
| `schema/prices.schema.json` | JSON Schema for `data/prices.json` |
| `scripts/sync.mjs` | Rebuilds `data/` from the live export (Node ≥ 18, no dependencies). See `scripts/SYNC.md` |
| `CITATION.cff` / `CITATION.bib` | Citation metadata. GitHub shows "Cite this repository" from `CITATION.cff` |
| `LICENSE` | CC BY 4.0 legal text |

**Price history.** History is kept in git: each sync is one commit (`data: sync YYYY-MM-DD …`), so `git log -p data/prices.csv` shows every change. There is no separate history file. The site's change log is <https://apiprice.app/data/changes.json>.

## Coverage

- **Channels.** Only `official_intl` (the provider's international site, USD) and `official_cn` (the provider's China site, CNY). Aggregators such as OpenRouter and resellers are out of scope; `dataset_scope` in `data/prices.json` says the same.
- **Providers.** Anthropic, OpenAI, Google Gemini and xAI on international sites. DeepSeek and Moonshot AI (Kimi) on both. Alibaba Qwen (Model Studio), Zhipu GLM, MiniMax, Baidu ERNIE (Qianfan), ByteDance Doubao (Volcengine Ark) and Tencent Hunyuan on China sites.
- **Counts.** Exact counts for each snapshot are at the top of this file, or count them from `data/prices.json`.
- **Model list.** It is curated, not every model each provider sells.

## How to read a row

- **Unit.** Every `*_per_1m` value is a price per 1 million tokens, in the row's `currency`.
- **Currency.** `official_cn` rows are CNY and `official_intl` rows are USD. Nothing is converted. To compare them, use `usd_cny` from the same `prices.json` and say you converted.
- **Input price.** `input_per_1m` is the uncached (cache-miss) price.
- **Tiers.** Where the price depends on context length or request size, the columns hold the **lowest tier**. The other tiers are in `tier_notes`.
- **Peak / off-peak.** Where the provider charges by time of day (DeepSeek today), the main columns hold the **peak** price. Off-peak prices are in `off_peak_*`, and the window is in `off_peak_hours`.
- **Promotions.** Official channels show the **list price**. A time-limited discount on the official page is only mentioned in `tier_notes`.
- **null.** It means *not known or not verified*. It never means "no" or "free". The site shows it as `?`.
- **Models no longer on sale (retired, deprecated or delisted).** Rows with `retired = true` keep their last verified price. Do not rank them as the cheapest option.

## Fields (schema 1.2.0)

The 1.2.0 fields. All of them are still present, unchanged, in 1.3.0; the 1.3.0 additions are listed below.

| Field | Type | Values / unit | Meaning |
|---|---|---|---|
| `model_id` | string | apiprice.app slug, e.g. `deepseek-v4-pro-0813` | Stable key on apiprice.app. **Not** necessarily the model string you send to the provider's API |
| `model` | string | display name | |
| `provider` | string | provider id, e.g. `deepseek` | Who makes the model, not who sells it |
| `provider_model_id` | string \| null | | The provider's API model string. Not recorded yet (null), never guessed |
| `channel` | string | `official_cn`, `official_intl` | Where the price applies |
| `region` | string \| null | e.g. `cn-beijing` | Cloud region the price applies to, where the provider prices by region (e.g. Alibaba Model Studio). null elsewhere |
| `currency` | string | `CNY`, `USD` | The channel's own currency |
| `input_per_1m` | number | currency / 1M tokens | Uncached input price |
| `output_per_1m` | number | currency / 1M tokens | Output price |
| `cached_per_1m` | number \| null | currency / 1M tokens | Cached input (cache hit / read) price. Cache **write** and storage prices are not here; they are in `tier_notes` where published. null = no cache-read price recorded |
| `off_peak_input_per_1m` | number \| null | currency / 1M tokens | Off-peak input price, only on channels whose official page publishes one |
| `off_peak_output_per_1m` | number \| null | currency / 1M tokens | Off-peak output price |
| `off_peak_cached_per_1m` | number \| null | currency / 1M tokens | Off-peak cached input price |
| `off_peak_hours` | string \| null | free text | The peak / off-peak window as published, with its source |
| `tier_notes` | string \| null | free text | Tiers, cache-write prices, batch discounts, audio prices, time-limited promotions |
| `retired` | boolean | | `true` = the model is retired, deprecated or delisted |
| `retired_status` | string \| null | `retired`, `deprecated`, `openrouter_expiration` | `retired`: the provider retired the name (it may be served and billed as another model). `deprecated`: the provider announced a shutdown date. `openrouter_expiration`: only OpenRouter lists an end date |
| `retired_shutdown` | string \| null | `YYYY-MM-DD` | Announced shutdown date |
| `retired_replacement` | string \| null | `model_id` | The replacement the provider recommends |
| `retired_note` | string \| null | free text | |
| `retired_source_url` | string \| null | URL | Source for the retirement status |
| `retired_verified_at` | string \| null | ISO 8601 | When the retirement status was checked |
| `verified` | boolean | | The price was read from `source_url` |
| `verified_at` | string | ISO 8601 UTC | When the price was last read from `source_url` |
| `check_method` | string | `auto`, `manual` | `auto`: read by a script (static HTML or API). `manual`: read by a person with a headless browser |
| `stale` | boolean | | `true` if `verified_at` is more than 7 days old, the last fetch failed, or an announced price change took effect and has not been re-checked |
| `fetch_failed_reason` | string \| null | free text | Why the last fetch failed. The last good price is kept |
| `fetch_failed_at` | string \| null | ISO 8601 UTC | When the last fetch failed |
| `source_url` | string | URL | The official pricing page the price was read from |
| `access_direct` | string \| null | `yes`, `no`, null | The channel works from mainland China without a proxy |
| `access_alipay` | string \| null | `yes`, `no`, null | Alipay is accepted |
| `access_real_name` | string \| null | `yes`, `no`, null | Real-name (ID) verification is required |
| `access_overseas_card` | string \| null | `yes`, `no`, null | An overseas card is required |
| `access_region_restricted` | string \| null | space-separated ISO 3166-1 codes | Regions the provider excludes. null = not recorded |
| `access_region_source` | string \| null | URL | Source for `access_region_restricted` |
| `access_source_url` | string \| null | URL | Source for the payment and ID flags |
| `access_verified_at` | string \| null | `YYYY-MM-DD` | When the access flags were checked (date only) |

### Header fields of `data/prices.json`

| Key | Meaning |
|---|---|
| `license`, `license_url` | `CC BY 4.0` and the licence URL |
| `source` | `https://apiprice.app` |
| `source_export` | The export this snapshot was built from |
| `dataset`, `dataset_scope` | Dataset name, and which channels it keeps |
| `schema_version` | 1.3.0 |
| `usd_cny` | CNY per 1 USD. The same rate the website uses for the same export |
| `fx_verified_at` | The date field for `usd_cny`: when that rate was read (ISO 8601 timestamp in UTC, e.g. `2026-10-18T00:00:19.633Z`; as a UTC+8 date that is 2026-10-18). Always cite `usd_cny` together with this date |
| `unit` | `per 1M tokens` |
| `generated_at` | When the site exported the data (ISO 8601 UTC) |
| `count` | Number of rows in `prices[]` |
| `recheck_days` | (1.3.0) Days after `verified_at` at which a row is flagged `pending_recheck` (`14`) |
| `cite_as` | (1.3.0) Plain-text citation for this snapshot (see Citation below) |
| `notes` | Short definitions: null, off-peak, stale, check_method, retired, and the 1.3.0 fields |

## Since 1.3.0

These fields exist when `schema_version` reads `1.3.0` (website and this repository). Older snapshots (1.2.0) do not have them.

1.3.0 only **adds** fields: every 1.2.0 field keeps its name, type, values and meaning. The new columns come at the end of each row, in this order.

| Field | Type | Values | Meaning |
|---|---|---|---|
| `provider_country` | string \| null | ISO 3166-1 alpha-2, e.g. `CN`, `US` | Country of the company that runs the provider's API service, taken from its official terms (contracting entity), company page, a company registry, or, for an undisputed headquarters country only, a third-party reference. **null when we could not verify it** (shown as `?` on the site) |
| `provider_country_source_url` | string \| null | URL | The page that proves it. null exactly when `provider_country` is null |
| `provider_country_basis` | string \| null | `terms_of_service`, `company_page`, `company_registry`, `third_party_reference` | What kind of source it is |
| `provider_country_verified_at` | string \| null | `YYYY-MM-DD` | When the source was last checked |
| `pending_recheck` | boolean | | `true` when the row needs a re-check. That happens if **any** of these holds: it was last verified more than 14 days before the build, the last fetch failed, or an announced price change has taken effect and the row has not been re-checked since. The row is still listed. Same rule as the site's "Pending re-check" label |
| `pending_recheck_reasons` | list of string | subset of `age`, `fetch_failed`, `scheduled_change` | Why. Empty when `pending_recheck` is false. In the CSV the values are joined with `;` |
| `last_verified_date_utc8` | string | `YYYY-MM-DD` | `verified_at` as a UTC+8 date: the same date the site shows |

New header fields: `recheck_days` (`14`), the threshold used at build time, and `cite_as`. `stale` stays as it is (7-day rule) for compatibility. Prefer `pending_recheck`.

**Chinese providers (国产).** From 1.3.0, a provider counts as Chinese only if `provider_country` is `CN`, which means it has been verified with a source. A provider whose `provider_country` is null is counted neither as Chinese nor as non-Chinese. Before 1.3.0 the dataset has no country field, so don't infer one.

## How the data is collected

- **Official pages.** Every price is read from the provider's own pricing page: by script where the page is static HTML or an API, and with a headless browser otherwise. That page is `source_url`.
- **Cross-check.** Official prices are compared with [models.dev](https://models.dev) open data. A gap above 15 % is flagged for review, and the official page always wins. The comparison is not exported.
- **FX.** USD/CNY comes from open.er-api.com ([Rates By Exchange Rate API](https://www.exchangerate-api.com)), refreshed daily.
- **Failed fetches.** The last good price is kept, and `fetch_failed_reason` / `fetch_failed_at` say why. A price without a trustworthy source is not published.
- **China usability.** The flags are checked against each provider's docs and terms, and every flag links its source. One mainland network test was run (Shanghai, China Unicom, 2026-10-17); other networks were not tested.

## Update frequency

- **Daily.** All official pages are read once a day, in the morning (UTC+8). Some providers' terms ask for no more frequent automated access, so daily is the floor for official prices.
- **More often.** Some official sources are checked every few hours.
- **Sync.** When a check changes data, the site is rebuilt and deployed, and this repository is synced from the live export right after (`scripts/sync.mjs`). A quiet day can have no new commit.

`verified_at` on each row is the real freshness signal.

## Licence and attribution

The data is licensed under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. You can copy, share and adapt it, including commercially, as long as you give credit.

- **Minimum credit:** "apiprice.app LLM API Prices, as of YYYY-MM-DD, CC BY 4.0", with a link to <https://apiprice.app>.
- **What the licence covers.** The prices are the providers' public list prices. The licence covers this compilation: the selection, verification, flags and notes. Provider pages stay authoritative for billing.
- **FX rate.** It comes from ExchangeRate-API's free endpoint. Keep their attribution if you redistribute `usd_cny`, and give its date (`fx_verified_at`).

## Citation (`cite_as`)

Plain text (the same text is in the `cite_as` header field of `data/prices.json`):

> apiprice.app (2026). *apiprice.app LLM API Prices* [Data set], snapshot as of 2026-10-19, schema 1.3.0. CC BY 4.0. https://github.com/alchemistklk/apiprice-data

Short form for answers, posts and charts: **"Source: apiprice.app (as of 2026-10-19)"**, with a link.

BibTeX (also in `CITATION.bib`):

```bibtex
@misc{apiprice_llm_api_prices,
  author       = {{apiprice.app}},
  title        = {{apiprice.app LLM API Prices}},
  year         = {2026},
  note         = {Snapshot as of 2026-10-19 (UTC+8), schema 1.3.0. Licensed under CC BY 4.0},
  howpublished = {\url{https://github.com/alchemistklk/apiprice-data}},
  url          = {https://apiprice.app}
}
```

If you cite an older snapshot, use its own date (`generated_at` in that commit's `data/prices.json`, as a UTC+8 date).

## Known limitations

- Tiered prices are reduced to the lowest tier. Cache-write, storage, batch and audio prices have no columns (see `tier_notes`).
- Announced future price changes are not in the price columns until they take effect. They appear in the site's change log as `scheduled`.
- Chinese cloud prices can depend on region. `region` is set where known.
- Free tiers, trial credits and coding plans are not per-token prices and are not here.
- `model_id` is the site's slug, not an API model string.
- The China-usability flags rest on provider docs plus one network test.
- No aggregator or reseller prices. Use the website for OpenRouter prices.

## Corrections

Email `data@apiprice.app` with a link to the official page.

## Placeholders

The sync replaces these in `README.md`, `README.zh.md` and `CITATION.bib`, using the `data/prices.json` it has just written. If a value can't be computed, the sync fails; it never writes a guess.

Tokens wrapped in backticks, like the ones in the table below, are documentation and must **not** be replaced. Match only unquoted tokens: ``(?<!`)\{\{(ROWS|MODELS|PROVIDERS|AS_OF|YEAR|SCHEMA_VERSION)\}\}(?!`)``. An unknown `{{…}}` name fails the sync.

| Placeholder | How it is computed | Example format |
|---|---|---|
| `{{ROWS}}` | `prices.length` in `data/prices.json` (must equal `count`) | `50` |
| `{{MODELS}}` | Number of distinct `model_id` in `prices[]` | `46` |
| `{{PROVIDERS}}` | Number of distinct `provider` in `prices[]` | `12` |
| `{{AS_OF}}` | `generated_at` converted to UTC+8, formatted `YYYY-MM-DD`. All dates in this repo (README, `CITATION.bib`, `CITATION.cff`, commit messages) use this same UTC+8 date | `2026-10-18` |
| `{{YEAR}}` | The first four characters of `{{AS_OF}}` | `2026` |
| `{{SCHEMA_VERSION}}` | `schema_version` in `data/prices.json` | `1.3.0` |

