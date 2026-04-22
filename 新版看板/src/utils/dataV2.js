export function aggregateUsabilityMetrics(tests) {
  const totalSessions = tests.length;
  const totalP0 = tests.reduce((sum, item) => sum + Number(item.p0Count || 0), 0);
  const totalIssues = tests.reduce((sum, item) => sum + Number(item.issueCount || 0), 0);
  const averageAdoption = totalSessions
    ? Math.round(
        tests.reduce((sum, item) => sum + Number(item.adoptionRate || 0), 0) / totalSessions,
      )
    : 0;

  return {
    totalSessions,
    totalP0,
    totalIssues,
    averageAdoption,
  };
}

function getTestChartLabel(test, index) {
  const explicitLabel = String(test.chartLabel || "").trim();
  if (explicitLabel) {
    return explicitLabel;
  }

  const projectName = String(test.projectName || "").trim();
  if (projectName) {
    return projectName.length > 8 ? `${projectName.slice(0, 8)}…` : projectName;
  }

  const testName = String(test.testName || `测试${index + 1}`).trim();
  return testName.length > 8 ? `${testName.slice(0, 8)}…` : testName;
}

function buildTimeline(tests) {
  const sorted = [...tests].sort((left, right) => left.testDate.localeCompare(right.testDate));

  let sessionTotal = 0;
  let p0Total = 0;
  let issueTotal = 0;

  return sorted.map((test) => {
    sessionTotal += 1;
    p0Total += Number(test.p0Count || 0);
    issueTotal += Number(test.issueCount || 0);

    return {
      label: String(test.testDate).slice(5).replace("-", "."),
      cumulativeSessions: sessionTotal,
      cumulativeP0: p0Total,
      cumulativeIssues: issueTotal,
    };
  });
}

export function buildProgressTrendChartData(tests) {
  const sorted = [...tests].sort((left, right) => left.testDate.localeCompare(right.testDate));

  return {
    type: "stackedBar",
    title: "各批次测试问题情况总览",
    note: "",
    ariaLabel: "各批次测试问题情况总览堆叠柱状图",
    labels: sorted.map(getTestChartLabel),
    series: [
      {
        label: "P0问题",
        caption: "",
        color: "rgba(195, 123, 66, 0.88)",
        values: sorted.map((item) => Number(item.p0Count || 0)),
      },
      {
        label: "P1问题",
        caption: "",
        color: "rgba(94, 138, 209, 0.86)",
        values: sorted.map((item) => Number(item.p1Count || 0)),
      },
      {
        label: "采纳数量",
        caption: "",
        color: "rgba(92, 162, 124, 0.9)",
        values: sorted.map((item) => Number(item.adoptedCount || 0)),
      },
    ],
  };
}

export function buildIssueTrendChartData(tests) {
  const timeline = buildTimeline(tests);

  return {
    title: "累计发现问题 vs P0 问题",
    note: "",
    ariaLabel: "累计发现问题与 P0 问题折线图",
    labels: timeline.map((item) => item.label),
    series: [
      {
        label: "所有问题总计",
        caption: "",
        color: "rgba(79, 122, 205, 0.88)",
        values: timeline.map((item) => item.cumulativeIssues),
      },
      {
        label: "P0 问题总计",
        caption: "",
        color: "rgba(168, 108, 49, 0.84)",
        values: timeline.map((item) => item.cumulativeP0),
      },
    ],
  };
}
