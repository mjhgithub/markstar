# Comet Design Handoff

- Change: maven-pilot
- Phase: design
- Mode: compact
- Context hash: 6069b94964abaa6c7304031465e168d27f161321802043ad8b631dd999dfe05a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/maven-pilot/proposal.md

- Source: openspec/changes/maven-pilot/proposal.md
- Lines: 1-25
- SHA256: efd84be0e21e69c0faa8c135a7d950c8ab5d4cea71389c60be4c47beab6cdd29

```md
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
```

## openspec/changes/maven-pilot/design.md

- Source: openspec/changes/maven-pilot/design.md
- Lines: 1-47
- SHA256: e1a45f159a07da06b2ceb22f8f29760915de8eaf1c3a0fdea2d769ade634d2c6

```md
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
```

## openspec/changes/maven-pilot/tasks.md

- Source: openspec/changes/maven-pilot/tasks.md
- Lines: 1-32
- SHA256: ee2e4ca17283144a55c2dd2dd38ae90bf66ba87f4e25045bfd503045c2abf92f

```md
## 1. Skills 目录与元数据

- [ ] 1.1 创建 `skills/maven-pilot/SKILL.md`，包含 frontmatter（name: maven-pilot，description 描述冲突检测与修复能力）
- [ ] 1.2 创建 `skills/maven-pilot/reference/` 目录，准备参考文档

## 2. 核心实现

- [ ] 2.1 实现 pilot 命令执行层：调用 `mvn eu.maveniverse.maven.plugins:pilot:conflicts -Dpilot.action=report` 并捕获输出
- [ ] 2.2 实现 `check` 模式：解析 pilot 报告 → AI 分析冲突 → 输出可读报告
- [ ] 2.3 实现 `fix` 模式：check 全部冲突 → AI 生成 pom.xml 修改 diff → 展示 diff → 用户确认后应用
- [ ] 2.4 实现入口路由逻辑：精确匹配 → check/fix → 无参数/自然语言，包含对话入口处理

## 3. 入口命令 /maven-pilot

- [ ] 3.1 实现 `/maven-pilot` 无参数时的默认行为（检测 + 分析，等待用户）
- [ ] 3.2 实现 `/maven-pilot fix` 检测并修复全量冲突
- [ ] 3.3 实现 `/maven-pilot check` 只检测不修复
- [ ] 3.4 实现自然语言对话入口，正确识别用户意图并路由

## 4. 参考文档

- [ ] 4.1 创建 `skills/maven-pilot/reference/pilot-usage.md` — pilot 命令参考和常见输出格式说明
- [ ] 4.2 创建 `skills/maven-pilot/reference/conflict-resolution.md` — 冲突解决方案策略文档

## 5. 验证

- [ ] 5.1 在有冲突和非冲突的 Maven 项目中分别验证 check 和 fix 流程

## 6. 发布

- [ ] 6.1 提交代码到 GitHub
- [ ] 6.2 发布新版 markstar 到 npm
```

## openspec/changes/maven-pilot/specs/auto-fix/spec.md

- Source: openspec/changes/maven-pilot/specs/auto-fix/spec.md
- Lines: 1-38
- SHA256: d87dced5d30af4bc08715e395ea8d2b4a3aa5968225597130d38105c7d96a852

```md
## ADDED Requirements

### Requirement: Fix all conflicts with AI recommendations
When the user invokes `/maven-pilot fix` or explicitly asks to fix, the system SHALL run conflict detection, apply AI-recommended fixes for ALL detected conflicts, and modify the `pom.xml` accordingly. The system SHALL present a diff preview to the user before applying changes, and only apply after user confirmation.

#### Scenario: Fix all conflicts with user confirmation
- **WHEN** user runs `/maven-pilot fix` in a Maven project with 3 detected conflicts
- **THEN** the system SHALL: (1) run detection, (2) produce AI analysis for each conflict, (3) generate the pom.xml modifications as a unified diff, (4) present the diff to the user, (5) wait for explicit user confirmation, (6) apply the changes to pom.xml only after confirmation

#### Scenario: Fix with no conflicts
- **WHEN** user runs `/maven-pilot fix` and no conflicts are detected
- **THEN** the system SHALL output "No dependency conflicts found, nothing to fix"

#### Scenario: User cancels fix after diff preview
- **WHEN** the diff preview is shown and user says "no" / "取消" / "不要修"
- **THEN** the system SHALL NOT apply any changes to pom.xml and report "Fix cancelled"

### Requirement: Diff preview before applying
Before modifying any user's `pom.xml`, the system SHALL generate and display the exact changes as a unified diff. The diff SHALL show each exclusion or version management change separately so the user can understand what will change and why.

#### Scenario: Diff preview with multiple changes
- **WHEN** there are 2 conflicts to fix
- **THEN** the diff SHALL show both modifications clearly in the diff output, each marked with its corresponding conflict number for traceability

### Requirement: pom.xml modification
The system SHALL modify the project's `pom.xml` to resolve conflicts by:
- Adding `<dependencyManagement>` entries with `<exclusion>` for transitive dependency conflicts
- Setting explicit versions in `<properties>` when applicable

The system SHALL NOT modify the code of the project outside of pom.xml.

#### Scenario: Add dependencyManagement entry
- **WHEN** a conflict is resolved by pinning a version
- **THEN** the system SHALL add or update the `<dependencyManagement>` section in pom.xml with the selected version

#### Scenario: Add exclusion for transitive dependency
- **WHEN** a conflict is resolved by excluding a transitive dependency
- **THEN** the system SHALL add `<exclusion>` entries to the appropriate `<dependency>` in pom.xml
```

## openspec/changes/maven-pilot/specs/conflict-detection/spec.md

- Source: openspec/changes/maven-pilot/specs/conflict-detection/spec.md
- Lines: 1-54
- SHA256: 2671c4d3941e35cf6c427122dca45adb615e7bf22ca48099dd18f41001ff0019

```md
## ADDED Requirements

## MODIFIED Requirements

### Requirement: Conflict detection via dependency:tree
The system SHALL detect Maven dependency version conflicts by invoking the Maven built-in `dependency:tree` command. The system SHALL first attempt `mvn dependency:tree -Dverbose` (compatible with maven-dependency-plugin 2.x). If that fails or produces no conflict markers, the system SHALL fall back to `mvn dependency:tree` (for 3.x where `-Dverbose` was removed). The system SHALL parse the text output to identify all version conflicts, transitive dependency paths, and the `omitted for conflict` / `version managed from` markers.

#### Scenario: Run conflict detection successfully
- **WHEN** user runs `/maven-pilot check` in a Maven project root directory
- **THEN** the system SHALL invoke pilot and produce a structured conflict report listing each conflict with groupId:artifactId, conflicting versions, and dependency paths

#### Scenario: No conflicts found
- **WHEN** the pilot report shows no conflicts
- **THEN** the system SHALL report "No dependency conflicts found"

#### Scenario: Maven or pom.xml not found
- **WHEN** the current directory or its parent directories do not contain a `pom.xml`
- **THEN** the system SHALL output "No pom.xml found in current project" and stop

### Requirement: AI-powered conflict analysis
The system SHALL analyze each detected conflict and provide:
- Version comparison and compatibility risk assessment
- Recommended version with rationale (considering the project's framework context)
- Transitive dependency source explanation in natural language

#### Scenario: AI explains a conflict
- **WHEN** pilot reports a version conflict for a dependency
- **THEN** the system SHALL output for each conflict: what versions are in conflict, which artifact introduced each version (the full dependency path), which version is recommended and why

### Requirement: Default entry point (no args)
When the user invokes `/maven-pilot` with no arguments, the system SHALL perform detection first, then automatically proceed to the AI analysis and recommendation stage. It SHALL NOT skip to fix without user confirmation.

#### Scenario: Default entry detects and analyzes
- **WHEN** user runs `/maven-pilot` with no arguments in a Maven project
- **THEN** the system SHALL detect conflicts, analyze them, and present the analysis with suggested fixes, then wait for user response

### Requirement: Natural language entry point
When the user invokes `/maven-pilot <natural language text>` (not `check` or `fix`), the system SHALL interpret the user's intent from the natural language text and route to the appropriate action (check, fix, explain a specific conflict, skip a dependency, etc.).

#### Scenario: User asks to check with natural language
- **WHEN** user runs `/maven-pilot 检查一下依赖冲突`
- **THEN** the system SHALL recognize the intent as "check" and run conflict detection

#### Scenario: User asks to fix with natural language
- **WHEN** user runs `/maven-pilot 帮我修一下`
- **THEN** the system SHALL recognize the intent as "fix" and run detection + fix flow

#### Scenario: User asks to skip a specific conflict
- **WHEN** user runs `/maven-pilot 跳过 guava`
- **THEN** the system SHALL understand the user wants to exclude `guava` from fixes

#### Scenario: Exact subcommand match takes priority
- **WHEN** user runs `/maven-pilot check`
- **THEN** the system SHALL treat this as exact subcommand match, not natural language, and run `check` mode (detection only, no fix)
```

