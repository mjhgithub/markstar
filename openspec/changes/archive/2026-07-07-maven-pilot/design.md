## Context

本技能是 markstar 包的一个子 skill，基于 Maven 内置的 `dependency:tree` 命令实现依赖冲突检测与自动修复。通过 `-Dverbose` 参数获取冲突标记（`omitted for conflict`、`version managed from`），AI 解析文本输出中的冲突信息。

技能运行在 Claude Code 环境中，用户通过 `/maven-pilot` 系列命令调用。

## Goals / Non-Goals

**Goals:**
- 在 Claude Code 中一行命令完成 Maven 依赖冲突检测
- AI 分析冲突报告并提供可理解的解释
- 自动生成 pom.xml 修改方案，用户确认后应用
- 支持子命令（check/fix）、无参数默认（检测+分析）、自然语言对话三种入口

**Non-Goals:**
- 不支持横向依赖版本审计（updates/audit）— 后续可扩展
- 不支持非 Maven 项目（Gradle、Ivy 等）
- 不处理 pom.xml 之外的文件
- 不依赖第三方 Maven 插件

## Decisions

### Decision 1: 使用 Maven 内置 dependency:tree（而非 pilot Maven plugin）
- **选型**：`mvn dependency:tree -Dverbose`
- **理由**：Maven 内置命令，零额外依赖，所有 Maven 开发者立即可用；maveniverse/pilot 的 conflicts 子命令只有交互式 TUI，无程序化 report 模式
- **替代方案**：pilot — 功能强大但 conflicts 子命令不支持 `-Dpilot.action=report`，无法被 AI 程序化消费

### Decision 2: AI 解析 dependency:tree 文本输出
- **选型**：解析 `-Dverbose` 输出的 `omitted for conflict` / `version managed from` 等标记
- **理由**：dependency:tree -Dverbose 输出包含明确的冲突标记语言；AI 自然语言理解能力天然适合解析此类文本
- **替代方案**：强制要求 JSON 输出 — dependency:tree 不支持 JSON，需要额外工具链

### Decision 3: AI 直接编辑 pom.xml（而非用 XML 引擎）
- **选型**：AI 直接编辑 pom.xml 文本，git diff 展示变更
- **理由**：AI 对 XML 的编辑能力成熟；git diff 是开发者熟知的确认方式；不需要额外依赖
- **替代方案**：使用 Maven POM 模型库 — 更精确但引入额外依赖，且 AI 无法在修复过程中编排决策（如跳过某些冲突、选择不同版本）

### Decision 4: 三级入口设计
- **选型**：精确子命令 > 无参数默认 > 自然语言对话
- **理由**：精确匹配（check/fix）最可靠用于 CLI；无参数默认提供"顺手就用"体验；自然语言用对话兜底处理所有模糊请求

## Risks / Trade-offs

- **dependency-plugin 3.x 无 -Dverbose** → 回退到默认输出 + AI 交叉比对同一 artifactId 的多层出现来推断冲突
- **AI 错误修改 pom.xml** → 强制 diff 预览 + 用户确认，不改 pom.xml 以外的文件
- **大型多模块项目** → dependency:tree 自然支持多模块；AI 解析时说明修改作用于父 pom 的 dependencyManagement
- **dependency:tree 命令失败** → 检测 mvn 是否可用；失败时提供原始命令让用户手动验证
