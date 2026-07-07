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
/data-to-chart 近6个月销售额趋势
/data-to-chart 各部门人员分布饼图
/data-to-chart 大屏：Q2 运营数据概览   ← 自动触发仪表盘模式
```

| 能力 | 说明 |
|------|------|
| 自动选型 | 根据业务场景自动选择 ECharts 图表类型（折线、柱状、饼图、散点等），数据结构辅助验证 |
| 大屏/仪表盘 | 检测到"大屏、仪表盘、驾驶舱、概览"等关键词，自动切换为多图表 Dashboard 布局 |
| 可交互 HTML | 生成完整的 HTML 文件，包含 tooltip、legend、缩放、导出等交互 |

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