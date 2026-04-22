import { createElement } from "./utils/dom.js";
import { formatMonthBadge, normalizeMonth } from "./utils/data.js";

const STORAGE_KEY = "research-board-editor-draft-v1";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const TAB_META = {
  usability: {
    label: "可用性测试验收",
    fileName: "usability.json",
  },
  insights: {
    label: "研究结论",
    fileName: "insights.json",
  },
};

bootstrap();

async function bootstrap() {
  const root = document.querySelector("#app");

  if (!isLocalHost()) {
    root.className = "editor-loading";
    root.replaceChildren(
      createElement("div", { className: "editor-blocked-card" }, [
        createElement("p", { className: "editor-pill", text: "仅本地可用" }),
        createElement("h1", { text: "录入页已禁用公网访问" }),
        createElement("p", {
          text: "这个页面只给你本地维护数据用。请通过 localhost 或 127.0.0.1 的静态服务打开它，不会挂到公开看板导航里。",
        }),
        createElement("p", {
          className: "editor-muted",
          text: "建议使用 py -m http.server 4173 后访问 /editor.html",
        }),
      ]),
    );
    return;
  }

  try {
    const sourceData = await loadSourceData();
    const draft = loadDraft();
    const data = draft ? normalizeEditorData(draft) : sourceData;

    const state = {
      sourceData,
      data,
      activeTab: "usability",
      filters: {
        usability: getDefaultMonth(data.usability, "testDate"),
        insights: getDefaultMonth(data.insights, "month"),
      },
      activeIds: {
        usability: getFirstId(data.usability),
        insights: getFirstId(data.insights),
      },
      notice: draft
        ? { type: "info", text: "已加载浏览器中的本地草稿。" }
        : { type: "info", text: "当前已读取 data 目录里的 JSON 文件。" },
    };

    renderEditor(root, state);
  } catch (error) {
    root.className = "editor-loading";
    root.replaceChildren(
      createElement("div", { className: "editor-blocked-card" }, [
        createElement("p", { className: "editor-pill", text: "加载失败" }),
        createElement("h1", { text: "录入页初始化失败" }),
        createElement("p", {
          text: "请确认你是通过本地静态服务器打开 editor.html，并且 data 目录下的 JSON 文件格式正常。",
        }),
        createElement("p", {
          className: "editor-muted",
          text: error.message,
        }),
      ]),
    );
  }
}

function isLocalHost() {
  if (window.location.protocol === "file:") {
    return false;
  }

  return LOCAL_HOSTS.has(window.location.hostname);
}

async function loadSourceData() {
  const [usabilityResponse, insightResponse] = await Promise.all([
    fetch("./data/usability.json", { cache: "no-store" }),
    fetch("./data/insights.json", { cache: "no-store" }),
  ]);

  if (!usabilityResponse.ok || !insightResponse.ok) {
    throw new Error("无法读取 data 目录中的 JSON 文件。");
  }

  return normalizeEditorData({
    usability: await usabilityResponse.json(),
    insights: await insightResponse.json(),
  });
}

function normalizeEditorData(data) {
  return {
    usability: Array.isArray(data.usability)
      ? data.usability.map(normalizeUsabilityRecord)
      : [],
    insights: Array.isArray(data.insights)
      ? data.insights.map(normalizeInsightRecord)
      : [],
  };
}

function normalizeUsabilityRecord(record = {}, index = 0) {
  const safeDate = String(record.testDate || getTodayDate());
  const safeMonth = normalizeMonth(safeDate) || "2026-04";

  return {
    id: String(record.id || createUsabilityId(safeMonth, index)),
    testName: String(record.testName || ""),
    testDate: safeDate,
    version: String(record.version || record.category || "其他"),
    chartLabel: String(record.chartLabel || ""),
    issueCount: toNumber(record.issueCount),
    p0Count: toNumber(record.p0Count),
    p1Count: toNumber(record.p1Count),
    adoptedCount: toNumber(record.adoptedCount),
    adoptionRate: toNumber(record.adoptionRate),
    description: String(record.description || ""),
    sourceLink: String(record.sourceLink || ""),
    sourcePassword: String(record.sourcePassword || ""),
    issues: normalizeStringArray(record.issues),
    projectName: String(record.projectName || ""),
    tags: normalizeStringArray(record.tags),
  };
}

function normalizeInsightRecord(record = {}, index = 0) {
  const safeMonth = String(record.month || normalizeMonth(record.date || getTodayDate()) || "2026-04");

  return {
    id: String(record.id || createInsightId(safeMonth, index)),
    month: safeMonth,
    featured: Boolean(record.featured),
    domain: String(record.domain || "用户洞察"),
    categoryTags: normalizeStringArray(record.categoryTags || record.categories),
    title: String(record.title || ""),
    summary: String(record.summary || ""),
    sourceReport: String(record.sourceReport || ""),
    date: String(record.date || `${safeMonth}-01`),
    tags: normalizeStringArray(record.tags),
    images: normalizeStringArray(record.images),
    sourceLink: String(record.sourceLink || record.link || ""),
    sourcePassword: String(record.sourcePassword || ""),
  };
}

function normalizeStringArray(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => String(item).trim()).filter(Boolean);
}

function toNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultMonth(records, monthKey) {
  const months = collectMonths(records, monthKey);
  return months[0] || "ALL";
}

function collectMonths(records, monthKey) {
  const set = new Set();
  records.forEach((record) => {
    const value =
      monthKey === "testDate" ? normalizeMonth(record.testDate) : String(record.month || "");
    if (value) {
      set.add(value);
    }
  });
  return [...set].sort((left, right) => right.localeCompare(left));
}

function getFirstId(records) {
  return records[0]?.id || null;
}

function renderEditor(root, state) {
  root.__editorState = state;
  ensureSelection(state, state.activeTab);
  root.className = "";

  const shell = createElement("div", { className: "editor-shell" }, [
    createHeader(state),
    createToolbar(state, root),
    createWorkspace(state, root),
  ]);

  root.replaceChildren(shell);
}

function createHeader(state) {
  const counts = {
    usability: state.data.usability.length,
    insights: state.data.insights.length,
  };

  return createElement("header", { className: "editor-header" }, [
    createElement("div", { className: "editor-header-copy" }, [
      createElement("p", { className: "editor-pill", text: "本地录入工具" }),
      createElement("h1", { text: "核心研究结论看板内容录入页" }),
      createElement("p", {
        className: "editor-lead",
        text: "这里用于本地维护可用性测试验收记录和各领域研究结论卡片。不会出现在公开看板导航里，整理完成后再导出 JSON。",
      }),
    ]),
    createElement("div", { className: "editor-status-grid" }, [
      createStatCard("测试记录", `${counts.usability} 条`),
      createStatCard("研究卡片", `${counts.insights} 条`),
      createStatCard("当前模式", TAB_META[state.activeTab].label),
    ]),
  ]);
}

function createStatCard(label, value) {
  return createElement("div", { className: "editor-stat-card" }, [
    createElement("span", { className: "editor-stat-label", text: label }),
    createElement("strong", { className: "editor-stat-value", text: value }),
  ]);
}

function createToolbar(state, root) {
  const activeTab = state.activeTab;
  const months = collectMonths(
    state.data[activeTab],
    activeTab === "usability" ? "testDate" : "month",
  );
  const notice = state.notice;

  const importInput = createElement("input", {
    attrs: { type: "file", accept: "application/json", hidden: "hidden" },
    events: {
      change: async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }

        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const normalized =
            activeTab === "usability"
              ? parsed.map(normalizeUsabilityRecord)
              : parsed.map(normalizeInsightRecord);
          state.data[activeTab] = normalized;
          state.activeIds[activeTab] = normalized[0]?.id || null;
          persistDraft(state.data);
          state.notice = {
            type: "success",
            text: `${TAB_META[activeTab].fileName} 已导入并覆盖当前草稿。`,
          };
          renderEditor(root, state);
        } catch (error) {
          state.notice = {
            type: "error",
            text: `导入失败：${error.message}`,
          };
          renderEditor(root, state);
        } finally {
          event.target.value = "";
        }
      },
    },
  });

  return createElement("section", { className: "editor-toolbar" }, [
    createElement("div", { className: "editor-toolbar-row" }, [
      createElement(
        "div",
        { className: "editor-tab-group" },
        Object.entries(TAB_META).map(([key, meta]) =>
          createElement("button", {
            className: `editor-tab${state.activeTab === key ? " is-active" : ""}`,
            text: meta.label,
            attrs: { type: "button" },
            events: {
              click: () => {
                state.activeTab = key;
                ensureSelection(state, key);
                state.notice = {
                  type: "info",
                  text: `已切换到 ${meta.label}。`,
                };
                renderEditor(root, state);
              },
            },
          }),
        ),
      ),
      createElement("div", { className: "editor-action-group" }, [
        createElement("button", {
          className: "editor-button editor-button-primary",
          text: activeTab === "usability" ? "新增测试记录" : "新增洞察卡片",
          attrs: { type: "button" },
          events: {
            click: () => {
              addRecord(state, activeTab);
              persistDraft(state.data);
              state.notice = {
                type: "success",
                text: activeTab === "usability" ? "已新增测试记录。" : "已新增洞察卡片。",
              };
              renderEditor(root, state);
            },
          },
        }),
        createElement("button", {
          className: "editor-button",
          text: "导入当前 JSON",
          attrs: { type: "button" },
          events: {
            click: () => importInput.click(),
          },
        }),
        createElement("button", {
          className: "editor-button",
          text: `导出 ${TAB_META[activeTab].fileName}`,
          attrs: { type: "button" },
          events: {
            click: () => {
              const validation = validateDatasetForExport(activeTab, state.data[activeTab]);
              if (validation.errors.length) {
                state.notice = {
                  type: "error",
                  text: `导出已拦截：当前有 ${validation.errors.length} 处必填问题未解决。`,
                };
                renderEditor(root, state);
                return;
              }

              downloadJson(
                TAB_META[activeTab].fileName,
                activeTab === "usability"
                  ? state.data.usability
                  : state.data.insights.map(toInsightExportRecord),
              );
              state.notice = {
                type: validation.warnings.length ? "info" : "success",
                text: validation.warnings.length
                  ? `${TAB_META[activeTab].fileName} 已导出，但还有 ${validation.warnings.length} 处提醒可继续优化。`
                  : `${TAB_META[activeTab].fileName} 已导出。`,
              };
              renderEditor(root, state);
            },
          },
        }),
        createElement("button", {
          className: "editor-button",
          text: "导出两个 JSON",
          attrs: { type: "button" },
          events: {
            click: () => {
              const usabilityValidation = validateDatasetForExport("usability", state.data.usability);
              const insightValidation = validateDatasetForExport("insights", state.data.insights);
              const totalErrors =
                usabilityValidation.errors.length + insightValidation.errors.length;
              const totalWarnings =
                usabilityValidation.warnings.length + insightValidation.warnings.length;

              if (totalErrors) {
                state.notice = {
                  type: "error",
                  text: `导出已拦截：A/B 数据中还有 ${totalErrors} 处必填问题未解决。`,
                };
                renderEditor(root, state);
                return;
              }

              downloadJson("usability.json", state.data.usability);
              downloadJson(
                "insights.json",
                state.data.insights.map(toInsightExportRecord),
              );
              state.notice = {
                type: totalWarnings ? "info" : "success",
                text: totalWarnings
                  ? `两个 JSON 文件都已导出，但还有 ${totalWarnings} 处提醒可继续优化。`
                  : "两个 JSON 文件都已导出。",
              };
              renderEditor(root, state);
            },
          },
        }),
      ]),
      importInput,
    ]),
    createElement("div", { className: "editor-toolbar-row editor-toolbar-row-bottom" }, [
      createElement("div", { className: "editor-list-filter" }, [
        createElement("span", { className: "editor-filter-label", text: "按月份查看" }),
        createElement(
          "div",
          { className: "editor-filter-tabs" },
          [
            createMonthFilterButton("ALL", "全部", state, root),
            ...months.map((month) =>
              createMonthFilterButton(month, formatMonthBadge(month), state, root),
            ),
          ],
        ),
      ]),
      createElement("div", { className: "editor-action-group" }, [
        createElement("button", {
          className: "editor-button editor-button-subtle",
          text: "从 data 文件重载",
          attrs: { type: "button" },
          events: {
            click: () => {
              state.data = structuredClone(state.sourceData);
              state.filters.usability = getDefaultMonth(state.data.usability, "testDate");
              state.filters.insights = getDefaultMonth(state.data.insights, "month");
              state.activeIds.usability = getFirstId(state.data.usability);
              state.activeIds.insights = getFirstId(state.data.insights);
              persistDraft(state.data);
              state.notice = {
                type: "info",
                text: "已恢复为当前 data 目录中的 JSON 内容。",
              };
              renderEditor(root, state);
            },
          },
        }),
        createElement("button", {
          className: "editor-button editor-button-subtle",
          text: "清空本地草稿",
          attrs: { type: "button" },
          events: {
            click: () => {
              localStorage.removeItem(STORAGE_KEY);
              state.notice = {
                type: "info",
                text: "浏览器中的本地草稿已清空。",
              };
              renderEditor(root, state);
            },
          },
        }),
      ]),
    ]),
    createElement("div", {
      className: `editor-notice is-${notice?.type || "info"}`,
      text: notice?.text || "已准备就绪。",
    }),
  ]);
}

function createMonthFilterButton(monthValue, label, state, root) {
  const activeTab = state.activeTab;
  return createElement("button", {
    className: `editor-chip${state.filters[activeTab] === monthValue ? " is-active" : ""}`,
    text: label,
    attrs: { type: "button" },
    events: {
      click: () => {
        state.filters[activeTab] = monthValue;
        ensureSelection(state, activeTab);
        renderEditor(root, state);
      },
    },
  });
}

function createWorkspace(state, root) {
  const activeTab = state.activeTab;
  const visibleRecords = getVisibleRecords(state, activeTab);
  const activeRecord = getActiveRecord(state, activeTab);

  return createElement("section", { className: "editor-workspace" }, [
    createElement("aside", { className: "editor-sidebar" }, [
      createElement("div", { className: "editor-sidebar-head" }, [
        createElement("h2", {
          text: activeTab === "usability" ? "测试记录列表" : "洞察卡片列表",
        }),
        createElement("p", {
          className: "editor-muted",
          text:
            activeTab === "usability"
              ? "左侧选记录，右侧编辑。当前筛选只影响录入页列表。"
              : "每张洞察卡都可以在右侧直接编辑摘要、图片和来源信息。",
        }),
      ]),
      createElement(
        "div",
        { className: "editor-record-list" },
        visibleRecords.length
          ? visibleRecords.map((record) => createRecordListItem(record, state, root))
          : [
              createElement("div", { className: "editor-empty" }, [
                createElement("p", { text: "当前筛选下还没有内容。" }),
              ]),
            ],
      ),
    ]),
    createElement("div", { className: "editor-form-shell" }, [
      activeRecord
        ? createRecordEditor(activeRecord, state, root)
        : createElement("div", { className: "editor-empty editor-empty-large" }, [
            createElement("p", { text: "请先新增一条记录，或从左侧选择已有内容。" }),
          ]),
    ]),
  ]);
}

function createRecordListItem(record, state, root) {
  const activeTab = state.activeTab;
  const isActive = state.activeIds[activeTab] === record.id;
  const title = activeTab === "usability" ? record.testName || "未命名测试" : record.title || "未命名洞察";
  const subline =
    activeTab === "usability"
      ? `${record.testDate || ""}${record.version ? ` · ${record.version}` : ""}${record.projectName ? ` · ${record.projectName}` : ""}`
      : `${record.domain || "用户洞察"}${record.featured ? " · 公开展示" : " · 暂不展示"}`;

  return createElement("article", {
    className: `editor-record-item${isActive ? " is-active" : ""}`,
    events: {
      click: () => {
        state.activeIds[activeTab] = record.id;
        renderEditor(root, state);
      },
    },
    children: [
      createElement("div", { className: "editor-record-main" }, [
        createElement("h3", { className: "editor-record-title", text: title }),
        createElement("p", { className: "editor-record-meta", text: subline }),
      ]),
      createElement("div", { className: "editor-record-actions" }, [
        createElement("button", {
          className: "editor-icon-button",
          text: "复制",
          attrs: { type: "button" },
          events: {
            click: (event) => {
              event.stopPropagation();
              duplicateRecord(state, activeTab, record.id);
              persistDraft(state.data);
              state.notice = {
                type: "success",
                text: "已复制当前记录。",
              };
              renderEditor(root, state);
            },
          },
        }),
        createElement("button", {
          className: "editor-icon-button is-danger",
          text: "删除",
          attrs: { type: "button" },
          events: {
            click: (event) => {
              event.stopPropagation();
              deleteRecord(state, activeTab, record.id);
              persistDraft(state.data);
              state.notice = {
                type: "info",
                text: "已删除当前记录。",
              };
              renderEditor(root, state);
            },
          },
        }),
      ]),
    ],
  });
}

function createRecordEditor(record, state, root) {
  return state.activeTab === "usability"
    ? createUsabilityEditor(record, state, root)
    : createInsightEditor(record, state, root);
}

function createUsabilityEditor(record, state, root) {
  const shell = createElement("div", { className: "editor-panel" }, [
    createElement("div", { className: "editor-panel-head" }, [
      createElement("div", {}, [
        createElement("p", { className: "editor-muted", text: "可用性测试验收记录" }),
        createElement("h2", { text: record.testName || "未命名测试" }),
      ]),
      createElement("div", { className: "editor-badge-group" }, [
        createElement("span", { className: "editor-badge", text: normalizeMonth(record.testDate) }),
        createElement("span", {
          className: "editor-badge editor-badge-soft",
          text: `采纳率 ${record.adoptionRate}%`,
        }),
      ]),
    ]),
  ]);

  shell.append(
    createSectionBlock("基础信息", [
      createFieldGrid(
        createTextField("记录 ID", record.id, (value) => updateRecordField(state, "usability", record.id, "id", value), root),
        createTextField("测试名称", record.testName, (value) => updateRecordField(state, "usability", record.id, "testName", value), root),
        createTextField("项目名称", record.projectName, (value) => updateRecordField(state, "usability", record.id, "projectName", value), root),
        createDateField("测试日期", record.testDate, (value) => {
          updateRecordField(state, "usability", record.id, "testDate", value);
        }, root),
      ),
      createFieldGrid(
        createTextField("版本分类", record.version, (value) => updateRecordField(state, "usability", record.id, "version", value), root),
        createTextField("图表短标签", record.chartLabel, (value) => updateRecordField(state, "usability", record.id, "chartLabel", value), root),
      ),
      createFieldGrid(
        createNumberField("累计发现问题", record.issueCount, (value) => updateRecordField(state, "usability", record.id, "issueCount", value), root),
        createNumberField("P0 问题数", record.p0Count, (value) => updateRecordField(state, "usability", record.id, "p0Count", value), root),
        createNumberField("P1 问题数", record.p1Count, (value) => updateRecordField(state, "usability", record.id, "p1Count", value), root),
        createNumberField("采纳数量", record.adoptedCount, (value) => updateRecordField(state, "usability", record.id, "adoptedCount", value), root),
        createNumberField("采纳率（整数）", record.adoptionRate, (value) => updateRecordField(state, "usability", record.id, "adoptionRate", value), root),
      ),
    ]),
  );

  shell.append(
    createSectionBlock("内容与来源", [
      createTextareaField(
        "一句话摘要",
        record.description,
        "这一段会出现在测试卡片摘要里。",
        (value) => updateRecordField(state, "usability", record.id, "description", value),
        root,
      ),
      createTextareaField(
        "典型问题（每行一条）",
        record.issues.join("\n"),
        "建议一行一个问题，页面会取前 3 条展示。",
        (value) =>
          updateRecordField(
            state,
            "usability",
            record.id,
            "issues",
            splitLines(value),
          ),
        root,
      ),
      createTextareaField(
        "标签（每行一条，或用英文逗号分隔）",
        record.tags.join("\n"),
        "这些标签会显示在测试卡片底部。",
        (value) =>
          updateRecordField(
            state,
            "usability",
            record.id,
            "tags",
            splitLinesOrCommas(value),
          ),
        root,
      ),
      createFieldGrid(
        createTextField("原文档链接", record.sourceLink, (value) => updateRecordField(state, "usability", record.id, "sourceLink", value), root),
        createTextField("访问密码", record.sourcePassword, (value) => updateRecordField(state, "usability", record.id, "sourcePassword", value), root),
      ),
    ]),
  );

  shell.append(createValidationSection(validateUsabilityRecord(record), "usability"));
  shell.append(createPreviewSection("看板预览", createUsabilityPreview(record)));

  return shell;
}

function createInsightEditor(record, state, root) {
  const shell = createElement("div", { className: "editor-panel" }, [
    createElement("div", { className: "editor-panel-head" }, [
      createElement("div", {}, [
        createElement("p", { className: "editor-muted", text: "研究结论卡片" }),
        createElement("h2", { text: record.title || "未命名洞察" }),
      ]),
      createElement("div", { className: "editor-badge-group" }, [
        createElement("span", { className: "editor-badge", text: record.domain || "用户洞察" }),
        createElement("span", {
          className: `editor-badge ${record.featured ? "editor-badge-soft" : ""}`,
          text: record.featured ? "公开展示" : "暂不展示",
        }),
      ]),
    ]),
  ]);

  shell.append(
    createSectionBlock("基础信息", [
      createFieldGrid(
        createTextField("记录 ID", record.id, (value) => updateRecordField(state, "insights", record.id, "id", value), root),
        createTextField("所属用研领域", record.domain, (value) => updateRecordField(state, "insights", record.id, "domain", value), root),
        createDateField("报告时间", record.date, (value) => updateRecordField(state, "insights", record.id, "date", value), root),
        createToggleField("是否公开展示", record.featured, (value) => updateRecordField(state, "insights", record.id, "featured", value), root),
      ),
      createFieldGrid(
        createTextField("洞察标题", record.title, (value) => updateRecordField(state, "insights", record.id, "title", value), root),
        createTextField("来源报告名称", record.sourceReport, (value) => updateRecordField(state, "insights", record.id, "sourceReport", value), root),
        createMonthField("历史月份（兼容旧数据）", record.month, (value) => {
          updateRecordField(state, "insights", record.id, "month", value);
        }, root),
      ),
    ]),
  );

  shell.append(
    createSectionBlock("摘要与资源", [
      createTextareaField(
        "洞察摘要（支持 Markdown）",
        record.summary,
        "支持段落、列表和加粗。卡片中会限高显示，但可滚动查看完整内容。",
        (value) => updateRecordField(state, "insights", record.id, "summary", value),
        root,
        "editor-textarea editor-textarea-tall",
      ),
      createTextareaField(
        "细分筛选标签（每行一条，或用英文逗号分隔）",
        record.categoryTags.join("\n"),
        "这些标签会作为页面顶部筛选项，例如 AI、生产力、NPS报告。",
        (value) =>
          updateRecordField(
            state,
            "insights",
            record.id,
            "categoryTags",
            splitLinesOrCommas(value),
          ),
        root,
      ),
      createTextareaField(
        "标签（每行一条，或用英文逗号分隔）",
        record.tags.join("\n"),
        "这些标签会显示在洞察卡标题下方。",
        (value) =>
          updateRecordField(
            state,
            "insights",
            record.id,
            "tags",
            splitLinesOrCommas(value),
          ),
        root,
      ),
      createTextareaField(
        "图片路径（每行一条）",
        record.images.join("\n"),
        "支持 1 张或 2 张图，建议继续使用 ./assets/xxx.svg 这种相对路径。",
        (value) =>
          updateRecordField(
            state,
            "insights",
            record.id,
            "images",
            splitLines(value),
          ),
        root,
      ),
      createFieldGrid(
        createTextField("原文档链接", record.sourceLink, (value) => updateRecordField(state, "insights", record.id, "sourceLink", value), root),
        createTextField("访问密码", record.sourcePassword, (value) => updateRecordField(state, "insights", record.id, "sourcePassword", value), root),
      ),
    ]),
  );

  shell.append(createValidationSection(validateInsightRecord(record), "insights"));
  shell.append(createPreviewSection("看板预览", createInsightPreview(record)));

  return shell;
}

function createSectionBlock(title, children) {
  return createElement("section", { className: "editor-section-block" }, [
    createElement("div", { className: "editor-section-head" }, [
      createElement("h3", { text: title }),
    ]),
    ...children,
  ]);
}

function createPreviewSection(title, previewNode) {
  return createSectionBlock(title, [
    createElement("div", { className: "editor-preview-shell" }, [previewNode]),
  ]);
}

function createValidationSection(validation, type) {
  const items = [
    ...validation.errors.map((text) => ({ level: "error", text })),
    ...validation.warnings.map((text) => ({ level: "warning", text })),
    ...validation.tips.map((text) => ({ level: "tip", text })),
  ];

  if (!items.length) {
    items.push({
      level: "ok",
      text: type === "usability" ? "当前测试记录字段完整，可直接导出。" : "当前洞察卡字段完整，可直接导出。",
    });
  }

  return createSectionBlock("录入提醒", [
    createElement(
      "ul",
      { className: "editor-check-list" },
      items.map((item) =>
        createElement("li", { className: `editor-check-item is-${item.level}` }, [
          createElement("span", { className: "editor-check-dot" }),
          createElement("span", { text: item.text }),
        ]),
      ),
    ),
  ]);
}

function createUsabilityPreview(record) {
  const issues = Array.isArray(record.issues) ? record.issues.slice(0, 3) : [];
  const tags = Array.isArray(record.tags) ? record.tags.slice(0, 6) : [];

  return createElement("article", { className: "editor-preview-card" }, [
    createElement("div", { className: "editor-preview-head" }, [
      createElement("div", { className: "editor-preview-main" }, [
        createElement("h4", {
          className: "editor-preview-title",
          text: record.testName || "测试名称将在这里显示",
        }),
        createElement("p", {
          className: "editor-preview-meta",
          text: [
            record.testDate || "未填写日期",
            record.version || "其他",
            record.projectName || "未填写项目名",
          ]
            .filter(Boolean)
            .join(" · "),
        }),
      ]),
      createElement("span", {
        className: "editor-preview-pill",
        text: `采纳率 ${Number(record.adoptionRate || 0)}%`,
      }),
    ]),
    createElement("p", {
      className: "editor-preview-summary",
      text: record.description || "一句话摘要会显示在这里。",
    }),
    createElement("div", { className: "editor-preview-subtitle", text: "典型问题" }),
    createElement(
      "div",
      { className: "editor-preview-issue-list" },
      (issues.length ? issues : ["这里会展示前 3 条典型问题"]).map((issue, index) =>
        createElement("div", { className: "editor-preview-issue-item" }, [
          createElement("span", {
            className: "editor-preview-index",
            text: `0${index + 1}`,
          }),
          createElement("p", { text: issue }),
        ]),
      ),
    ),
    tags.length
      ? createElement(
          "div",
          { className: "editor-preview-tag-row" },
          tags.map((tag) => createElement("span", { className: "editor-preview-tag", text: tag })),
        )
      : null,
    createElement("div", { className: "editor-preview-action-row" }, [
      createElement("span", { className: "editor-preview-button" }, ["点击跳转原链接"]),
      createElement("span", { className: "editor-preview-button editor-preview-button-secondary" }, [
        `密码：${record.sourcePassword || "XXXXXX"}`,
      ]),
    ]),
  ]);
}

function createInsightPreview(record) {
  const categoryTags = Array.isArray(record.categoryTags) ? record.categoryTags.slice(0, 6) : [];
  const tags = Array.isArray(record.tags) ? record.tags.slice(0, 6) : [];
  const images = Array.isArray(record.images) ? record.images.slice(0, 2) : [];

  return createElement("article", { className: "editor-preview-card editor-preview-card-insight" }, [
    createElement("div", { className: "editor-preview-head editor-preview-head-stack" }, [
      createElement("p", {
        className: "editor-preview-meta",
        text: [
          record.domain ? `领域：${record.domain}` : "领域：未填写",
          record.sourceReport ? `来源：${record.sourceReport}` : "来源：未填写",
          record.date ? `时间：${record.date}` : "时间：未填写",
        ].join("   "),
      }),
      createElement("h4", {
        className: "editor-preview-title",
        text: record.title || "洞察标题将在这里显示",
      }),
    ]),
    categoryTags.length
      ? createElement(
          "div",
          { className: "editor-preview-tag-row" },
          categoryTags.map((tag) =>
            createElement("span", { className: "editor-preview-tag", text: `筛选：${tag}` }),
          ),
        )
      : null,
    tags.length
      ? createElement(
          "div",
          { className: "editor-preview-tag-row" },
          tags.map((tag) => createElement("span", { className: "editor-preview-tag", text: tag })),
        )
      : null,
    createElement("div", { className: "editor-preview-scroll" }, [
      createElement("p", {
        className: "editor-preview-summary editor-preview-summary-rich",
        text: record.summary || "摘要预览会显示在这里。",
      }),
    ]),
    createElement(
      "div",
      {
        className: `editor-preview-image-row${images.length === 1 ? " is-single" : ""}`,
      },
      (images.length ? images : ["图片占位"]).map((image) =>
        createElement("div", { className: "editor-preview-image-card" }, [
          String(image).startsWith("./") || String(image).startsWith("http")
            ? createElement("img", {
                className: "editor-preview-image",
                attrs: {
                  src: image,
                  alt: "图片预览",
                  loading: "lazy",
                },
              })
            : createElement("span", {
                className: "editor-preview-image-fallback",
                text: image,
              }),
        ]),
      ),
    ),
    createElement("div", { className: "editor-preview-action-row editor-preview-action-row-compact" }, [
      createElement("span", { className: "editor-preview-button editor-preview-button-compact" }, ["点击跳转原链接"]),
      createElement("span", { className: "editor-preview-button editor-preview-button-secondary editor-preview-button-compact" }, [
        `密码：${record.sourcePassword || "XXXXXX"}`,
      ]),
    ]),
  ]);
}

function createFieldGrid(...fields) {
  return createElement("div", { className: "editor-field-grid" }, fields);
}

function createTextField(label, value, onCommit, root) {
  return createInputShell(label, buildInputControl("text", value, onCommit, root));
}

function createDateField(label, value, onCommit, root) {
  return createInputShell(label, buildInputControl("date", value, onCommit, root));
}

function createMonthField(label, value, onCommit, root) {
  return createInputShell(label, buildInputControl("month", value, onCommit, root));
}

function createNumberField(label, value, onCommit, root) {
  return createInputShell(label, buildInputControl("number", value, onCommit, root));
}

function createToggleField(label, value, onCommit, root) {
  const input = createElement("input", {
    className: "editor-checkbox",
    attrs: { type: "checkbox" },
  });
  input.checked = Boolean(value);
  bindControl(input, () => input.checked, onCommit, root, true);
  return createInputShell(label, createElement("label", { className: "editor-checkbox-row" }, [
    input,
    createElement("span", { text: value ? "公开展示" : "暂不展示" }),
  ]));
}

function createTextareaField(label, value, hint, onCommit, root, className = "editor-textarea") {
  const textarea = createElement("textarea", {
    className,
    attrs: { rows: "5" },
  });
  textarea.value = value;
  bindControl(textarea, () => textarea.value, onCommit, root, true);

  return createInputShell(label, createElement("div", {}, [
    textarea,
    hint ? createElement("p", { className: "editor-field-hint", text: hint }) : null,
  ]));
}

function buildInputControl(type, value, onCommit, root) {
  const input = createElement("input", {
    className: "editor-input",
    attrs: { type },
  });
  input.value = value ?? "";
  bindControl(
    input,
    () => (type === "number" ? toNumber(input.value) : input.value),
    onCommit,
    root,
    true,
  );
  return input;
}

function createInputShell(label, control) {
  return createElement("label", { className: "editor-field" }, [
    createElement("span", { className: "editor-field-label", text: label }),
    control,
  ]);
}

function bindControl(control, readValue, onCommit, root, rerenderOnChange = false) {
  control.addEventListener("input", () => {
    onCommit(readValue());
    persistDraftSnapshot();
  });

  control.addEventListener("change", () => {
    onCommit(readValue());
    persistDraftSnapshot();
    if (rerenderOnChange) {
      const currentState = root.__editorState;
      currentState.notice = {
        type: "success",
        text: "已自动保存到浏览器草稿。",
      };
      renderEditor(root, currentState);
    }
  });
}

function persistDraftSnapshot() {
  const root = document.querySelector("#app");
  const state = root?.__editorState;
  if (state) {
    persistDraft(state.data);
  }
}

function updateRecordField(state, tab, recordId, field, value) {
  const nextValue = Array.isArray(value) ? [...value] : value;

  state.data[tab] = state.data[tab].map((record) => {
    if (record.id !== recordId) {
      return record;
    }

    const nextRecord = {
      ...record,
      [field]: nextValue,
    };

    if (field === "id" && state.activeIds[tab] === recordId) {
      state.activeIds[tab] = String(nextValue);
    }

    return nextRecord;
  });
}

function getVisibleRecords(state, tab) {
  const records = state.data[tab];
  const activeFilter = state.filters[tab];

  const filtered =
    activeFilter === "ALL"
      ? records
      : records.filter((record) =>
          tab === "usability"
            ? normalizeMonth(record.testDate) === activeFilter
            : record.month === activeFilter,
        );

  return [...filtered].sort((left, right) => {
    const leftDate = tab === "usability" ? left.testDate : left.date;
    const rightDate = tab === "usability" ? right.testDate : right.date;
    return String(rightDate).localeCompare(String(leftDate));
  });
}

function getActiveRecord(state, tab) {
  const records = state.data[tab];
  return records.find((record) => record.id === state.activeIds[tab]) || null;
}

function ensureSelection(state, tab) {
  const visible = getVisibleRecords(state, tab);
  if (visible.length && !visible.some((record) => record.id === state.activeIds[tab])) {
    state.activeIds[tab] = visible[0].id;
  }
  if (!visible.length) {
    state.activeIds[tab] = state.data[tab][0]?.id || null;
  }
}

function addRecord(state, tab) {
  const monthSeed = state.filters[tab] === "ALL" ? getTodayDate().slice(0, 7) : state.filters[tab];

  if (tab === "usability") {
    const next = createDefaultUsabilityRecord(monthSeed, state.data.usability.length);
    state.data.usability = [next, ...state.data.usability];
    state.activeIds.usability = next.id;
    state.filters.usability = normalizeMonth(next.testDate);
    return;
  }

  const next = createDefaultInsightRecord(monthSeed, state.data.insights.length);
  state.data.insights = [next, ...state.data.insights];
  state.activeIds.insights = next.id;
  state.filters.insights = next.month;
}

function duplicateRecord(state, tab, recordId) {
  const source = state.data[tab].find((item) => item.id === recordId);
  if (!source) {
    return;
  }

  const duplicate =
    tab === "usability"
      ? {
          ...source,
          id: `${source.id}-copy`,
          issues: [...source.issues],
          tags: [...source.tags],
        }
      : {
          ...source,
          id: `${source.id}-copy`,
          categoryTags: [...source.categoryTags],
          tags: [...source.tags],
          images: [...source.images],
        };

  state.data[tab] = [duplicate, ...state.data[tab]];
  state.activeIds[tab] = duplicate.id;
}

function deleteRecord(state, tab, recordId) {
  state.data[tab] = state.data[tab].filter((item) => item.id !== recordId);
  ensureSelection(state, tab);
}

function createDefaultUsabilityRecord(month, index) {
  return {
    id: createUsabilityId(month, index),
    testName: "",
    testDate: `${month}-01`,
    version: "其他",
    chartLabel: "",
    issueCount: 0,
    p0Count: 0,
    p1Count: 0,
    adoptedCount: 0,
    adoptionRate: 0,
    description: "",
    sourceLink: "",
    sourcePassword: "",
    issues: [],
    projectName: "",
    tags: [],
  };
}

function createDefaultInsightRecord(month, index) {
  return {
    id: createInsightId(month, index),
    month,
    featured: true,
    domain: "用户洞察",
    categoryTags: [],
    title: "",
    summary: "",
    sourceReport: "",
    date: `${month}-01`,
    tags: [],
    images: [],
    sourceLink: "",
    sourcePassword: "",
  };
}

function createUsabilityId(month, index) {
  return `UT-${String(month)}-${String(index + 1).padStart(2, "0")}`;
}

function createInsightId(month, index) {
  return `IN-${String(month)}-${String(index + 1).padStart(2, "0")}`;
}

function splitLines(text) {
  return String(text)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLinesOrCommas(text) {
  return String(text)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateUsabilityRecord(record) {
  const errors = [];
  const warnings = [];
  const tips = [];

  if (!String(record.testName || "").trim()) {
    errors.push("测试名称不能为空。");
  }
  if (!String(record.testDate || "").trim()) {
    errors.push("测试日期不能为空。");
  }
  if (!String(record.description || "").trim()) {
    warnings.push("一句话摘要还没填写，列表卡片会显得信息不足。");
  }
  if (!record.issues.length) {
    warnings.push("还没有填写典型问题。");
  }
  if (record.issues.length > 3) {
    warnings.push(`当前录入了 ${record.issues.length} 条典型问题，看板只展示前 3 条。`);
  }
  if (!record.sourceLink.trim()) {
    warnings.push("原文档链接为空，公开看板里“点击跳转原链接”会不可用。");
  }
  if (!record.sourcePassword.trim()) {
    tips.push("访问密码为空时，密码按钮会显示默认占位。");
  }
  if (Number(record.adoptionRate) > 100) {
    warnings.push("采纳率大于 100%，建议检查是否填错。");
  }

  return { errors, warnings, tips };
}

function validateInsightRecord(record) {
  const errors = [];
  const warnings = [];
  const tips = [];

  if (!String(record.month || "").trim()) {
    warnings.push("历史月份为空不会影响公开看板，但建议保留方便兼容旧数据。");
  }
  if (!String(record.domain || "").trim()) {
    errors.push("所属用研领域不能为空。");
  }
  if (!String(record.title || "").trim()) {
    errors.push("洞察标题不能为空。");
  }
  if (!String(record.summary || "").trim()) {
    errors.push("洞察摘要不能为空。");
  }
  if (!String(record.sourceReport || "").trim()) {
    warnings.push("来源报告名称为空，卡片头部会缺少来源信息。");
  }
  if (!String(record.date || "").trim()) {
    warnings.push("报告时间为空，卡片头部会缺少日期。");
  }
  if (!record.categoryTags.length) {
    warnings.push("细分筛选标签为空时，这条内容只会出现在“总体”下。");
  }
  if (!record.featured) {
    tips.push("当前卡片暂不公开展示，公开看板中不会显示。");
  }
  if (record.images.length > 2) {
    warnings.push(`当前录入了 ${record.images.length} 张图片，页面预览和正式看板都只建议保留前 2 张。`);
  }
  if (!record.sourceLink.trim()) {
    warnings.push("原文档链接为空，卡片底部跳转按钮会不可用。");
  }
  if (!record.sourcePassword.trim()) {
    tips.push("访问密码为空时，密码按钮会显示默认占位。");
  }

  return { errors, warnings, tips };
}

function validateDatasetForExport(tab, records) {
  const checker = tab === "usability" ? validateUsabilityRecord : validateInsightRecord;
  const issues = records.flatMap((record) => {
    const validation = checker(record);
    const title =
      tab === "usability"
        ? record.testName || record.id || "未命名测试"
        : record.title || record.id || "未命名洞察";

    return [
      ...validation.errors.map((text) => ({ level: "error", text: `${title}：${text}` })),
      ...validation.warnings.map((text) => ({ level: "warning", text: `${title}：${text}` })),
    ];
  });

  return {
    errors: issues.filter((item) => item.level === "error"),
    warnings: issues.filter((item) => item.level === "warning"),
  };
}

function persistDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function downloadJson(fileName, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
}

function toInsightExportRecord(record) {
  return {
    id: record.id,
    month: record.month,
    featured: record.featured,
    domain: record.domain,
    categoryTags: record.categoryTags,
    title: record.title,
    summary: record.summary,
    sourceReport: record.sourceReport,
    date: record.date,
    tags: record.tags,
    images: record.images,
    sourceLink: record.sourceLink,
    sourcePassword: record.sourcePassword,
  };
}
