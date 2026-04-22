import { createApp } from "./dashboardAppV2.js";

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`读取数据失败: ${path}`);
  }

  return response.json();
}

async function bootstrap() {
  const root = document.querySelector("#app");

  try {
    const [usabilityData, insightData] = await Promise.all([
      loadJson("./data/usability.json"),
      loadJson("./data/insights.json"),
    ]);

    const app = createApp({ usabilityData, insightData });
    root.className = "";
    root.replaceChildren(app);
  } catch (error) {
    root.className = "app-error-shell";
    root.innerHTML = `
      <div class="error-card">
        <h1>页面初始化失败</h1>
        <p>请确认你是通过本地静态服务器或 GitHub Pages 打开当前项目，而不是直接使用 file:// 访问。</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}

bootstrap();
