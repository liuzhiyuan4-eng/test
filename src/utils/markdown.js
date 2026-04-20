function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderInline(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function renderMarkdown(markdownText = "") {
  const fragment = document.createDocumentFragment();
  const blocks = markdownText
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  blocks.forEach((block) => {
    const lines = block.split("\n").map((line) => line.trim());
    const isList = lines.every((line) => /^[-*]\s+/.test(line));

    if (isList) {
      const list = document.createElement("ul");
      lines.forEach((line) => {
        const item = document.createElement("li");
        item.innerHTML = renderInline(line.replace(/^[-*]\s+/, ""));
        list.append(item);
      });
      fragment.append(list);
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.innerHTML = lines.map(renderInline).join("<br>");
    fragment.append(paragraph);
  });

  return fragment;
}
