# Brainstorm Summary

- Change: maven-pilot
- Date: 2026-07-07

## 确认的技术方案

- 检测引擎：`mvn dependency:tree -Dverbose`（maven-dependency-plugin 2.x）或纯 `dependency:tree`（3.x），AI 解析文本输出
- 不再依赖 maveniverse/pilot 作为检测引擎（pilot:conflicts 只有交互 TUI，无 programmatic 输出，且需要额外配置）
- AI 分析冲突 → 生成 pom.xml 修改方案 → diff 预览 → 用户确认后应用
- 三级入口：`/maven-pilot`（默认检测+分析）、`/maven-pilot check`（只检测）、`/maven-pilot fix`（检测+修复）
- 自然语言对话入口：AI 理解用户意图路由到对应操作

## 关键取舍与风险

- `-Dverbose` 在 maven-dependency-plugin 3.x 已移除，需确认兼容版本
- AI 解析文本输出可能误读，需在 SKILL.md 中设定严格解析步骤
- 修复 pom.xml 前必须 diff 预览 + 用户确认

## 测试策略

- 在有版本冲突的 Maven 项目验证 check 输出准确性
- 验证 fix 生成的 pom.xml 修改正确
- 验证非 Maven 项目的错误提示

## Spec Patch

- `conflict-detection/spec.md`: 需要补充检测引擎的技术细节，明确使用 `dependency:tree`
- `auto-fix/spec.md`: 无需修改
