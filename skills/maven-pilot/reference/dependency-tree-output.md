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
