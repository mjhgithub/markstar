# MarkStar — AI 编程技能集合

一行命令安装 [Claude Code](https://claude.ai/code) 技能，开箱即用。

## 安装

```bash
npx -y markstar
```

技能安装到 `~/.claude/skills/`，重启 Claude Code 即可使用。

## 技能列表

### data-to-chart — 智能图表生成

```
/data-to-chart 近6个月销售额趋势              ← 项目内有数据文件时自动读取
/data-to-chart 2026年全球智能手机市场份额饼图   ← 无本地数据时自动从网络搜索
/data-to-chart 各部门人员分布饼图
/data-to-chart 大屏：Q2 运营数据概览           ← 自动触发仪表盘模式
```

| 能力 | 说明 |
|------|------|
| 自动选型 | 根据业务场景自动选择 ECharts 图表类型（折线、柱状、饼图、散点、地图等 12 种），数据结构辅助验证 |
| 智能数据获取 | 优先搜索项目目录中的 CSV/JSON/Excel 文件，找不到则从网络搜索公开数据，最后降级为示例数据 |
| 大屏/仪表盘 | 检测到"大屏、仪表盘、驾驶舱、概览"等关键词，自动切换为多图表 Dashboard 布局 + KPI 卡片 |
| 可交互 HTML | 生成完整 HTML 文件，含 tooltip、legend、缩放、导出、深色/商务/学术三种主题 |

### maven-pilot — Maven 依赖冲突检测与修复

```
/maven-pilot check           # 只检测，输出冲突报告
/maven-pilot fix             # 检测 + 修复全量冲突 + 编译验证
/maven-pilot 看看有没有冲突    # 自然语言，AI 识别意图
```

| 能力 | 说明 |
|------|------|
| 冲突检测 | 基于 `mvn dependency:tree -Dverbose`，解析 `omitted for conflict` / `version managed from` 标记 |
| AI 分析 | 对每个冲突分析版本来源、传递路径、影响风险、推荐版本 |
| 安全修复 | 在 `<dependencyManagement>` 锁定版本 或 `<exclusion>` 排除传递依赖 |
| 用户确认 | 所有修改先展示 unified diff，确认后才 apply |
| 编译验证 | 修复后自动 `mvn compile`，编译失败自动回滚 |

**安全约束：** 不升级大版本、不改源代码、不改 `<dependencies>` 中版本号

## 卸载

```bash
npx markstar --uninstall
```

## 许可

MIT