# 用研组核心研究结论看板

一个纯前端静态网页项目，用于展示用研组沉淀的核心研究结论。当前版本不依赖后端、数据库或登录系统，数据来自本地 JSON 文件，适合先部署到 GitHub Pages 给相关同事查看初版效果。

## 功能概览

- 顶部按用研领域切换：用户洞察、可用性测试验收、人因研究、互联网用户研究
- 用户洞察、人因研究、互联网用户研究共用研究结论卡片样式
- 每个研究领域支持动态细分标签筛选，标签来自 `data/insights.json`
- 可用性测试验收支持动态版本筛选，版本来自 `data/usability.json`
- 可用性测试验收页包含指标卡、图表和测试结果列表
- 研究卡片支持 Markdown 摘要、图片放大、原文链接跳转和密码复制
- 本地录入页可辅助维护 JSON 数据，公开看板不会展示录入入口

## 项目结构

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── assets/
│   └── *.svg
├── data/
│   ├── insights.json
│   └── usability.json
├── src/
│   ├── components/
│   │   ├── ChartCardV2.js
│   │   ├── ImageModal.js
│   │   ├── InsightCard.js
│   │   ├── MetricCardsV2.js
│   │   └── TestList.js
│   ├── utils/
│   │   ├── data.js
│   │   ├── dataV2.js
│   │   ├── dom.js
│   │   └── markdown.js
│   ├── dashboardAppV2.js
│   ├── editor.js
│   └── main.js
├── styles/
│   ├── editor.css
│   ├── main.css
│   └── tokens.css
├── editor.html
├── index.html
└── README.md
```

## 本地运行

页面通过 `fetch()` 读取本地 JSON，所以不要直接双击 `index.html`，需要通过静态服务打开。

```powershell
py -m http.server 4173
```

然后访问：

```text
http://localhost:4173/
```

## 数据维护

### 研究结论数据

编辑 `data/insights.json`。

常用字段：

```json
{
  "id": "IN-2026-04-01",
  "featured": true,
  "domain": "用户洞察",
  "categoryTags": ["AI", "生产力"],
  "title": "洞察标题",
  "summary": "支持 Markdown 的摘要内容",
  "sourceReport": "来源报告名称",
  "date": "2026-04-09",
  "tags": ["展示标签1", "展示标签2"],
  "images": ["./assets/example.svg"],
  "link": "https://example.com/report",
  "sourcePassword": "XXXXXX"
}
```

说明：

- `domain` 决定内容出现在哪个一级领域页面
- `categoryTags` 决定该领域下的细分筛选标签，新增标签后页面会自动出现
- `featured: false` 的内容不会在公开看板中展示
- `summary` 支持段落、列表和加粗
- `images` 建议保留 0 到 2 张图，图片可点击放大

### 可用性测试数据

编辑 `data/usability.json`。

常用字段：

```json
{
  "id": "UT-2026-04-01",
  "testName": "测试名称",
  "testDate": "2026-04-11",
  "version": "16.0",
  "chartLabel": "图表短标签",
  "issueCount": 9,
  "p0Count": 1,
  "p1Count": 4,
  "adoptedCount": 6,
  "adoptionRate": 88,
  "description": "一句话摘要",
  "issues": ["典型问题1", "典型问题2", "典型问题3"],
  "projectName": "项目名称",
  "tags": ["展示标签A", "展示标签B"],
  "sourceLink": "https://example.com/report",
  "sourcePassword": "XXXXXX"
}
```

说明：

- `version` 决定可用性测试验收页的版本筛选标签
- `chartLabel` 用于图表 X 轴，建议短一点
- 指标和图表都会根据当前筛选后的测试数据自动计算
- `issues` 建议保留 3 条典型问题

## 本地录入页

项目包含一个只用于本地维护数据的录入页：

```text
http://localhost:4173/editor.html
```

说明：

- 录入页不会出现在公开看板导航里
- 录入页只允许在 `localhost` 或 `127.0.0.1` 这类本地地址下打开
- 可以读取当前 `data/usability.json` 和 `data/insights.json`
- 支持新增、删除、编辑、导入当前 JSON、导出 JSON
- 编辑过程会自动保存到浏览器本地草稿

## 部署到 GitHub Pages

仓库里已经包含 `.github/workflows/deploy.yml`。

推荐操作：

1. 将项目推送到 GitHub 仓库
2. 打开仓库 `Settings -> Pages`
3. Source 选择 `GitHub Actions`
4. 等待 Actions 跑完后，GitHub 会生成 Pages 访问地址

如果只是公开给领导看初版效果，请先确认 `data/*.json` 中没有真实敏感链接、密码或内部资料。
