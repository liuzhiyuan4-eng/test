export function normalizeMonth(dateText) {
  return String(dateText).slice(0, 7);
}

export function formatMonthBadge(month) {
  const [year, monthValue] = String(month).split("-");
  return `${year}.${monthValue}`;
}

export function formatDateLabel(dateText) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function sortByDateDesc(records, dateKey = "date") {
  return [...records].sort((left, right) =>
    String(right[dateKey] || "").localeCompare(String(left[dateKey] || "")),
  );
}

const CATEGORY_ORDER = {
  用户洞察: ["AI", "生产力", "FINDX职场年轻人", "RENO女大", "OPPO男大", "其他"],
  人因研究: [
    "折叠屏研究",
    "手势人因研究",
    "流畅性研究",
    "曲面屏手机热区研究",
    "高端设计风格视觉评估体系",
  ],
  互联网用户研究: ["NPS报告", "互联网", "穿测报告", "洞察报告"],
};

const USABILITY_VERSION_ORDER = ["16.0", "16.1", "天池", "三江源", "其他"];

export function getResearchItemsByDomain(insightData, domain) {
  return sortByDateDesc(
    insightData.filter((item) => {
      const itemDomain = item.domain || "用户洞察";
      return itemDomain === domain && item.featured !== false;
    }),
    "date",
  );
}

export function collectResearchCategories(insightData, domain) {
  const categories = [];

  getResearchItemsByDomain(insightData, domain).forEach((item) => {
    getResearchCategoryTags(item).forEach((category) => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
  });

  return ["总体", ...sortByPreferredOrder(categories, CATEGORY_ORDER[domain] || [])];
}

export function filterResearchItems(insights, category) {
  if (!category || category === "总体") {
    return sortByDateDesc(insights, "date");
  }

  return sortByDateDesc(
    insights.filter((item) => getResearchCategoryTags(item).includes(category)),
    "date",
  );
}

export function collectUsabilityVersions(usabilityData) {
  const versions = [];

  usabilityData.forEach((item) => {
    const version = getUsabilityVersion(item);
    if (!versions.includes(version)) {
      versions.push(version);
    }
  });

  return ["总体", ...sortByPreferredOrder(versions, USABILITY_VERSION_ORDER)];
}

export function filterUsabilityByVersion(usabilityData, version) {
  if (!version || version === "总体") {
    return usabilityData;
  }

  return usabilityData.filter((item) => getUsabilityVersion(item) === version);
}

export function getUsabilityVersion(test) {
  return String(test.version || test.category || "其他").trim() || "其他";
}

export function getResearchCategoryTags(insight) {
  const categories = Array.isArray(insight.categoryTags)
    ? insight.categoryTags
    : Array.isArray(insight.categories)
      ? insight.categories
      : [];

  return categories.map((item) => String(item).trim()).filter(Boolean);
}

function sortByPreferredOrder(items, preferredOrder) {
  return [...items].sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);

    if (leftIndex >= 0 && rightIndex >= 0) {
      return leftIndex - rightIndex;
    }
    if (leftIndex >= 0) {
      return -1;
    }
    if (rightIndex >= 0) {
      return 1;
    }

    return left.localeCompare(right, "zh-CN");
  });
}
