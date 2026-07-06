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
