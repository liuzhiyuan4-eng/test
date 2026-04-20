export function createElement(tag, options = {}, children = []) {
  const {
    className,
    text,
    html,
    attrs = {},
    dataset = {},
    events = {},
  } = options;

  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  if (html !== undefined) {
    element.innerHTML = html;
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = String(value);
  });

  Object.entries(events).forEach(([eventName, handler]) => {
    element.addEventListener(eventName, handler);
  });

  const childList = options.children || children;
  childList.forEach((child) => appendChild(element, child));

  return element;
}

function appendChild(parent, child) {
  if (child === null || child === undefined || child === false) {
    return;
  }

  if (typeof child === "string") {
    parent.append(document.createTextNode(child));
    return;
  }

  parent.append(child);
}
