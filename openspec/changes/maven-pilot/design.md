## Context

本技能是 markstar 包的一个子 skill，基于 maveniverse/pilot 引擎实现 Maven 依赖冲突检测与自动修复。pilot 是 Apache Maven 核心团队开发的终端 TUI/CLI 工具，提供 `pilot:conflicts` 命令输出结构化冲突报告（含 `report`/`check`/`fix` 三种 action 模式）。

技能运行在 Claude Code 环境中，用户通过 `/maven-pilot` 系列命令调用。

## Goals / Non-Goals

**Goals:**
- 在 Claude Code 中一行命令完成 Maven 依赖冲突检测
- AI 分析冲突报告并提供可理解的解释
- 自动生成 pom.xml 修改方案，用户确认后应用
- 支持子命令（check/fix）、无参数默认（检测+分析）、自然语言对话三种入口

**Non-Goals:**
- 不替代 pilot 的其他能力（updates/audit/dependencies）— 后续可扩展
- 不支持非 Maven 项目（Gradle、Ivy 等）
- 不处理 pom.xml 之外的文件
- 不支持跨模块批量扫描

## Decisions

### Decision 1: 直接调用 pilot Maven plugin（而非 jbang/CLI）
- **选型**：`mvn eu.maveniverse.maven.plugins:pilot:conflicts -Dpilot.action=report`
- **理由**：Maven Java 开发者默认有 `mvn` 命令；jbang 需要额外安装；Maven plugin 模式直接复用用户的 Maven 配置（如 mirror、profile）
- **替代方案**：jbang CLI — 优点是不依赖 mvn，缺点是额外安装成本和 Maven 配置丢失

### Decision 2: AI 解析 pilot 文本输出（而非 JSON）
- **选型**：解析 actio=report 的结构化文本
- **理由**：pilot 的 report 模式输出是结构化文本，AI 自然语言理解能力天然适合解析此类文本，无需额外 JSON 解析层
- **替代方案**：pilot 的 JSON 输出 — 如果需要更精确解析可改用，但第一期使用文本更省成本

### Decision 3: AI 直接编辑 pom.xml（而非用 DomTrip）
- **选型**：AI 直接编辑 pom.xml 文本，git diff 展示变更
- **理由**：AI 对 XML 的编辑能力成熟；git diff 是开发者熟知的确认方式；不需要额外依赖
- **替代方案**：pilot 内置的 DomTrip XML 引擎 — 更精确但需要调 `-Dpilot.action=fix`，AI 无法在 fix 过程中编排决策（如跳过某些冲突、选择不同版本）

### Decision 4: 三级入口设计
- **选型**：精确子命令 > 无参数默认 > 自然语言对话
- **理由**：精确匹配（check/fix）最可靠用于 CLI；无参数默认提供"顺手就用"体验；自然语言用对话兜底处理所有模糊请求

## Risks / Trade-offs

- **pilot 版本依赖** → 技能文档中注明最低 pilot 版本要求；CI 定期验证新版本兼容性
- **AI 错误修改 pom.xml** → 强制 diff 预览 + 用户确认，不改 pom.xml 以外的文件
- **大型 pom.xml（多模块）** → pilot 本身支持多模块；AI 解析时说明修改作用于哪个模块
- **pilot 命令失败** → 检测 pilot 是否可用；失败时提供原始命令让用户手动验证
