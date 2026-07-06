# data-source-integration Specification

## Purpose
TBD - created by archiving change data-to-chart. Update Purpose after archive.
## Requirements
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

