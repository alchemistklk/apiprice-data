# apiprice.app 大模型 API 价格数据集

> GitHub 仓库：[`alchemistklk/apiprice-data`](https://github.com/alchemistklk/apiprice-data)（公开）。Hugging Face 仓库尚不存在；下文的 `apiprice/llm-api-prices` 只是建议名。统计数字按 **2026-10-17** 的线上导出实际计算（`generated_at` 为 2026-10-17T07:30:37.165Z，即 UTC+8 15:30），并**只保留官网渠道**（113 行里筛出 48 行）。许可证：**CC BY 4.0**。

这是 [apiprice.app](https://apiprice.app) 发布的中英双语大模型 API 价格数据集。每一行是**一个模型在一个官方购买渠道上的价格**：厂商国内官网（人民币）或厂商国际官网（美元）。**第一版不含第三方聚合渠道**（不含 OpenRouter，也不含中转站）。每行都带价格出处（`source_url`）和核实时间（`verified_at`）。每行还按渠道标了国内可用性：能否直连、能否用支付宝、是否要实名、是否要海外卡，每一项都有自己的来源。

- 网站：<https://apiprice.app/zh/> · English: <https://apiprice.app/en/>
- 数据方法论：<https://apiprice.app/zh/methodology/>
- 线上文件：<https://apiprice.app/data/prices.json> · <https://apiprice.app/data/prices.csv> · <https://apiprice.app/llms.txt> · <https://apiprice.app/llms-full.txt>

## 覆盖范围（截至 2026-10-17）

**第一版范围：** 只含官网渠道（`official_intl`、`official_cn`）。**不含**第三方聚合渠道（含 OpenRouter）。下表数字是从当天线上导出过滤后实际算出来的。

| | 数量 |
|---|---|
| 价格记录（模型 × 渠道） | **48** |
| 模型 | **45** |
| 厂商 | **12** |
| 按渠道 | `official_intl` 25 · `official_cn` 23 |
| 按币种 | USD 25 · CNY 23 |

| 厂商 | `provider` | 总部 | 模型数 | 国际官网 | 国内官网 |
|---|---|---|---|---|---|
| Google Gemini | `google` | 美国 | 9 | 9 | 0 |
| xAI | `xai` | 美国 | 6 | 6 | 0 |
| 阿里云百炼 通义千问 | `qwen` | 中国 | 5 | 0 | 5 |
| Anthropic | `anthropic` | 美国 | 4 | 4 | 0 |
| 百度 文心 ERNIE（千帆） | `baidu` | 中国 | 4 | 0 | 4 |
| 字节跳动 豆包（火山方舟） | `bytedance` | 中国 | 3 | 0 | 3 |
| 月之暗面 Kimi | `moonshot` | 中国 | 3 | 1 | 3 |
| OpenAI | `openai` | 美国 | 3 | 3 | 0 |
| 智谱 GLM（Z.ai） | `zhipu` | 中国 | 3 | 0 | 3 |
| 深度求索 DeepSeek | `deepseek` | 中国 | 2 | 2 | 2 |
| MiniMax 稀宇科技 | `minimax` | 中国 | 2 | 0 | 2 |
| 腾讯混元 | `tencent` | 中国 | 1 | 0 | 1 |

按渠道看模型覆盖：

| 有价格的渠道 | 模型数 |
|---|---|
| 只有国际官网 | 22 |
| 只有国内官网 | 20 |
| 国内官网 + 国际官网 | 3 |

线上站点还有 4 家厂商只有聚合渠道价格（Mistral AI、小米 MiMo、阶跃星辰、英伟达），不在本数据集里。

模型列表是人工挑选的（站点源码里的 `data/catalog.json`），不是各厂商的全部模型。

## 字段

`prices.csv` 的列和 `prices.json → prices[]` 里每个对象的字段一一对应（37 列，schema 1.2.0）。线上站点导出仍是 47 列（多出来的 10 列是 OpenRouter 专用：`or_*`、`quantized_min_*`、`licensed_cloud_*`），且还含聚合渠道行。本仓库去掉那 10 列，只保留 48 行官网价格。机器可读 schema：`schema/prices.schema.json`。

| 字段 | 类型 | 单位 / 取值 | 示例 | 说明 |
|---|---|---|---|---|
| `model_id` | string | apiprice.app 内部标识 | `deepseek-v4.1-flash` | 站内稳定主键，**不一定**是调用厂商 API 时传的模型名 |
| `model` | string | 显示名 | `DeepSeek V4.1 Flash` | |
| `provider` | string | 上表 12 个 id 之一 | `deepseek` | |
| `provider_model_id` | string \| null | 厂商 API 模型名 | null | 尚未录入（本快照全部为 null）；从不臆造 |
| `channel` | string | `official_cn`、`official_intl` | `official_cn` | `official_cn` = 国内官网；`official_intl` = 国际官网。聚合渠道不在第一版导出里 |
| `region` | string \| null | 地域 id | `cn-beijing` | 价格适用的云地域。5 行通义千问有值，其余为 null |
| `currency` | string | `CNY`、`USD` | `CNY` | 渠道原币种，**没有换算** |
| `input_per_1m` | number | 每百万输入 token 的价格（原币种） | `2` | 未命中缓存的输入价。分档计价取最低档，峰谷价取高峰价 |
| `output_per_1m` | number | 每百万输出 token 的价格 | `8` | 分档规则同上 |
| `cached_per_1m` | number \| null | 每百万缓存命中输入 token 的价格 | `0.04` | 只是缓存**读取**价，不含缓存写入价。48 行官网价格里有 9 行为 null（全是 `official_cn`），表示没有记录缓存价 |
| `off_peak_input_per_1m` | number \| null | 每百万 token | `1` | 闲时输入价。仅官网公布峰谷价时填写（4 行 DeepSeek）；其余为 null |
| `off_peak_output_per_1m` | number \| null | 每百万 token | `4` | 闲时输出价 |
| `off_peak_cached_per_1m` | number \| null | 每百万 token | `0.02` | 闲时缓存命中价 |
| `off_peak_hours` | string \| null | 自由文本 | `Peak 01:00-04:00 and 06:00-10:00 UTC …` | 高峰 / 闲时窗口（按官网原文），并附来源 |
| `tier_notes` | string \| null | 自由文本 | `Cache write $5/MTok; batch -50%` | 分档、缓存写入价、批量折扣、限时促销。6 行为 null |
| `retired` | boolean | `true`、`false` | `false` | 该模型名已退役、已弃用，或仅 OpenRouter 标明到期时为 `true`。行会保留，但不得当作当前最低价排名。本快照 48 行官网价格里有 2 行为 `true`。 |
| `retired_status` | string \| null | `retired`、`deprecated`、`openrouter_expiration`、null | `deprecated` | `retired` = 厂商退役了该名称（可能仍按另一型号计费）；`deprecated` = 厂商已公告下线日期；`openrouter_expiration` = 只有 OpenRouter 标了到期（无厂商公告）。`retired=false` 时为 null。 |
| `retired_shutdown` | string \| null | 日期 `YYYY-MM-DD` | `2026-11-18` | 已知的下线 / 到期日期 |
| `retired_replacement` | string \| null | apiprice.app 内部标识 | `minimax-m3` | 厂商建议的替代型号 `model_id`（有则填写） |
| `retired_note` | string \| null | 自由文本 | `MiniMax: M2.5/M2.7 close…` | 退役 / 弃用说明 |
| `retired_source_url` | string \| null | URL | `https://platform.minimaxi.com/docs/guides/models-intro` | 退役状态的来源（`openrouter_expiration` 时可能是 OpenRouter） |
| `retired_verified_at` | string \| null | ISO 8601 时间 | `2026-10-17T12:43:54+08:00` | 退役状态的核实时间 |
| `verified` | boolean | `true` | `true` | 本快照的 48 行官网价格都是 `true` |
| `verified_at` | string | ISO 8601 UTC 时间 | `2026-10-17T03:45:56.903Z` | 从 `source_url` 读到这个价格的时间 |
| `check_method` | string | `auto`、`manual` | `auto` | `auto` = 脚本抓取（静态 HTML/API）；`manual` = 人工用无头浏览器读。11 行 auto / 37 行 manual |
| `stale` | boolean | `true`、`false` | `false` | `verified_at` 超过 7 天、上次抓取失败、或已公告调价生效但尚未重新核实，则为 true |
| `fetch_failed_reason` | string \| null | 自由文本 | null | 上次抓取失败原因（仍保留上次成功价格） |
| `fetch_failed_at` | string \| null | ISO 8601 UTC | null | 上次抓取失败时间 |
| `source_url` | string | URL | `https://api-docs.deepseek.com/zh-cn/quick_start/pricing` | 该渠道的官方价格页 |
| `access_direct` | string \| null | `yes`、`no`、null | `yes` | 大陆能否不经代理直接使用。null = **未核实**（页面上显示为 `?`），不等于"否" |
| `access_alipay` | string \| null | `yes`、`no`、null | `yes` | 能否用支付宝付款 |
| `access_real_name` | string \| null | `yes`、`no`、null | `yes` | 是否要求实名认证 |
| `access_overseas_card` | string \| null | `no`、null | `no` | 是否必须用海外卡（目前没有 `yes`） |
| `access_region_restricted` | string \| null | 空格分隔的 ISO 3166 代码，或 null | null | 厂商支持地区列表里排除的地区。null = 未记录（本快照 48 行全部为 null） |
| `access_region_source` | string \| null | URL | null | `access_region_restricted` 的来源 |
| `access_source_url` | string \| null | URL | `https://api-docs.deepseek.com/zh-cn/faq` | 支付、实名等标志的来源 |
| `access_verified_at` | string \| null | 日期 `YYYY-MM-DD` | `2026-10-17` | 只有日期，和 `verified_at` 格式不同。有 3 行为 null |

`prices.json` 的顶层字段：

| 字段 | 2026-10-17 的值 |
|---|---|
| `license` | `CC BY 4.0` |
| `source` | `https://apiprice.app` |
| `schema_version` | `1.2.0` |
| `usd_cny` | 6.698464 |
| `fx_verified_at` | 汇率核实时间 |
| `unit` | `per 1M tokens` |
| `generated_at` | 导出时间 |
| `count` | 行数 |
| `notes` | retired、null、闲时价、stale、check_method 的定义 |
| `prices` | 数据行 |

本仓库的 `data/prices.json` 还会加上 `license_url`、`source_export`、`dataset`、`dataset_scope`，并去掉 OpenRouter 相关说明。

CSV 里**没有**汇率和 `generated_at`，需要时从 JSON 取。

## 更新频率

网站自称每日更新，方法论页也写着汇率每天刷新。更新脚本（`npm run update`）会重新读取各家官网（线上站点还会读聚合渠道 API），并记录差异；网站重新构建时导出这些文件。每次站点部署后，用 `scripts/sync.mjs` 把官网渠道行同步到本公开仓库（见 `scripts/SYNC.md`）。变动记录从 **2026-10-17** 开始，还没有长期历史。

每行有多新，看它的 `verified_at`。网站上超过 14 天没重新核实的行会显示成灰色。

## 数据来源与核实方式

- **官网静态 HTML**：OpenAI、Anthropic、DeepSeek（中英文页面）。
- **官网无头浏览器（Chrome）**：Google、xAI、阿里云百炼、Kimi、智谱、MiniMax、百度千帆、腾讯混元、火山方舟。
- **交叉核对**：官网价格会和 [models.dev](https://models.dev) 开放数据比对，差距超过 15% 就标记出来，以官网为准。核对结果暂时没有导出。
- **汇率**：`https://open.er-api.com/v6/latest/USD`。
- **国内可用性**：逐个渠道对照厂商自己的文档和条款核实，每个标志都附来源链接。方法论页记录了一次大陆网络实测（2026-10-17，上海联通），其他运营商没测。
- 没有可信来源的价格不发布。纠错请发邮件到 `data@apiprice.app`，附上官方链接。

线上站点还会跟踪 OpenRouter 标价；那些行**不在本数据集里**（第一版的决定）。

## 已知局限

- **峰谷价**：DeepSeek 闲时更便宜。主价格列是**高峰价**；闲时价在 `off_peak_input_per_1m` / `off_peak_output_per_1m` / `off_peak_cached_per_1m`，窗口在 `off_peak_hours`（4 行 DeepSeek；其余为 null）。
- **分档计价**：下面这些分档都只取**最低档**：
  - 长上下文分档（如 ≥200K 按 2 倍计费）
  - Anthropic 的 ≤100K / >100K
  - OpenAI 的长上下文价
  - 国内按单次输入长度分档（如"0<Token≤1M""输入≤32K"）

  分档说明以自由文本写在 `tier_notes`。
- **缓存**：`cached_per_1m` 是缓存命中（读取）价。缓存写入价、存储费、批量推理折扣（常见五折）都没有对应的列。
- **已公告的调价**：有些官网已经公告了以后的价格（如"2026-11-30 前……之后……"），表里只有核实时正在生效的价格。
- **模态**：价格按文本输入算，通常也包括图片和视频。音频输入经常另外定价（如部分 Gemini 模型），没有对应的列。
- **促销价和刊例价**：一般列刊例价。页面上另有限时折扣时（例如某个通义千问模型显示"限时 8 折"），`tier_notes` 会记下来。每行应理解为"我们判断当时生效的价格"，最新促销请看 `source_url`。
- **不含第三方聚合渠道**：第一版只含 `official_cn` 和 `official_intl`。OpenRouter 以及其他中转站 / 代理商的价格都不在本数据集里（线上站点仍会展示）。上面的统计是过滤后的结果（2026-10-17 线上 113 行里筛出 48 行）。
- **退役 / 弃用型号**：`retired=true` 的行仍保留上次核实的价格，不要把它们当成当前最低价。本快照：`gemini-3.1-flash-lite`（official_intl，deprecated，下线 2027-05-07）和 `minimax-m2.7`（official_cn，deprecated，下线 2026-11-18）。
- **币种和汇率**：国内官网行是人民币，**没有换算**。要换算的话，请用同一份快照里的 `usd_cny`，并注明换算过。网站上的"综合价"（0.75 × 输入 + 0.25 × 输出，按美元比较）不在数据里。
- **地域**：国内云厂商的价格可能跟地域有关（如阿里云"华北2（北京）"）。已知时写在 `region` 列（5 行通义千问为 `cn-beijing`；其余为 null）。
- **免费额度**：免费模型、试用额度和优惠活动不是按 token 计价，不在这张表里。见 <https://apiprice.app/zh/free/> 和 <https://apiprice.app/zh/free-credits/>。
- **null 表示未知**：`access_*` 字段里的 null 是未核实（页面上显示为 `?`），不要当成"否"。
- **模型标识**：`model_id` 是 apiprice.app 的内部标识，不是调用 API 时传的模型名。
- **这是快照**：厂商可能随时调价。用某个数字之前，请先看它的 `verified_at` 和 `source_url`。

## 用法

### curl

```bash
curl -sL https://apiprice.app/data/prices.json -o prices.json
curl -sL https://apiprice.app/data/prices.csv  -o prices.csv
# 用 jq 列出国内官网价格
jq -r '.prices[] | select(.channel=="official_cn") | [.model, .input_per_1m, .output_per_1m, .currency] | @tsv' prices.json
```

### pandas

```python
import json, urllib.request
import pandas as pd

df = pd.read_csv("https://apiprice.app/data/prices.csv")

# 汇率在 JSON 顶层，CSV 里没有
meta = json.load(urllib.request.urlopen("https://apiprice.app/data/prices.json"))
fx = meta["usd_cny"]

to_usd = df["currency"].map({"USD": 1.0, "CNY": 1 / fx})
df["input_usd_per_1m"] = df["input_per_1m"] * to_usd
df["output_usd_per_1m"] = df["output_per_1m"] * to_usd
print(df.sort_values("input_usd_per_1m")[["model", "channel", "input_usd_per_1m"]].head(10))
```

### Hugging Face `datasets`（HF 仓库发布后可用）

```python
from datasets import load_dataset

latest = load_dataset("apiprice/llm-api-prices", "latest", split="train")   # 建议的仓库名
df = latest.to_pandas()
```

## 引用

请注明 **apiprice.app** 和快照日期，并附上链接：

> apiprice.app（截至 2026-10-17）. *LLM API Prices.* https://apiprice.app — CC BY 4.0

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

仓库里另有机器可读的 `CITATION.cff`。引用时把日期改成你实际用的那份快照的日期。

## 许可证

数据采用[知识共享署名 4.0 国际许可协议（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)。可以复制、转发、改编，也可以商用，条件是注明来源 apiprice.app、附上许可证链接，并说明改了什么。

价格本身是厂商公开的事实。许可证覆盖的是 apiprice.app 的整理成果，包括选取、结构、核实信息和可用性标注，不主张对厂商页面或价格本身的任何权利。厂商和模型名称是各自所有者的商标。

## 相关链接

- 价格总表：<https://apiprice.app/zh/> · Price table: <https://apiprice.app/en/>
- 最便宜的大模型 API：<https://apiprice.app/zh/cheapest-llm-api/>
- 国内可直连的大模型 API：<https://apiprice.app/zh/china-llm-api/>
- 价格变动：<https://apiprice.app/zh/changes/> · RSS：<https://apiprice.app/zh/rss.xml>
- 数据方法论：<https://apiprice.app/zh/methodology/>
