import { createElement } from "../utils/dom.js";

export function createMetricCards(metrics) {
  const cards = [
    {
      label: "测试场次",
      value: `${metrics.totalSessions}`,
      hint: "以当前筛选下的测试记录条数统计。",
    },
    {
      label: "累计发现问题",
      value: `${metrics.totalIssues}`,
      hint: "汇总当前筛选下所有测试记录中的问题总量。",
    },
    {
      label: "累计 P0 问题",
      value: `${metrics.totalP0}`,
      hint: "用于快速判断高优问题暴露强度和修复压力。",
    },
    {
      label: "平均采纳率",
      value: `${metrics.averageAdoption}%`,
      hint: "按已录入测试的 adoptionRate 字段计算均值。",
    },
  ];

  const grid = createElement("div", { className: "metrics-grid" });

  cards.forEach((item) => {
    grid.append(
      createElement("article", { className: "metric-card" }, [
        createElement("p", {
          className: "metric-label",
          text: item.label,
        }),
        createElement("p", {
          className: "metric-value",
          text: item.value,
        }),
        createElement("p", {
          className: "metric-hint",
          text: item.hint,
        }),
      ]),
    );
  });

  return grid;
}
