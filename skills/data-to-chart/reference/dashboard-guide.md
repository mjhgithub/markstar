# Dashboard 数据大屏指南

> Agent 在 Step 0 检测到大屏关键词后加载此文件。提供布局模式、KPI 卡片、动态背景和完整 HTML 骨架。

---

## 1. 布局模式

根据用户描述中涉及的图表数量，自动选择布局。KPI 卡片不计入图表数（它们独占顶部行）。

| 图表数 | 布局 | Grid 模板 | 适用场景 |
|--------|------|-----------|---------|
| 1 | 2 列：KPI 列 + 图表列 | `grid-template-columns: 0.35fr 0.65fr` | 1 个主图表 |
| 2 | 2 列均分 | `grid-template-columns: 1fr 1fr` | 2 图并排 |
| 3 | 上方 2 列 + 下方跨整行 | 第一行 2 列，`.span-full` 跨整行 | 2 图 + 1 宽图 |
| 4 | 2×2 | `grid-template-columns: 1fr 1fr` + `grid-template-rows: 1fr 1fr` | 4 图均分 |
| 5 | 上方跨行 + 下方 2×2 | `.span-full` + 2×2 网格 | 主图 + 4 辅图 |
| 6 | 2×3 | `grid-template-columns: 1fr 1fr 1fr` + `grid-template-rows: 1fr 1fr` | 6 图均分 |
| ≥7 | 3×3 每格定高 | `grid-template-columns: 1fr 1fr 1fr`，行高 320px | 信息密集面板 |

**规则**：
- KPI 卡片始终独占顶部一行，放在 grid 容器外，作为 `.kpi-row`
- 图表网格放在 `.chart-grid` 容器中
- 超过 9 个图表就取最重要的 9 个，其余根据用户是否需要省略

---

## 2. KPI 卡片

### HTML 结构

```html
<div class="kpi-row">
  <div class="kpi-card">
    <div class="kpi-label">2025 年总出货量</div>
    <div class="kpi-value">2.85<span class="kpi-unit">亿台</span></div>
    <div class="kpi-change down">▼ 0.6%</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">华为市场份额</div>
    <div class="kpi-value">16.4<span class="kpi-unit">%</span></div>
    <div class="kpi-change up">▲ 从榜外到第一</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">前五品牌合计份额</div>
    <div class="kpi-value">79.4<span class="kpi-unit">%</span></div>
    <div class="kpi-change up">▲ 同比 +1.2pp</div>
  </div>
</div>
```

### CSS

```css
.kpi-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.kpi-card {
  flex: 1;
  background: linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 100%);
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 16px; right: 16px;
  height: 2px;
  border-radius: 0 0 2px 2px;
}
.kpi-card:nth-child(1)::before { background: linear-gradient(90deg, #00DDFF, transparent); }
.kpi-card:nth-child(2)::before { background: linear-gradient(90deg, #37A2FF, transparent); }
.kpi-card:nth-child(3)::before { background: linear-gradient(90deg, #FF0087, transparent); }
.kpi-card:nth-child(4)::before { background: linear-gradient(90deg, #FFBF00, transparent); }
.kpi-label {
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: #E2E8F0;
  font-family: "DIN Alternate", "Microsoft YaHei", "PingFang SC", sans-serif;
  letter-spacing: 1px;
}
.kpi-unit {
  font-size: 16px;
  font-weight: 400;
  color: #94A3B8;
  margin-left: 4px;
}
.kpi-change {
  font-size: 12px;
  margin-top: 4px;
}
.kpi-change.up { color: #34D399; }
.kpi-change.down { color: #F87171; }
```

---

## 3. 动态背景

### 方案 2：科技网格线（默认，性能好）

纯 CSS 实现，不依赖 JS。作为 body 的叠加背景层。

```css
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,221,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,221,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridPulse 4s ease-in-out infinite alternate;
}
@keyframes gridPulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}
```

### 方案 1：浮动粒子（用户要求"粒子/星空"时启用）

```css
.particles {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(0,221,255,0.3);
  border-radius: 50%;
  animation: floatUp linear infinite;
}
.particle:nth-child(odd) { background: rgba(55,162,255,0.25); }
.particle:nth-child(3n) { background: rgba(255,0,135,0.2); }

@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
}
```

生成粒子元素的 JS（放在 `<script>` 中）：

```javascript
(function() {
  var container = document.createElement('div');
  container.className = 'particles';
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(p);
  }
  document.body.appendChild(container);
})();
```

---

## 4. Dashboard HTML 骨架（完整）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- 大屏标题 --></title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
            background: #0F172A;
            color: #E2E8F0;
            min-height: 100vh;
            padding: 20px 24px;
            overflow-x: hidden;
            position: relative;
        }

        /* ---------- 科技网格背景 ---------- */
        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 0;
            background-image:
                linear-gradient(rgba(0,221,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,221,255,0.04) 1px, transparent 1px);
            background-size: 60px 60px;
            animation: gridPulse 4s ease-in-out infinite alternate;
        }
        @keyframes gridPulse {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
        }

        /* ---------- 全屏容器 ---------- */
        .dashboard {
            position: relative;
            z-index: 1;
            max-width: 1600px;
            margin: 0 auto;
        }

        /* ---------- 标题行 ---------- */
        .dashboard-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #1E293B;
        }
        .dashboard-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #E2E8F0;
            letter-spacing: 2px;
            background: linear-gradient(90deg, #00DDFF, #37A2FF, #FF0087);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dashboard-header .subtitle {
            font-size: 13px;
            color: #64748B;
            margin-top: 4px;
        }

        /* ---------- KPI 卡片行 ---------- */
        .kpi-row {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
        }
        .kpi-card {
            flex: 1;
            background: linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 100%);
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 16px 20px;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(4px);
        }
        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0; left: 16px; right: 16px;
            height: 2px;
            border-radius: 0 0 2px 2px;
        }
        .kpi-card:nth-child(1)::before { background: linear-gradient(90deg, #00DDFF, transparent); }
        .kpi-card:nth-child(2)::before { background: linear-gradient(90deg, #37A2FF, transparent); }
        .kpi-card:nth-child(3)::before { background: linear-gradient(90deg, #FF0087, transparent); }
        .kpi-card:nth-child(4)::before { background: linear-gradient(90deg, #FFBF00, transparent); }
        .kpi-label {
            font-size: 13px;
            color: #94A3B8;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .kpi-value {
            font-size: 32px;
            font-weight: 700;
            color: #E2E8F0;
            font-family: "DIN Alternate", "Microsoft YaHei", "PingFang SC", sans-serif;
            letter-spacing: 1px;
        }
        .kpi-unit {
            font-size: 16px;
            font-weight: 400;
            color: #94A3B8;
            margin-left: 4px;
        }
        .kpi-change {
            font-size: 12px;
            margin-top: 4px;
        }
        .kpi-change.up { color: #34D399; }
        .kpi-change.down { color: #F87171; }

        /* ---------- 图表网格 ---------- */
        .chart-grid {
            display: grid;
            gap: 16px;
        }
        /* 布局由 Agent 根据图表数量选择对应的 class，参考布局模式表 */
        .chart-grid.cols-2 { grid-template-columns: 1fr 1fr; }
        .chart-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
        .chart-grid.rows-2 { grid-template-rows: 1fr 1fr; }

        .chart-panel {
            background: rgba(30,41,59,0.8);
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 12px 14px 8px;
            backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            min-height: 340px;
        }
        .chart-panel .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: #CBD5E1;
            margin-bottom: 4px;
            padding-left: 8px;
            border-left: 3px solid #00DDFF;
        }
        .chart-panel .chart-inner {
            flex: 1;
            width: 100%;
            min-height: 280px;
        }
        .span-full { grid-column: 1 / -1; }

        /* ---------- 脚注 ---------- */
        .dashboard-footer {
            text-align: center;
            margin-top: 16px;
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="dashboard-header">
            <h1><!-- 大屏标题 --></h1>
            <div class="subtitle"><!-- 数据来源说明 --></div>
        </div>

        <!-- KPI 卡片行 -->
        <div class="kpi-row">
            <!-- 由 Agent 填入 2-4 个 kpi-card -->
        </div>

        <!-- 图表网格 -->
        <div class="chart-grid <!-- cols-2 / cols-3 / rows-2 -->">
            <!-- 由 Agent 填入 .chart-panel，每个含 .panel-title + .chart-inner -->
        </div>

        <div class="dashboard-footer"><!-- 脚注 --></div>
    </div>

    <script>
        // 初始化所有图表
        (function() {
            var panels = document.querySelectorAll('.chart-inner');
            // 每个 panel 的 option 由 Agent 在下方定义
            var options = [
                // Agent 将各块的 option 按顺序填在这里
            ];
            panels.forEach(function(el, i) {
                if (options[i]) {
                    var chart = echarts.init(el, null, { backgroundColor: 'transparent' });
                    // 深色主题公共 textStyle
                    if (options[i].textStyle === undefined) {
                        options[i].textStyle = { color: '#CBD5E1' };
                    }
                    chart.setOption(options[i]);
                    window.addEventListener('resize', function() { chart.resize(); });
                }
            });
        })();
    </script>
</body>
</html>
```

---

## 5. 深色 ECharts 通用配置

大屏中所有图表共享此配置基础：

```javascript
// 每个 option 必须追加的深色主题设置
var darkBase = {
  textStyle: { color: '#CBD5E1' },
  legend: { textStyle: { color: '#94A3B8' } },
  tooltip: { backgroundColor: 'rgba(15,23,42,0.92)', borderColor: '#334155', textStyle: { color: '#E2E8F0' } },
  // 使用 Theme B 调色板
  color: ['#00DDFF','#37A2FF','#FF0087','#FFBF00','#00E396','#FEBE4A','#A78BFA','#34D399','#FF6B6B']
};

// 合并方式：先将 darkBase 浅合并到业务 option（不覆盖业务已显式设置的属性）
// 实际生成代码时直接内联到每个 option 对象中
```

---

## 6. Agent 生成指引

大屏模式下 Agent 按以下要点执行：

1. **确定内容**：从用户描述中提取每个子图的主题 → 对每个子图执行原 flow 的 Step 1（场景分析）确定图表类型
2. **确定布局**：数图表数量 → 查布局模式表 → 为 `.chart-grid` 选择 `cols-2` / `cols-3` 和 `rows-2`
3. **生成 option**：每个 panel 独立获取数据、整理、生成 option（共享 Theme B 调色板）
4. **KPI 卡片**：从数据中提炼 2-4 个关键指标（总量、最高值、同比变化、合计占比等）
5. **特殊图表**：地图场景需在 `<script>` 前添加 China GeoJSON fetch 逻辑
