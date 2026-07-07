# maven-pilot 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 markstar 包中新增 `maven-pilot` 技能，实现一行命令检测并修复 Maven 依赖冲突

**Architecture:** 技能 = 一个 SKILL.md 指令文件 + 两个 reference 文档。SKILL.md 定义多级入口路由，执行时调用 `mvn dependency:tree` 检测冲突，AI 解析输出、分析影响、生成 pom.xml 修改 diff，用户确认后应用修复。

**Tech Stack:** Claude Code Skill (Markdown), Maven dependency:tree CLI

## Global Constraints

- 检测引擎仅使用 Maven 内置的 `dependency:tree`，不依赖第三方插件
- 修复安全约束：不升级大版本、不改源代码、不改 `<dependencies>` 中的版本号，仅在 `<dependencyManagement>` 中锁定
- 所有修改前必须先展示 diff 预览并等待用户确认
- 检测当前目录及父目录，找第一个 pom.xml

---

## 文件结构

```
skills/maven-pilot/
├── SKILL.md                                    ← 主技能文件
└── reference/
    ├── dependency-tree-output.md                ← dependency:tree 输出格式参考
    └── conflict-resolution.md                   ← 冲突解决策略文档
```

### Task 1: 创建 skills 目录结构和 reference 文档

**Files:**
- Create: `skills/maven-pilot/reference/dependency-tree-output.md`
- Create: `skills/maven-pilot/reference/conflict-resolution.md`

**Interfaces:**
- Consumes: Design Doc `docs/superpowers/specs/2026-07-07-maven-pilot-design.md`
- Produces: `skills/maven-pilot/reference/dependency-tree-output.md`, `skills/maven-pilot/reference/conflict-resolution.md`

- [x] **Step 1: 创建目录**

```bash
mkdir -p skills/maven-pilot/reference
```

- [x] **Step 2: 编写 `dependency-tree-output.md`**

内容需要包含：
- `mvn dependency:tree` 基本用法
- `-Dverbose` 的输出格式示例和解析方法（`omitted for conflict`、`version managed from` 等标记）
- 无 `-Dverbose` 时的输出格式示例
- 如何从树形结构中识别冲突来源
- 多模块项目的输出特点

```bash
cat > skills/maven-pilot/reference/dependency-tree-output.md << 'REFEOF'
# Maven dependency:tree 输出参考

## 基本命令

```bash
# 检测当前项目的依赖树（含冲突标记 — maven-dependency-plugin 2.x）
mvn dependency:tree -Dverbose

# 如果 -Dverbose 不支持（3.x 已移除），回退到：
mvn dependency:tree

# 查看特定依赖
mvn dependency:tree -Dincludes=com.google.guava:*
```

## 输出格式

### 带 -Dverbose（2.x 版本）

```
[INFO] com.example:my-app:jar:1.0.0
[INFO] +- com.google.guava:guava:jar:30.1-jre:compile
[INFO] |  \- org.checkerframework:checker-qual:jar:3.21.0:compile
[INFO] \- org.springframework.boot:spring-boot-starter:jar:3.2.0:compile
[INFO]    \- com.google.guava:guava:jar:32.0.1-jre:compile (omitted for conflict with 30.1-jre)
```

关键标记说明：
- `(omitted for conflict with X)` — 该版本因冲突被跳过。后面是被选中的版本
- `(version managed from X)` — 该版本被 `<dependencyManagement>` 覆盖
- `(omitted for duplicate)` — 同一版本被多次引入，只保留一个

### 不带 -Dverbose（3.x 版本）

```
[INFO] com.example:my-app:jar:1.0.0
[INFO] +- com.google.guava:guava:jar:30.1-jre:compile
[INFO] \- org.springframework.boot:spring-boot-starter:jar:3.2.0:compile
[INFO]    \- com.google.guava:guava:jar:32.0.1-jre:compile
```

3.x 版本默认不显示冲突标记。此时需要结合 `-Dincludes` 过滤来确认实际使用的版本。

### 冲突检测规则

Maven 的"最短路径获胜"规则：
- 根 pom 的依赖深度 = 1
- 传递依赖深度 = 2+
- 同深度的先声明者获胜

```
    根 pom (my-app)
       │
       ├─ A → Guava 30.1         (深度 2)
       │
       └─ B → C → Guava 32.0    (深度 3)
       
结果：Guava 30.1 获胜（深度 2 < 深度 3）
```
REFEOF
```

- [x] **Step 3: 编写 `conflict-resolution.md`**

内容需要包含：
- Maven 冲突解决的基本策略
- `<dependencyManagement>` 使用方式
- `<exclusion>` 的使用方式
- 安全约束：不升级大版本、不改源代码
- 如何判断同一个 jar 的不同版本是否 API 兼容

```bash
cat > skills/maven-pilot/reference/conflict-resolution.md << 'REFEOF'
# Maven 依赖冲突解决策略

## 冲突来源

| 冲突类型 | 后果 | 示例 |
|---------|------|------|
| 版本冲突 | NoSuchMethodError | Guava 30.1 vs 32.0 |
| 重复依赖 | 冗余、潜在冲突 | 同一 jar 被多次声明 |
| 作用域冲突 | ClassNotFoundException | compile vs provided |

## 解决方案

### 方案 A：在 <dependencyManagement> 中锁定版本

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>32.0.1-jre</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

**何时用：** 父 pom 可对所有子模块统一控制版本。如果父 pom 没有 `<dependencyManagement>`，直接创建。

### 方案 B：使用 <exclusion> 排除传递依赖

```xml
<dependency>
  <groupId>org.example</groupId>
  <artifactId>example-lib</artifactId>
  <exclusions>
    <exclusion>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

**何时用：** 某个依赖带入了不需要的旧版本，而其他路径已经有新版本时。

## 修复安全约束（硬性规则）

1. **优先锁定当前使用的版本** — 选择 Maven 最短路径获胜的版本（即实际运行中的版本）
2. **不改变原代码** — 不改 `<dependencies>` 中已声明的版本号，不改 Java 源文件
3. **安全例外** — 仅当前版本有已知高危 CVE 时，升级到同一小版本线的安全补丁
4. **仅做排除** — 不动功能代码
5. **用户确认** — 所有修改先展示 diff，用户确认后才 apply

## 根据错误信息判断冲突

| 错误 | 原因 |
|------|------|
| NoSuchMethodError | 方法不存在于当前版本的 jar 中 |
| ClassNotFoundException | 整个类都不存在 |
| AbstractMethodError | 接口新增了方法但 jar 里的类没实现 |
| ClassCastException | 同一个类来自两个不同的 jar |
REFEOF
```

- [x] **Step 4: 提交**

```bash
git add skills/maven-pilot/
git commit -m "feat(maven-pilot): add reference docs for dependency tree output and conflict resolution"
```

---

### Task 2: 编写 SKILL.md（完整技能定义）

**Files:**
- Create: `skills/maven-pilot/SKILL.md`

**Interfaces:**
- Consumes: Design Doc, `dependency-tree-output.md`, `conflict-resolution.md`
- Produces: `skills/maven-pilot/SKILL.md`

这个任务是最核心的——SKILL.md 定义了 AI 在执行 `/maven-pilot` 时的完整行为逻辑。

- [x] **Step 1: 编写 SKILL.md 的 frontmatter 和入口路由**

SKILL.md 的 frontmatter：

```yaml
---
name: maven-pilot
description: Maven 依赖冲突检测与自动修复。检测当前项目的依赖版本冲突，AI 分析冲突影响和修复方案，用户确认后自动修改 pom.xml。
---
```

- [x] **Step 2: 编写入口路由逻辑**

包括三分支：
```markdown
## 入口路由

收到用户输入 args 后，按优先级依次判断：

**分支 1 — 精确匹配 check**
- 当 args 完全等于 "check"
- 行为：只检测不修复

**分支 2 — 精确匹配 fix**
- 当 args 完全等于 "fix"
- 行为：检测 + 全量修复

**分支 3 — 无参数或自然语言**
- 当 args 为空，或不为 check/fix
- 行为：AI 从文本中识别用户意图
  - 包含"检查/检测/看看/有没有"等 → 走 check 流程
  - 包含"修/修复/解决/处理"等 → 走 fix 流程
  - 其他 → 默认走 check（检测+分析，等用户决定）
  - 用户指定跳过某个依赖 → 后续 fix 时排除
```

- [x] **Step 3: 编写 check 流程（Step 1-3）**

```markdown
## Check 流程（检测 + 分析）

### Step 1: 环境检测
1. 从当前目录向上查找 pom.xml（最多 5 级）
2. 检查 mvn 命令是否存在（`mvn --version`）
3. 任一条件不满足 → 输出错误信息并停止

### Step 2: 运行 dependency:tree
1. 先执行 `mvn dependency:tree -Dverbose` 捕获输出
2. 如果失败或无 `omitted for conflict` 标记，回退到 `mvn dependency:tree`
3. 如果 pom.xml 是父模块，输出会包含所有子模块

### Step 3: AI 分析冲突
1. 扫描输出中的冲突标记
   - `(omitted for conflict with X)` — 版本冲突
   - `(version managed from X)` — 已被管理
2. 对每个冲突构建分析：
   - 哪些版本在冲突
   - 各版本由谁引入（传递路径，从树缩进推断）
   - 当前使用的是哪个版本
   - 推荐保留版本 + 理由

**输出格式示例：**

```
发现 2 个依赖冲突：

1. com.google.guava:guava
   - 30.1-jre（由 my-app → A → guava 30.1 引入，当前使用）
   - 32.0.1-jre（由 my-app → spring-boot → guava 32.0 引入）
   - 建议：保留 30.1-jre（当前最短路径版本），在 dependencyManagement 中锁定
   - 风险：低，两者 API 兼容

2. ch.qos.logback:logback-classic
   - 1.2.11（由 my-app → A → logback 1.2.11 引入，当前使用）
   - 1.4.14（由 my-app → spring-boot → logback 1.4.14 引入）
   - 建议：保留 1.4.14（存在 CVE 安全修复），升级为同一小版本线
   - 风险：低，1.4.x 兼容 1.2.x
```
```

- [x] **Step 4: 编写 fix 流程（Step 4）**

```markdown
## Fix 流程（在前面的 check 流程基础上）

### Step 4: 修复冲突
1. 对每个冲突按以下规则生成 pom.xml 修改：

   **类型 A：锁定版本（到 dependencyManagement）**
   1. 检测 pom.xml 中是否已有 <dependencyManagement>
   2. 若有，在现有块中添加 `<dependency><groupId>...</groupId>...<version>...</version></dependency>`
   3. 若无，在 <project> 下创建 <dependencyManagement><dependencies>...</dependencies></dependencyManagement>

   **类型 B：排除传递依赖（到对应依赖上加 exclusion）**
   1. 在引入旧版本的依赖上加 <exclusions><exclusion>...</exclusion></exclusions>

2. 生成 unified diff 展示给用户
3. 等待用户确认
4. 用户确认后使用 Edit/Write 工具修改 pom.xml
5. 用户拒绝则不修改

### 修复安全约束

必须遵守以下硬性规则：
- **不升级大版本** — 默认锁当前 Maven 实际使用的版本
- **不修改 <dependencies>** — 仅在 <dependencyManagement> 中锁定
- **不改源代码** — 不动 pom.xml 以外的文件
- **安全例外** — 当前版本有已知 CVE 时才升级安全补丁版本
- **用户确认** — 展示 diff 后等用户明确说"确认/可以/apply/修"等才执行修改
```

- [x] **Step 5: 编写完整的 SKILL.md**

```bash
cat > skills/maven-pilot/SKILL.md << 'SKILLEOF'
---
name: maven-pilot
description: Maven 依赖冲突检测与自动修复。检测当前项目的依赖版本冲突，AI 分析冲突影响和修复方案，用户确认后自动修改 pom.xml。
---

# maven-pilot — Maven 依赖冲突检测与自动修复

在 Claude Code 中一行命令检测并修复 Maven 依赖版本冲突。不依赖第三方插件，仅使用 Maven 内置的 `dependency:tree`。

## 核心原则

- **安全优先**：不升级大版本、不改源代码、diff 预览 + 用户确认后才 apply
- **零依赖**：仅需 `mvn`，不需要额外 Maven 插件

## 执行流程

### 入口路由

收到用户输入 `args` 后，按优先级依次判断：

**分支 1：精确匹配 check**
- args 完全等于 `check`
- 只检测不修复

**分支 2：精确匹配 fix**
- args 完全等于 `fix`
- 检测 + 修复全量冲突

**分支 3：自然语言或无参数**
- args 为空，或不为 check/fix
- AI 从自然语言识别意图：
  - 包含"检查/检测/看看/有没有/扫描"等 → 走 Check 流程
  - 包含"修/修复/解决/处理/改"等 → 走 Fix 流程
  - 指定某个依赖（"跳过 guava""只修 logback"）→ 记录排除/包含规则
  - 其他 → 默认走 Check 流程

---

### Check 流程（检测 + 分析）

#### Step 1: 环境检测

1. 从当前目录逐级向上查找 `pom.xml`（最多 5 级）
2. 运行 `mvn --version` 确认 Maven 可用

任一条件不满足 → 输出错误信息并停止：
- "未在当前目录或其父目录中找到 pom.xml"
- "Maven (mvn) 未安装或不在 PATH 中"

#### Step 2: 运行 dependency:tree

1. **首次尝试**：先执行 `mvn dependency:tree -Dverbose`，捕获 stdout
   - 如果成功输出且包含 `omitted for conflict` 或 `version managed from` 标记，继续
   - 如果命令失败或输出中无冲突标记，回退
2. **回退**：执行 `mvn dependency:tree`，捕获 stdout
3. 参考 `reference/dependency-tree-output.md` 了解输出格式

#### Step 3: AI 分析冲突

扫描输出，识别所有冲突条目：

**识别冲突标记：**
- `(omitted for conflict with X.X.X)` — 此版本被跳过，选择了 X.X.X
- `(version managed from X.X.X)` — 被 dependencyManagement 管理

**对每个冲突构建分析信息：**
- `groupId:artifactId`（依赖标识）
- 冲突的版本列表
- 每个版本由谁引入（从树缩进推断传递路径）
- 当前运行时使用的版本（即获胜版本）
- 推荐保留版本 + 理由

**输出格式示例：**

```
发现 2 个依赖冲突：

1. com.google.guava:guava
   - 30.1-jre ←（当前使用，由 my-app → A → guava 30.1 引入）
   - 32.0.1-jre ←（由 my-app → spring-boot → guava 32.0 引入）
   - 建议：锁定 30.1-jre（当前运行版本，API 兼容）
   - 影响：低风险

2. ch.qos.logback:logback-classic
   - 1.2.11 ←（当前使用，由 my-app → A → logback 1.2.11 引入）
   - 1.4.14 ←（由 my-app → spring-boot → logback 1.4.14 引入）
   - 建议：锁定 1.4.14（包含安全修复，1.4.x 兼容 1.2.x）
   - 影响：低风险
```

---

### Fix 流程（在前面的 Check 流程基础上）

#### Step 4: 修复冲突

1. **为每个冲突生成 pom.xml 修改方案：**

   **类型 A：在 <dependencyManagement> 中锁定版本**
   - 检查 pom.xml 中是否已有 `<dependencyManagement>`
   - 有 → 在现有 `<dependencies>` 中追加 `<dependency><groupId/><artifactId/><version/></dependency>`
   - 无 → 在 `<project>` 下创建 `<dependencyManagement><dependencies>...</dependencies></dependencyManagement>`
   - **必须遵守的安全约束：**
     - 不修改 `<dependencies>` 中已声明的 `<version>`
     - 不修改 Java 源文件
     - 锁定当前 Maven 实际使用的版本（除非有 CVE）
     - 有 CVE 时才升级到同一小版本线的安全补丁版本

   **类型 B：添加 <exclusion>**
   - 在引入旧/多余版本的依赖上添加 `<exclusions><exclusion><groupId/><artifactId/></exclusion></exclusions>`

2. **生成 unified diff 展示给用户：**

   ```diff
   +  <dependencyManagement>
   +    <dependencies>
   +      <dependency>
   +        <groupId>com.google.guava</groupId>
   +        <artifactId>guava</artifactId>
   +        <version>30.1-jre</version>
   +      </dependency>
   +    </dependencies>
   +  </dependencyManagement>
   ```

3. **等待用户确认：** "以上是 pom.xml 的修改方案，确认 apply 吗？（yes/no）"
4. **用户确认后** → 使用 Edit 工具修改 pom.xml
5. **用户拒绝** → "修复已取消，未做任何修改"
SKILLEOF
```

- [x] **Step 6: 提交**

```bash
git add skills/maven-pilot/SKILL.md
git commit -m "feat(maven-pilot): add SKILL.md with check/fix flows and entry routing"
```

---

### Task 3: 验证

**Files:**
- Test: `skills/maven-pilot/SKILL.md` (by invoking `/maven-pilot`)

- [x] **Step 1: 创建验证用 Maven 项目**

```bash
mkdir -p /tmp/maven-test
cat > /tmp/maven-test/pom.xml << 'EOF'
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.test</groupId>
  <artifactId>test-conflict</artifactId>
  <version>1.0</version>
  <dependencies>
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>30.1-jre</version>
    </dependency>
    <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-common</artifactId>
      <version>3.3.4</version>
    </dependency>
  </dependencies>
</project>
EOF
cd /tmp/maven-test && mvn dependency:tree -Dverbose 2>&1 | head -30
```

- [x] **Step 2: 规划更多验证场景**

```markdown
关键验证场景：
1. 有版本冲突的项目 → 确认所有冲突被检测到
2. 无冲突的项目 → 确认输出 "No dependency conflicts found"
3. 非 Maven 项目目录 → 确认输出 "No pom.xml found"
4. 执行 fix → 确认 diff 正确，确认 pom.xml 被修改
5. 自然语言入口 → 确认意图识别正常
```
