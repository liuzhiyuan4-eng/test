import { createElement } from "../utils/dom.js";
import { formatDateLabel, getUsabilityVersion } from "../utils/data.js";

export function createTestList({ tests, title = "测试结果", copy = "按测试时间倒序展示" }) {
  const card = createElement("section", { className: "list-card" }, [
    createElement("div", { className: "subsection-head" }, [
      createElement("h3", {
        className: "subsection-title",
        text: title,
      }),
      createElement("p", {
        className: "subsection-copy",
        text: copy,
      }),
    ]),
  ]);

  if (!tests.length) {
    card.append(
      createElement("div", { className: "empty-card" }, [
        createElement("p", { text: "当前分类暂无可用性测试记录。" }),
      ]),
    );
    return card;
  }

  const list = createElement("div", { className: "test-list" });

  tests.forEach((test) => {
    const meta = [
      formatDateLabel(test.testDate),
      `版本：${getUsabilityVersion(test)}`,
      test.projectName || "未分配项目",
    ];

    const tags = Array.isArray(test.tags) ? test.tags : [];
    const issues = Array.isArray(test.issues)
      ? test.issues.slice(0, 3)
      : test.description
        ? [test.description]
        : [];
    const sourceLink = test.sourceLink || "";
    const sourcePassword = test.sourcePassword || "XXXXX";

    const item = createElement("article", { className: "test-item" }, [
      createElement("div", { className: "test-item-top" }, [
        createElement("div", {}, [
          createElement("h4", {
            className: "test-name",
            text: test.testName,
          }),
          createElement(
            "div",
            { className: "test-meta" },
            meta.map((entry) => createElement("span", { text: entry })),
          ),
        ]),
        createElement("div", { className: "test-pill-group" }, [
          createElement("span", {
            className: "pill pill-strong",
            text: `采纳率 ${test.adoptionRate}%`,
          }),
        ]),
      ]),
      createElement("p", {
        className: "test-description",
        text: test.description,
      }),
    ]);

    if (issues.length) {
      item.append(
        createElement("div", { className: "issue-block" }, [
          createElement("p", {
            className: "issue-block-title",
            text: "典型问题",
          }),
          createElement(
            "div",
            { className: "issue-grid" },
            issues.map((issue, index) =>
              createElement("div", { className: "issue-card issue-card-vertical" }, [
                createElement("span", {
                  className: "issue-index",
                  text: `0${index + 1}`,
                }),
                createElement("p", {
                  className: "issue-text",
                  text: issue,
                }),
              ]),
            ),
          ),
        ]),
      );
    }

    if (tags.length) {
      item.append(
        createElement(
          "div",
          { className: "tag-row" },
          tags.map((tag) => createElement("span", { className: "tag", text: tag })),
        ),
      );
    }

    const passwordHint = createElement("p", {
      className: "test-action-hint",
      text: "点击复制",
    });

    const passwordButton = createElement("button", {
      className: "test-action-button test-action-button-secondary",
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

    item.append(
      createElement("div", { className: "test-actions" }, [
        createElement("a", {
          className: `test-action-button${sourceLink ? "" : " is-disabled"}`,
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
    );

    list.append(item);
  });

  card.append(list);
  return card;
}
