# P0 技术方案：分数 ↔ 小数（抽象数学）+ 共享数学库 + SEO 信息架构

**关联文档：** [PRD.md](./PRD.md) §14.2 P0、§7 Phase A、§9–10
**版本：** 1.1
**日期：** 2026-04-18
**目标读者：** 前端 / 全栈执行开发与 Code Review

---

## 1. P0 范围（本方案交付边界）

### 1.1 必须交付

| 项 | 说明 |
|----|------|
| **共享数学库** | 从现有 `convert-inches-to-decimal/utils/fractionParser.ts` 中抽出**与英寸无关**的解析与运算，供「英寸工具」与「抽象分数工具」共用。 |
| **新工具：抽象分数 ↔ 小数** | 独立路由与 UI，语义为**纯数学**（非「英寸」）；支持真分数、假分数、带分数输入；结果数学正确、约分一致。 |
| **信息架构与 SEO 基础** | 唯一 `title` / `description` / `canonical`；与 `convert-inches-to-decimal` 的文案与结构化数据**区分意图**（数学 vs 测量）。 |
| **性能体验** | Answer-first 布局；首屏可交互路径短；避免阻塞主线程的重计算；符合 PRD 对 CWV 的期望（具体指标见 §8）。 |

### 1.2 明确不在 P0

- **Programmatic SEO（pSEO）** 的**批量落地页**、**动态/静态路由工厂**、**sitemap 批量注入**、**首批 50–200+ URL 上线**（在 PRD 中属 **P1**，见 [PRD.md](./PRD.md) §7 Phase B、§14.3）。
- Time → Decimal、Hex、可打印 PDF 图表（**P2/P3**）。
- 长除法逐步动画、分数圆环可视化（可 P1+）。

### 1.3 Programmatic SEO（pSEO）与 P0 的关系

PRD 将 **pSEO** 作为核心增长手段，但**落地实现放在 P1**，原因是：必须先有 **单一可信的数学结果来源**（`lib/fraction-math`）和 **主工具页**（`fraction-to-decimal`）作为「枢纽」，批量页面才有统一答案与内链锚点；否则会出现**薄内容 + 结果与计算器不一致**的双重风险。

本 P0 文档**不**包含 pSEO 的完整技术设计，但要求 P0 **为 P1 pSEO 预留衔接**，避免返工：

| 衔接点 | P0 应做到的事 | 到 P1 pSEO 时的用途 |
|--------|----------------|---------------------|
| **计算内核** | 所有「某分数的小数值」只来自 `lib/fraction-math`（或对其的薄封装） | `generateMetadata` / 页面正文 / 预填组件**同源**，避免手写死数 |
| **元数据模式** | 主工具 `layout.tsx` 已建立 canonical、OG、JSON-LD 模式 | 复制为 **pSEO 模板** 的 `generateMetadata({ params })` |
| **路由命名空间** | 主工具 slug 固定为 `fraction-to-decimal`（或团队最终选定 slug） | pSEO 建议走 `.../tools/[num]-[den]-as-a-decimal` 这类独立 slug，避免与主工具页抢 canonical（具体 URL 规则在 **P1 专项**里定） |
| **内容块** | 主工具已有 Answer-first、FAQ 可选 | pSEO 模板扩展：**H1 + 首屏答案 + 相关分数内链**；FAQ/Schema 与 PRD §8 一致 |
| **构建与索引** | — | P1：`app/sitemap.ts` 合并 pSEO URL；IndexNow 批量提交；`generateStaticParams` 或 ISR 策略选型 |

**结论：** P0 = **计算器 + 共享库 + 单页 SEO 基线**；**pSEO = P1 里程碑**。若产品坚持在 P0 内「先上一页验证」，可接受 **仅 1 条** 静态或动态 pSEO **Proof-of-concept**（例如固定 `3/8`），但必须复用 `lib/fraction-math` 与同一 metadata 组件，且**不**替代 P1 的规模化与 sitemap 设计。

### 1.4 P1 pSEO 技术要点（备忘，不在 P0 实施）

以下留给 **P1 技术方案** 展开，此处仅列标题级提醒：

- **URL 与去重：** 约定「最简分数」唯一 slug（如 `3/8` 与 `6/16` 是否 301/ canonical 到同一页）。
- **渲染策略：** SSG（`generateStaticParams`）vs SSR vs ISR；批量数量与构建时间权衡。
- **薄页防控：** 每页独有段落/相关链接/FAQ；与 PRD §12 风险一致。
- **hreflang：** 若 pSEO 先上 EN，其它 locale 的生成顺序。

---

## 2. 现状与差距

### 2.1 已有实现（英寸工具）

- 路径：`app/[locale]/tools/convert-inches-to-decimal/`
- `fractionParser.ts`：`parseFractionalInput` 会去掉 `inches`、`"` 等单位字符，并包含**英寸业务**相关的 `COMMON_FRACTIONS`、`findCommonEquivalents`（32 分母等）。
- `converter.ts`：`convertFractionToDecimal`、`convertDecimalToFractionResult`、标尺相关 `generateRulerMarks` 等。
- `layout.tsx`：`generateMetadata` + 多段 JSON-LD（`WebApplication`、`FAQPage`、`BreadcrumbList` 等），canonical 规则：`en` 为 `https://youtubeshortdownloader.com/tools/{slug}`，其它语言为 `https://youtubeshortdownloader.com/{locale}/tools/{slug}`。

### 2.2 差距（PRD P0）

- 无**仅数学语义**的独立工具页面。
- 数学逻辑与英寸逻辑**耦合在同一文件**，后续 pSEO 与第三工具会复制粘贴，风险高。

### 2.3 与 pSEO 的差距（属 P1）

- 尚无**按分数维度批量生成**的页面与 sitemap 条目；见 §1.3、§1.4。

---

## 3. 总体架构

```
                    ┌─────────────────────────────┐
                    │   lib/fraction-math (新建)   │
                    │   纯函数、无 React、无 i18n  │
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ inches 工具         │  │ fraction-to-decimal │  │ 未来：pSEO / 其它   │
│ 薄适配层：strip 单位 │  │ 薄适配层：仅数学文案 │  │ import 同库        │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

**原则：** `lib/fraction-math` 只做**可测试的纯函数**；国际化、metadata、Schema 只在 `app/` 与 message 文件里处理。

---

## 4. 目录与文件规划

### 4.1 新建：`lib/fraction-math/`

建议文件（可按实现微调命名，但职责需清晰）：

| 文件 | 职责 |
|------|------|
| `gcd.ts` | `gcd(a,b)`（已有算法可从 `fractionParser` 迁移）。 |
| `rational.ts` | 最简分数 `(num, den)`、假分数与带分数互转、禁止 `den===0`。 |
| `parse-math-input.ts` | 解析用户字符串：`3/8`、`1 1/2`、`1-1/2`、可选纯小数输入模式；**不** strip `inch`（由调用方决定预处理）。 |
| `convert.ts` | `fractionStringToDecimalValue`、带精度/格式的 `formatDecimal`（可与现 `formatDecimal` 对齐）。 |
| `types.ts` | `ParsedMathFraction`、`MathConversionResult` 等轻量类型。 |
| `index.ts` | 对外 re-export。 |

**注意：** 英寸工具里的 `COMMON_FRACTIONS` / `findCommonEquivalents` / `convertDecimalToFraction`（maxDenominator=32）保留在 inches 侧或 `lib/inches-fraction/` 扩展包中，**不要**塞进核心 `fraction-math`，避免数学工具误用 32 分母约束。

### 4.2 新建工具路由

| 路径 | 说明 |
|------|------|
| `app/[locale]/tools/fraction-to-decimal/page.tsx` | 客户端页面（与英寸工具类似：`"use client"`），主计算器 UI。 |
| `app/[locale]/tools/fraction-to-decimal/layout.tsx` | `generateMetadata` + JSON-LD（复用 inches 模式，文案换 namespace）。 |
| `app/[locale]/tools/fraction-to-decimal/seoData.ts` | `TOOL_SLUG`、`CONTENT_VERSION`、`LAST_MODIFIED_ISO`。 |
| `app/[locale]/tools/fraction-to-decimal/components/` | 按需拆分输入框、结果区、模式切换（分数→小数 / 小数→分数）。 |

**Slug 建议：** `fraction-to-decimal`（与 PRD 示例一致，且与 `convert-inches-to-decimal` 并列可读）。

### 4.3 国际化

- 新增 namespace：`FractionToDecimal`（或 `ConvertFractionToDecimal`），在现有 `messages/*.json`（或项目实际语言文件路径）中增加 `seo_title`、`seo_description`、`structured_data.*`、界面文案。
- 默认可先填 **en** 全量，其它 locale 可复制英文占位或后续补译。

### 4.4 产品入口

- `data/toolsData.ts`：新增一条 `fraction-to-decimal` 卡片，`href: "/tools/fraction-to-decimal"`（与 next-intl 的 `Link` 行为一致；注意 locale 前缀由框架处理）。
- 若 Header / Footer 有工具导航，同步增加链接（按项目现有 `headerNavLinks` 等数据文件）。

---

## 5. 核心逻辑设计

### 5.1 解析规则（P0）

- **支持：** `a/b`（正整数）、`w a/b` 或 `w-a/b` 带分数、可选**非负**纯小数（与 PRD 场景一致；若需负数可在 P0 末或 P1 增加，需在类型与文案中统一）。
- **拒绝：** `denominator === 0`；空串；无法解析的杂串（返回结构化错误码，便于 UI 显示）。
- **约分：** 内部用最简分数存储或展示时约分，与现 `createFraction` / `findGCD` 行为一致。

### 5.2 精度与「不四舍五入」

PRD 提到 *“type an integer or a decimal do not round”* 类意图：

- P0 至少提供：**有限小数**的精确显示（去掉尾随 0）；对**无限循环小数**，可用 **分数形式 + 近似小数**（例如显示 `1/3 ≈ 0.333…` 或固定精度 + 说明），避免 `toFixed` 静默误导。
- 实现策略（择一或组合，需在 PR 中写明）：
  - **方案 A：** 用 `BigInt` 或有理数比较判断分母质因数是否仅含 2 和 5 → 有限小数；否则标记 repeating。
  - **方案 B：** P0 先 **合理精度上限**（如 12 位）+ 文案「近似值」，P1 再加强循环节检测。

### 5.3 英寸工具迁移步骤（避免大爆炸）

1. 在 `lib/fraction-math` 中实现并通过单元测试的解析 + 转小数。
2. 新增 `fraction-to-decimal` 工具，**只依赖** `lib/fraction-math`。
3. 重构 `convert-inches-to-decimal/utils/fractionParser.ts`：
   - 输入预处理后调用 `lib/fraction-math` 的 parse；
   - 英寸特有的 `COMMON_FRACTIONS` / 标尺等**留在 inches 包内**。
4. 回归测试：手动验收英寸工具关键用例（或自动化后补）。

---

## 6. SEO 与 metadata（P0 必做）

### 6.1 与英寸工具的差异化

| 维度 | 英寸工具 | 抽象分数工具（P0） |
|------|----------|---------------------|
| `title` / `description` | 强调 **inches**、construction、ruler | 强调 **fraction**、**decimal**、math homework |
| `keywords` | 含 inch / ruler 等 | 含 fraction to decimal / mixed number 等 |
| JSON-LD `name` / `description` | 不变 | 新文案，避免 duplicate 信号 |

### 6.2 Canonical

与现有 inches `layout.tsx` **同一套规则**：

- `locale === "en"` → `https://youtubeshortdownloader.com/tools/fraction-to-decimal`
- 其它 → `https://youtubeshortdownloader.com/{locale}/tools/fraction-to-decimal`

### 6.3 结构化数据（P0 最小集）

- 至少：`WebApplication`（或 `SoftwareApplication`）+ `BreadcrumbList`（Home → Tools → 本页）。
- `FAQPage`：可选 3–6 条**本工具专属** FAQ（勿与 inches 完全雷同）；若工期紧可先上简短 FAQ，与 PRD P1 的「完整 FAQ 模板」衔接。

---

## 7. UI / UX 要点（Answer-first + CWV）

- 首屏：**大字号直接结果**（例如「3/8 = 0.375」），输入区次之。
- 客户端组件范围：**仅计算器与强交互块**；静态说明、FAQ 可考虑 Server Component 包裹（按现有项目习惯）。
- 图片：P0 可复用站点通用占位，**专用 OG 图**可在 P0 末或 P1 补（与 inches 的 og 图模式一致）。
- 避免：首屏大量 `blur`/`animation` 阻塞 LCP；超大列表虚拟化（P0 不需要）。

---

## 8. 性能与质量指标（验收参考）

| 项 | 目标（方向性） |
|----|----------------|
| LCP | 工具页在良好网络下 **< 2.5s**（以 field data 为准更佳） |
| CLS | **< 0.1**（结果区布局稳定，避免异步跳动） |
| INP | 输入反馈 **< 200ms** 感知（debounce 不宜过大） |

（上线后用 CrUX / GSC 与 Lighthouse 抽样。）

---

## 9. 测试策略

当前仓库 **未配置** `jest`/`vitest`。P0 建议二选一：

1. **推荐：** 增加 `vitest` + 仅对 `lib/fraction-math/**/*.ts` 跑单元测试（ golden cases：`1/2`→`0.5`、`1/3` 循环、`3 3/8`→`3.375`、`7/22` 等）。
2. **最低：** `node` + `assert` 小脚本在 `scripts/test-fraction-math.mjs`，在 CI 或本地 `yarn` script 中运行。

**必测边界：** 分母为 0、极大分母、带分数空格变体、纯小数输入是否与「分数」模式冲突。

---

## 10. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 双工具数学结果不一致 | 单一来源 `lib/fraction-math`；英寸仅加单位层。 |
| 无限小数展示误导 | 有限/无限分支 + 文案；见 §5.2。 |
| SEO 与 inches 关键词 cannibalization | 标题/描述严格区分；站内互链用清晰锚文本（「英寸」vs「分数」）。 |

---

## 11. 任务清单（可贴到 Issue / 看板）

- [ ] 新建 `lib/fraction-math`，实现 parse + convert + 类型 + 文档注释
- [ ] 补充单元测试（Vitest 或脚本）
- [ ] 新建 `app/[locale]/tools/fraction-to-decimal/`（page + layout + seoData + 组件）
- [ ] 新增 `next-intl` 文案（至少 en）
- [ ] 更新 `data/toolsData.ts`（及导航如有）
- [ ] 重构 `convert-inches-to-decimal` 使用共享库，回归英寸功能
- [ ] Lighthouse / 手动移动端走查
- [ ] （可选）确认 P1 pSEO 专项文档 / Issue 已引用 `lib/fraction-math` 与主工具 canonical 规则（见 §1.3）

---

## 12. 开放问题（实施前确认）

1. P0 是否支持**负数**分数（如 `-3/8`）？若否，在 UI 与 FAQ 中写明「仅非负数」。
2. 默认 locale 路由是否与现有 `en` 无前缀一致（当前 inches 已采用）？**保持一致即可。**
3. OG 图片是否 P0 必须：**建议 P0 末补一张**，避免分享预览重复用 inches 图。
4. **pSEO** 是否允许在 P0 末尾插入 **1 个 PoC 页面**：默认 **否**（归 P1）；若 **是**，范围仅限 §1.3 所述，且不跳过 P1 的 sitemap 与规模化设计。

---

**文档结束。** 实施完成后可将本文件版本号与 PRD 交叉引用，并在 PR 描述中链接本文档路径：`docs/TECH-SPEC-P0.md`。
