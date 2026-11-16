const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, "current_screenshots");

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1440px Desktop
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1440, height: 900 });
  await pageDesktop.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  console.log("Capturing 1440px current screenshots...");
  await pageDesktop.screenshot({ path: path.join(OUTPUT_DIR, "1440_act0_hero.png") });

  await pageDesktop.evaluate(() => {
    const el = document.getElementById("act-story");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(OUTPUT_DIR, "1440_act1_manifesto.png") });

  await pageDesktop.evaluate(() => {
    const el = document.getElementById("act-method");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(OUTPUT_DIR, "1440_act3_steps.png") });

  await pageDesktop.evaluate(() => {
    const el = document.getElementById("seal-lock");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(OUTPUT_DIR, "1440_act5_simulator.png") });

  await pageDesktop.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(OUTPUT_DIR, "1440_act6_footer.png") });

  // 375px Mobile
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 375, height: 812, isMobile: true });
  await pageMobile.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  console.log("Capturing 375px current screenshots...");
  await pageMobile.screenshot({ path: path.join(OUTPUT_DIR, "375_act0_hero.png") });

  await pageMobile.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageMobile.screenshot({ path: path.join(OUTPUT_DIR, "375_act6_footer.png") });

  await browser.close();
  console.log("Screenshots captured successfully!");
})();

