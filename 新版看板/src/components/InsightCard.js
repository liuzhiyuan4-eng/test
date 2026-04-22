import { createElement } from "../utils/dom.js";
import { formatDateLabel } from "../utils/data.js";
import { renderMarkdown } from "../utils/markdown.js";

export function createInsightCard({ insight, onImageClick }) {
  const sourceLink = insight.sourceLink || insight.link || "";
  const sourcePassword = insight.sourcePassword || "XXXXXX";
  const hasImages = Array.isArray(insight.images) && insight.images.length;

  const card = createElement(
    "article",
    { className: `insight-card ${hasImages ? "has-images" : "no-images"}` },
    [
    createElement("div", { className: "insight-header" }, [
      createElement(
        "div",
        { className: "insight-meta" },
        [
          `来源：${insight.sourceReport}`,
          `时间：${formatDateLabel(insight.date)}`,
        ].map((entry) => createElement("span", { text: entry })),
      ),
      createElement("h3", {
        className: "insight-title",
        text: insight.title,
      }),
    ]),
    ],
  );

  if (Array.isArray(insight.tags) && insight.tags.length) {
    card.append(
      createElement(
        "div",
        { className: "tag-row" },
        insight.tags.map((tag) => createElement("span", { className: "tag", text: tag })),
      ),
    );
  }

  const summary = createElement("div", { className: "summary-block" });
  summary.append(renderMarkdown(insight.summary));
  card.append(summary);

  if (hasImages) {
    const imageGrid = createElement("div", {
      className: `image-grid${insight.images.length === 1 ? " image-grid-single" : ""}`,
    });

    insight.images.forEach((imageSrc, index) => {
      imageGrid.append(
        createElement("button", {
          className: "image-button",
          attrs: { type: "button", "aria-label": `放大查看 ${insight.title} 图片 ${index + 1}` },
          events: {
            click: () =>
              onImageClick({
                src: imageSrc,
                alt: `${insight.title} 图片 ${index + 1}`,
              }),
          },
          children: [
            createElement("img", {
              attrs: {
                src: imageSrc,
                alt: `${insight.title} 图片 ${index + 1}`,
                loading: "lazy",
              },
            }),
          ],
        }),
      );
    });

    card.append(imageGrid);
  }

  const passwordHint = createElement("p", {
    className: "test-action-hint test-action-hint-compact",
    text: "点击复制",
  });

  const passwordButton = createElement("button", {
    className:
      "test-action-button test-action-button-secondary test-action-button-compact",
    text: `密码：${sourcePassword}`,
    attrs: { type: "button" },
    events: {
      click: async () => {
        try {
          await navigator.clipboard.writeText(sourcePassword);
        } catch {
          const helper = document.createElement("textarea");
          helper.value = sourcePassword;
          document.body.append(helper);
          helper.select();
          document.execCommand("copy");
          helper.remove();
        }

        passwordHint.textContent = "复制成功";
        passwordHint.classList.add("is-success");
        window.setTimeout(() => {
          passwordHint.textContent = "点击复制";
          passwordHint.classList.remove("is-success");
        }, 1600);
      },
    },
  });

  card.append(
    createElement("div", { className: "insight-footer" }, [
      createElement("div", { className: "insight-actions" }, [
        createElement("a", {
          className: `test-action-button test-action-button-compact${sourceLink ? "" : " is-disabled"}`,
          text: "点击跳转原链接",
          attrs: {
            href: sourceLink || "#",
            target: "_blank",
            rel: "noreferrer noopener",
            "aria-disabled": sourceLink ? "false" : "true",
          },
          events: sourceLink
            ? {}
            : {
                click: (event) => event.preventDefault(),
              },
        }),
        createElement("div", { className: "test-password-wrap" }, [
          passwordButton,
          passwordHint,
        ]),
      ]),
    ]),
  );

  return card;
}
