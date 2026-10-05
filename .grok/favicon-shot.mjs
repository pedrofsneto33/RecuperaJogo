import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const svg = pathToFileURL(resolve("/workspace/.grok/favicon.svg")).href;
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  for (const size of [16, 32, 64]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<html><body style="margin:0;background:#ddd">
         <img src="${svg}" width="${size}" height="${size}" style="display:block"/>
       </body></html>`,
      { waitUntil: "load" },
    );
    await page.screenshot({
      path: `/workspace/.grok/favicon-${size}.png`,
      type: "png",
    });
    await page.close();
  }
  console.log("ok");
} finally {
  await browser.close();
}
