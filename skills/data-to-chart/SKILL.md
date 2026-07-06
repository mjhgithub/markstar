---
name: data-to-chart
description: Use when the user wants to create charts, graphs, or data visualizations, or uses Chinese keywords like 画图/图表/可视化/数据展示/生成图表. Also triggered by /data-to-chart command. Supports automatic chart type selection based on business scenario analysis with ECharts.
---

# data-to-chart — 智能图表生成

根据用户的分析意图和数据特征，自动选择 ECharts 图表类型并生成完整的可交互 HTML 文件。当检测到大屏/仪表盘场景时，自动切换为多图表 Dashboard 模式。

## 核心原则

**业务场景决定图表类型，数据结构辅助验证。冲突时业务优先。**

## 执行流程

严格按以下步骤执行。每步完成后进入下一步，不可跳过。

---

### Step 0: 大屏场景检测（前置）

检测用户输入是否含大屏关键词：「大屏、数据大屏、仪表盘、驾驶舱、概览、总览、看板」。

- **命中** → **必须先用 Read 工具加载 `reference/dashboard-guide.md`**，然后进入 Dashboard 流程（D1-D3），替代原有 Step 1-5
- **未命中** → 继续原有单图流程，进入 Step 1

---

## Dashboard 流程（命中大屏场景时）

### D1: 区域规划

分析用户描述，拆解为若干子图表 + KPI 卡片。每个子图按原 Step 1 场景分析确定图表类型。

根据图表数量，从 `dashboard-guide.md` 布局模式表中选择 Grid 布局：

| 图表数 | 布局 | Grid class |
|--------|------|------------|
| 1 | KPI 列 + 图表列 | `cols-2` |
| 2 | 2 列均分 | `cols-2` |
| 3 | 2列 + 下方跨整行 | `cols-2`，下方 `.span-full` |
| 4 | 2×2 | `cols-2 rows-2` |
| 5 | 上方跨行 + 2×2 | `.span-full` + `cols-2 rows-2` |
| 6 | 2×3 | `cols-3 rows-2` |
| ≥7 | 3×N | `cols-3` |

### D2: 数据获取与图表 Option 生成

对每个子图区域执行原 Step 2+3+4（数据获取 → 数据整理 → 双轴验证），记录每块图表的 option 对象。

**颜色统一**：所有图表使用 Theme B 调色板：`['#00DDFF','#37A2FF','#FF0087','#FFBF00','#00E396','#FEBE4A','#A78BFA','#34D399','#FF6B6B']`

**KPI 卡片数据**：从所有子图数据中提炼 2-4 个关键指标（总量、最高值、同比变化、合计占比等）。

### D3: 大屏 HTML 生成

使用 `dashboard-guide.md` 中的 Dashboard HTML 骨架，将各 option 嵌入。

输出格式：先输出 Dashoard 内容说明（各区域名称 + 图表类型 + 数据来源），再输出完整 HTML。

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

**主题选择**：根据用户场景关键词自动匹配主题方案（参见 `reference/echarts-templates.md` 中的「主题配色方案」章节）：
- 含「大屏、仪表盘、深色、暗色、科技」→ 方案 B：科技深色
- 含「论文、打印、学术、出版、无障碍」→ 方案 C：简约学术
- 其他（默认）→ 方案 A：专业商务

**代码生成**：
- 引入 CDN：`<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>`
- `.wrapper` 包裹容器：居中、最大宽度、圆角、阴影、内边距 — 与所选主题骨架一致
- 图表容器：`<div id="chart" style="width:100%; min-height:400px;"></div>`
- 文字区域：`<h1>` 标题 + `.subtitle` 数据来源 + `.note` 脚注，三件套缺一不可
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
| `reference/dashboard-guide.md` | 大屏布局模式、KPI 卡片、动态背景、骨架模板 | Step 0 检测到大屏关键词时加载 |
| `reference/chart-mapping.md` | 完整图表类型映射表和冲突解决规则 | Step 1 前必须加载 |
| `reference/data-processing.md` | 数据获取降级链和格式转换规则 | Step 2 前必须加载 |
| `reference/echarts-templates.md` | ECharts option 模板和通用配置 | Step 5 前必须加载 |
