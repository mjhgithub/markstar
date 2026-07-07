## 1. Skills 目录与元数据

- [x] 1.1 创建 `skills/maven-pilot/SKILL.md`，包含 frontmatter（name: maven-pilot，description 描述冲突检测与修复能力）
- [x] 1.2 创建 `skills/maven-pilot/reference/` 目录，准备参考文档

## 2. 核心实现

- [x] 2.1 实现检测引擎层：运行 `mvn dependency:tree`（先试 -Dverbose，失败回退默认），捕获 stdout
- [x] 2.2 实现 `check` 模式：解析 dependency:tree 输出 → AI 分析冲突 → 输出可读报告
- [x] 2.3 实现 `fix` 模式：check 全部冲突 → AI 生成 pom.xml 修改 diff（dependencyManagement 锁定 / exclusion）→ 展示 diff → 用户确认后应用
- [x] 2.4 实现入口路由逻辑：精确匹配 check/fix → 无参数/自然语言，包含对话入口处理

## 3. 入口命令 /maven-pilot

- [x] 3.1 实现 `/maven-pilot` 无参数时的默认行为（检测 + 分析，等待用户）
- [x] 3.2 实现 `/maven-pilot fix` 检测并修复全量冲突
- [x] 3.3 实现 `/maven-pilot check` 只检测不修复
- [x] 3.4 实现自然语言对话入口，正确识别用户意图并路由

## 4. 参考文档

- [x] 4.1 创建 `skills/maven-pilot/reference/dependency-tree-output.md` — dependency:tree 输出格式参考
- [x] 4.2 创建 `skills/maven-pilot/reference/conflict-resolution.md` — 冲突解决方案策略文档

## 5. 验证

- [x] 5.1 在有冲突和非冲突的 Maven 项目中分别验证 check 和 fix 流程

## 6. 发布

- [ ] 6.1 提交代码到 GitHub
- [ ] 6.2 发布新版 markstar 到 npm
