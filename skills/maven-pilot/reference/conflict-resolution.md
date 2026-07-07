# Maven 依赖冲突解决策略

## 冲突来源

| 冲突类型 | 后果 | 示例 |
|---------|------|------|
| 版本冲突 | NoSuchMethodError | Guava 30.1 vs 32.0 |
| 重复依赖 | 冗余、潜在冲突 | 同一 jar 被多次声明 |
| 作用域冲突 | ClassNotFoundException | compile vs provided |

## 解决方案

### 方案 A：在 `<dependencyManagement>` 中锁定版本

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

### 方案 B：使用 `<exclusion>` 排除传递依赖

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
