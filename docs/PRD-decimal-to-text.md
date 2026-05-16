# PRD: Decimal to Text

**Product:** YoutubeShortDownloader
**Feature:** `decimal-to-text`
**Status:** MVP shipped in repo
**Version:** 1.0
**Last updated:** 2026-05-05

---

## 1. 背景

关键词 **`decimal to text`** 对应的用户意图很明确：用户已经有一个十进制数字，希望立刻拿到**可复制、可阅读、可朗读**的英文文本表达，而不是再做额外换算。

这类需求常见于：

- 文档与产品文案编写
- 无障碍 / TTS / 语音播报场景
- 教学演示与作业讲解
- 数据核对与格式 QA

当前项目里已有 `fraction-to-decimal`、`convert-inches-to-decimal`，但还没有一个把**十进制数字直接转成文字**的工具页。这个工具能补齐 “decimal” 主题下一个高相关、低理解门槛的使用场景。

---

## 2. 产品目标

### 主目标

提供一个 **answer-first** 的在线工具，让用户输入十进制数字后，立即得到英文文字形式，例如：

- `12.34` -> `twelve point three four`
- `0.050` -> `zero point zero five zero`
- `-7.125` -> `negative seven point one two five`

### 次目标

- 承接 `decimal to text`、`decimal to words`、`spell decimal number` 等搜索意图
- 强化 YoutubeShortDownloader 在 “decimal-related utilities” 主题下的工具覆盖
- 形成可复用的 SEO 页面模板：工具 + quick answer + FAQ + structured data

---

## 3. 目标用户

### 核心用户

1. **内容与产品团队**
   需要把数字写成自然语言，用于文档、帮助中心、表单提示、播报文案。

2. **教育用户**
   学生、老师、家长需要确认某个小数应该怎么读、怎么写。

3. **无障碍 / 语音场景使用者**
   需要将数字转成更适合朗读与屏幕阅读器理解的文本。

4. **QA / 数据审阅人员**
   需要对比数字和文字结果，确认是否有符号、精度、尾零丢失等问题。

---

## 4. 用户问题

- 我知道 `12.34` 这个数字，但不知道英文里该怎么准确写出来
- 我不想自己手动逐位拼写小数部分
- 我希望 `0.050` 这种输入不要被错误简化成 `0.05`
- 我需要一个可以直接复制结果的轻量工具，而不是复杂的表单系统

---

## 5. 产品定位

`Decimal to Text` 是一个**轻量、即时、精确保留小数表达**的英文数字转写工具。

它不是：

- 货币大写工具
- 支票填写工具
- 科学计数法解释器
- 多语言数字转写平台

MVP 聚焦一件事：**把标准十进制数字稳定转换成可读英文文本**。

---

## 6. MVP 范围

### 支持

- 正整数：`42`
- 常规小数：`12.34`
- 负数：`-7.125`
- 带千分位逗号：`1,234.56`
- 保留尾零：`0.050`
- 以 `.` 开头的小数：`.75`

### 不支持

- 科学计数法：`1.2e-4`
- 货币 / check-writing 语法
- 非英文输出
- 超大整数（超过 decillion 级别）

---

## 7. 核心体验

### 7.1 输入

用户在单输入框中输入十进制数字。

### 7.2 输出

页面实时返回：

1. **主结果**：完整英文文本
2. **Normalized number**：标准化后的数字
3. **Whole-number words**：整数部分文字
4. **Decimal-part words**：小数部分逐位文字

### 7.3 交互

- 实时转换（轻量 debounce）
- 一键复制
- 常用示例快捷填充

---

## 8. 体验规则

### 文本规则

- 整数部分使用标准英文数字命名
- 小数点固定输出为 `point`
- 小数部分按**逐位**读取，避免语义损失
- 负数前添加 `negative`
- 用户显式输入的尾零必须保留

### 示例

- `15.2` -> `fifteen point two`
- `15.20` -> `fifteen point two zero`
- `0.007` -> `zero point zero zero seven`

---

## 9. 页面内容策略

为了符合当前站点的 GEO / SEO 模式，页面除工具本体外，还需要提供：

- Quick Answer
- Core Facts
- How it Works
- Use Cases
- Scope and Limitations
- FAQ
- Structured Data

目标不是堆砌关键词，而是让用户和搜索引擎都能快速提取页面事实块。

---

## 10. SEO 策略

### 目标关键词

- decimal to text
- decimal to words
- spell decimal number
- decimal in words

### 页面策略

- H1 直接命中主词
- 首屏提供 quick answer
- 元描述明确示例值与能力边界
- FAQ 覆盖 trailing zeros / negative / commas / scientific notation 等高频问题
- 使用 `WebApplication` + `FAQPage` + `BreadcrumbList` 结构化数据

---

## 11. 功能需求

### Must have

- 输入合法校验
- 实时英文转写
- 保留尾零
- 支持负数与千分位
- 一键复制
- 移动端可用

### Should have

- 示例快捷按钮
- 输出拆解展示
- FAQ 与说明内容

### Won't have

- 多语言
- 账号体系
- 导出文件
- 科学计数法

---

## 12. 非功能要求

- **性能**：首屏轻，转换逻辑纯前端本地执行
- **可访问性**：输入框、按钮、结果区有清晰层次与可读对比
- **可维护性**：转换逻辑独立为 util，便于后续复用
- **SEO**：metadata、canonical、FAQ schema 与 breadcrumb 完整

---

## 13. 成功指标

### 产品指标

- 用户在 5 秒内拿到可复制结果
- 首次使用无需解释即可完成转换
- 低错误率（主要来自非法输入）

### SEO 指标

- 收录 `decimal-to-text` 路由
- 在相关长尾词上获得 impressions / clicks
- FAQ 与 quick answer 提升 AI / snippet 可提取性

---

## 14. 当前版本落地说明

本次实现包含：

- 新工具路由：`app/[locale]/tools/decimal-to-text`
- 实时转换组件
- 独立转换工具函数
- metadata 与 JSON-LD
- 英文站内文案
- 工具列表入口

后续可扩展方向：

1. 增加 `number to words` / `currency to words` 衍生工具
2. 增加英式 / 美式风格差异选项
3. 增加更多 locale 的数字转写
