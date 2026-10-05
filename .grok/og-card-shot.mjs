import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const html = pathToFileURL(resolve("/workspace/.grok/og-card.html")).href;
const out = "/workspace/.grok/og-card-raw.png";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto(html, { waitUntil: "load", timeout: 30000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const img = document.querySelector("img.bg");
    if (img && !img.complete) {
      await new Promise((resolve, reject) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", reject, { once: true });
      });
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, type: "png", omitBackground: false });
  console.log(JSON.stringify({ ok: true, html, out }));
} finally {
  await browser.close();
}
