import { createChartCard } from "./components/ChartCardV2.js";
import { createImageModal } from "./components/ImageModal.js";
import { createInsightCard } from "./components/InsightCard.js";
import { createMetricCards } from "./components/MetricCardsV2.js";
import { createMonthTabs } from "./components/MonthTabs.js";
import { createTestList } from "./components/TestList.js";
import { createElement } from "./utils/dom.js";
import {
  collectAvailableMonths,
  formatMonthHeading,
  getFeaturedInsightsByMonth,
  getLatestMonth,
  getUsabilityByMonth,
} from "./utils/data.js";
import {
  aggregateUsabilityMetrics,
  buildIssueTrendChartData,
  buildProgressTrendChartData,
} from "./utils/dataV2.js";

export function createApp({ usabilityData, insightData }) {
  const state = {
    selectedMonth: getLatestMonth(collectAvailableMonths(usabilityData, insightData)),
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
    const months = collectAvailableMonths(usabilityData, insightData);
    const selectedMonth = state.selectedMonth || getLatestMonth(months);
    const monthTests = getUsabilityByMonth(usabilityData, selectedMonth);
    const monthInsights = getFeaturedInsightsByMonth(insightData, selectedMonth);
    const metrics = aggregateUsabilityMetrics(monthTests);
    const progressChartData = buildProgressTrendChartData(monthTests);
    const issueChartData = buildIssueTrendChartData(monthTests);

    const hero = createHero({
      selectedMonth,
      monthTests,
      monthInsights,
    });

    const globalMonthFilter = createGlobalMonthFilter({
      months,
      selectedMonth,
      onMonthChange: (month) => {
        state.selectedMonth = month;
        render();
      },
    });

    const usabilityPanel = createUsabilityPanel({
      selectedMonth,
      metrics,
      progressChartData,
      issueChartData,
      tests: monthTests,
    });

    const insightPanel = createInsightPanel({
      selectedMonth,
      insights: monthInsights,
      onImageClick: (image) => {
        state.activeImage = image;
        render();
      },
    });

    const layout = createElement("div", { className: "board-layout" }, [
      usabilityPanel,
      insightPanel,
    ]);

    const nodes = [hero, globalMonthFilter, layout];

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

function createHero({ selectedMonth, monthTests, monthInsights }) {
  const totalImages = monthInsights.reduce(
    (count, insight) => count + (insight.images?.length || 0),
    0,
  );

  return createElement("header", { className: "hero-card" }, [
    createElement("div", { className: "hero-topline" }, [
      createElement("span", { className: "hero-dot" }),
      createElement("span", { text: "Monthly Research Board" }),
    ]),
    createElement("div", { className: "hero-body" }, [
      createElement("div", { className: "hero-main-copy" }, [
        createElement("h1", {
          className: "hero-title",
          text: "用研组月度成果公示看板",
        }),
        createElement("p", {
          className: "hero-description",
          text:
            "聚合可用性测试反馈与重点研究洞察，帮助业务小伙伴们按月份快速浏览问题与本月值得关注的结论",
        }),
      ]),
      createElement("div", { className: "hero-meta-panel" }, [
        createElement("div", { className: "hero-meta-box" }, [
          createElement("p", {
            className: "hero-meta-label",
            text: "本月情况",
          }),
          createElement("p", {
            className: "hero-meta-value",
            text: `${monthTests.length} 场测试 / ${monthInsights.length} 条重点洞察`,
          }),
          createElement("p", {
            className: "hero-meta-copy",
            text: `当前月份：${formatMonthHeading(selectedMonth)}，本页共包含 ${totalImages} 张可放大查看的缩略图。`,
          }),
        ]),
      ]),
    ]),
  ]);
}

function createGlobalMonthFilter({ months, selectedMonth, onMonthChange }) {
  return createElement("section", { className: "global-filter-bar" }, [
    createElement("div", { className: "global-filter-copy" }, [
      createElement("p", {
        className: "panel-label",
        text: "全局月份筛选",
      }),
      createElement("h2", {
        className: "global-filter-title",
        text: `${formatMonthHeading(selectedMonth)} 视图`,
      }),
      createElement("p", {
        className: "global-filter-description",
        text: "切换后将同步更新 A 区测试数据与 B 区洞察内容。",
      }),
    ]),
    createElement("div", { className: "global-filter-tabs" }, [
      createMonthTabs({
        months,
        selectedMonth,
        onChange: onMonthChange,
      }),
    ]),
  ]);
}

function createUsabilityPanel({
  selectedMonth,
  metrics,
  progressChartData,
  issueChartData,
  tests,
}) {
  return createElement("section", { className: "panel panel-a" }, [
    createElement("div", { className: "panel-head" }, [
      createElement("div", { className: "panel-head-copy" }, [
        createElement("p", {
          className: "panel-label",
          text: "A区 / 可用性测试情况反馈",
        }),
        createElement("h2", {
          className: "panel-title",
          text: "本月可用性测试情况概览",
        }),
        createElement("p", {
          className: "panel-description",
          text:
            "左侧展示四个核心指标，右侧图标展示情况，下方展示单场测试内容摘要",
        }),
      ]),
    ]),
    createElement("div", { className: "usability-dashboard-grid" }, [
      createMetricCards(metrics),
      createElement("div", { className: "chart-stack" }, [
        createChartCard(progressChartData),
        createChartCard(issueChartData),
      ]),
    ]),
    createTestList({ tests, selectedMonth }),
  ]);
}

function createInsightPanel({ selectedMonth, insights, onImageClick }) {
  const panel = createElement("section", { className: "panel panel-b" });

  panel.append(
    createElement("div", { className: "insight-head" }, [
      createElement("div", { className: "insight-head-copy" }, [
        createElement("p", {
          className: "panel-label",
          text: "B区 / 每月重要研究报告展示",
        }),
        createElement("h2", {
          className: "month-title",
          text: `${formatMonthHeading(selectedMonth)}核心观点洞察`,
        }),
        createElement("p", {
          className: "month-subtitle",
          text:
            "仅展示当月入选的重点报告卡片，快速浏览的“每月一页纸”",
        }),
      ]),
    ]),
    createElement("div", { className: "month-title-block" }, [
      createElement("p", {
        className: "month-lead",
        text: "本月精选洞察",
      }),
    ]),
  );

  if (!insights.length) {
    panel.append(
      createElement("div", { className: "empty-card" }, [
        createElement("h3", { text: "当前月份暂无入选洞察" }),
        createElement("p", {
          text: "你可以直接修改 data/insights.json，为该月份补充 featured 为 true 的重点报告。",
        }),
      ]),
    );
    return panel;
  }

  const grid = createElement("div", { className: "insight-grid" });
  insights.forEach((insight) => {
    grid.append(createInsightCard({ insight, onImageClick }));
  });

  panel.append(grid);
  return panel;
}
