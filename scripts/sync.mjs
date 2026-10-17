#!/usr/bin/env node
// Regenerate data/prices.json + data/prices.csv from the live apiprice.app export,
// keeping ONLY official channels (official_cn, official_intl) and dropping
// OpenRouter-only fields. Also rewrites CITATION.cff version/date-released.
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
const OR_ONLY = /^(or_|quantized_min_|licensed_cloud_)/;

async function load(src) {
  if (/^https?:/.test(src)) {
    const r = await fetch(src, { headers: { 'user-agent': 'apiprice-data-sync/1' } });
    if (!r.ok) throw new Error(`fetch ${src}: HTTP ${r.status}`);
    return r.json();
  }
  return JSON.parse(fs.readFileSync(src, 'utf8'));
}

const die = (m) => { console.error('sync: ' + m); process.exit(2); };
const live = await load(SRC);
if (live.schema_version !== '1.2.0') die(`unexpected schema_version ${live.schema_version} (expected 1.2.0); update FIELDS/schema first`);
if (!Array.isArray(live.prices) || live.prices.length !== live.count) die('count mismatch in source export');
const srcKeys = new Set(live.prices.flatMap((p) => Object.keys(p)));
const missing = FIELDS.filter((f) => !srcKeys.has(f));
if (missing.length) die('source missing fields: ' + missing.join(','));
const unknown = [...srcKeys].filter((k) => !FIELDS.includes(k) && !OR_ONLY.test(k));
if (unknown.length) die('source has new non-OpenRouter fields not in FIELDS: ' + unknown.join(',') + ' (decide and bump schema)');

const rows = live.prices.filter((p) => OFFICIAL.has(p.channel)).map((p) => Object.fromEntries(FIELDS.map((f) => [f, p[f] ?? null])));
// validations
const ids = new Set();
for (const r of rows) {
  const id = `${r.model_id}:${r.channel}`;
  if (ids.has(id)) die('duplicate record ' + id);
  ids.add(id);
  if (!r.source_url || !r.verified_at || !r.currency) die('missing source_url/verified_at/currency on ' + id);
  if ((r.channel === 'official_cn') !== (r.currency === 'CNY')) die('currency/channel mismatch on ' + id);
  for (const f of FIELDS.filter((f) => f.endsWith('_per_1m'))) if (r[f] != null && !(typeof r[f] === 'number' && r[f] >= 0)) die(`bad ${f} on ${id}`);
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
  usd_cny: live.usd_cny,
  fx_verified_at: live.fx_verified_at,
  unit: live.unit,
  generated_at: live.generated_at,
  count: rows.length,
  notes: Object.fromEntries(Object.entries(live.notes || {}).filter(([k]) => k !== 'openrouter')),
  prices: rows,
};
const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [FIELDS.join(','), ...rows.map((r) => FIELDS.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
const json = JSON.stringify(out, null, 1) + '\n';

const snap = String(live.generated_at).slice(0, 10); // UTC date of the export
const cffPath = path.join(ROOT, 'CITATION.cff');
let cff = fs.existsSync(cffPath) ? fs.readFileSync(cffPath, 'utf8') : '';
cff = cff.replace(/^version: .*$/m, `version: "${snap}"`).replace(/^date-released: .*$/m, `date-released: "${snap}"`);

const targets = [['data/prices.json', json], ['data/prices.csv', csv], ['CITATION.cff', cff]];
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
