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
   - 30.1-jre ← （当前使用，由 my-app → A → guava 30.1 引入）
   - 32.0.1-jre ← （由 my-app → spring-boot → guava 32.0 引入）
   - 建议：锁定 30.1-jre（当前运行版本，API 兼容）
   - 影响：低风险

2. ch.qos.logback:logback-classic
   - 1.2.11 ← （当前使用，由 my-app → A → logback 1.2.11 引入）
   - 1.4.14 ← （由 my-app → spring-boot → logback 1.4.14 引入）
   - 建议：锁定 1.4.14（包含安全修复，1.4.x 兼容 1.2.x）
   - 影响：低风险
```

---

### Fix 流程（在前面的 Check 流程基础上）

#### Step 4: 修复冲突

1. **为每个冲突生成 pom.xml 修改方案：**

   **类型 A：在 `<dependencyManagement>` 中锁定版本**
   - 检查 pom.xml 中是否已有 `<dependencyManagement>`
   - 有 → 在现有 `<dependencies>` 中追加 `<dependency><groupId/><artifactId/><version/></dependency>`
   - 无 → 在 `<project>` 下创建 `<dependencyManagement><dependencies>...</dependencies></dependencyManagement>`
   - **必须遵守的安全约束：**
     - 不修改 `<dependencies>` 中已声明的 `<version>`
     - 不修改 Java 源文件
     - 锁定当前 Maven 实际使用的版本（除非有 CVE）
     - 有 CVE 时才升级到同一小版本线的安全补丁版本

   **类型 B：添加 `<exclusion>`**
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
