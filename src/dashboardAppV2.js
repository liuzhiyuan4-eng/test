import { createChartCard } from "./components/ChartCardV2.js";
import { createImageModal } from "./components/ImageModal.js";
import { createInsightCard } from "./components/InsightCard.js";
import { createMetricCards } from "./components/MetricCardsV2.js";
import { createTestList } from "./components/TestList.js";
import { createElement } from "./utils/dom.js";
import {
  collectResearchCategories,
  collectUsabilityVersions,
  filterResearchItems,
  filterUsabilityByVersion,
  getResearchItemsByDomain,
  sortByDateDesc,
} from "./utils/data.js";
import {
  aggregateUsabilityMetrics,
  buildIssueTrendChartData,
  buildProgressTrendChartData,
} from "./utils/dataV2.js";

const DOMAIN_TABS = [
  "用户洞察",
  "可用性测试验收",
  "人因研究",
  "互联网用户研究",
];

const DOMAIN_COPY = {
  用户洞察:
    "沉淀用户心智、场景机会和关键人群洞察，默认展示全部结论，也可按赛道或人群标签进一步筛选。",
  可用性测试验收:
    "集中查看各版本可用性测试验收结果，统计图表和测试卡片会跟随版本标签同步筛选。",
  人因研究:
    "沉淀折叠屏、手势、流畅性、热区和高端视觉风格等方向的人因研究结论。",
  互联网用户研究:
    "汇总 NPS、互联网业务、穿测和专项洞察报告，便于快速回看重点结论。",
};

export function createApp({ usabilityData, insightData }) {
  const state = {
    activeDomain: DOMAIN_TABS[0],
    activeFilters: {
      用户洞察: "总体",
      可用性测试验收: "总体",
      人因研究: "总体",
      互联网用户研究: "总体",
    },
    activeImage: null,
  };

  const shell = createElement("div", { className: "page-shell" });

  const closeImage = () => {
    state.activeImage = null;
    render();
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape" && state.activeImage) {
      closeImage();
    }
  };

  if (document.__researchBoardEscHandler) {
    document.removeEventListener("keydown", document.__researchBoardEscHandler);
  }
  document.__researchBoardEscHandler = handleKeydown;
  document.addEventListener("keydown", handleKeydown);

  function render() {
    const hero = createHero({ usabilityData, insightData });
    const domainNav = createDomainNav({
      activeDomain: state.activeDomain,
      onChange: (domain) => {
        state.activeDomain = domain;
        render();
      },
    });

    const content =
      state.activeDomain === "可用性测试验收"
        ? createUsabilityPage({
            tests: usabilityData,
            activeVersion: state.activeFilters["可用性测试验收"],
            onVersionChange: (version) => {
              state.activeFilters["可用性测试验收"] = version;
              render();
            },
          })
        : createResearchPage({
            domain: state.activeDomain,
            insights: insightData,
            activeCategory: state.activeFilters[state.activeDomain],
            onCategoryChange: (category) => {
              state.activeFilters[state.activeDomain] = category;
              render();
            },
            onImageClick: (image) => {
              state.activeImage = image;
              render();
            },
          });

    const nodes = [hero, domainNav, content];

    if (state.activeImage) {
      nodes.push(
        createImageModal({
          image: state.activeImage,
          onClose: closeImage,
        }),
      );
    }

    shell.replaceChildren(...nodes);
  }

  render();
  return shell;
}

function createHero({ usabilityData, insightData }) {
  const activeInsights = insightData.filter((item) => item.featured !== false);
  const insightDomains = new Set(activeInsights.map((item) => item.domain || "用户洞察"));

  return createElement("header", { className: "hero-card" }, [
    createElement("div", { className: "hero-topline" }, [
      createElement("span", { className: "hero-dot" }),
      createElement("span", { text: "Research Conclusions Board" }),
    ]),
    createElement("div", { className: "hero-body" }, [
      createElement("div", { className: "hero-main-copy" }, [
        createElement("h1", {
          className: "hero-title",
          text: "用研组核心研究结论看板",
        }),
        createElement("p", {
          className: "hero-description",
          text:
            "聚合用户洞察、可用性测试验收、人因研究和互联网用户研究的关键结论，帮助业务同学按领域快速查看、复用和追溯原始报告。",
        }),
      ]),
      createElement("div", { className: "hero-meta-panel" }, [
        createElement("div", { className: "hero-meta-box" }, [
          createElement("p", {
            className: "hero-meta-label",
            text: "当前收录",
          }),
          createElement("p", {
            className: "hero-meta-value",
            text: `${activeInsights.length} 条结论 / ${usabilityData.length} 场测试`,
          }),
          createElement("p", {
            className: "hero-meta-copy",
            text: `覆盖 ${insightDomains.size} 个研究领域，所有内容按时间倒序展示，可通过领域和标签继续收敛。`,
          }),
        ]),
      ]),
    ]),
  ]);
}

function createDomainNav({ activeDomain, onChange }) {
  return createElement("nav", {
    className: "domain-nav-card",
    attrs: { "aria-label": "用研领域切换" },
  }, [
    createElement("div", { className: "domain-nav-copy" }, [
      createElement("p", { className: "panel-label", text: "用研领域" }),
      createElement("h2", { className: "domain-nav-title", text: activeDomain }),
      createElement("p", {
        className: "domain-nav-description",
        text: "切换领域后，页面会展示该领域下的结论、标签筛选和来源入口。",
      }),
    ]),
    createElement(
      "div",
      { className: "domain-tabs" },
      DOMAIN_TABS.map((domain) =>
        createElement("button", {
          className: `domain-tab${domain === activeDomain ? " active" : ""}`,
          text: domain,
          attrs: { type: "button" },
          events: { click: () => onChange(domain) },
        }),
      ),
    ),
  ]);
}

function createResearchPage({
  domain,
  insights,
  activeCategory,
  onCategoryChange,
  onImageClick,
}) {
  const categories = collectResearchCategories(insights, domain);
  const selectedCategory = categories.includes(activeCategory) ? activeCategory : "总体";
  const domainInsights = getResearchItemsByDomain(insights, domain);
  const filteredInsights = filterResearchItems(domainInsights, selectedCategory);

  const panel = createElement("section", { className: "panel panel-b domain-content-panel" }, [
    createElement("div", { className: "insight-head" }, [
      createElement("div", { className: "insight-head-copy" }, [
        createElement("p", {
          className: "panel-label",
          text: "研究结论",
        }),
        createElement("h2", {
          className: "month-title",
          text: `${domain}核心结论`,
        }),
        createElement("p", {
          className: "month-subtitle",
          text: DOMAIN_COPY[domain],
        }),
      ]),
    ]),
    createFilterStrip({
      label: "细分标签",
      items: categories,
      activeItem: selectedCategory,
      onChange: onCategoryChange,
    }),
    createElement("div", { className: "month-title-block" }, [
      createElement("p", {
        className: "month-lead",
        text: `${selectedCategory} · ${filteredInsights.length} 条结论`,
      }),
    ]),
  ]);

  if (!filteredInsights.length) {
    panel.append(
      createElement("div", { className: "empty-card" }, [
        createElement("h3", { text: "当前分类暂无研究结论" }),
        createElement("p", {
          text: "你可以在 data/insights.json 中为报告补充 domain 和 categoryTags 字段，页面会自动生成对应标签。",
        }),
      ]),
    );
    return panel;
  }

  const grid = createElement("div", { className: "insight-grid" });
  filteredInsights.forEach((insight) => {
    grid.append(createInsightCard({ insight, onImageClick }));
  });

  panel.append(grid);
  return panel;
}

function createUsabilityPage({ tests, activeVersion, onVersionChange }) {
  const versions = collectUsabilityVersions(tests);
  const selectedVersion = versions.includes(activeVersion) ? activeVersion : "总体";
  const filteredTests = filterUsabilityByVersion(tests, selectedVersion);
  const sortedTests = sortByDateDesc(filteredTests, "testDate");
  const metrics = aggregateUsabilityMetrics(sortedTests);
  const progressChartData = buildProgressTrendChartData(sortedTests);
  const issueChartData = buildIssueTrendChartData(sortedTests);

  return createElement("section", { className: "panel panel-a domain-content-panel" }, [
    createElement("div", { className: "panel-head" }, [
      createElement("div", { className: "panel-head-copy" }, [
        createElement("p", {
          className: "panel-label",
          text: "测试验收",
        }),
        createElement("h2", {
          className: "panel-title",
          text: "可用性测试验收概览",
        }),
        createElement("p", {
          className: "panel-description",
          text:
            "上方版本标签由测试数据动态生成。切换后，指标、图表和测试结果会同步按版本重新统计。",
        }),
      ]),
    ]),
    createFilterStrip({
      label: "版本分类",
      items: versions,
      activeItem: selectedVersion,
      onChange: onVersionChange,
    }),
    createElement("div", { className: "usability-dashboard-grid" }, [
      createMetricCards(metrics),
      createElement("div", { className: "chart-stack" }, [
        createChartCard(progressChartData),
        createChartCard(issueChartData),
      ]),
    ]),
    createTestList({
      tests: sortedTests,
      title: "测试结果",
      copy: `${selectedVersion} · ${sortedTests.length} 场测试，按测试时间倒序展示`,
    }),
  ]);
}

function createFilterStrip({ label, items, activeItem, onChange }) {
  return createElement("div", { className: "filter-strip" }, [
    createElement("p", { className: "filter-strip-label", text: label }),
    createElement(
      "div",
      { className: "filter-chips" },
      items.map((item) =>
        createElement("button", {
          className: `filter-chip${item === activeItem ? " active" : ""}`,
          text: item,
          attrs: { type: "button" },
          events: { click: () => onChange(item) },
        }),
      ),
    ),
  ]);
}
