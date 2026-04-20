export function normalizeMonth(dateText) {
  return String(dateText).slice(0, 7);
}

export function collectAvailableMonths(usabilityData, insightData) {
  const monthSet = new Set();

  usabilityData.forEach((item) => {
    monthSet.add(normalizeMonth(item.testDate));
  });

  insightData.forEach((item) => {
    monthSet.add(item.month);
  });

  return [...monthSet].sort((left, right) => right.localeCompare(left));
}

export function getLatestMonth(months) {
  return months[0] || "";
}

export function getUsabilityByMonth(usabilityData, month) {
  return usabilityData
    .filter((item) => normalizeMonth(item.testDate) === month)
    .sort((left, right) => right.testDate.localeCompare(left.testDate));
}

export function getFeaturedInsightsByMonth(insightData, month) {
  return insightData
    .filter((item) => item.month === month && item.featured)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function formatMonthHeading(month) {
  const [, monthValue] = String(month).split("-");
  return `${Number(monthValue)}月`;
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
