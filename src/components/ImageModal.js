import { createElement } from "../utils/dom.js";

export function createImageModal({ image, onClose }) {
  return createElement("div", {
    className: "image-modal",
    events: {
      click: onClose,
    },
    children: [
      createElement("div", {
        className: "image-modal-card",
        events: {
          click: (event) => event.stopPropagation(),
        },
        children: [
          createElement("button", {
            className: "image-modal-close",
            text: "×",
            attrs: { type: "button", "aria-label": "关闭图片预览" },
            events: {
              click: onClose,
            },
          }),
          createElement("img", {
            attrs: {
              src: image.src,
              alt: image.alt,
            },
          }),
        ],
      }),
    ],
  });
}
