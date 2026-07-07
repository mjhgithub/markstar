---
comet_change: maven-pilot
role: technical-design
canonical_spec: openspec
---

# maven-pilot — Maven 依赖冲突检测与自动修复

## Context

Maven 项目的依赖版本冲突是 Java 开发中最常见的运行时错误源头（NoSuchMethodError、ClassNotFoundException）。现有解决方案要么需要 IDE 插件（Maven Helper）、要么需要手动解析 `dependency:tree` 并逐一排查。本技能在 Claude Code 中实现「自动检测 → AI 分析 → 预览修复 → 确认生效」的闭环体验。

检测引擎使用 Maven 内置的 `dependency:tree`，零额外依赖。AI 负责解析输出、分析冲突、生成修复方案。

## Goals / Non-Goals

**Goals:**
- 一行命令检测当前 Maven 项目的所有依赖版本冲突
- AI 分析每个冲突的影响和推荐版本
- AI 生成 pom.xml 修改 diff，用户确认后自动应用
- 支持子命令（check/fix）、无参数、自然语言三种入口

**Non-Goals:**
- 不支持非 Maven 项目（Gradle、Ivy 等）
- 不处理 pom.xml 之外的文件
- 不依赖 maveniverse/pilot 或第三方 Maven 插件
- 不做跨模块批量扫描
- 不做依赖版本升级检测（updates）或安全审计（audit）

## Architecture

```
用户输入
    │
    ▼
┌─────────────────────────────────────────────────┐
│              入口路由层                           │
│                                                   │
│  /maven-pilot        → 默认：检测 + 分析           │
│  /maven-pilot check  → 检测，不修复               │
│  /maven-pilot fix    → 检测 + 修复全量             │
│  /maven-pilot <NL>   → 自然语言，AI 识别意图       │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              检测引擎                             │
│                                                   │
│  1. 检查当前目录是否存在 pom.xml                    │
│  2. 运行 mvn dependency:tree -Dverbose/output     │
│      （自适应 maven-dependency-plugin 版本）        │
│  3. 捕获 stdout/stderr                            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              AI 分析层                            │
│                                                   │
│  1. 解析 dependency:tree 输出                     │
│     - 识别 "omitted for conflict" 条目            │
│     - 识别 "version managed from" 条目            │
│     - 构建冲突列表：版本 vs 来源路径                │
│  2. 分析每个冲突的影响                              │
│     - 冲突的两个版本                               │
│     - 各自由谁引入（传递路径）                       │
│     - 推荐保留版本 + 理由                          │
│  3. 输出人类可读的报告                              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              修复层（仅 fix 模式）                 │
│                                                   │
│  1. 生成 pom.xml 修改方案                         │
│     - <dependencyManagement> 版本锁定             │
│     - <exclusions> 排除传递依赖                    │
│  2. 展示 unified diff 给用户                      │
│  3. 用户确认后应用修改                              │
└─────────────────────────────────────────────────┘
```

## Design Decisions

### Decision 1: 用 `dependency:tree` 代替 pilot

- **选型**：`mvn dependency:tree`（零配置）
- **理由**：pilot:conflicts 只有交互 TUI 模式，无法 programmatic 输出；需要 `~/.m2/settings.xml` 配置或写完整 groupId；`dependency:tree` Maven 自带，每个 Java 开发者都有
- **处理**：技能内部先试 `-Dverbose`（2.x），不生效则回退到默认（3.x），AI 适配解析两种输出格式

### Decision 2: AI 直接编辑 pom.xml

- **选型**：AI 生成 XML 修改 → diff 预览 → 用户确认 → Write/Edit 写入
- **理由**：不需要额外依赖；修改可控（diff 预览 + 用户确认）
- **修复方式**：版本锁定用 `<dependencyManagement>` + `<version>` / `<exclusion>`

### 修复安全约束（硬性规则）

1. **不升级大版本** — 锁定版本时优先选择当前 Maven 实际使用的版本（即"最短路径获胜版"）。如果实际使用的版本已满足运行需求（代码中没有调用高版本的特定 API），则不修改版本号。
2. **不改变原代码** — 不修改 `<dependencies>` 中已声明的版本号，仅在 `<dependencyManagement>` 中锁定。不改任何 Java 源文件。
3. **安全例外** — 仅当实际使用版本存在已知高危 CVE 时，才升级到同一小版本线的安全补丁版本（如 30.1 → 30.1-jre，API 兼容）。
4. **仅做排除** — 对于传递依赖冲突，仅在对应依赖上加 `<exclusion>`，不动其他。
5. **用户最终确认** — 所有修改必须经过 diff 预览 + 用户确认，AI 不得 auto-apply。

### Decision 3: 三级入口路由

- 精确匹配 `check` / `fix` → 对应模式
- 无参数 → 检测 + 分析（不自动修）
- 其他文本 → 自然语言意图识别

### Decision 4: 多模块项目

- 在项目根 pom.xml 目录运行 `mvn dependency:tree` 天然覆盖所有子模块
- 修复方式：在父 pom 的 `<dependencyManagement>` 中锁定版本，所有子模块自动生效
- 如果父 pom 没有 `<dependencyManagement>`，AI 自动创建

## Execution Flow (SKILL.md 结构)

```
## Step 1: 检测环境
  → 检查 pom.xml 是否存在
  → 检查 mvn 命令是否可用
  → 检测 maven-dependency-plugin 版本（试 -Dverbose）

## Step 2: 检测冲突
  → 运行 dependency:tree
  → 捕获输出

## Step 3: AI 分析
  → 解析输出，识别冲突
  → 分析影响，推荐版本
  → 输出报告

## Step 4: 修复（check 模式跳过此步）
  → 生成 pom.xml diff
  → 展示给用户
  → 等待确认后应用
```

## Spec Patch

`conflict-detection/spec.md` 中需要补充：
- 明确检测引擎使用 `dependency:tree`（而非 pilot）
- 补充 `-Dverbose` 兼容性处理的场景

## 测试策略

1. 创建一个包含已知冲突的 Maven 项目
   - 依赖 A → Guava 30.1
   - 依赖 B → Guava 32.0
2. 运行 `mvn dependency:tree -Dverbose` 确认输出格式
3. 运行 `/maven-pilot check` 确认检测准确
4. 运行 `/maven-pilot fix` 确认 diff 正确

## Open Questions

1. `-Dverbose` 在最新的 maven-dependency-plugin 上是否还有效？如无效，3.x 版的输出是否足够 AI 解析？
   → 后续验证环节确认
