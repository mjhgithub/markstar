# ECharts 图表模板参考

> **使用方式**：Agent 在 Step 5 生成代码前加载此文件。参考各类型的 option 骨架，但必须根据实际数据的维度、系列数、值域灵活调整，不可机械套用。
>
> 标记说明：🔴 = 必须项（该图表类型的核心配置，移除后图表无法正确呈现） | 🟡 = 推荐项（提升可读性和交互体验） | ⚪ = 可选项（按需添加）

---

## 主题配色方案

Agent 根据用户场景自动选择配色，在输出中不透露选择细节。

### 方案 A：专业商务 — 默认

适用：报告、PPT、数据分析、商业场景。浅色背景、清晰配色、专业感。

```css
/* -- 核心颜色 -- */
--bg: #F7F8FA;
--card-bg: #FFFFFF;
--card-shadow: 0 2px 16px rgba(0,0,0,0.08);
--title: #1F2937;
--subtitle: #6B7280;
--border: #E5E7EB;
```

### 方案 B：科技深色

适用：大屏、仪表盘、深夜查看、科技感展示。深色背景带微光效果。

```css
/* -- 核心颜色 -- */
--bg: #0F172A;
--card-bg: #1E293B;
--card-shadow: 0 4px 24px rgba(0,0,0,0.4);
--title: #E2E8F0;
--subtitle: #94A3B8;
--border: #334155;
```

### 方案 C：简约学术 — 备选

适用：学术论文、打印、色盲友好场景。极简白底、高对比度、无障碍配色。

```css
/* -- 核心颜色 -- */
--bg: #FFFFFF;
--card-bg: #FFFFFF;
--card-shadow: 0 1px 4px rgba(0,0,0,0.06);
--title: #111827;
--subtitle: #4B5563;
--border: #D1D5DB;
```

### 自动选择规则

| 场景关键词 | 方案 |
|-----------|------|
| 大屏、仪表盘、深色、暗色、科技 | B — 科技深色 |
| 论文、打印、学术、出版、无障碍 | C — 简约学术 |
| 其他（默认） | A — 专业商务 |

---

## 通用配置（所有图表类型共享）

```javascript
// 🔴 必须：tooltip — 鼠标悬停提示
tooltip: {
  trigger: 'axis',   // line/bar 用 'axis', pie/scatter 用 'item'
  axisPointer: { type: 'shadow' }  // bar 可选
}

// 🟡 推荐：legend — 多系列时显示图例
legend: {
  type: 'scroll',    // 系列多时支持滚动
  bottom: 0,
  textStyle: { fontSize: 12 }
}

// 🟡 推荐：toolbox — 保存图片等工具
toolbox: {
  feature: {
    saveAsImage: { title: '保存为图片' },
    dataView: { title: '数据视图', readOnly: false }
  }
}

// 🟡 推荐：color — 调色板（按所选主题使用对应方案）
// 方案 A（默认）：['#4E79A7','#59A14F','#F28E2B','#E15759','#76B7B2','#B07AA1','#FF9DA7','#9C755F','#BAB0AC']
// 方案 B（深色）：['#00DDFF','#37A2FF','#FF0087','#FFBF00','#00E396','#FEBE4A','#A78BFA','#34D399','#FF6B6B']
// 方案 C（简约）：['#0072B2','#009E73','#F0E442','#CC79A7','#56B4E9','#E69F00','#D55E00','#999999']

// ⚪ 可选：grid — 绘图区域边距
grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true }

// ⚪ 可选：animation — 动画
animation: true,
animationDuration: 800
```

---


## 图表类型模板

### 1. 折线图 `line`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 200, 150, 80, 70] }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' },
  // 🟡 多系列时添加
  legend: { data: ['系列1'], bottom: 0 },

  // ⚪ 面积图变体
  // series: [{ type: 'line', areaStyle: {}, data: [...] }]
  // ⚪ 平滑曲线
  // series: [{ type: 'line', smooth: true, data: [...] }]
};
```

### 2. 饼图 `pie`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'pie',
    radius: '60%',    // 或 ['40%', '70%'] 做环形图
    data: [
      { name: '类别A', value: 100 },
      { name: '类别B', value: 200 },
      { name: '类别C', value: 150 }
    ],
    // 🔴 饼图推荐显示标签
    label: { show: true, formatter: '{b}: {d}%' }
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { type: 'scroll', bottom: 0 },

  // ⚪ 可选效果
  // emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
};
```

### 3. 柱状图 `bar`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [320, 200, 150, 80] }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' },

  // ⚪ 水平柱状图（分类名过长时用）
  // yAxis: { type: 'category', data: [...] },
  // xAxis: { type: 'value' },
  // ⚪ 堆叠柱状图
  // series: [
  //   { type: 'bar', stack: 'total', data: [...] },
  //   { type: 'bar', stack: 'total', data: [...] }
  // ]
};
```

### 4. 堆叠图 `bar`(stack) / `line`(areaStyle)

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yAxis: { type: 'value' },
  series: [
    { name: '产品A', type: 'bar', stack: 'total', data: [120, 200, 150, 80] },
    { name: '产品B', type: 'bar', stack: 'total', data: [80, 120, 180, 110] },
    { name: '产品C', type: 'bar', stack: 'total', data: [60, 80, 100, 140] }
  ],

  // 🔴 多系列必须有 legend
  legend: { data: ['产品A', '产品B', '产品C'], bottom: 0 },

  // 🟡 推荐
  tooltip: { trigger: 'axis' },

  // ⚪ 面积堆叠变体（改 type 为 line + areaStyle）
  // series: [
  //   { name: '产品A', type: 'line', stack: 'total', areaStyle: {}, data: [...] }
  // ]
};
```

### 5. 散点图 `scatter`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'value', name: 'X 轴标签' },
  yAxis: { type: 'value', name: 'Y 轴标签' },
  series: [{
    type: 'scatter',
    data: [[10, 20], [15, 30], [20, 25], [25, 40], [30, 35]],
    symbolSize: 8
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: 'X: {c[0]}<br/>Y: {c[1]}' },

  // ⚪ 多系列散点
  // series: [
  //   { name: '组A', type: 'scatter', data: [...] },
  //   { name: '组B', type: 'scatter', data: [...] }
  // ]
};
```

### 6. 地图 `map`（中国地图）

```javascript
// 🔴 必须：额外引入中国地图 GeoJSON，放在 <script> 中，在 echarts.init 之前
// <script src="https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"></script>
// 或通过 fetch 加载后 registerMap

option = {
  // 🔴 必须
  series: [{
    type: 'map',
    map: 'china',
    data: [
      { name: '广东', value: 1000 },
      { name: '江苏', value: 800 },
      // ... 各省数据
    ],
    label: { show: true, fontSize: 10 }
  }],

  // 🔴 地图必须有 visualMap
  visualMap: {
    min: 0,
    max: 1000,
    left: 'left',
    bottom: 'bottom',
    text: ['高', '低'],
    inRange: { color: ['#E0F3F8', '#045A8D'] }
  },

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c}' }
};
```

### 7. 漏斗图 `funnel`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'funnel',
    left: '10%',
    right: '10%',
    width: '80%',
    data: [
      { name: '访问', value: 1000 },
      { name: '注册', value: 600 },
      { name: '下单', value: 300 },
      { name: '支付', value: 150 }
    ],
    label: { show: true, formatter: '{b}: {c}' },
    sort: 'descending'  // 🔴 漏斗图默认从大到小排列
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item', formatter: '{b}: {c}' }
};
```

### 8. 仪表盘 `gauge`

```javascript
option = {
  // 🔴 必须
  series: [{
    type: 'gauge',
    min: 0,
    max: 100,
    detail: { formatter: '{value}%', fontSize: 20 },
    data: [{ value: 75, name: '完成率' }],
    axisLine: {
      lineStyle: { color: [[0.3, '#67E0E3'], [0.7, '#37A2DA'], [1, '#FD666D']], width: 20 }
    }
  }]
};
```

### 9. 旭日图/矩形树图 `sunburst` / `treemap`

```javascript
// sunburst
option = {
  // 🔴 必须
  series: [{
    type: 'sunburst',
    data: [{
      name: '大类A',
      children: [
        { name: '小类A1', value: 100 },
        { name: '小类A2', value: 200 }
      ]
    }, {
      name: '大类B',
      children: [
        { name: '小类B1', value: 150 }
      ]
    }],
    radius: ['15%', '80%'],
    label: { rotate: 'radial' }
  }]
};

// treemap
option = {
  // 🔴 必须
  series: [{
    type: 'treemap',
    data: [{
      name: '大类A',
      children: [
        { name: '小类A1', value: 100 },
        { name: '小类A2', value: 200 }
      ]
    }, {
      name: '大类B',
      children: [
        { name: '小类B1', value: 150 }
      ]
    }],
    label: { show: true, formatter: '{b}' }
  }]
};
```

### 10. 雷达图 `radar`

```javascript
option = {
  // 🔴 必须
  radar: {
    indicator: [
      { name: '指标A', max: 100 },
      { name: '指标B', max: 100 },
      { name: '指标C', max: 100 },
      { name: '指标D', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [{ value: [80, 90, 70, 85], name: '当前' }],
    areaStyle: {}
  }],

  // 🟡 推荐：多系列对比
  // data: [
  //   { value: [80, 90, 70, 85], name: '当前' },
  //   { value: [60, 70, 80, 75], name: '目标' }
  // ]

  // 🟡 推荐
  legend: { data: ['当前'], bottom: 0 },
  tooltip: { trigger: 'item' }
};
```

### 11. 箱线图 `boxplot`

```javascript
// ⚠️ 箱线图需要 echarts-stat 扩展
// <script src="https://cdn.jsdelivr.net/npm/echarts-stat@1.1.0/dist/ecStat.min.js"></script>
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['组A', '组B', '组C'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'boxplot',
    data: [
      [10, 20, 30, 40, 50],  // [min, Q1, median, Q3, max]
      [15, 25, 35, 45, 55],
      [5, 15, 25, 35, 45]
    ]
  }],

  // 🟡 推荐
  tooltip: { trigger: 'item' }
};
```

### 12. K 线图 `candlestick`

```javascript
option = {
  // 🔴 必须
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'candlestick',
    data: [
      [20, 34, 10, 38],  // [open, close, low, high]
      [40, 35, 30, 50],
      [31, 38, 30, 42],
      [38, 30, 20, 45]
    ],
    // 🟡 上涨/下跌颜色
    itemStyle: { color: '#EF5350', color0: '#26A69A', borderColor: '#EF5350', borderColor0: '#26A69A' }
  }],

  // 🟡 推荐
  tooltip: { trigger: 'axis' }
};
```

---

## 完整 HTML 骨架

按所选主题方案生成对应骨架，替换 `option` 对象即可。三种方案用同一结构，仅 CSS 变量和调色板不同。

### 方案 A 骨架：专业商务（默认）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- 图表标题 --></title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
            background: #F7F8FA;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
        }
        .wrapper {
            width: 100%;
            max-width: 1100px;
            background: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.08);
            padding: 28px 24px 16px;
        }
        h1 { text-align: center; font-size: 22px; color: #1F2937; font-weight: 600; margin-bottom: 2px; }
        .subtitle { text-align: center; font-size: 13px; color: #6B7280; margin-bottom: 12px; }
        #chart { width: 100%; height: 520px; }
        .note { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 8px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1><!-- 图表标题 --></h1>
        <div class="subtitle"><!-- 数据来源说明 --></div>
        <div id="chart"></div>
        <div class="note"><!-- 脚注 --></div>
    </div>
    <script>
        var chart = echarts.init(document.getElementById('chart'));
        var option = { /* 替换为具体图表 option */ };
        chart.setOption(option);
        window.addEventListener('resize', function() { chart.resize(); });
    </script>
</body>
</html>
```

### 方案 B 骨架：科技深色

```html
<!DOCTYPE html>
<html lang="zh-CN" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- 图表标题 --></title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
            background: #0F172A;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
        }
        .wrapper {
            width: 100%;
            max-width: 1100px;
            background: #1E293B;
            border-radius: 14px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 1px rgba(148,163,184,0.1);
            padding: 28px 24px 16px;
            border: 1px solid #334155;
        }
        h1 { text-align: center; font-size: 22px; color: #E2E8F0; font-weight: 600; margin-bottom: 2px; }
        .subtitle { text-align: center; font-size: 13px; color: #94A3B8; margin-bottom: 12px; }
        #chart { width: 100%; height: 520px; }
        .note { font-size: 12px; color: #64748B; text-align: center; margin-top: 8px; line-height: 1.6; }

        /* 深色主题 ECharts 覆盖 — textStyle 在 option 中设置 */
        .note em { color: #94A3B8; font-style: normal; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1><!-- 图表标题 --></h1>
        <div class="subtitle"><!-- 数据来源说明 --></div>
        <div id="chart"></div>
        <div class="note"><!-- 脚注 --></div>
    </div>
    <script>
        var chart = echarts.init(document.getElementById('chart'), null, {
            // 深色计算背景，让图表透明区域融入深色背景
            backgroundColor: 'transparent'
        });
        var option = {
            // 深色主题必须设置全局文本颜色
            // textStyle: { color: '#CBD5E1' },
            /* 替换为具体图表 option */
        };
        chart.setOption(option);
        window.addEventListener('resize', function() { chart.resize(); });
    </script>
</body>
</html>
```

### 方案 C 骨架：简约学术

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- 图表标题 --></title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
            background: #FFFFFF;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
        }
        .wrapper {
            width: 100%;
            max-width: 960px;
            background: #FFFFFF;
            border: 1px solid #D1D5DB;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            padding: 24px 20px 14px;
        }
        h1 { text-align: center; font-size: 18px; color: #111827; font-weight: 600; margin-bottom: 2px; }
        .subtitle { text-align: center; font-size: 12px; color: #4B5563; margin-bottom: 10px; }
        #chart { width: 100%; height: 480px; }
        .note { font-size: 11px; color: #6B7280; text-align: center; margin-top: 6px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1><!-- 图表标题 --></h1>
        <div class="subtitle"><!-- 数据来源说明 --></div>
        <div id="chart"></div>
        <div class="note"><!-- 脚注 --></div>
    </div>
    <script>
        var chart = echarts.init(document.getElementById('chart'));
        chart.setOption({ /* 替换为具体图表 option */ });
        window.addEventListener('resize', function() { chart.resize(); });
    </script>
</body>
</html>
```
