import { createElement } from "../utils/dom.js";
import { formatMonthBadge } from "../utils/data.js";

export function createMonthTabs({ months, selectedMonth, onChange }) {
  const tabs = createElement("div", { className: "month-tabs" });

  months.forEach((month) => {
    tabs.append(
      createElement("button", {
        className: `month-tab${month === selectedMonth ? " active" : ""}`,
        text: formatMonthBadge(month),
        attrs: { type: "button" },
        events: {
          click: () => onChange(month),
        },
      }),
    );
  });

  return tabs;
}
