# MarkStar — AI 编程技能集合

一行命令安装 [Claude Code](https://claude.ai/code) 技能，开箱即用。

## 安装

```bash
npx markstar
```

技能会自动安装到 `~/.claude/skills/`，重启 Claude Code 即可使用。

## 技能列表

| 技能 | 命令 | 说明 |
|------|------|------|
| **data-to-chart** | `/data-to-chart` | 智能图表生成，自动选择 ECharts 图表类型并生成可交互 HTML。支持大屏/仪表盘模式。 |
| **maven-pilot** | `/maven-pilot` | Maven 依赖冲突检测与自动修复。检测 → AI 分析 → diff 预览 → 用户确认 → 修改 pom.xml → 编译验证。零第三方依赖。 |

## maven-pilot 使用示例

```bash
/maven-pilot check          # 只检测，不修复
/maven-pilot fix            # 检测 + 修复全量冲突
/maven-pilot 帮我看看有没有冲突   # 自然语言
```

**特点：**
- 基于 Maven 内置 `dependency:tree`，不需要额外插件
- 修复方式：`<dependencyManagement>` 锁定版本或 `<exclusion>` 排除传递依赖
- 安全约束：不升级大版本、不改源代码、diff 预览 + 用户确认、修复后编译验证
- 编译失败自动回滚

## 卸载

```bash
npx markstar --uninstall
```

## 发布

```bash
npm publish
```

## 许可

MIT
