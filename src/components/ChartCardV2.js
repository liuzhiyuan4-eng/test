import { createElement } from "../utils/dom.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function createSvgNode(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function buildPolyline(points) {
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

export function createChartCard(chartConfig) {
  const card = createElement("article", { className: "chart-card chart-card-line" }, [
    createElement("div", { className: "chart-card-head" }, [
      createElement("h3", {
        className: "chart-card-title",
        text: chartConfig.title,
      }),
      createElement("p", {
        className: "chart-card-note",
        text: chartConfig.note,
      }),
    ]),
  ]);

  const chartWrap = createElement("div", { className: "chart-wrap" });
  const svg = createSvgNode("svg", {
    viewBox: "0 0 420 240",
    class: "chart-svg",
    role: "img",
    "aria-label": chartConfig.ariaLabel,
  });

  const padding = { top: 22, right: 18, bottom: 42, left: 28 };
  const chartWidth = 420 - padding.left - padding.right;
  const chartHeight = 240 - padding.top - padding.bottom;
  const baselineY = padding.top + chartHeight;
  const maxValue = Math.max(
    1,
    ...chartConfig.series.flatMap((series) => series.values.map((value) => Number(value) || 0)),
  );

  [0, 0.25, 0.5, 0.75, 1].forEach((step) => {
    const y = baselineY - chartHeight * step;
    svg.append(
      createSvgNode("line", {
        x1: padding.left,
        y1: y,
        x2: padding.left + chartWidth,
        y2: y,
        stroke: "rgba(22, 33, 28, 0.08)",
        "stroke-width": 1,
      }),
    );
  });

  const pointCount = chartConfig.labels.length;
  const stepX = pointCount > 1 ? chartWidth / (pointCount - 1) : 0;
  const getPointX = (index) =>
    pointCount > 1 ? padding.left + index * stepX : padding.left + chartWidth / 2;

  chartConfig.labels.forEach((label, index) => {
    const x = getPointX(index);

    svg.append(
      createSvgNode("line", {
        x1: x,
        y1: padding.top,
        x2: x,
        y2: baselineY,
        stroke: "rgba(22, 33, 28, 0.04)",
        "stroke-width": 1,
      }),
    );

    const labelText = createSvgNode("text", {
      x,
      y: baselineY + 26,
      "text-anchor": "middle",
      "font-size": 12,
      "font-family": "Avenir Next, PingFang SC, Microsoft YaHei UI, sans-serif",
      fill: "#77847d",
    });
    labelText.textContent = label;
    svg.append(labelText);
  });

  if (chartConfig.type === "stackedBar") {
    const slotWidth = pointCount > 1 ? stepX : chartWidth;
    const barWidth = Math.min(48, slotWidth * 0.46);
    const groupedMax = Math.max(
      1,
      ...chartConfig.labels.map((_, index) =>
        chartConfig.series.reduce(
          (sum, series) => sum + Number(series.values[index] || 0),
          0,
        ),
      ),
    );

    chartConfig.labels.forEach((_, index) => {
      const x = getPointX(index) - barWidth / 2;
      let runningHeight = 0;

      chartConfig.series.forEach((series) => {
        const value = Number(series.values[index] || 0);
        const segmentHeight = (value / groupedMax) * chartHeight;
        const y = baselineY - runningHeight - segmentHeight;

        svg.append(
          createSvgNode("rect", {
            x,
            y,
            width: barWidth,
            height: Math.max(segmentHeight, 0),
            rx: 8,
            fill: series.color,
          }),
        );

        runningHeight += segmentHeight;
      });

      const totalValue = chartConfig.series.reduce(
        (sum, series) => sum + Number(series.values[index] || 0),
        0,
      );

      const valueText = createSvgNode("text", {
        x: x + barWidth / 2,
        y: baselineY - runningHeight - 10,
        "text-anchor": "middle",
        "font-size": 12,
        "font-family": "Avenir Next, PingFang SC, Microsoft YaHei UI, sans-serif",
        fill: "#15211c",
      });
      valueText.textContent = String(totalValue);
      svg.append(valueText);
    });
  } else {
    chartConfig.series.forEach((series) => {
      const points = series.values.map((value, index) => {
        const x = getPointX(index);
        const y = baselineY - ((Number(value) || 0) / maxValue) * chartHeight;
        return { x, y, value };
      });

      svg.append(
        createSvgNode("polyline", {
          points: buildPolyline(points),
          fill: "none",
          stroke: series.color,
          "stroke-width": 3,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      );

      points.forEach((point) => {
        svg.append(
          createSvgNode("circle", {
            cx: point.x,
            cy: point.y,
            r: 4.5,
            fill: "#ffffff",
            stroke: series.color,
            "stroke-width": 2.5,
          }),
        );
      });

      const lastPoint = points[points.length - 1];
      if (lastPoint) {
        const valueText = createSvgNode("text", {
          x: lastPoint.x + 8,
          y: lastPoint.y - 10,
          "font-size": 13,
          "font-family": "Avenir Next, PingFang SC, Microsoft YaHei UI, sans-serif",
          fill: series.color,
        });
        valueText.textContent = String(lastPoint.value);
        svg.append(valueText);
      }
    });
  }

  chartWrap.append(svg);
  card.append(chartWrap);

  const legend = createElement("div", { className: "chart-legend" });
  chartConfig.series.forEach((series) => {
    legend.append(
      createElement("div", { className: "legend-item" }, [
        createElement("span", {
          className: "legend-dot",
          attrs: { style: `background:${series.color}` },
        }),
        createElement("span", {
          text: series.caption ? `${series.label} ${series.caption}` : series.label,
        }),
      ]),
    );
  });

  card.append(legend);
  return card;
}
