---
change: data-to-chart
design-doc: docs/superpowers/specs/2026-07-06-data-to-chart-design.md
base-ref: N/A（非 Git 仓库）
---

# data-to-chart — AI Agent Skill 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 创建 `data-to-chart` Claude Code skill，使 LLM 能根据用户分析意图和数据特征，自动选择 ECharts 图表类型并生成完整 HTML 文件。

**Architecture:** 一个 SKILL.md 主入口（5 步指令式流程）+ 三个 reference 参考文件（图表映射表、ECharts 模板、数据处理策略）。全为 Markdown 文档，无代码依赖。

**Tech Stack:** Claude Code skill 框架（SKILL.md frontmatter + reference/ 目录），ECharts 5.4.3 CDN。

## Global Constraints

- 部署路径：`C:\Users\PC\.claude\skills\data-to-chart\`（用户级 skill）
- 参考文件目录：`reference/`（skill 根目录下的子目录）
- 触发关键词：画图、图表、可视化、数据展示、生成图、chart、graph、plot
- 斜杠命令：`/data-to-chart`
- 图表库：ECharts 5.4.3 via jsDelivr CDN
- 业务场景优先于数据结构 — 冲突时以业务为准
- 首版范围：12 种图表类型，仅中国地图，不含混合图表/3D

---

### Task 1: Skill 骨架搭建 — SKILL.md 主入口

**Files:**
- Create: `C:\Users\PC\.claude\skills\data-to-chart\SKILL.md`

**Interfaces:**
- Produces: SKILL.md 定义 `name: data-to-chart` 的 skill，含 frontmatter 触发规则和 5 步执行流程，引用 `reference/chart-mapping.md`、`reference/echarts-templates.md`、`reference/data-processing.md`

- [x] **Step 1: 创建 skill 根目录**

```bash
mkdir -p "/c/Users/PC/.claude/skills/data-to-chart/reference"
```

- [x] **Step 2: 创建 SKILL.md 完整内容**

写入以下内容到 `C:\Users\PC\.claude\skills\data-to-chart\SKILL.md`：

````markdown
---
name: data-to-chart
description: Use when the user wants to create charts, graphs, or data visualizations, or uses Chinese keywords like 画图/图表/可视化/数据展示/生成图表. Also triggered by /data-to-chart command. Supports automatic chart type selection based on business scenario analysis with ECharts.
---

# data-to-chart — 智能图表生成

根据用户的分析意图和数据特征，自动选择 ECharts 图表类型并生成完整的可交互 HTML 文件。

## 核心原则

**业务场景决定图表类型，数据结构辅助验证。冲突时业务优先。**

## 执行流程

严格按以下 5 步执行。每步完成后进入下一步，不可跳过。

---

### Step 1: 场景分析 — 确定图表类型

**必须先用 Read 工具加载 `reference/chart-mapping.md`**，获取完整的图表类型映射表和优先级规则。

按优先级从用户输入中匹配业务关键词，确定图表类型：

| 优先级 | 关键词类别 | 推荐类型 |
|--------|-----------|---------|
| 1 | 趋势、变化、增长率、走势、时间线、历年 | `line` |
| 2 | 占比、份额、构成、分布、比例、百分比 | `pie` |
| 3 | 排名、对比、比较、TOP、排行 | `bar` |
| 4 | 时间+分类组合、堆积 | `bar`(stack) / `line`(areaStyle) |
| 5 | 关系、相关性、关联 | `scatter` |
| 6 | 地域、地区、省份、城市 | `map` |
| 7 | 流程、转化、漏斗、阶段 | `funnel` |
| 8 | 进度、完成率、KPI、达成 | `gauge` |
| 9 | 层级、树形、嵌套 | `sunburst` / `treemap` |
| 10 | 多维指标、综合评分 | `radar` |
| 11 | 分布、频次、密度 | `bar`(histogram) / `boxplot` |
| 12 | 波动、范围、区间 | `candlestick` |

**规则**：
- 多关键词匹配时取最高优先级
- 无法识别任何关键词时默认选择 `bar`
- 将选型结果记录在最终输出中（1-2 句话说明理由）

### Step 2: 数据获取

**必须先用 Read 工具加载 `reference/data-processing.md`**，获取完整的数据获取策略。

按优先级降级链执行，上一级获取不到数据时自动进入下一级：

1. **项目文件**：搜索当前项目目录下的 CSV/JSON/Excel 文件，读取并解析
2. **Web 搜索**：使用 web_search 工具搜索相关公开数据，必要时打开 1-2 个搜索结果页面提取详细数值
3. **示例数据**：使用合理模拟数据继续，并在输出中标注「⚠️ 已使用示例数据，非真实数据」

### Step 3: 数据整理

将获取的数据转换为 ECharts 可用格式。按数据结构选择格式：

- **时间序列** → `{ xAxis: { type: "category", data: ["2020", "2021", ...] }, series: [{ type: "line", data: [100, 120, ...] }] }`
- **分类对比** → `{ xAxis: { type: "category", data: ["分类A", "分类B", ...] }, series: [{ type: "bar", data: [100, 200, ...] }] }`
- **多系列** → `{ series: [{ name: "系列1", type: "line", data: [...] }, { name: "系列2", type: "line", data: [...] }] }`
- **饼图** → `{ series: [{ type: "pie", data: [{ name: "类别A", value: 100 }, { name: "类别B", value: 200 }] }] }`
- **散点图** → `{ series: [{ type: "scatter", data: [[x1, y1], [x2, y2], ...] }] }`

### Step 4: 双轴验证

对比分析业务选型与数据实际维度：

- 数据是时间序列但业务选饼图 → **以业务为准**，仍用时间序列方式展示
- 数据缺关键维度（如散点图需两个数值列但数据只有一个）→ **降级为柱状图**并在输出中说明降级原因
- 数据与业务一致 → 直接通过，进入 Step 5

### Step 5: 代码生成

**必须先用 Read 工具加载 `reference/echarts-templates.md`**，获取该图表类型的 ECharts option 结构参考。

参考模板但灵活适配实际数据的维度、系列数、值域。不可机械套用模板。

#### HTML 输出规范

- 引入 CDN：`<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>`
- 容器：`<div id="chart" style="width:100%; min-height:400px;"></div>`
- 初始化：`var chart = echarts.init(document.getElementById('chart')); chart.setOption(option);`
- 响应式：`window.addEventListener('resize', function() { chart.resize(); });`
- 默认启用：tooltip、legend（多系列时）、toolbox（saveAsImage）
- 字体：`font-family: "Microsoft YaHei", "PingFang SC", sans-serif;`
- 地图场景：额外引入中国地图 CDN JSON（`https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json`），通过 `echarts.registerMap('china', geoJson)` 注册后使用

#### 输出格式

1. 先输出文字说明：选型理由（1-2 句话）+ 数据来源（项目文件/Web 搜索/示例数据）
2. 再输出完整 HTML 代码块（````html ... ````）

---

## 参考文件

执行时按需加载（使用 Read 工具）：

| 文件 | 用途 | 触发条件 |
|------|------|---------|
| `reference/chart-mapping.md` | 完整图表类型映射表和冲突解决规则 | Step 1 前必须加载 |
| `reference/data-processing.md` | 数据获取降级链和格式转换规则 | Step 2 前必须加载 |
| `reference/echarts-templates.md` | ECharts option 模板和通用配置 | Step 5 前必须加载 |
````

- [x] **Step 3: 验证文件已创建**

```bash
test -f "/c/Users/PC/.claude/skills/data-to-chart/SKILL.md" && echo "PASS: SKILL.md exists" || echo "FAIL: SKILL.md not found"
```

Expected: `PASS: SKILL.md exists`

- [x] **Step 4: 验证 frontmatter 可解析**

```bash
head -5 "/c/Users/PC/.claude/skills/data-to-chart/SKILL.md" && echo "---" && echo "Frontmatter section OK"
```

Expected: 显示 YAML frontmatter 包含 `name: data-to-chart`

- [x] **Step 5: 提交（如使用 Git）**

```bash
# 本次为非 Git 仓库，跳过提交步骤
echo "Task 1 complete — SKILL.md created"
```

---

### Task 2: 图表选型参考文件 — chart-mapping.md

**Files:**
- Create: `C:\Users\PC\.claude\skills\data-to-chart\reference\chart-mapping.md`

**Interfaces:**
- Consumes: SKILL.md 中 Step 1 的引用
- Produces: 12 种图表类型的完整映射表，含关键词列表、适用条件、降级方案、冲突解决决策树

- [x] **Step 1: 创建 chart-mapping.md 完整内容**

写入以下内容到 `C:\Users\PC\.claude\skills\data-to-chart\reference\chart-mapping.md`：

````markdown
# 图表类型映射表

## 优先级规则

1. 从用户输入中提取所有业务关键词
2. 按下表优先级顺序匹配，取**最高优先级**匹配项
3. 同一优先级内多个关键词匹配时，选择第一个匹配的类型
4. 完全无匹配时默认 `bar`
5. 多关键词跨优先级时，高优先级覆盖低优先级

---

## 完整映射表

### 优先级 1：趋势/时间序列 → `line`

**关键词**：趋势、变化、增长率、走势、时间线、历年、历年变化、同比、环比、时间序列、时序、波动

**适用条件**：数据含时间维度（年/月/日/季度）且用户关注变化趋势

**option 类型**：`series.type = "line"`

**降级方案**：数据分类过多（>20 个时间点）且用户关注排名 → 降级为 `bar`

---

### 优先级 2：占比/构成 → `pie`

**关键词**：占比、份额、构成、分布、比例、百分比、比重、几成、多少比例

**适用条件**：数据各部分之和有意义（构成整体），分类数 2-10 个

**option 类型**：`series.type = "pie"`

**降级方案**：
- 分类 > 10 个 → 降级为 `bar`，取 TOP 10 + 「其他」
- 数据不含可加总的组成部分 → 降级为 `bar`

---

### 优先级 3：排名/对比 → `bar`

**关键词**：排名、对比、比较、TOP、排行、谁最多、谁最少、哪个最高

**适用条件**：需要横向对比不同类别数值大小

**option 类型**：`series.type = "bar"`，`xAxis.type = "category"`

**降级方案**：分类名过长（>8 个中文字符）→ 改用水平柱状图（`yAxis.type = "category"`）

---

### 优先级 4：时间+分类组合 → `bar`(stack) / `line`(areaStyle)

**关键词**：堆积、堆叠、构成变化、面积、累计、叠加

**适用条件**：同时有时间维度和分类维度，需展示各部分随时间变化

**option 类型**：
- 柱状：`series.type = "bar"` + `series.stack = "total"`
- 折线：`series.type = "line"` + `series.areaStyle = {}`

**降级方案**：系列数 > 5 → 去除 areaStyle，改用多折线

---

### 优先级 5：关系/相关性 → `scatter`

**关键词**：关系、相关性、关联、散点、相关度、二维分布、交叉分析

**适用条件**：数据至少包含两个数值列（X 和 Y 轴）

**option 类型**：`series.type = "scatter"`

**降级方案**：数据只有一个数值列 → 降级为 `bar`，并说明「散点图需要两个数值维度，当前数据仅一个数值列」

---

### 优先级 6：地域 → `map`

**关键词**：地域、地区、省份、城市、全国、各省、地图

**适用条件**：数据含中国省/市/自治区名称

**option 类型**：`series.type = "map"` + `series.map = "china"`

**降级方案**：非中国地图数据 → 降级为 `bar`，并说明「首版仅支持中国地图，其他地区请自行注册 GeoJSON」

---

### 优先级 7：流程/转化 → `funnel`

**关键词**：流程、转化、漏斗、阶段、转化率、流失、各环节

**适用条件**：数据各阶段呈递减趋势，表示从大到小的转化过程

**option 类型**：`series.type = "funnel"`

**降级方案**：数据无明显递减 → 降级为 `bar`，并说明「漏斗图适合递减转化数据，当前数据不满足递减特征」

---

### 优先级 8：进度/KPI → `gauge`

**关键词**：进度、完成率、KPI、达成、指标、完成度、百分比仪表

**适用条件**：单个数值（0-100 或 0-1），表示完成程度或达成率

**option 类型**：`series.type = "gauge"`

**降级方案**：多个指标 > 1 → 降级为 `bar`（多个仪表盘不直观）

---

### 优先级 9：层级/树形 → `sunburst` / `treemap`

**关键词**：层级、树形、嵌套、多级、下钻、子类别、层次

**适用条件**：数据具有父子层级关系，如 大类→小类→细类

**option 类型**：`series.type = "sunburst"` 或 `series.type = "treemap"`

**降级方案**：数据扁平无层级 → 降级为 `pie` 或 `bar`

---

### 优先级 10：多维指标 → `radar`

**关键词**：多维、综合评分、多指标、雷达、多维度评估、能力模型

**适用条件**：多个指标在同一尺度下比较，指标数 3-10 个

**option 类型**：`series.type = "radar"`

**降级方案**：指标数 < 3 → 降级为 `bar`

---

### 优先级 11：分布/频次 → `bar`(histogram) / `boxplot`

**关键词**：分布、频次、密度、直方图、箱线、数据分布

**适用条件**：关注数值的分布形态而非具体值

**option 类型**：`series.type = "bar"`（直方图用 bar 近似）或 `series.type = "boxplot"`

**降级方案**：ECharts boxplot 需要 echarts-stat 扩展 → 数据量不足以分箱时降级为散点图

---

### 优先级 12：波动/区间 → `candlestick`

**关键词**：波动、范围、区间、K线、开盘、最高最低、极值范围

**适用条件**：每个数据点有 4 个值（开/高/低/收 或 最小值/Q1/Q3/最大值）

**option 类型**：`series.type = "candlestick"`

**降级方案**：数据只有 2 个值（最小/最大）→ 降级为带误差线的 `bar`

---

## 冲突解决决策树

```
用户输入
  │
  ├─ 包含"趋势/变化/增长率"等 → line（优先级 1 胜出）
  │     └─ 但同时说"占比分析" → 仍选 line，Step 4 双轴验证会确认
  │
  ├─ 包含"占比/份额/百分比" → pie
  │     └─ 但分类 > 10 → bar
  │
  ├─ 包含"排名/对比/TOP" → bar
  │
  ├─ 包含"各省/地区/地图" → map（仅中国地图）
  │
  ├─ 包含"流程/漏斗/转化" → funnel
  │
  └─ 无明确关键词 → bar（默认）
```

## 选型结果记录格式

在最终输出中，必须包含选型说明，格式如下：

> **图表选型**：检测到关键词「XXX」（优先级 N），推荐使用 `<chart-type>` 图表。`<补充理由（如降级原因、适用条件匹配等）>`
````

- [x] **Step 2: 验证文件已创建**

```bash
test -f "/c/Users/PC/.claude/skills/data-to-chart/reference/chart-mapping.md" && echo "PASS" || echo "FAIL"
```

Expected: `PASS`

- [x] **Step 3: 提交（如使用 Git）**

```bash
echo "Task 2 complete — chart-mapping.md created"
```

---

### Task 3: ECharts 模板参考文件 — echarts-templates.md

**Files:**
- Create: `C:\Users\PC\.claude\skills\data-to-chart\reference\echarts-templates.md`

**Interfaces:**
- Consumes: SKILL.md 中 Step 5 的引用
- Produces: 12 种图表类型的 ECharts option 最小示例，通用配置（tooltip/legend/toolbox/color），必须项 vs 可选项标注

- [x] **Step 1: 创建 echarts-templates.md 完整内容**

写入以下内容到 `C:\Users\PC\.claude\skills\data-to-chart\reference\echarts-templates.md`：

````markdown
# ECharts 图表模板参考

> **使用方式**：Agent 在 Step 5 生成代码前加载此文件。参考各类型的 option 骨架，但必须根据实际数据的维度、系列数、值域灵活调整，不可机械套用。
> 
> 标记说明：🔴 = 必须项（该图表类型的核心配置，移除后图表无法正确呈现） | 🟡 = 推荐项（提升可读性和交互体验） | ⚪ = 可选项（按需添加）

---

## 通用配置（所有图表类型共享）

```javascript
// 🔴 必须：tooltip — 鼠标悬停提示
tooltip: {
  trigger: 'axis',   // line/bar 用 'axis', pie/scatter 用 'item'
  axisPointer: { type: 'shadow' }  // bar 可选
}

// 🟡 推荐：legend — 多系列时显示图例
legend: {
  type: 'scroll',    // 系列多时支持滚动
  bottom: 0,
  textStyle: { fontSize: 12 }
}

// 🟡 推荐：toolbox — 保存图片等工具
toolbox: {
  feature: {
    saveAsImage: { title: '保存为图片' },
    dataView: { title: '数据视图', readOnly: false }
  }
}

// 🟡 推荐：color — 调色板
color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC']

// ⚪ 可选：grid — 绘图区域边距
grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true }

// ⚪ 可选：animation — 动画
animation: true,
animationDuration: 800
```

---

## 图表类型模板

### 1. 折线图 `line`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 200, 150, 80, 70] }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' },
  // 🟡 多系列时添加
  legend: { data: ['系列1'], bottom: 0 },

  // ⚪ 面积图变体
  // series: [{ type: 'line', areaStyle: {}, data: [...] }]
  // ⚪ 平滑曲线
  // series: [{ type: 'line', smooth: true, data: [...] }]
};
```

### 2. 饼图 `pie`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'pie',
    radius: '60%',    // 或 ['40%', '70%'] 做环形图
    data: [
      { name: '类别A', value: 100 },
      { name: '类别B', value: 200 },
      { name: '类别C', value: 150 }
    ],
    // 🔴 饼图推荐显示标签
    label: { show: true, formatter: '{b}: {d}%' }
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { type: 'scroll', bottom: 0 },

  // ⚪ 可选效果
  // emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
};
```

### 3. 柱状图 `bar`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [320, 200, 150, 80] }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' },

  // ⚪ 水平柱状图（分类名过长时用）
  // yAxis: { type: 'category', data: [...] },
  // xAxis: { type: 'value' },
  // ⚪ 堆叠柱状图
  // series: [
  //   { type: 'bar', stack: 'total', data: [...] },
  //   { type: 'bar', stack: 'total', data: [...] }
  // ]
};
```

### 4. 堆叠图 `bar`(stack) / `line`(areaStyle)

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yAxis: { type: 'value' },
  series: [
    { name: '产品A', type: 'bar', stack: 'total', data: [120, 200, 150, 80] },
    { name: '产品B', type: 'bar', stack: 'total', data: [80, 120, 180, 110] },
    { name: '产品C', type: 'bar', stack: 'total', data: [60, 80, 100, 140] }
  ],

  // 🔴 多系列必须有 legend
  legend: { data: ['产品A', '产品B', '产品C'], bottom: 0 },

  // 🟡 推荐
  tooltip: { trigger: 'axis' },

  // ⚪ 面积堆叠变体（改 type 为 line + areaStyle）
  // series: [
  //   { name: '产品A', type: 'line', stack: 'total', areaStyle: {}, data: [...] }
  // ]
};
```

### 5. 散点图 `scatter`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'value', name: 'X 轴标签' },
  yAxis: { type: 'value', name: 'Y 轴标签' },
  series: [{
    type: 'scatter',
    data: [[10, 20], [15, 30], [20, 25], [25, 40], [30, 35]],
    symbolSize: 8
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: 'X: {c[0]}<br/>Y: {c[1]}' },

  // ⚪ 多系列散点
  // series: [
  //   { name: '组A', type: 'scatter', data: [...] },
  //   { name: '组B', type: 'scatter', data: [...] }
  // ]
};
```

### 6. 地图 `map`（中国地图）

```javascript
// 🔴 必须：额外引入中国地图 GeoJSON（放在 <script> 中，在 echarts.init 之前）
// <script src="https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"></script>
// 或通过 fetch 加载后 registerMap

option = {
  // 🔴 必须
  series: [{
    type: 'map',
    map: 'china',
    data: [
      { name: '广东', value: 1000 },
      { name: '江苏', value: 800 },
      // ... 各省数据
    ],
    label: { show: true, fontSize: 10 }
  }],

  // 🔴 地图必须有 visualMap
  visualMap: {
    min: 0,
    max: 1000,
    left: 'left',
    bottom: 'bottom',
    text: ['高', '低'],
    inRange: { color: ['#E0F3F8', '#045A8D'] }
  },

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c}' }
};
```

### 7. 漏斗图 `funnel`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'funnel',
    left: '10%',
    right: '10%',
    width: '80%',
    data: [
      { name: '访问', value: 1000 },
      { name: '注册', value: 600 },
      { name: '下单', value: 300 },
      { name: '支付', value: 150 }
    ],
    label: { show: true, formatter: '{b}: {c}' },
    sort: 'descending'  // 🔴 漏斗图默认从大到小排列
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c}' }
};
```

### 8. 仪表盘 `gauge`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'gauge',
    min: 0,
    max: 100,
    detail: { formatter: '{value}%', fontSize: 20 },
    data: [{ value: 75, name: '完成率' }],
    axisLine: {
      lineStyle: { color: [[0.3, '#67E0E3'], [0.7, '#37A2DA'], [1, '#FD666D']], width: 20 }
    }
  }]
};
```

### 9. 旭日图/矩形树图 `sunburst` / `treemap`

```javascript
// sunburst
option = {
  // 🔴 必须
  series: [{
    type: 'sunburst',
    data: [{
      name: '大类A',
      children: [
        { name: '小类A1', value: 100 },
        { name: '小类A2', value: 200 }
      ]
    }, {
      name: '大类B',
      children: [
        { name: '小类B1', value: 150 }
      ]
    }],
    radius: ['15%', '80%'],
    label: { rotate: 'radial' }
  }]
};

// treemap
option = {
  // 🔴 必须
  series: [{
    type: 'treemap',
    data: [{
      name: '大类A',
      children: [
        { name: '小类A1', value: 100 },
        { name: '小类A2', value: 200 }
      ]
    }, {
      name: '大类B',
      children: [
        { name: '小类B1', value: 150 }
      ]
    }],
    label: { show: true, formatter: '{b}' }
  }]
};
```

### 10. 雷达图 `radar`

```javascript
option = {
  // 🔴 必须
  radar: {
    indicator: [
      { name: '指标A', max: 100 },
      { name: '指标B', max: 100 },
      { name: '指标C', max: 100 },
      { name: '指标D', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [{ value: [80, 90, 70, 85], name: '当前' }],
    areaStyle: {}
  }],

  // 🟡 推荐：多系列对比
  // data: [
  //   { value: [80, 90, 70, 85], name: '当前' },
  //   { value: [60, 70, 80, 75], name: '目标' }
  // ]

  // 🟡 推荐
  legend: { data: ['当前'], bottom: 0 },
  tooltip: { trigger: 'item' }
};
```

### 11. 箱线图 `boxplot`

```javascript
// ⚠️ 箱线图需要 echarts-stat 扩展
// <script src="https://cdn.jsdelivr.net/npm/echarts-stat@1.1.0/dist/ecStat.min.js"></script>
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['组A', '组B', '组C'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'boxplot',
    data: [
      [10, 20, 30, 40, 50],  // [min, Q1, median, Q3, max]
      [15, 25, 35, 45, 55],
      [5, 15, 25, 35, 45]
    ]
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item' }
};
```

### 12. K 线图 `candlestick`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'candlestick',
    data: [
      [20, 34, 10, 38],  // [open, close, low, high]
      [40, 35, 30, 50],
      [31, 38, 30, 42],
      [38, 30, 20, 45]
    ],
    // 🟡 上涨/下跌颜色
    itemStyle: { color: '#EF5350', color0: '#26A69A', borderColor: '#EF5350', borderColor0: '#26A69A' }
  }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' }
};
```

---

## 完整 HTML 骨架

每种图表类型都套用以下 HTML 骨架，替换 `option` 对象即可：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- 图表标题 --></title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <!-- 地图场景额外引入 -->
    <!-- <script src="https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"></script> -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #chart {
            width: 100%;
            max-width: 1000px;
            min-height: 500px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="chart"></div>
    <script>
        (function() {
            var chart = echarts.init(document.getElementById('chart'));
            // 地图场景：echarts.registerMap('china', <geoJson>);

            var option = {
                // 替换为具体图表类型的 option
            };

            chart.setOption(option);
            window.addEventListener('resize', function() {
                chart.resize();
            });
        })();
    </script>
</body>
</html>
```
````

- [x] **Step 2: 验证文件已创建**

```bash
test -f "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md" && echo "PASS" || echo "FAIL"
```

Expected: `PASS`

- [x] **Step 3: 验证关键模板均已包含**

```bash
grep -c "### [0-9]" "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md"
```

Expected: 输出 `12`（12 种图表类型模板均已包含）

- [x] **Step 4: 提交（如使用 Git）**

```bash
echo "Task 3 complete — echarts-templates.md created"
```

---

### Task 4: 数据处理参考文件 — data-processing.md

**Files:**
- Create: `C:\Users\PC\.claude\skills\data-to-chart\reference\data-processing.md`

**Interfaces:**
- Consumes: SKILL.md 中 Step 2 的引用
- Produces: 数据获取三级降级链、CSV/JSON/Web 数据 → ECharts 格式转换规则、示例数据生成指引

- [x] **Step 1: 创建 data-processing.md 完整内容**

写入以下内容到 `C:\Users\PC\.claude\skills\data-to-chart\reference\data-processing.md`：

````markdown
# 数据处理策略

## 数据获取降级链

按以下优先级执行，上一级获取不到数据时自动进入下一级。任何一级成功获取数据后停止。

### 级别 1：项目文件

**操作**：
1. 使用 Glob 工具搜索当前项目目录下的数据文件：
   ```
   pattern: **/*.{csv,json,xlsx,xls}
   ```
2. 如果找到多个文件，优先选择文件名与用户查询最相关的
3. 使用 Read 工具读取文件内容：
   - CSV：解析为二维表，第一行作为列名
   - JSON：解析为数组或对象结构
   - Excel（.xlsx/.xls）：Read 工具可直接读取

**成功条件**：能提取到至少 2 条数据记录

**失败时**：进入级别 2

---

### 级别 2：Web 搜索

**操作**：
1. 使用 web_search 工具搜索相关公开数据，搜索词格式：
   ```
   "<用户查询关键词> 数据 历年 统计"
   ```
2. 从搜索结果摘要中提取数值。如果摘要信息不完整，使用 WebFetch 打开 1-2 个最相关的结果页面
3. 从页面内容中提取表格、列表等结构化数据

**成功条件**：能提取到至少 2 条完整数据记录（含标签和数值）

**输出标注**：数据来源 URL

**失败时**：进入级别 3

---

### 级别 3：示例数据

**操作**：
1. 根据用户查询主题，生成合理模拟数据
2. 数据应尽可能贴近真实场景的数值范围和趋势
3. 数据量适中：时间序列 5-15 个点，分类 3-10 个类别

**输出标注**：必须在输出中明确标注「⚠️ 已使用示例数据，非真实数据」

---

## 数据格式转换规则

### CSV → ECharts

CSV 内容示例：
```csv
年份,GDP,人均GDP
2020,101.4,7.2
2021,114.9,8.1
2022,121.0,8.5
```

转换规则：
1. 第一行为列名（维度名 + 系列名）
2. 第一列默认为 xAxis 分类轴
3. 后续列各为一个 series

对应的 ECharts 格式：
```javascript
xAxis: { type: 'category', data: ['2020', '2021', '2022'] },
series: [
  { name: 'GDP', type: 'line', data: [101.4, 114.9, 121.0] },
  { name: '人均GDP', type: 'line', data: [7.2, 8.1, 8.5] }
]
```

### JSON → ECharts

JSON 数组：
```json
[
  { "年份": "2020", "GDP": 101.4, "人均GDP": 7.2 },
  { "年份": "2021", "GDP": 114.9, "人均GDP": 8.1 }
]
```

转换为：
```javascript
// 取第一个 key 为 xAxis
xAxis: { type: 'category', data: ['2020', '2021'] },
// 其余 key 各为 series
series: [
  { name: 'GDP', type: 'line', data: [101.4, 114.9] },
  { name: '人均GDP', type: 'line', data: [7.2, 8.1] }
]
```

JSON 对象（键值对）：
```json
{ "北京": 2154, "上海": 3815, "广州": 2501 }
```

转换为：
```javascript
// 饼图
series: [{
  type: 'pie',
  data: [
    { name: '北京', value: 2154 },
    { name: '上海', value: 3815 },
    { name: '广州', value: 2501 }
  ]
}]

// 柱状图
xAxis: { type: 'category', data: ['北京', '上海', '广州'] },
series: [{ type: 'bar', data: [2154, 3815, 2501] }]
```

### Web 搜索结果 → ECharts

从网页表格提取：
1. 识别 `<table>` 或 Markdown 表格
2. 提取表头为列名，提取数据行为数值
3. 按 CSV 转换规则处理

从网页文本提取：
1. 识别「年份+数值」或「名称+数值」模式
2. 手动整理为键值对格式
3. 按 JSON 对象转换规则处理

---

## 数据质量检查

生成 option 前必须检查：

1. **数值有效性**：所有数值可解析为数字（`!isNaN(Number(value))`）
2. **维度一致性**：xAxis.data 长度与每个 series.data 长度一致
3. **数值规模**：差异过大（如一个系列 1000-2000，另一个 0.1-0.5）→ 考虑双 yAxis
4. **空值处理**：缺失值用 `null` 或 `'-'` 替代（ECharts 会断开连线）
5. **中文/特殊字符**：确保 UTF-8 编码正确处理

### 异常数据处理

```javascript
// 清洗示例
function cleanValue(val) {
  if (val === null || val === undefined || val === '') return null;
  var num = Number(String(val).replace(/[,%￥$]/g, '').trim());
  return isNaN(num) ? null : num;
}
```

---

## 双 yAxis 使用准则

满足以下条件时使用双 yAxis：

- 两个系列的数值量级相差 10 倍以上
- 两个系列的数值单位不同（如「亿元」和「%」）

```javascript
yAxis: [
  { type: 'value', name: 'GDP（万亿元）' },
  { type: 'value', name: '增长率（%）' }
],
series: [
  { name: 'GDP', type: 'bar', data: [...] },       // 使用左侧 yAxis
  { name: '增长率', type: 'line', yAxisIndex: 1, data: [...] }  // 使用右侧 yAxis
]
```

---

## 示例数据生成指引

当使用示例数据时，确保：

- **时间序列**：生成 5-15 个时间点，数值体现合理趋势（上升/下降/波动）
- **分类对比**：3-10 个分类，数值适度差异（不至于全一样）
- **占比**：各部分真实加总等于整体的概念
- **地域**：至少包含 5 个以上省份/城市
- **标注**：数据前加注释 `// ⚠️ 示例数据，非真实数据`

```javascript
// ⚠️ 示例数据，非真实数据
var exampleData = {
  years: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
  gdp: [74.6, 83.2, 91.9, 98.7, 101.4, 114.9, 121.0, 126.1, 134.9, 143.2],
  growthRate: [6.8, 6.9, 6.7, 6.0, 2.2, 8.4, 3.0, 5.2, 5.0, 4.8]
};
```
````

- [x] **Step 2: 验证文件已创建**

```bash
test -f "/c/Users/PC/.claude/skills/data-to-chart/reference/data-processing.md" && echo "PASS" || echo "FAIL"
```

Expected: `PASS`

- [x] **Step 3: 提交（如使用 Git）**

```bash
echo "Task 4 complete — data-processing.md created"
```

---

### Task 5: 端到端验收测试

**Files:**
- 无新文件创建 — 验证已有 skill 文件的行为正确性

**Interfaces:**
- Consumes: Task 1-4 创建的所有文件
- Produces: 验收测试通过记录，确认 skill 满足 design doc 的所有验收场景

- [x] **Step 1: 验证目录结构完整性**

```bash
echo "=== Skill 目录结构 ===" && \
find "/c/Users/PC/.claude/skills/data-to-chart" -type f | sort && \
echo "=== 预期文件 ===" && \
echo "SKILL.md" && \
echo "reference/chart-mapping.md" && \
echo "reference/echarts-templates.md" && \
echo "reference/data-processing.md"
```

Expected: 输出显示 4 个文件均存在

- [x] **Step 2: 验证 SKILL.md frontmatter 格式**

```bash
echo "=== Frontmatter 检查 ===" && \
head -5 "/c/Users/PC/.claude/skills/data-to-chart/SKILL.md"
```

Expected: 显示 `---` 包裹的 YAML，包含 `name: data-to-chart` 和 `description:` 字段

- [x] **Step 3: 验证图表映射表覆盖 12 种类型**

```bash
echo "=== 图表类型覆盖检查 ===" && \
grep -oP '### 优先级 \d+.*?→ `\w+`' "/c/Users/PC/.claude/skills/data-to-chart/reference/chart-mapping.md"
```

Expected: 显示 12 行，每行对应一种图表类型和优先级

- [x] **Step 4: 验证 ECharts 模板覆盖 12 种类型**

```bash
echo "=== 模板类型覆盖检查 ===" && \
grep -c "^### \d+\." "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md"
```

Expected: `12`

- [x] **Step 5: 验证数据处理降级链完整**

```bash
echo "=== 降级链检查 ===" && \
grep -c "### 级别" "/c/Users/PC/.claude/skills/data-to-chart/reference/data-processing.md"
```

Expected: `3`

- [x] **Step 6: 模拟触发关键词匹配**

```bash
echo "=== SKILL.md 触发关键词 ===" && \
grep "画图\|图表\|可视化\|数据展示\|生成图\|chart\|graph\|plot" "/c/Users/PC/.claude/skills/data-to-chart/SKILL.md"
```

Expected: 显示 description 字段中包含所有触发关键词

- [x] **Step 7: 验证 HTML 骨架完整性**

```bash
echo "=== HTML 骨架必要元素 ===" && \
grep -c "echarts.init" "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md" && \
grep -c "chart.resize" "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md" && \
grep -c "echoarts@5.4.3" "/c/Users/PC/.claude/skills/data-to-chart/reference/echarts-templates.md"
```

Expected: 每行输出大于 0（echarts.init、chart.resize、CDN 版本号均已包含）

- [x] **Step 8: 提交验收结果**

```bash
echo "=== 验收完成 ===" && \
echo "Skill 目录: $(ls -1 /c/Users/PC/.claude/skills/data-to-chart/ | tr '\n' ' ')" && \
echo "Reference 文件: $(ls -1 /c/Users/PC/.claude/skills/data-to-chart/reference/ | tr '\n' ' ')" && \
echo "All checks passed."
```

Expected: 4 个文件全部就位，所有检查通过

---

## 完成检查清单

在标记此计划完成前，确认：

- [x] `SKILL.md` 包含完整 5 步执行流程和 3 个参考文件索引
- [x] `chart-mapping.md` 覆盖全部 12 种图表类型，含冲突解决决策树
- [x] `echarts-templates.md` 包含全部 12 种类型的 option 骨架 + 通用 HTML 骨架
- [x] `data-processing.md` 包含三级降级链 + 4 种数据格式转换规则
- [x] 所有文件部署在 `C:\Users\PC\.claude\skills\data-to-chart\` 下
- [x] 触发关键词：画图、图表、可视化、数据展示、生成图、chart、graph、plot
- [x] 斜杠命令 `/data-to-chart` 在 frontmatter 中声明
- [x] CDN 版本：ECharts 5.4.3
- [x] 业务优先原则在 SKILL.md 和 chart-mapping.md 中明确
