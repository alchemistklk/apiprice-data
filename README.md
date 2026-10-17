# apiprice.app LLM API Prices

> GitHub repository: [`alchemistklk/apiprice-data`](https://github.com/alchemistklk/apiprice-data) (public). No Hugging Face repository exists yet; the `apiprice/llm-api-prices` id below is a proposal only. Statistics were computed from the live export on **2026-10-17** (`generated_at` 2026-10-17T07:30:37.165Z UTC = 15:30 UTC+8), **filtered to official channels only** (48 of 113 live rows). License: **CC BY 4.0**.

A bilingual (English / 中文) dataset of large-language-model API prices, published by [apiprice.app](https://apiprice.app). Each row is **one model on one official purchase channel**: the provider's official China site (CNY) or the provider's official international site (USD). **v1 does not include third-party aggregators** (no OpenRouter or reseller rows). Every row carries the URL it was read from (`source_url`) and when it was read (`verified_at`). Each row also has per-channel flags for whether the channel is usable from mainland China (direct access, Alipay, real-name ID, overseas card), and each flag has its own source.

- Website: <https://apiprice.app/en/> · 中文: <https://apiprice.app/zh/>
- Methodology: <https://apiprice.app/en/methodology/>
- Live files: <https://apiprice.app/data/prices.json> · <https://apiprice.app/data/prices.csv> · <https://apiprice.app/llms.txt> · <https://apiprice.app/llms-full.txt>

## Coverage (as of 2026-10-17)

**Scope of v1:** only official channels — `official_intl` and `official_cn`. Third-party aggregators (including OpenRouter) are **not** included. Counts below are filtered from the live export on that day.

| | Count |
|---|---|
| Rows (model × channel prices) | **48** |
| Distinct models | **45** |
| Providers | **12** |
| Rows by channel | `official_intl` 25 · `official_cn` 23 |
| Rows by currency | USD 25 · CNY 23 |

| Provider | `provider` | HQ | Models | official_intl rows | official_cn rows |
|---|---|---|---|---|---|
| Google Gemini | `google` | US | 9 | 9 | 0 |
| xAI | `xai` | US | 6 | 6 | 0 |
| Alibaba Qwen (Model Studio) | `qwen` | CN | 5 | 0 | 5 |
| Anthropic | `anthropic` | US | 4 | 4 | 0 |
| Baidu ERNIE (Qianfan) | `baidu` | CN | 4 | 0 | 4 |
| ByteDance Doubao (Volcengine Ark) | `bytedance` | CN | 3 | 0 | 3 |
| Moonshot AI (Kimi) | `moonshot` | CN | 3 | 1 | 3 |
| OpenAI | `openai` | US | 3 | 3 | 0 |
| Zhipu GLM (Z.ai) | `zhipu` | CN | 3 | 0 | 3 |
| DeepSeek | `deepseek` | CN | 2 | 2 | 2 |
| MiniMax | `minimax` | CN | 2 | 0 | 2 |
| Tencent Hunyuan | `tencent` | CN | 1 | 0 | 1 |

Models by channel coverage:

| Channels with a price | Models |
|---|---|
| Official intl only | 22 |
| Official CN only | 20 |
| Official CN + official intl | 3 |

Four providers that appear only on aggregators on the live site (Mistral AI, Xiaomi MiMo, StepFun, NVIDIA) are not in this dataset.

The model list is curated (`data/catalog.json` in the site source). It is not every model each provider offers.

## Fields

The columns of `prices.csv` match the fields of each object in `prices.json → prices[]` (37 columns, schema 1.2.0). The live site export has 47 columns (the extra 10 are OpenRouter-only: `or_*`, `quantized_min_*`, `licensed_cloud_*`) and still includes aggregator rows. This repository drops those columns and keeps the 48 official rows. Machine-readable schema: `schema/prices.schema.json`.

| Field | Type | Unit / allowed values | Example | Notes |
|---|---|---|---|---|
| `model_id` | string | apiprice.app slug | `deepseek-v4.1-flash` | Stable key used on apiprice.app. **Not** necessarily the model string you send to the provider's API. |
| `model` | string | display name | `DeepSeek V4.1 Flash` | |
| `provider` | string | one of the 12 ids above | `deepseek` | |
| `provider_model_id` | string \| null | provider API model string | null | Not recorded yet (null on all rows); never guessed. |
| `channel` | string | `official_cn`, `official_intl` | `official_cn` | `official_cn` = provider's China site; `official_intl` = international site. Aggregator channels are not exported in v1. |
| `region` | string \| null | region id | `cn-beijing` | Cloud region the price applies to. Set on the 5 Qwen rows; null elsewhere. |
| `currency` | string | `CNY`, `USD` | `CNY` | The channel's native currency. Prices are **not** converted. |
| `input_per_1m` | number | currency per 1M input tokens | `2` | Uncached (cache-miss) input. Tiered pricing: lowest tier. Peak/off-peak: peak price. |
| `output_per_1m` | number | currency per 1M output tokens | `8` | Same tier rules as input. |
| `cached_per_1m` | number \| null | currency per 1M cached input tokens (cache read / hit) | `0.04` | Cache **write** prices are not in this column. `null` on 9 of the 48 official rows (all `official_cn`) where no cache-read price is recorded. |
| `off_peak_input_per_1m` | number \| null | currency per 1M | `1` | Off-peak input price. Only where the official page publishes off-peak prices (4 DeepSeek rows); null elsewhere. |
| `off_peak_output_per_1m` | number \| null | currency per 1M | `4` | Off-peak output price. |
| `off_peak_cached_per_1m` | number \| null | currency per 1M | `0.02` | Off-peak cached input price. |
| `off_peak_hours` | string \| null | free text | `Peak 01:00-04:00 and 06:00-10:00 UTC …` | Peak / off-peak window as published, with source. |
| `tier_notes` | string \| null | free text | `Cache write $5/MTok; batch -50%` | Tiers, cache-write prices, batch discounts, time-limited promotions. Null on 6 rows. |
| `retired` | boolean | `true`, `false` | `false` | `true` if this model name is retired, deprecated, or listed with an OpenRouter-only expiration. The row is kept but must not be ranked as cheapest. 2 of 48 official rows are `true` in this snapshot. |
| `retired_status` | string \| null | `retired`, `deprecated`, `openrouter_expiration`, null | `deprecated` | `retired` = vendor retired the name (may be served/billed as another model); `deprecated` = vendor announced a shutdown date; `openrouter_expiration` = only OpenRouter lists an expiration (no vendor notice). null when `retired=false`. |
| `retired_shutdown` | string \| null | date `YYYY-MM-DD` | `2026-11-18` | Announced shutdown / expiration date when known. |
| `retired_replacement` | string \| null | apiprice.app slug | `minimax-m3` | Recommended replacement `model_id` when the vendor names one. |
| `retired_note` | string \| null | free text | `MiniMax: M2.5/M2.7 close…` | Free-text note about retirement / deprecation. |
| `retired_source_url` | string \| null | URL | `https://platform.minimaxi.com/docs/guides/models-intro` | Official (or OpenRouter, for `openrouter_expiration`) source for the status. |
| `retired_verified_at` | string \| null | ISO 8601 timestamp | `2026-10-17T12:43:54+08:00` | When the retirement status was checked. |
| `verified` | boolean | `true` | `true` | `true` on all 48 official rows in this snapshot. |
| `verified_at` | string | ISO 8601 UTC timestamp | `2026-10-17T03:45:56.903Z` | When the price was read from `source_url`. |
| `check_method` | string | `auto`, `manual` | `auto` | `auto` = fetched by script (static HTML/API); `manual` = read by a person with a headless browser. 11 auto / 37 manual. |
| `stale` | boolean | `true`, `false` | `false` | true if `verified_at` is older than 7 days, the last fetch failed, or an announced price change took effect without re-verification. |
| `fetch_failed_reason` | string \| null | free text | null | Why the last fetch failed (last good price kept). |
| `fetch_failed_at` | string \| null | ISO 8601 UTC | null | When the last fetch failed. |
| `source_url` | string | URL | `https://api-docs.deepseek.com/zh-cn/quick_start/pricing` | Official pricing page for that channel. |
| `access_direct` | string \| null | `yes`, `no`, null | `yes` | Usable from mainland China without a proxy. null = **unverified** (shown as `?` on the site), not "no". |
| `access_alipay` | string \| null | `yes`, `no`, null | `yes` | Whether Alipay is accepted. |
| `access_real_name` | string \| null | `yes`, `no`, null | `yes` | Whether real-name / ID verification is required. |
| `access_overseas_card` | string \| null | `no`, null | `no` | Whether an overseas card is required. (No `yes` values today.) |
| `access_region_restricted` | string \| null | space-separated ISO 3166 codes, or null | null | Regions excluded by the provider's supported-regions list. null = not recorded (null on all 48 official rows in this snapshot). |
| `access_region_source` | string \| null | URL | null | Source for `access_region_restricted`. |
| `access_source_url` | string \| null | URL | `https://api-docs.deepseek.com/zh-cn/faq` | Source for the payment and ID flags. |
| `access_verified_at` | string \| null | date `YYYY-MM-DD` | `2026-10-17` | Date only, unlike `verified_at`. Null on 3 rows. |

Top-level keys of `prices.json`:

| Key | Value on 2026-10-17 |
|---|---|
| `license` | `CC BY 4.0` |
| `source` | `https://apiprice.app` |
| `schema_version` | `1.2.0` |
| `usd_cny` | 6.698464 |
| `fx_verified_at` | FX check time |
| `unit` | `per 1M tokens` |
| `generated_at` | export time |
| `count` | row count |
| `notes` | definitions of retired, null, off-peak, stale, check_method |
| `prices` | the rows |

This repository's `data/prices.json` also adds `license_url`, `source_export`, `dataset` and `dataset_scope`, and drops the OpenRouter note.

The CSV does **not** carry the FX rate or `generated_at`. Take them from the JSON.

## Update frequency

The site describes itself as updated daily, and the methodology page says the FX rate is refreshed daily. The update job (`npm run update`) re-reads the official pages (and, for the live site only, aggregator APIs), records diffs, and the site rebuild re-exports these files. After each site deploy, `scripts/sync.mjs` refreshes this public repository with official-channel rows only (see `scripts/SYNC.md`). Change history starts on **2026-10-17**, so there is no long history yet.

Each row's `verified_at` shows how fresh it is. On the website, rows not re-verified for 14 days are greyed out.

## Sources and verification

- **Official pages, static HTML:** OpenAI, Anthropic, DeepSeek (English and Chinese pages).
- **Official pages, headless Chrome:** Google, xAI, Alibaba Model Studio, Kimi, Zhipu, MiniMax, Baidu Qianfan, Tencent Hunyuan, Volcengine Ark.
- **Cross-check:** official rows are compared against [models.dev](https://models.dev) open data. A gap above 15 % is flagged, and the official page always wins. The cross-check result is not in the export yet.
- **FX:** `https://open.er-api.com/v6/latest/USD`. [Rates By Exchange Rate API](https://www.exchangerate-api.com) (attribution required by the provider's free API).
- **China-usability flags:** checked per channel against the provider's own docs and terms, and each flag links its source. The methodology page documents one mainland network test (Shanghai, China Unicom, 2026-10-17). Other ISPs were not tested.
- Prices without a trustworthy source are not published. For corrections, email `data@apiprice.app` with an official link.

The live site also tracks OpenRouter list prices; those rows are **excluded from this dataset** (v1 decision).

## Known limitations

- **Peak / off-peak.** DeepSeek charges less off-peak. The main price columns show the **peak** price; off-peak prices are in `off_peak_input_per_1m` / `off_peak_output_per_1m` / `off_peak_cached_per_1m` with the window in `off_peak_hours` (4 DeepSeek rows; null elsewhere).
- **Tiered pricing.** These tiers are reduced to the **lowest tier**:
  - long-context tiers (e.g. ≥200K tokens billed 2×)
  - Anthropic's ≤100K / >100K split
  - OpenAI long-context prices
  - Chinese per-request input-length tiers (e.g. "0 < tokens ≤ 1M", "input ≤ 32K")

  The tier notes are exported as free text in `tier_notes`.
- **Cache.** `cached_per_1m` is the cache-read (hit) price. Cache-write prices, storage fees and batch discounts (often −50 %) have no columns.
- **Scheduled changes.** Some official pages announce future prices (e.g. "until 2026-11-30, then …"). Rows list only the price in force when they were checked.
- **Modality.** Prices are for text input, and usually image and video input. Audio input is often priced differently (e.g. some Gemini models) and has no column.
- **Promotions vs list price.** Rows normally show the list price. When a page also shows a time-limited discount (e.g. a Qwen model shown "20 % off for a limited time"), `tier_notes` records it. Treat each row as the price we judged to be in force, and check `source_url` for current promotions.
- **No third-party aggregators.** v1 includes only `official_cn` and `official_intl`. OpenRouter and other reseller / relay prices are not in this dataset, even though the live site still shows them. Counts above are filtered accordingly (48 of 113 live rows on 2026-10-17).
- **Retired / deprecated names.** Rows with `retired=true` stay in the dataset with their last verified price. Do not treat them as the current cheapest option. In this snapshot: `gemini-3.1-flash-lite` (official_intl, deprecated, shutdown 2027-05-07) and `minimax-m2.7` (official_cn, deprecated, shutdown 2026-11-18).
- **Currency and FX.** `official_cn` rows are in CNY and are **not** converted. If you convert, use `usd_cny` from the same snapshot and say so. The site's "blended" price (0.75 × input + 0.25 × output, compared in USD) is not a column.
- **Region.** Chinese cloud prices can depend on the region (e.g. Alibaba "华北2（北京）"). The `region` column records it where known (`cn-beijing` on the 5 Qwen rows; null elsewhere).
- **Free tiers and credits.** Free models, trial credits and promotions are not per-token prices and are not in this table. See <https://apiprice.app/en/free/> and <https://apiprice.app/en/free-credits/>.
- **null means unknown.** In `access_*` fields, null means not verified (shown as `?` on apiprice.app). Do not read it as "no".
- **Model ids.** `model_id` is apiprice.app's slug, not the string you send to the provider's API.
- **Snapshot, not ground truth.** Providers change prices without notice. Always check `verified_at` and `source_url` before relying on a number.

## Usage

### curl

```bash
curl -sL https://apiprice.app/data/prices.json -o prices.json
curl -sL https://apiprice.app/data/prices.csv  -o prices.csv
# Official China-site prices with jq
jq -r '.prices[] | select(.channel=="official_cn") | [.model, .input_per_1m, .output_per_1m, .currency] | @tsv' prices.json
```

### pandas

```python
import json, urllib.request
import pandas as pd

df = pd.read_csv("https://apiprice.app/data/prices.csv")

# The FX rate is in the JSON header, not the CSV
meta = json.load(urllib.request.urlopen("https://apiprice.app/data/prices.json"))
fx = meta["usd_cny"]

to_usd = df["currency"].map({"USD": 1.0, "CNY": 1 / fx})
df["input_usd_per_1m"] = df["input_per_1m"] * to_usd
df["output_usd_per_1m"] = df["output_per_1m"] * to_usd
print(df.sort_values("input_usd_per_1m")[["model", "channel", "input_usd_per_1m"]].head(10))
```

### Hugging Face `datasets` (once the HF repo is published)

```python
from datasets import load_dataset

latest = load_dataset("apiprice/llm-api-prices", "latest", split="train")   # proposed repo id
df = latest.to_pandas()
```

## Citation

Please credit **apiprice.app** with the snapshot date and a link:

> apiprice.app (as of 2026-10-17). *LLM API Prices.* https://apiprice.app — CC BY 4.0

```bibtex
@misc{apiprice_llm_api_prices,
  author       = {{apiprice.app}},
  title        = {{apiprice.app LLM API Prices}},
  year         = {2026},
  note         = {Snapshot as of 2026-10-17. Licensed under CC BY 4.0},
  howpublished = {\url{https://apiprice.app/data/prices.json}},
  url          = {https://apiprice.app}
}
```

A machine-readable `CITATION.cff` is included. Change the date to the snapshot you used.

## License

Data: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may copy, redistribute and adapt it, including for commercial use, as long as you credit apiprice.app, link to the license and say what you changed.

The prices are facts published by the providers. The license covers apiprice.app's compilation: the selection, structure, verification metadata and access flags. It claims no rights over the providers' own pages or prices. Provider and model names are trademarks of their owners.

## Links

- Price table: <https://apiprice.app/en/> · 价格总表: <https://apiprice.app/zh/>
- Cheapest LLM API ranking: <https://apiprice.app/en/cheapest-llm-api/>
- LLM APIs usable from mainland China: <https://apiprice.app/en/china-llm-api/>
- Price changes: <https://apiprice.app/en/changes/> · RSS: <https://apiprice.app/en/rss.xml>
- Methodology: <https://apiprice.app/en/methodology/>
