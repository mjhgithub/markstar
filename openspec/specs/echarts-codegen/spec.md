# echarts-codegen Specification

## Purpose
TBD - created by archiving change data-to-chart. Update Purpose after archive.
## Requirements
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

