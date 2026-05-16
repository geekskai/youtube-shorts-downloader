# P1 技术方案：Programmatic SEO（pSEO）闭环 + 增长型页面模板

**关联文档：** [PRD.md](./PRD.md) §7 Phase 1 / §8、§11–12、§14.3；前置 [TECH-SPEC-P0.md](./TECH-SPEC-P0.md)
**版本：** 1.0
**日期：** 2026-04-18
**目标读者：** 前端 / 全栈 / SEO 执行与 Code Review

---

## 1. 文档目的与 P1 边界

### 1.1 目的

在 **P0** 已交付 **`lib/fraction-math`** 与 **`/tools/fraction-to-decimal` 主工具** 的前提下，P1 实现 PRD 中的 **「长尾落地页 + 收录与内链闭环」**：可规模化、可监控、与计算器**同源数值**，避免薄内容与重复 URL。

### 1.2 P1 必须交付（对齐 PRD §14.3）

| 交付项 | 说明 |
|--------|------|
| **pSEO 落地页模板 v1** | 每页：首屏直接答案、**H1 对齐查询意图**、可访问的说明段落；**嵌入计算器且预填**当前分数。 |
| **首批批量 URL** | 建议 **50–200** 个高价值、**已约分**分数（可配置列表）；验证索引与 GSC 后再扩至 500+。 |
| **唯一 slug 规则** | 全站只认一种 URL 形态；非规范输入 **301 → 规范页** 或 **canonical only**（见 §4）。 |
| **Sitemap** | `app/sitemap.ts` **合并** pSEO URL；`lastModified` / `priority`（可选）可配置。 |
| **结构化数据** | 每页至少 **FAQPage**（问题与答案与页面强相关）；可选 **HowTo**（步骤少而真）。 |
| **站内内链** | 「相关分数」模块（同分母/邻分子等**确定性**规则）；链回 **主工具**、可选 **英寸工具**（意图说明）。 |
| **IndexNow** | 大批量上线后调用现有 `scripts/submit-indexnow.mjs`（或封装批量）。 |

### 1.3 P1 不包含（属 P2 / P3）

| 项 | 归属 |
|----|------|
| Time → Decimal、Hex、图表 PDF、Fraction/Decimal/Percent 三角 | **P2** 起 |
| 完整长除法动画、可打印作业生成 | **P2+** |
| 广告位策略 | 产品决策（PRD §13），P1 仅预留布局不破坏 CWV |

---

## 2. 前置依赖（P0 现状）

实施 P1 前需确认：

- `lib/fraction-math` 可输入 `(numerator, denominator)` 得到 **`mathParsedToConversion`** 一致的结果（或通过 `parseMathFractionInput("${n}/${d}")`）。
- 主工具路由：`/[locale]/tools/fraction-to-decimal`（默认 locale 无前缀规则与现有一致）。
- `messages/en.json` 中已有 `FractionToDecimal` 命名空间，pSEO 可 **扩展** 子 key（如 `pseo.*`），避免硬编码英文散落。

---

## 3. 信息架构与 URL 方案（必须拍板）

### 3.1 推荐路径（统一收敛到 `/tools`）

主工具：`/tools/fraction-to-decimal`（枢纽，无分数参数）。
pSEO hub：`/tools/as-a-decimal`。
pSEO 落地页：`/tools/as-a-decimal/[n]-[d]`（如 `/tools/as-a-decimal/3-8`）。

该方案的好处：

- 保留 `tools` 目录的信息架构，统一站内工具语义；
- slug 直接对齐搜索意图，适合 snippet / SERP 展示；
- 与主工具 slug `fraction-to-decimal` 明确区分，不复用同一路径层级。

### 3.2 仅收录「最简分数」

- 内部维护白名单：`{ numerator, denominator }` 均为正整数、`den > 0`，且 `gcd(n,d)=1`。
- 用户或爬虫访问 **非最简**（如 `6/16`）：**301 重定向**到 `/tools/as-a-decimal/3-8`，或在 P1 第一期仅返回 **canonical 指向规范页**（二选一；推荐 **301** 减少重复收录）。

### 3.3 带分数（可选 P1.1）

PRD 有 mixed number 需求。建议 **二期**再开 `/tools/mixed-[whole]-[n]-[d]-as-a-decimal` 或 query，避免 P1 组合爆炸。P1 以 **真分数/假分数的最简形式** 为主（如 `9/8` 单页，`1 1/8` 可跳转或 canonical 到同一有理数页——需产品与 SEO 一致）。

---

## 4. Next.js App Router 实现要点

### 4.1 路由与渲染

- 新增：`app/[locale]/tools/as-a-decimal/page.tsx` 作为 hub，`app/[locale]/tools/as-a-decimal/[slug]/page.tsx` 作为落地页。
- `slug` 使用 **`n-d`**（如 `3-8`），页面内部解析 slug → `(numerator, denominator)`，统一走 `lib/fraction-math` 做校验、约分、canonical 判定。
- **generateStaticParams**：仅返回白名单组合 → **SSG**，利于性能与可预测构建时间。
- 若名单 > 5k：考虑 **分批构建** 或 **ISR**（`revalidate`）+ 首波只静态生成 50–200。

### 4.2 `generateMetadata`

- **title**：如 `What is 3/8 as a decimal? | YoutubeShortDownloader`（模板 + 数值来自 `lib`）。
- **description**：含 **直接答案**（0.375）与前 155 字内自然语句。
- **canonical**：`en` → `https://youtubeshortdownloader.com/tools/as-a-decimal/3-8`；其它语言带 `/${locale}/`。
- **Open Graph**：可与主工具共用占位图或 pSEO 专用图（P1 可后补）。

### 4.3 页面结构（RSC + 客户端岛）

| 区域 | 实现 | 说明 |
|------|------|------|
| H1、首屏答案、简介段落 | **Server Component** | 利于 LCP；文案可 `next-intl` + 传参。 |
| FAQ 列表 | RSC 或同页 MDX | 每页可 **插值** `n,d,decimal`。 |
| 计算器 | **Client** `FractionConverter` **扩展 `initialInput`/`initialPrecision`** | 预填 `"3/8"`，满足 PRD「首击即意图」。 |
| 相关链接 | RSC | 纯链接，无状态。 |

### 4.4 与 `lib/fraction-math` 的单一数据源

- 页面展示的 **小数结果**、**是否循环** 文案：调用与主工具相同的 **`mathParsedToConversion`**（或导出 **`getFractionPageModel(n,d)`** 封装在 `lib/fraction-math/page-model.ts`），**禁止**在 TSX 里手写 `0.375`。
- 便于后续单元测试：对同一 `(n,d)`，主工具、pSEO、metadata **断言一致**。

---

## 5. 内容模板（防薄页）

每页至少包含 **不重复** 的模块（机器生成 + 模板句型轮换）：

1. **直接答案**（首屏，大字号）
2. **一句「如何计算」**（除法描述，非空泛）
3. **相关分数**（3–8 个内链）
4. **FAQ**（3–6 条，与 PRD §8.1 一致）
5. **指向主工具** +（可选）**英寸工具** 的一句话差异说明

可选 P1：「Step-by-step」折叠块（**简化版**：文字步骤，无动画）+ **HowTo** JSON-LD。

---

## 6. 结构化数据（JSON-LD）

| 类型 | P1 |
|------|-----|
| **FAQPage** | 每页 1 组；问题含「3/8」「decimal」等自然语言 |
| **BreadcrumbList** | Home → Tools →（可选中间）→ 当前页 |
| **HowTo** | 可选；步骤 2–4 条，与可见内容一致 |
| **WebApplication** | **不重复**堆叠：pSEO 页以 **FAQ + Article/WebPage** 为主即可，避免与主工具 **重复 SoftwareApplication** 造成噪音（需与 SEO 同学确认一种策略） |

原则：**页面可见内容 = Schema 可引用内容**，避免处罚。

---

## 7. Sitemap 与 IndexNow

### 7.1 `app/sitemap.ts`

- 在现有 `toolRoutes` 之外，**flatMap** pSEO 白名单 × `supportedLocales`（若多语言已开）。
- **P1 EN-only**：可只生成 `en` 的绝对 URL，其它 locale 待翻译与 hreflang 再开。
- `lastModified`：部署日或内容版本日（`CONTENT_VERSION` 变更时批量更新）。

### 7.2 IndexNow

- 上线批次后，将新 URL 列表送入 `scripts/submit-indexnow.mjs`（若脚本仅支持单批，扩展为读 `pseo-urls.json`）。

---

## 8. 国际化（i18n）

- **P1 默认**：仅 **`messages/en.json`** 增加 `FractionToDecimal.pseo.*` 模板字符串（含 `{numerator}` `{denominator}` `{decimal}`）。
- 其它 locale：**不生成 pSEO 路由** 或 `noindex` 直至翻译到位（避免机器翻译薄页）。
- **hreflang**：与现网 `alternates.languages` 策略一致；未翻译前仅 `en` + `x-default`。

---

## 9. 内链算法（可实现、可测）

输入：当前最简 `(n,d)`。输出：固定数量链接（如 6 个）：

- 同分母：`n±1/d`（若存在且最简且在白名单内）
- 同分子：`n/d±1`（边界校验）
- 「常见邻居」：预置表（如八分之一族 1/8…7/8）

所有链接指向 **pSEO 规范 URL**，而非主工具（主工具保留 **一个 CTA**）。

---

## 10. 数据与配置

| 资产 | 建议位置 | 说明 |
|------|----------|------|
| 白名单分数列表 | `data/pseo-fractions.ts` 或 `scripts/generated-fractions.json` | 构建时 `generateStaticParams` 读取 |
| SEO 句型模板 | `messages/en.json` | 插值生成 title/description |
| 版本戳 | 与主工具类似 `seoData.ts` 或共享 `CONTENT_VERSION` | 大改版时批量更新 lastmod |

---

## 11. 测试与验收

| 类型 | 内容 |
|------|------|
| **单元** | `getFractionPageModel(n,d)` 与 `parseMathFractionInput("${n}/${d}")` 结果一致 |
| **E2E（可选）** | 抽样访问 `/tools/as-a-decimal/3-8`，存在 H1、预填、canonical |
| **SEO** | Search Console：索引覆盖率；抽样 **富结果** 调试工具 |
| **性能** | Lighthouse：LCP、CLS；避免首屏大客户端包 |

---

## 12. 风险与缓解（对齐 PRD §12）

| 风险 | 缓解 |
|------|------|
| 薄内容 | 模板多样性 + 固定模块字数下限 + 内链 |
| 重复 URL | 仅最简 + 301/canonical |
| 数值不一致 | 唯一 `lib` 出口 + 单测 |
| 构建时间过长 | 分批 SSG 或 ISR |

---

## 13. 里程碑建议

| 阶段 | 内容 |
|------|------|
| **P1a** | 路由 + 1 个静态样例页（如 3/8）+ metadata + FAQ |
| **P1b** | 白名单 50–200 + `generateStaticParams` + sitemap |
| **P1c** | 内链模块 + IndexNow + GSC 监控 |
| **P1d** | 扩至 500+ 或引入 ISR；mixed number 策略 |

---

## 14. 任务清单（可拆 Issue）

- [ ] 确定最终 URL 方案（§3）并实现动态路由
- [ ] 实现 `getFractionPageModel`（或等价）封装 `lib/fraction-math`
- [ ] pSEO 页面 RSC 模板 + **预填** `FractionConverter` props
- [ ] 白名单数据与 `generateStaticParams`
- [ ] 非最简访问：301 或 canonical
- [ ] `generateMetadata` 模板与 `next-intl` 键
- [ ] FAQ + FAQPage JSON-LD；可选 HowTo
- [ ] 相关分数内链 + 主工具 / 英寸 CTA
- [ ] `sitemap.ts` 合并；IndexNow 批量
- [ ] 文档与发布说明（批次、日期、回滚方式）

---

## 15. 成功指标（对齐 PRD §11）

- 索引量随批次上升，无大面积 **已抓取 — 未编入索引（薄内容）**
- 展示量/点击量在 4–8 周内相对基线提升（具体数值产品定）
- 核心词抽样出现 **富摘要/FAQ**（不保证位次）

---

**文档结束。** 实施时与 [TECH-SPEC-P0.md](./TECH-SPEC-P0.md) 交叉检查：计算器行为与 pSEO **必须**同源。
