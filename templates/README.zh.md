# apiprice.app 大模型 API 价格数据集

大模型 API 每百万 tokens 的价格，一行是「一个模型 × 一个购买渠道」。只收录各厂商的官方国内站（人民币）和官方国际站（美元）。**本数据集只含官方渠道价格，聚合商和中转商的价格（如 OpenRouter）不在其中。**

每一行都记录：

- 价格是从哪个页面读到的（`source_url`），什么时候读的（`verified_at`）；
- 这个渠道在中国大陆能不能用：直连、支付宝、实名、海外卡，每一项都附来源。

发布方：[apiprice.app](https://apiprice.app)。许可：**CC BY 4.0**。English: [README.md](README.md)。

**本快照截至 {{AS_OF}}（UTC+8）：**

- {{ROWS}} 行
- {{MODELS}} 个模型
- {{PROVIDERS}} 家厂商
- schema {{SCHEMA_VERSION}}

链接：

- 网站：<https://apiprice.app/zh/> · English：<https://apiprice.app/en/>
- 取价方法：<https://apiprice.app/zh/methodology/>
- 网站上的实时文件（含聚合商渠道，本数据集不收）：<https://apiprice.app/data/prices.json> · <https://apiprice.app/data/prices.csv> · <https://apiprice.app/data/changes.json>

## 文件

| 路径 | 内容 |
|---|---|
| `data/prices.json` | 最新快照：文件头（许可、schema 版本、汇率、导出时间）加 `prices[]` |
| `data/prices.csv` | 和 `prices.json → prices[]` 行、列顺序都相同。CSV 没有文件头信息，汇率和导出时间要看 JSON |
| `schema/prices.schema.json` | `data/prices.json` 的 JSON Schema |
| `scripts/sync.mjs` | 从网站实时导出重新生成 `data/`（Node ≥ 18，无依赖），见 `scripts/SYNC.md` |
| `CITATION.cff` / `CITATION.bib` | 引用信息。GitHub 根据 `CITATION.cff` 显示「Cite this repository」 |
| `LICENSE` | CC BY 4.0 法律文本 |

**价格历史**：在 git 里。每次同步是一个 commit（`data: sync YYYY-MM-DD …`），`git log -p data/prices.csv` 就能看到每次变化。仓库里没有单独的历史文件。网站的改价记录在 <https://apiprice.app/data/changes.json>。

## 覆盖范围

- **渠道**：只有 `official_intl`（厂商国际站，美元）和 `official_cn`（厂商国内站，人民币）。OpenRouter 等聚合商和中转商不在范围内，`data/prices.json` 的 `dataset_scope` 也写明了这一点。
- **厂商**：
  - 只有国际站：Anthropic、OpenAI、Google Gemini、xAI。
  - 两个站都有：DeepSeek、月之暗面 Kimi。
  - 只有国内站：阿里云百炼（通义千问）、智谱 GLM、MiniMax、百度千帆（文心）、字节火山方舟（豆包）、腾讯混元。
- **具体数量**：每个快照的具体数量见本页开头，也可以直接数 `data/prices.json`。
- **模型列表**：人工挑选，不是每家的全部模型。

## 怎么读一行

- **单位**：所有 `*_per_1m` 都是每百万 tokens 的价格，币种看 `currency`。
- **币种**：`official_cn` 是人民币，`official_intl` 是美元，都**不换算**。要跨币种比较，请用同一份 `prices.json` 里的 `usd_cny`，并注明是换算过的。
- **输入价**：`input_per_1m` 是未命中缓存的价格。
- **阶梯价**：按上下文长度或请求大小分档的，主价格取**最低一档**，其余档位写在 `tier_notes`。
- **峰谷价**：按时段计价的（目前是 DeepSeek），主价格取**高峰价**；空闲时段价格在 `off_peak_*`，时段在 `off_peak_hours`。
- **限时优惠**：官方渠道一律用**刊例价**，官方页上的限时折扣只写在 `tier_notes` 里。
- **null**：表示*未知或未核实*，不是「否」，也不是「免费」。网站上显示为 `?`。
- **已退役、弃用或已下架的模型**：`retired = true` 的行保留最后一次核实的价格，不能当成「最便宜」推荐。

## 字段（schema 1.2.0）

1.2.0 的字段。1.3.0 里这些字段全部保留、不变，新增字段见下文。

| 字段 | 类型 | 取值 / 单位 | 含义 |
|---|---|---|---|
| `model_id` | string | apiprice.app 的 slug，如 `deepseek-v4-pro-0813` | 网站上的稳定主键，**不一定**是调用 API 时传的模型名 |
| `model` | string | 显示名 | |
| `provider` | string | 厂商 id，如 `deepseek` | 模型的开发方，不是销售方 |
| `provider_model_id` | string \| null | | 厂商 API 里的模型名。暂未记录（null），不猜 |
| `channel` | string | `official_cn`、`official_intl` | 价格适用的渠道 |
| `region` | string \| null | 如 `cn-beijing` | 按地域定价的厂商（如阿里云百炼）才有，其他为 null |
| `currency` | string | `CNY`、`USD` | 渠道本身的币种 |
| `input_per_1m` | number | 币种 / 百万 tokens | 输入价（未命中缓存） |
| `output_per_1m` | number | 币种 / 百万 tokens | 输出价 |
| `cached_per_1m` | number \| null | 币种 / 百万 tokens | 缓存命中（读取）的输入价。缓存写入、存储费不在这一列，官方有公布的写在 `tier_notes`。null = 没有记录缓存命中价 |
| `off_peak_input_per_1m` | number \| null | 币种 / 百万 tokens | 空闲时段输入价，只有官方页公布了峰谷价的渠道才有 |
| `off_peak_output_per_1m` | number \| null | 币种 / 百万 tokens | 空闲时段输出价 |
| `off_peak_cached_per_1m` | number \| null | 币种 / 百万 tokens | 空闲时段缓存命中价 |
| `off_peak_hours` | string \| null | 文本 | 官方公布的高峰 / 空闲时段，附来源 |
| `tier_notes` | string \| null | 文本 | 档位、缓存写入价、Batch 折扣、音频价、限时优惠 |
| `retired` | boolean | | `true` = 型号已退役、弃用或已下架 |
| `retired_status` | string \| null | `retired`、`deprecated`、`openrouter_expiration` | `retired`：厂商已停用这个名字，请求可能由别的模型提供并计费。`deprecated`：厂商公布了下线日期。`openrouter_expiration`：只有 OpenRouter 标了到期日 |
| `retired_shutdown` | string \| null | `YYYY-MM-DD` | 公布的下线日期 |
| `retired_replacement` | string \| null | `model_id` | 厂商推荐的替代型号 |
| `retired_note` | string \| null | 文本 | |
| `retired_source_url` | string \| null | URL | 退役状态的来源 |
| `retired_verified_at` | string \| null | ISO 8601 | 退役状态的核实时间 |
| `verified` | boolean | | 价格是从 `source_url` 读到的 |
| `verified_at` | string | ISO 8601 UTC | 最后一次从 `source_url` 读到价格的时间 |
| `check_method` | string | `auto`、`manual` | `auto`：脚本读取（静态 HTML 或 API）。`manual`：人工用无头浏览器读取 |
| `stale` | boolean | | 满足任一条件为 `true`：`verified_at` 超过 7 天；最近一次抓取失败；公布的改价已生效但还没复核 |
| `fetch_failed_reason` | string \| null | 文本 | 最近一次抓取失败的原因（保留上一次成功的价格） |
| `fetch_failed_at` | string \| null | ISO 8601 UTC | 最近一次抓取失败的时间 |
| `source_url` | string | URL | 读到价格的官方价格页 |
| `access_direct` | string \| null | `yes`、`no`、null | 中国大陆不用代理能否直接使用 |
| `access_alipay` | string \| null | `yes`、`no`、null | 是否支持支付宝 |
| `access_real_name` | string \| null | `yes`、`no`、null | 是否需要实名认证 |
| `access_overseas_card` | string \| null | `yes`、`no`、null | 是否需要海外银行卡 |
| `access_region_restricted` | string \| null | 空格分隔的 ISO 3166-1 代码 | 厂商排除的地区。null = 未记录 |
| `access_region_source` | string \| null | URL | `access_region_restricted` 的来源 |
| `access_source_url` | string \| null | URL | 支付、实名几项的来源 |
| `access_verified_at` | string \| null | `YYYY-MM-DD` | 可用性几项的核实日期（只到日） |

### `data/prices.json` 文件头

| 键 | 含义 |
|---|---|
| `license`、`license_url` | `CC BY 4.0` 和许可链接 |
| `source` | `https://apiprice.app` |
| `source_export` | 本快照来自哪份导出 |
| `dataset`、`dataset_scope` | 数据集名称，以及保留了哪些渠道 |
| `schema_version` | {{SCHEMA_VERSION}} |
| `usd_cny` | 1 美元兑多少人民币，和网站同一次导出用的汇率相同 |
| `fx_verified_at` | `usd_cny` 对应的日期字段，即这个汇率的读取时间。格式是 UTC 的 ISO 8601 时间戳，如 `2026-10-18T00:00:19.633Z`，换成 UTC+8 日期是 2026-10-18。引用 `usd_cny` 时请一起写上这个日期 |
| `unit` | `per 1M tokens` |
| `generated_at` | 网站导出时间（ISO 8601 UTC） |
| `count` | `prices[]` 的行数 |
| `recheck_days` | （1.3.0）`verified_at` 超过多少天标为 `pending_recheck`（`14`） |
| `cite_as` | （1.3.0）本快照的纯文本引用格式（见下文「引用格式」） |
| `notes` | null、峰谷价、stale、check_method、retired 以及 1.3.0 字段的简短定义 |

## 1.3.0 起

`schema_version` 为 `1.3.0` 时（网站和本仓库）才有这些字段，更早的快照（1.2.0）没有。

1.3.0 **只新增字段**：1.2.0 每个字段的名称、类型、取值、含义都不变。新列加在每行末尾，顺序如下：

| 字段 | 类型 | 取值 | 含义 |
|---|---|---|---|
| `provider_country` | string \| null | ISO 3166-1 alpha-2，如 `CN`、`US` | 运营该厂商 API 服务的公司所在国，依据官方条款里的签约主体、官网公司页、公司登记信息；总部所在国这类无争议事实也可依据第三方资料。**核实不到就是 null**，网站显示 `?` |
| `provider_country_source_url` | string \| null | URL | 证明页面。只有 `provider_country` 为 null 时它才为 null |
| `provider_country_basis` | string \| null | `terms_of_service`、`company_page`、`company_registry`、`third_party_reference` | 来源类型 |
| `provider_country_verified_at` | string \| null | `YYYY-MM-DD` | 来源最后一次核实的日期 |
| `pending_recheck` | boolean | | 待复核。满足**任一**条件为 `true`：<br>· 构建时距最后核实超过 14 天<br>· 最近一次抓取失败<br>· 公布的改价已生效但还没复核<br>这一行照常列出，和网站上「待复核」标签同一个判定 |
| `pending_recheck_reasons` | 字符串列表 | `age`、`fetch_failed`、`scheduled_change` 的子集 | 待复核的原因。`pending_recheck` 为 false 时为空；CSV 里用 `;` 连接 |
| `last_verified_date_utc8` | string | `YYYY-MM-DD` | `verified_at` 换成 UTC+8 的日期，和网站上显示的日期相同 |

文件头新增 `recheck_days`（`14`，即构建时用的阈值）和 `cite_as`。`stale` 保持不变（7 天规则），只为兼容，建议改用 `pending_recheck`。

**「国产」怎么算**：

- 1.3.0 起，只有 `provider_country` 为 `CN`（即已核实、有来源）的厂商才算国产。
- `provider_country` 为 null 的厂商，既不算国产，也不算非国产。
- 1.3.0 之前数据集里没有国家字段，请不要自行推断。

## 取数方法

- **官方页**：每个价格都从厂商自己的价格页读取。静态 HTML 或 API 用脚本读，其余用无头浏览器读。读的是哪个页面就写在 `source_url`。
- **交叉核对**：官方价格和 [models.dev](https://models.dev) 的公开数据比对。差距超过 15% 时标记复查，以官方页为准。比对结果不导出。
- **汇率**：美元兑人民币取自 open.er-api.com（[Rates By Exchange Rate API](https://www.exchangerate-api.com)），每天更新。
- **抓取失败**：保留上一次成功的价格，并在 `fetch_failed_reason` / `fetch_failed_at` 写明原因。没有可信来源的价格不发布。
- **国内可用性**：各项都依据厂商自己的文档和条款，每一项都链接来源。大陆网络只实测过一次（上海联通，2026-10-17），其他运营商没有测。

## 更新频率

- **每天**：所有官方页每天读一次，在早上（UTC+8）。有些厂商的条款不允许更频繁的自动访问，所以官方价格至少每天更新一次，但不会更频繁。
- **更频繁的**：部分官方来源每几小时检查一次。
- **同步**：检查发现数据有变化时，网站重新构建并部署，随后本仓库从网站实时导出同步（`scripts/sync.mjs`）。没有变化的日子可能没有新 commit。

每一行的 `verified_at` 才是真正的新鲜度。

## 许可和署名

数据以 **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)** 发布：只要署名，就可以复制、分享、改编，包括商用。

- **最低署名要求**：「apiprice.app LLM API Prices，截至 YYYY-MM-DD，CC BY 4.0」，并附 <https://apiprice.app> 链接。
- **许可范围**：价格本身是各厂商公开的刊例价。许可覆盖的是本数据集的整理工作（挑选、核实、可用性标注和备注）。计费以厂商页面为准。
- **汇率**：来自 ExchangeRate-API 的免费接口。转发 `usd_cny` 时请保留他们的署名，并注明日期（`fx_verified_at`）。

## 引用格式（cite_as）

纯文本（`data/prices.json` 文件头的 `cite_as` 字段也是这段）：

> apiprice.app ({{YEAR}}). *apiprice.app LLM API Prices* [Data set], snapshot as of {{AS_OF}}, schema {{SCHEMA_VERSION}}. CC BY 4.0. https://github.com/alchemistklk/apiprice-data

在回答、帖子、图表里可以用简写：**「来源：apiprice.app（截至 {{AS_OF}}）」**，并附链接。

BibTeX（与 `CITATION.bib` 相同）：

```bibtex
@misc{apiprice_llm_api_prices,
  author       = {{apiprice.app}},
  title        = {{apiprice.app LLM API Prices}},
  year         = {{{YEAR}}},
  note         = {Snapshot as of {{AS_OF}} (UTC+8), schema {{SCHEMA_VERSION}}. Licensed under CC BY 4.0},
  howpublished = {\url{https://github.com/alchemistklk/apiprice-data}},
  url          = {https://apiprice.app}
}
```

如果引用的是更早的快照，用那个 commit 里 `data/prices.json` 的 `generated_at`，换成 UTC+8 的日期。

## 已知局限

- 阶梯价只取最低一档；缓存写入、存储、Batch、音频价格没有单独的列（见 `tier_notes`）。
- 公布的未来改价，生效前不进价格列；网站改价记录里类型为 `scheduled`。
- 国内云厂商的价格可能因地域不同，已知的写在 `region`。
- 免费额度、试用金、Coding Plan 不是按 token 计的价格，不在本数据集。
- `model_id` 是网站的 slug，不是 API 模型名。
- 国内可用性依据厂商文档，加一次网络实测。
- 不含聚合商和中转商的价格；OpenRouter 价格请看网站。

## 纠错

发邮件到 `data@apiprice.app`，请附官方页面链接。

## 占位符

同步脚本用刚写好的 `data/prices.json` 计算下面这些值，替换 `README.md`、`README.zh.md`、`CITATION.bib` 里的占位符。算不出来就同步失败，不写猜测值。

用反引号包住的占位符（比如下表里的）是说明文字，**不替换**。只匹配没有反引号的：``(?<!`)\{\{(ROWS|MODELS|PROVIDERS|AS_OF|YEAR|SCHEMA_VERSION)\}\}(?!`)``。遇到不认识的 `{{…}}` 名字，同步失败。

| 占位符 | 怎么算 | 格式示例 |
|---|---|---|
| `{{ROWS}}` | `data/prices.json` 里 `prices.length`（必须等于 `count`） | `50` |
| `{{MODELS}}` | `prices[]` 里不重复的 `model_id` 个数 | `46` |
| `{{PROVIDERS}}` | `prices[]` 里不重复的 `provider` 个数 | `12` |
| `{{AS_OF}}` | `generated_at` 换成 UTC+8 后的 `YYYY-MM-DD`。本仓库所有日期（README、`CITATION.bib`、`CITATION.cff`、commit 信息）都统一用这个 UTC+8 日期 | `2026-10-18` |
| `{{YEAR}}` | `{{AS_OF}}` 的前 4 位 | `2026` |
| `{{SCHEMA_VERSION}}` | `data/prices.json` 的 `schema_version` | `1.3.0` |

