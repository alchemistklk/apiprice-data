#!/usr/bin/env node
// Regenerate data/prices.json + data/prices.csv from the live apiprice.app export,
// keeping ONLY official channels (official_cn, official_intl) and dropping
// OpenRouter-only fields. Also rewrites CITATION.cff version/date-released and renders
// templates/{README.md,README.zh.md,CITATION.bib} (if present) with the snapshot placeholders.
// Schema: the export's schema_version (1.2.0 or 1.3.0) is kept; an unknown version refuses (never drops fields silently).
// Dates: the snapshot date everywhere (CITATION.cff, placeholders, commit message) is generated_at as a UTC+8 date.
// Usage: node scripts/sync.mjs [--src URL_or_path] [--check]
//   --check : regenerate in memory and exit 1 if files would change (no write)
// No dependencies; Node >= 18 (global fetch).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const srcIdx = args.indexOf('--src');
const SRC = srcIdx >= 0 ? args[srcIdx + 1] : (process.env.APIPRICE_SRC || 'https://apiprice.app/data/prices.json');
const CHECK = args.includes('--check');

const OFFICIAL = new Set(['official_cn', 'official_intl']);
// Dataset fields (schema 1.2.0 export minus OpenRouter-only fields), in order.
export const FIELDS = [
  'model_id', 'model', 'provider', 'provider_model_id', 'channel', 'region', 'currency',
  'input_per_1m', 'output_per_1m', 'cached_per_1m',
  'off_peak_input_per_1m', 'off_peak_output_per_1m', 'off_peak_cached_per_1m', 'off_peak_hours',
  'tier_notes',
  'retired', 'retired_status', 'retired_shutdown', 'retired_replacement', 'retired_note',
  'retired_source_url', 'retired_verified_at',
  'verified', 'verified_at', 'check_method', 'stale', 'fetch_failed_reason', 'fetch_failed_at',
  'source_url', 'access_direct', 'access_alipay', 'access_real_name', 'access_overseas_card',
  'access_region_restricted', 'access_region_source', 'access_source_url', 'access_verified_at',
];
// 1.3.0 (machine-entry-spec §7.4): add-only, appended in this order. or_discount* are OpenRouter-only and not in the dataset.
export const FIELDS_130 = [...FIELDS,
  'provider_country', 'provider_country_source_url', 'provider_country_basis', 'provider_country_verified_at',
  'pending_recheck', 'pending_recheck_reasons', 'last_verified_date_utc8',
];
export const FIELDS_BY_VERSION = { '1.2.0': FIELDS, '1.3.0': FIELDS_130 };
export const COUNTRY_BASIS = ['terms_of_service', 'company_page', 'company_registry', 'third_party_reference'];
const OR_ONLY = /^(or_|quantized_min_|licensed_cloud_)/;
// generated_at -> UTC+8 calendar date (YYYY-MM-DD)
export const dateUtc8 = (iso) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return null; return new Date(t + 8 * 3600e3).toISOString().slice(0, 10); };
// Placeholders (Beacon's dataset docs): only unquoted tokens are replaced; an unknown {{NAME}} or an uncomputable value fails.
export const PLACEHOLDERS = ['ROWS', 'MODELS', 'PROVIDERS', 'AS_OF', 'YEAR', 'SCHEMA_VERSION'];
export function placeholderValues(out) {
  const rows = out.prices; if (!Array.isArray(rows) || rows.length !== out.count) throw new Error('placeholders: prices.length != count');
  const asOf = dateUtc8(out.generated_at); if (!asOf) throw new Error('placeholders: generated_at not a date');
  if (!out.schema_version) throw new Error('placeholders: no schema_version');
  return { ROWS: String(rows.length), MODELS: String(new Set(rows.map((r) => r.model_id)).size), PROVIDERS: String(new Set(rows.map((r) => r.provider)).size), AS_OF: asOf, YEAR: asOf.slice(0, 4), SCHEMA_VERSION: out.schema_version };
}
export function renderPlaceholders(text, vals) {
  const unknown = [...text.matchAll(/(?<!`)\{\{([A-Za-z_]+)\}\}(?!`)/g)].map((m) => m[1]).filter((k) => !PLACEHOLDERS.includes(k));
  if (unknown.length) throw new Error('placeholders: unknown ' + [...new Set(unknown)].map((k) => `{{${k}}}`).join(', '));
  return text.replace(/(?<!`)\{\{(ROWS|MODELS|PROVIDERS|AS_OF|YEAR|SCHEMA_VERSION)\}\}(?!`)/g, (m, k) => { if (vals[k] == null || vals[k] === '') throw new Error(`placeholders: no value for {{${k}}}`); return vals[k]; });
}

async function load(src) {
  if (/^https?:/.test(src)) {
    const r = await fetch(src, { headers: { 'user-agent': 'apiprice-data-sync/1' } });
    if (!r.ok) throw new Error(`fetch ${src}: HTTP ${r.status}`);
    return r.json();
  }
  return JSON.parse(fs.readFileSync(src, 'utf8'));
}

const die = (m) => { console.error('sync: ' + m); process.exit(2); };
if (!process.argv[1] || !fileURLToPath(import.meta.url).endsWith(path.basename(process.argv[1]))) { /* imported (tests): no side effects */ } else {
const live = await load(SRC);
const FIELDS_V = FIELDS_BY_VERSION[live.schema_version];
if (!FIELDS_V) die(`unexpected schema_version ${live.schema_version} (known: ${Object.keys(FIELDS_BY_VERSION).join(', ')}); update FIELDS/schema first`);
if (!Array.isArray(live.prices) || live.prices.length !== live.count) die('count mismatch in source export');
const srcKeys = new Set(live.prices.flatMap((p) => Object.keys(p)));
const missing = FIELDS_V.filter((f) => !srcKeys.has(f));
if (missing.length) die('source missing fields: ' + missing.join(','));
const unknown = [...srcKeys].filter((k) => !FIELDS_V.includes(k) && !OR_ONLY.test(k));
if (unknown.length) die('source has new non-OpenRouter fields not in FIELDS: ' + unknown.join(',') + ' (decide and bump schema)');

const rows = live.prices.filter((p) => OFFICIAL.has(p.channel)).map((p) => Object.fromEntries(FIELDS_V.map((f) => [f, p[f] ?? null])));
// validations
const ids = new Set();
for (const r of rows) {
  const id = `${r.model_id}:${r.channel}`;
  if (ids.has(id)) die('duplicate record ' + id);
  ids.add(id);
  if (!r.source_url || !r.verified_at || !r.currency) die('missing source_url/verified_at/currency on ' + id);
  if ((r.channel === 'official_cn') !== (r.currency === 'CNY')) die('currency/channel mismatch on ' + id);
  for (const f of FIELDS_V.filter((f) => f.endsWith('_per_1m'))) if (r[f] != null && !(typeof r[f] === 'number' && r[f] >= 0)) die(`bad ${f} on ${id}`);
  if (FIELDS_V === FIELDS_130) {
    // §7.4: a country without its source never enters the dataset; null country = all source fields null
    const src = [r.provider_country_source_url, r.provider_country_basis, r.provider_country_verified_at];
    if (r.provider_country != null ? src.some((v) => v == null) : src.some((v) => v != null)) die('provider_country / source fields inconsistent on ' + id);
    if (r.provider_country != null && (!/^[A-Z]{2}$/.test(r.provider_country) || !COUNTRY_BASIS.includes(r.provider_country_basis) || !/^\d{4}-\d{2}-\d{2}$/.test(r.provider_country_verified_at))) die('bad provider_country fields on ' + id);
    if (typeof r.pending_recheck !== 'boolean' || !Array.isArray(r.pending_recheck_reasons) || r.pending_recheck !== r.pending_recheck_reasons.length > 0) die('bad pending_recheck fields on ' + id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.last_verified_date_utc8 || '')) die('bad last_verified_date_utc8 on ' + id);
  }
}
if (rows.length === 0) die('0 official rows; refusing to write');

const out = {
  license: 'CC BY 4.0',
  license_url: 'https://creativecommons.org/licenses/by/4.0/',
  source: 'https://apiprice.app',
  source_export: SRC,
  dataset: 'apiprice-data',
  dataset_scope: 'official channels only (official_cn, official_intl); no third-party aggregators',
  schema_version: live.schema_version,
  usd_cny: live.usd_cny, // the site's FX, same as the website (no pinning)
  fx_verified_at: live.fx_verified_at,
  unit: live.unit,
  generated_at: live.generated_at,
  count: rows.length,
  ...(FIELDS_V === FIELDS_130 ? { recheck_days: live.recheck_days } : {}),
  notes: Object.fromEntries(Object.entries(live.notes || {}).filter(([k]) => k !== 'openrouter' && k !== 'or_discount')),
  prices: rows,
};
if (FIELDS_V === FIELDS_130 && !(Number.isInteger(out.recheck_days) && out.recheck_days > 0)) die('1.3.0 export without recheck_days');
const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [FIELDS_V.join(','), ...rows.map((r) => FIELDS_V.map((c) => esc(Array.isArray(r[c]) ? r[c].join(';') : r[c])).join(','))].join('\n') + '\n';
const json = JSON.stringify(out, null, 1) + '\n';

const snap = dateUtc8(live.generated_at); if (!snap) die('generated_at is not a date'); // UTC+8 date of the export
const cffPath = path.join(ROOT, 'CITATION.cff');
let cff = fs.existsSync(cffPath) ? fs.readFileSync(cffPath, 'utf8') : '';
cff = cff.replace(/^version: .*$/m, `version: "${snap}"`).replace(/^date-released: .*$/m, `date-released: "${snap}"`);

const targets = [['data/prices.json', json], ['data/prices.csv', csv], ['CITATION.cff', cff]];
// templates/<file> -> <file> with the snapshot placeholders (README.md, README.zh.md, CITATION.bib); no template = file untouched
let vals; try { vals = placeholderValues(out); } catch (e) { die(e.message); }
for (const rel of ['README.md', 'README.zh.md', 'CITATION.bib']) {
  const tp = path.join(ROOT, 'templates', rel); if (!fs.existsSync(tp)) continue;
  try { targets.push([rel, renderPlaceholders(fs.readFileSync(tp, 'utf8'), vals)]); } catch (e) { die(`${rel}: ${e.message}`); }
}
let changed = 0;
for (const [rel, body] of targets) {
  const p = path.join(ROOT, rel);
  const cur = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (cur === body) continue;
  changed++;
  if (!CHECK) fs.writeFileSync(p, body);
}
const by = {}; rows.forEach((r) => (by[r.channel] = (by[r.channel] || 0) + 1));
console.log(`sync: ${rows.length} official rows of ${live.count} (${JSON.stringify(by)}), models ${new Set(rows.map((r) => r.model_id)).size}, providers ${new Set(rows.map((r) => r.provider)).size}; generated_at ${live.generated_at}; ${changed} file(s) ${CHECK ? 'would change' : 'changed'}`);
if (CHECK && changed) process.exit(1);
}
