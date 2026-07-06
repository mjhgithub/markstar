## 1. Skill 骨架搭建

- [x] 1.1 创建 `C:\Users\PC\.claude\skills\data-to-chart\SKILL.md` 主入口文件，包含触发规则、执行流程描述、参考文件索引

## 2. 图表选型参考文件

- [x] 2.1 创建 `reference/chart-mapping.md`：完整业务场景关键词→图表类型映射表，按优先级排序，每条包含场景关键词、推荐 chart type、适用条件、降级方案

## 3. ECharts 代码生成参考文件

- [x] 3.1 创建 `reference/echarts-guide.md`：ECharts option 构建规范，包含各图表类型的 option 模板、颜色方案、交互配置（tooltip/legend/toolbox）、响应式设置

## 4. 数据来源处理参考文件

- [x] 4.1 创建 `reference/data-sources.md`：数据获取策略优先级说明、数据格式与 ECharts dataset 的映射关系、数据不可用时的降级处理说明

## 5. 端到端验收测试

- [x] 5.1 验证：输入「最近10年GDP增长率」→ 输出折线图 HTML
- [x] 5.2 验证：输入「最近10年GDP各产业占比」→ 输出堆叠柱状图 HTML
- [x] 5.3 验证：提供示例 CSV 数据 + 描述 → 自动解析并生成匹配图表
- [x] 5.4 验证：数据适合饼图但场景要求趋势 → 以业务场景为准生成折线图
- [x] 5.5 验证：`/data-to-chart` 斜杠命令可正确触发 skill
- [x] 5.6 验证：自然语言「画个图」等关键词可触发 skill
- [x] 5.7 验证：本地无数据时自动通过网络搜索获取数据并生成图表
