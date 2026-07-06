# Comet Design Handoff

- Change: data-to-chart
- Phase: design
- Mode: compact
- Context hash: 98009a580f470ec78284da85150a724ea7e6664122c323f671a26693e23610bc

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/data-to-chart/proposal.md

- Source: openspec/changes/data-to-chart/proposal.md
- Lines: 1-28
- SHA256: bef868d982e81c9441fbc8a35ee56d61ab4ca3e21d15716092d3196f224b1955

```md
## Why

用户在数据分析对话中需要快速将数据或场景描述转化为可视化图表，但手动选择图表类型、搭建 ECharts 配置效率低下。需要一个 AI Agent skill 自动完成「数据理解 → 图表选型 → 代码生成」全流程，一次对话即可产出可交互的 HTML 图表。

## What Changes

- 新增 `data-to-chart` skill，自动根据业务场景和数据特征选择合适的 ECharts 图表类型
- 实现双轴匹配逻辑：业务场景语义为主轴，数据结构特征为副轴，冲突时业务优先
- 支持多种数据来源：纯文字描述推断、项目文件读取、接口调用、网络搜索整理
- 输出完整可独立运行的 HTML 文件（CDN 引入 ECharts），一次性输出无需交互确认
- 支持 Slash command (`/chart`) 和自然语言关键词两种触发方式
- 兼容 Claude Code 和 Codex 平台

## Capabilities

### New Capabilities
- `chart-smart-select`: 图表智能选型能力 — 基于业务场景关键词和数据结构特征的映射规则
- `data-source-integration`: 多来源数据获取能力 — 文件读取、接口调用、网络搜索的数据采集与整理
- `echarts-codegen`: ECharts 代码生成能力 — 按选型结果构建 option 并输出完整 HTML

### Modified Capabilities
<!-- 首版无修改，留空 -->

## Impact

- 部署位置：`C:\Users\PC\.claude\skills\data-to-chart\`（当前项目，测试通过后推广为用户级 skill）
- 依赖：Apache ECharts CDN（无其他运行时依赖）
- 文件范围：SKILL.md + reference/ 子目录（图表选型规则表、ECharts option 模板等）
```

## openspec/changes/data-to-chart/design.md

- Source: openspec/changes/data-to-chart/design.md
- Lines: 1-111
- SHA256: bb03463bbe752cb45e2413dbfaa46f2954166fc2c1842d7ed826eea635ade58c

[TRUNCATED]

```md
## Context

用户在数据分析对话中频繁需要图表可视化，但手动选择图表类型并编写 ECharts 配置效率低且容易出错。本项目创建一个 AI Agent skill，使 LLM 能自动完成「场景理解 → 图表选型 → 数据获取 → 代码生成」全流程。

当前项目 `D:\mjh\code\claude\skills1` 已有 `comet`、`openspec-*` 等 skill，`data-to-chart` 作为独立 skill 加入，遵循相同 SKILL.md 格式。

## Goals / Non-Goals

**Goals:**
- 根据业务场景关键词自动选择 ECharts 图表类型
- 根据数据结构特征验证图表类型可行性，冲突时以业务场景为准
- 支持多来源数据获取：项目文件、API 接口、Web 搜索、纯描述推断
- 输出完整独立 HTML 文件（CDN ECharts），浏览器直接打开可交互
- 支持 `/chart` 斜杠命令和自然语言关键词触发
- 兼容 Claude Code 和 Codex 平台

**Non-Goals:**
- 不做服务端渲染、图片导出
- 不做实时数据看板/仪表盘
- 首版不做 React/Vue/其他框架组件（保留扩展点）

## Decisions

### D1: 文件结构

```
skills/data-to-chart/
├── SKILL.md              # 主入口：触发规则 + 执行流程
└── reference/
    ├── chart-mapping.md  # 业务场景→图表类型映射表
    ├── echarts-guide.md  # ECharts option 构建指南 + 常用模板
    └── data-sources.md   # 数据来源处理策略
```

**理由**: 与现有 skill（comet、openspec-* 等）结构一致，主文件轻量，参考文件按需加载。

### D2: 图表选型双轴匹配

**业务场景轴**（主，通过关键词匹配）：

| 场景关键词 | 推荐图表 | ECharts series.type |
|-----------|---------|-------------------|
| 趋势、变化、增长率、走势、时间线 | 折线图 | `line` |
| 占比、份额、构成、分布、比例 | 饼图/环形图 | `pie` |
| 排名、对比、比较、最高最低 | 柱状图 | `bar` |
| 时间+分类组合、堆积 | 堆叠柱状/面积 | `bar`(stack) / `line`(areaStyle) |
| 两个变量关系、相关性 | 散点图 | `scatter` |
| 多维指标、综合评分 | 雷达图 | `radar` |
| 地域、地区、省份、城市 | 地图 | `map`(需注册) |
| 流程、转化、漏斗、阶段 | 漏斗图 | `funnel` |
| 进度、完成率、KPI、达成 | 仪表盘 | `gauge` |
| 层级、树形、嵌套 | 旭日图/矩形树图 | `sunburst` / `treemap` |
| 分布、频次、密度 | 直方图/箱线图 | `bar`(histogram) / `boxplot` |
| 波动、范围、区间 | 蜡烛图/误差图 | `candlestick` |

**数据结构轴**（副，用于验证）：

| 数据特征 | 适配图表 |
|---------|---------|
| 1维时间序列 x→y | line, bar, area |
| 分类 + 单值 | bar, pie |
| 分类 + 时间 + 值（多系列） | stacked bar, stacked area |
| x, y 数值对 | scatter, line |
| 多维指标（≥3个维度） | radar, parallel |
| 层级结构 | sunburst, treemap |
| 含地理坐标 | map |

**冲突解决**：当数据轴建议的图表与业务轴不一致时，以业务轴为准。例如：数据是"分类+值"（适合饼图），但场景是"10年趋势"→ 依然生成折线图。

**理由**: 图表展示应服务于分析目的，而非数据结构本身。同一个"各产业占比"数据，用户说的是"趋势"就给他看趋势，说的是"占比"就给他看占比。

### D3: 数据获取优先级

```
项目文件（CSV/JSON/Excel）→ 项目 API 端点 → Web 搜索 → 示例数据占位
```

1. 先在项目目录中搜索匹配的数据文件
2. 若有项目内 API，尝试调用
3. 前两步无数据时，使用 `mcp__web-search-prime__web_search_prime` 搜索相关数据
```

Full source: openspec/changes/data-to-chart/design.md

## openspec/changes/data-to-chart/tasks.md

- Source: openspec/changes/data-to-chart/tasks.md
- Lines: 1-25
- SHA256: cfe2bf3bf3d2aaa919dd58e870e2027741a98fbd3e1083b491f9babe7376a558

```md
## 1. Skill 骨架搭建

- [ ] 1.1 创建 `C:\Users\PC\.claude\skills\data-to-chart\SKILL.md` 主入口文件，包含触发规则、执行流程描述、参考文件索引

## 2. 图表选型参考文件

- [ ] 2.1 创建 `reference/chart-mapping.md`：完整业务场景关键词→图表类型映射表，按优先级排序，每条包含场景关键词、推荐 chart type、适用条件、降级方案

## 3. ECharts 代码生成参考文件

- [ ] 3.1 创建 `reference/echarts-guide.md`：ECharts option 构建规范，包含各图表类型的 option 模板、颜色方案、交互配置（tooltip/legend/toolbox）、响应式设置

## 4. 数据来源处理参考文件

- [ ] 4.1 创建 `reference/data-sources.md`：数据获取策略优先级说明、数据格式与 ECharts dataset 的映射关系、数据不可用时的降级处理说明

## 5. 端到端验收测试

- [ ] 5.1 验证：输入「最近10年GDP增长率」→ 输出折线图 HTML
- [ ] 5.2 验证：输入「最近10年GDP各产业占比」→ 输出堆叠柱状图 HTML
- [ ] 5.3 验证：提供示例 CSV 数据 + 描述 → 自动解析并生成匹配图表
- [ ] 5.4 验证：数据适合饼图但场景要求趋势 → 以业务场景为准生成折线图
- [ ] 5.5 验证：`/chart` 斜杠命令可正确触发 skill
- [ ] 5.6 验证：自然语言「画个图」等关键词可触发 skill
- [ ] 5.7 验证：本地无数据时自动通过网络搜索获取数据并生成图表
```

## openspec/changes/data-to-chart/specs/chart-smart-select/spec.md

- Source: openspec/changes/data-to-chart/specs/chart-smart-select/spec.md
- Lines: 1-70
- SHA256: dd7831c6cfadf57e20dcec750037b021e3d4c5bafa34bb26c45605c94c401921

```md
# chart-smart-select — 图表智能选型

## ADDED Requirements

### Requirement: 业务场景关键词匹配

系统 SHALL 根据用户输入中的业务场景关键词，从映射表中匹配推荐的 ECharts 图表类型。

#### Scenario: 趋势类场景生成折线图

- **WHEN** 用户输入包含「趋势」「变化」「增长率」「走势」「时间线」「历年」「最近N年」等关键词
- **THEN** 系统推荐 `line`（折线图）作为图表类型

#### Scenario: 占比类场景生成饼图

- **WHEN** 用户输入包含「占比」「份额」「构成」「分布」「比例」「百分比」「比重」等关键词
- **THEN** 系统推荐 `pie`（饼图/环形图）作为图表类型

#### Scenario: 对比排名类场景生成柱状图

- **WHEN** 用户输入包含「排名」「对比」「比较」「最高最低」「TOP」「排行」等关键词
- **THEN** 系统推荐 `bar`（柱状图）作为图表类型

#### Scenario: 关系类场景生成散点图

- **WHEN** 用户输入包含「关系」「相关性」「关联」等关键词，且涉及两个数值变量
- **THEN** 系统推荐 `scatter`（散点图）作为图表类型

#### Scenario: 地域类场景生成地图

- **WHEN** 用户输入包含「地域」「地区」「省份」「城市」「国家」「分布」等地理相关关键词
- **THEN** 系统推荐 `map`（地图）作为图表类型，并提示需注册地图 JSON

#### Scenario: 多场景关键词同时出现

- **WHEN** 用户输入同时包含多种场景关键词（如「各省GDP对比和增长率趋势」）
- **THEN** 系统 SHALL 选择优先匹配的关键词（关键词优先级按映射表顺序：趋势 > 占比 > 对比 > 关系 > 地域 > 流程 > 进度 > 层级 > 波动）

#### Scenario: 无法识别场景

- **WHEN** 用户输入不包含任何已知场景关键词
- **THEN** 系统 SHALL 默认选择 `bar`（柱状图），并在输出中说明默认选型原因

### Requirement: 数据结构特征验证

系统 SHALL 分析数据结构特征，验证其是否支持业务场景轴推荐的图表类型。数据不匹配时以业务场景为准。

#### Scenario: 数据结构与场景一致

- **WHEN** 数据结构是时间序列（x为日期/年份），业务场景推荐 `line`
- **THEN** 系统 SHALL 直接采用 `line`，不做调整

#### Scenario: 数据结构与场景冲突

- **WHEN** 数据结构是「分类+单值」（适合饼图），但业务场景是「趋势变化」（推荐折线图）
- **THEN** 系统 SHALL 以业务场景为准，仍生成折线图

#### Scenario: 数据缺失关键维度

- **WHEN** 业务场景推荐 `scatter`（散点图），但数据只有一个数值维度
- **THEN** 系统 SHALL 降级为业务场景的次选图表（柱状图），并在输出中说明数据限制

### Requirement: 图表类型建议输出

系统 SHALL 在最终输出中包含选型理由（不超过2句话），说明为什么选择该图表类型。

#### Scenario: 正常输出选型理由

- **WHEN** 系统完成场景匹配和类型选择
- **THEN** 输出中包含类似「基于"趋势变化"场景，选择折线图展示历年数据变化」的简短说明
```

## openspec/changes/data-to-chart/specs/data-source-integration/spec.md

- Source: openspec/changes/data-to-chart/specs/data-source-integration/spec.md
- Lines: 1-55
- SHA256: f85fc37a3db78da5175de8fbe6e89a9605f65df6effd00443f6318d8c437d395

```md
# data-source-integration — 多来源数据获取

## ADDED Requirements

### Requirement: 项目文件数据读取

系统 SHALL 优先在项目目录中搜索匹配的数据文件（CSV、JSON、Excel），解析为图表可用格式。

#### Scenario: 项目中有匹配的 CSV 文件

- **WHEN** 用户在项目目录下存在与话题相关的 CSV 或 JSON 数据文件
- **THEN** 系统 SHALL 读取该文件并解析数据，用于图表生成

#### Scenario: 项目中有匹配的 Excel 文件

- **WHEN** 用户在项目目录下存在 .xlsx 或 .xls 文件
- **THEN** 系统 SHALL 尝试使用可用工具读取内容，提取图表用的行列数据

#### Scenario: 项目中没有匹配数据文件

- **WHEN** 项目目录中不存在相关数据文件
- **THEN** 系统 SHALL 依次尝试下一步数据源，不在此步骤报错

### Requirement: 网络搜索数据获取

系统 SHALL 当本地无数据时，通过网络搜索获取相关数据并整理为图表可用格式。

#### Scenario: 搜索获取公开统计数据

- **WHEN** 用户询问「最近10年GDP增长率」且本地无数据
- **THEN** 系统 SHALL 使用 Web 搜索获取相关数据，提取数值并整理为图表可用格式

#### Scenario: 搜索结果无可用数据

- **WHEN** Web 搜索无法返回可用数据
- **THEN** 系统 SHALL 使用合理示例数据，并在输出中标注「已使用示例数据」

### Requirement: 数据整理为 ECharts 可用格式

系统 SHALL 将获取的数据（无论来源）整理为 ECharts `dataset` 或 `xAxis.data` + `series.data` 标准格式。

#### Scenario: 时间序列数据整理

- **WHEN** 获取到「年份→数值」类数据
- **THEN** 输出为 `{ xAxis: { data: [...] }, series: [{ data: [...] }] }` 格式

#### Scenario: 分类对比数据整理

- **WHEN** 获取到「分类名称→数值」类数据
- **THEN** 输出为 `{ xAxis: { data: [分类列表] }, series: [{ data: [数值列表] }] }` 格式

#### Scenario: 多系列数据整理

- **WHEN** 获取到多个分类维度的数据（如各产业占比）
- **THEN** 输出为 `{ series: [{ name: '系列1', data: [...] }, { name: '系列2', data: [...] }] }` 格式
```

## openspec/changes/data-to-chart/specs/echarts-codegen/spec.md

- Source: openspec/changes/data-to-chart/specs/echarts-codegen/spec.md
- Lines: 1-55
- SHA256: 6646bb62e5428cb6ad90ce75b8d228cbb74c30e6fae5928b126c805791748eed

```md
# echarts-codegen — ECharts 代码生成

## ADDED Requirements

### Requirement: 完整 HTML 文件输出

系统 SHALL 生成一个完整独立、可直接在浏览器打开的 HTML 文件，包含 ECharts CDN 引入和图表初始化代码。

#### Scenario: 输出标准 HTML 结构

- **WHEN** 系统完成图表选型和数据整理
- **THEN** 输出文件 SHALL 包含：
  - `<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js">` CDN 引入
  - 一个具有 id 的 `<div>` 容器（宽度100%，最小高度400px）
  - `window.onload` 或 `DOMContentLoaded` 中初始化 `echarts.init()`
  - 调用 `setOption()` 设置完整配置
  - 响应窗口大小变化（`window.onresize` → `chart.resize()`）

#### Scenario: 移动端适配

- **WHEN** 生成的 HTML 在移动设备打开
- **THEN** 图表 SHALL 自适应屏幕宽度，不超出可视区域

### Requirement: ECharts option 正确性

系统 SHALL 生成符合 ECharts 5.x API 规范的完整 option 配置对象。

#### Scenario: 包含完整基础配置

- **WHEN** 生成任意类型的图表
- **THEN** option SHALL 包含：`title`、`tooltip`、`xAxis`/`yAxis`（或对应坐标轴）、`series`

#### Scenario: 不同图表类型的特定配置

- **WHEN** 图表类型为 `pie`（饼图）
- **THEN** series 中 SHALL 不包含 `xAxis`/`yAxis` 引用，使用 `series.data` 格式 `{ name, value }`

#### Scenario: 图表颜色方案

- **WHEN** 生成多系列图表
- **THEN** SHALL 使用 `echarts.setOption` 中的默认配色或合理的自定义配色，确保系列间颜色可区分

### Requirement: 输出同时包含说明

系统 SHALL 在 HTML 文件之外同时以文字说明选型理由和图表解读。

#### Scenario: 输出包含选型理由

- **WHEN** 生成图表代码
- **THEN** 在代码块上方或回复中包含选型理由（如「基于"趋势变化"场景，选择折线图」）

#### Scenario: 图表标题自动设置

- **WHEN** 用户描述中可提取图表主题
- **THEN** option.title.text SHALL 设置为该主题的简短标题
```

