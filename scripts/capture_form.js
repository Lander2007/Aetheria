const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Scroll so that the console form is centered
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.scrollIntoView({ block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(__dirname, 'test_output', 'form_date_picker_centered.png'),
    fullPage: false
  });

  await browser.close();
})();
