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
4. 搜索也无法获取时，使用合理示例数据并在输出中说明

**理由**: 优先使用用户已有的真实数据，网络搜索作为后备。

### D4: HTML 输出格式

统一输出标准 HTML 结构：
- CDN 引入 ECharts（`https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js`）
- 响应式容器（`width: 100%; min-height: 400px`）
- `window.onload` 初始化图表
- 完整的 `<script>` 内嵌 option 配置
- 中文友好字体栈

不支持前端框架组件（React/Vue）— 首版只做纯 HTML。后续可扩展。

**理由**: HTML 是最通用格式，无需任何构建工具，降低使用门槛。

### D5: 触发机制

- **斜杠命令**: `/chart <描述或数据>` — 显式调用
- **自然语言**: skill 在 SKILL.md 中声明触发关键词（画图、生成图表、可视化、数据图表等），平台自动匹配

**理由**: 两种方式覆盖精准触发和自然使用两种场景。

## Risks / Trade-offs

- [数据获取失败] → 降级为示例数据 + 说明提示，不阻塞输出
- [业务场景无法识别] → 默认折线图，并在输出中说明选型依据
- [地图组件需要额外注册] → 首版提示用户地图需要注册，预留全国/各省 map JSON 的 CDN 引用
- [搜索数据不准确] → 在图表下方标注数据来源链接
- [ECharts 版本兼容] → 固定使用 ECharts 5.x CDN，首次加载新增主题
