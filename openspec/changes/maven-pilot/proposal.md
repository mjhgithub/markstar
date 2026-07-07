## Why

Maven 项目中的依赖冲突（NoSuchMethodError、ClassNotFoundException）是 Java 开发者每天都会遇到的痛点。现有工具如 Maven Helper 只能展示冲突，不能自动修复。maveniverse/pilot 提供了强大的冲突检测引擎，但缺少「理解项目上下文 → 做出最优修复决策」这一层。本技能通过 AI 填补这个空白：检测冲突 → 分析上下文 → 推荐方案 → 用户确认后自动修改 pom.xml。

## What Changes

- 新增 `skills/maven-pilot/` 技能目录，包含 SKILL.md 及参考文档
- 技能名 `maven-pilot`，CLI 子命令 `/maven-pilot check`（只检测）和 `/maven-pilot fix`（检测+全修），以及 `/maven-pilot` 对话入口
- 底层调用 `mvn eu.maveniverse.maven.plugins:pilot:conflicts -Dpilot.action=report` 获取冲突数据
- AI 分析报告后提供修复建议，修改 pom.xml 前展示 diff 确认

## Capabilities

### New Capabilities
- `conflict-detection`: 基于 pilot 引擎的 Maven 依赖版本冲突检测，解析冲突报告并给出 AI 解释（冲突来源、影响评估、建议版本）
- `auto-fix`: AI 驱动的依赖冲突自动修复，先展示 diff 预览，用户确认后修改 pom.xml

### Modified Capabilities
-（无，本 change 不修改已有能力）

## Impact

- 新增 `skills/maven-pilot/` 目录（不影响已有的 `skills/data-to-chart/`）
- 用户需有 `mvn` 命令可用（Java 开发者标配）
- pilot 无需在 pom.xml 中配置，零安装成本
