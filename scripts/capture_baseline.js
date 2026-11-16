const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASELINE_DIR = path.join(__dirname, "baseline_screenshots");

(async () => {
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // --- 1440px DESKTOP ---
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1440, height: 900 });
  await pageDesktop.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  console.log("Capturing 1440px sections...");

  // Act 0 Hero
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act0_hero.png") });

  // Scroll to Act 1 Manifesto
  await pageDesktop.evaluate(() => {
    const el = document.getElementById("act-story");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act1_manifesto.png") });

  // Scroll to Act 3 Steps
  await pageDesktop.evaluate(() => {
    const el = document.getElementById("act-method");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act3_steps.png") });

  // Scroll to Act 4 Gallery
  await pageDesktop.evaluate(() => {
    const el = document.getElementById("act-archive");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act4_gallery.png") });

  // Scroll to Act 5 Simulator
  await pageDesktop.evaluate(() => {
    const el = document.getElementById("seal-lock");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act5_simulator.png") });

  // Scroll to Footer
  await pageDesktop.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight });
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageDesktop.screenshot({ path: path.join(BASELINE_DIR, "1440_act6_footer.png") });

  // --- 375px MOBILE ---
  console.log("Capturing 375px mobile sections...");
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 375, height: 812 });
  await pageMobile.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  await pageMobile.screenshot({ path: path.join(BASELINE_DIR, "375_act0_hero.png") });

  await pageMobile.evaluate(() => {
    const el = document.getElementById("act-method");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageMobile.screenshot({ path: path.join(BASELINE_DIR, "375_act3_steps.png") });

  await pageMobile.evaluate(() => {
    const el = document.getElementById("seal-lock");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageMobile.screenshot({ path: path.join(BASELINE_DIR, "375_act5_simulator.png") });

  await pageMobile.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight });
  });
  await new Promise((r) => setTimeout(r, 1000));
  await pageMobile.screenshot({ path: path.join(BASELINE_DIR, "375_act6_footer.png") });

  await browser.close();
  console.log("All baseline reference screenshots saved successfully.");
})();

