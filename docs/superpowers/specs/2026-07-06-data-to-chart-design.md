---
comet_change: data-to-chart
role: technical-design
canonical_spec: openspec
---

# data-to-chart — AI Agent Skill 技术设计

## 1. 概述

`data-to-chart` 是一个 Claude Code skill，使 LLM 能根据用户的分析意图和数据特征，自动选择合适的 ECharts 图表类型并生成完整可交互的 HTML 文件。

**核心原则**：业务场景决定图表类型，数据结构辅助验证。冲突时业务优先。

## 2. 文件结构

```
~/.claude/skills/data-to-chart/
├── SKILL.md                      # 主入口，指令式5步流程
└── reference/
    ├── chart-mapping.md          # 12种图表类型映射表（场景关键词→类型→降级）
    ├── echarts-templates.md      # ECharts option 参考模板（各类型最小示例）
    └── data-processing.md        # 数据获取策略与整理规范
```

## 3. 执行流程（SKILL.md 核心指令）

### Step 1: 场景分析 — 确定图表类型

Agent 必须先用 Read 工具加载 `reference/chart-mapping.md`，然后按优先级从用户输入中匹配业务关键词：

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

无法识别时默认 `bar`。选择结果记录在最终输出中（1-2句话理由）。

### Step 2: 数据获取

按优先级降级链执行，上一级无数据时自动进入下一级：

1. **项目文件**：搜索当前项目目录下的 CSV/JSON/Excel 文件，读取解析
2. **Web 搜索**：使用 web_search 工具搜索相关公开数据，必要时打开1-2个结果页面提取详细数值
3. **示例数据**：标注「已使用示例数据」，用合理模拟数据继续

### Step 3: 数据整理

将数据转换为 ECharts 可用格式，适应性处理：

- 时间序列 → `{ xAxis: { data: [...] }, series: [{ data: [...] }] }`
- 分类对比 → `{ xAxis: { data: [分类] }, series: [{ data: [数值] }] }`
- 多系列 → `{ series: [{ name, data }, ...] }`
- 饼图 → `{ series: [{ data: [{ name, value }, ...] }] }`

### Step 4: 双轴验证

分析数据的实际维度：
- 数据是时间序列但业务选饼图 → 以业务为准，仍用时间序列方式展示
- 数据缺关键维度（如散点图需两个数值列但数据只有一个）→ 降级为柱状图并说明
- 数据与业务一致 → 直接通过

### Step 5: 代码生成

参考 `reference/echarts-templates.md` 获取该图表类型的 ECharts option 结构参考，但灵活适配实际数据的维度、系列数、值域。

**HTML 输出要求**：
- `<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js">`
- 容器 `width:100%; min-height:400px`，id 为 `chart`
- 构建 `option` 对象，调用 `echarts.init().setOption(option)`
- 响应式：`window.onresize` → `chart.resize()`
- 默认 tooltip、legend（多系列时）、toolbox（saveAsImage）
- 中文 font-family
- 地图场景额外引入中国地图 CDN JSON，注册后使用

**输出格式**：
1. 先文字说明选型理由（1-2句）
2. 再 HTML 代码块

## 4. 触发机制

### SKILL.md frontmatter

```yaml
---
name: data-to-chart
description: Use when the user wants to create charts, graphs, or data visualizations, or uses Chinese keywords like 画图/图表/可视化/数据展示/生成图表. Also triggered by /data-to-chart command. Supports automatic chart type selection based on business scenario analysis with ECharts.
---
```

### 触发条件
- 用户输入包含：画图、图表、可视化、数据展示、生成图、chart、graph、plot 等
- 用户使用 `/data-to-chart` 斜杠命令

## 5. 参考文件内容概要

### chart-mapping.md
- 完整 12 种类型的映射表（关键词列表 + 适用条件 + 降级方案）
- 多关键词优先级排序规则
- 冲突解决决策树

### echarts-templates.md
- 每种图表类型的最小示例（option 骨架 + 必要配置项）
- 通用配置：tooltip、legend、toolbox、color 方案
- 不是一个模板套所有 — 标注哪些是必须项、哪些是可选项

### data-processing.md
- 数据来源降级链详细说明
- CSV/JSON/Web 搜索结果 → ECharts 数据格式转换规则
- 示例数据生成指引

## 6. 风险与限制

- 搜索数据质量不可控 → 标注数据来源，示例数据时明确告知用户
- 地图类型受限于 CDN JSON 可用性 → 首版仅中国地图，其他地区提示需自行注册
- 复杂图表（如混合图表、3D）不在首版范围内
- 适应性优先意味着同一场景输出可能不完全一致，但图表类型选择由规则保证正确
