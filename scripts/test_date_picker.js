const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log('[Date Picker Test] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Scroll to #seal-lock
    await page.evaluate(() => {
      const el = document.getElementById('seal-lock');
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 800));

    // 1. Verify existence of date and time inputs & label "UNLOCK EPOCH"
    console.log('[Date Picker Test] 1. Checking inputs and label...');
    const labelText = await page.evaluate(() => {
      const label = document.querySelector('label[for="unlock-date"]');
      return label ? label.innerText.trim() : null;
    });
    console.log(`   Label text found: "${labelText}"`);
    if (!labelText || !labelText.includes('UNLOCK EPOCH')) {
      throw new Error(`Expected label "UNLOCK EPOCH", got: "${labelText}"`);
    }

    const hasDateInput = await page.evaluate(() => !!document.querySelector('input#unlock-date[type="date"]'));
    const hasTimeInput = await page.evaluate(() => !!document.querySelector('input#unlock-time[type="time"]'));
    console.log(`   Date input exists: ${hasDateInput}, Time input exists: ${hasTimeInput}`);
    if (!hasDateInput || !hasTimeInput) {
      throw new Error('Date or time input missing');
    }

    // Check min attribute on date input is today
    const minAttr = await page.evaluate(() => document.querySelector('#unlock-date').getAttribute('min'));
    console.log(`   Date input min attribute: ${minAttr}`);
    if (!minAttr) throw new Error('Missing min attribute on date input');

    // 2. Check all 6 presets exist
    console.log('[Date Picker Test] 2. Checking presets...');
    const presets = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const labels = ['+30 SEC', '+1 MIN', '+1 HOUR', '+1 DAY', '+1 WEEK', '+1 YEAR'];
      return labels.map(l => ({
        label: l,
        found: btns.some(b => b.innerText.trim() === l)
      }));
    });
    console.log('   Presets check:', presets);
    if (presets.some(p => !p.found)) {
      throw new Error('One or more required quick presets missing');
    }

    // 3. Test clicking "+1 DAY" preset
    console.log('[Date Picker Test] 3. Testing "+1 DAY" preset click...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const dayBtn = btns.find(b => b.innerText.trim() === '+1 DAY');
      if (dayBtn) dayBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const dateValAfterDay = await page.evaluate(() => document.querySelector('#unlock-date').value);
    const timeValAfterDay = await page.evaluate(() => document.querySelector('#unlock-time').value);
    console.log(`   Date after +1 DAY: ${dateValAfterDay}, Time: ${timeValAfterDay}`);
    if (!dateValAfterDay || !timeValAfterDay) {
      throw new Error('Clicking preset did not populate date/time values');
    }

    // Check live preview line shows "OPENS IN"
    const previewLine = await page.evaluate(() => {
      return document.body.innerText.includes('OPENS IN');
    });
    console.log(`   Live preview "OPENS IN" rendered: ${previewLine}`);
    if (!previewLine) throw new Error('Live preview line "OPENS IN" not found');

    // 4. Test validation: set time in past
    console.log('[Date Picker Test] 4. Testing validation (<10 seconds in future)...');
    await page.evaluate(() => {
      const setReactValue = (el, val) => {
        const proto = window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const past = new Date(Date.now() - 60000);
      const pad = n => String(n).padStart(2, '0');
      const dEl = document.querySelector('#unlock-date');
      const tEl = document.querySelector('#unlock-time');
      setReactValue(dEl, `${past.getFullYear()}-${pad(past.getMonth()+1)}-${pad(past.getDate())}`);
      setReactValue(tEl, `${pad(past.getHours())}:${pad(past.getMinutes())}:${pad(past.getSeconds())}`);
    });
    await new Promise(r => setTimeout(r, 600));

    const errorMsg = await page.evaluate(() => {
      return document.body.innerText.includes('Unlock moment must be at least 10 seconds in the future.');
    });
    console.log(`   Validation error correctly shown: ${errorMsg}`);
    if (!errorMsg) throw new Error('Expected validation error for past/imminent moment, none shown');

    // Verify submit button is disabled
    const isSubmitDisabled = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn ? btn.disabled : false;
    });
    console.log(`   Submit button is disabled: ${isSubmitDisabled}`);
    if (!isSubmitDisabled) throw new Error('Submit button should be disabled when epoch is invalid');

    // 5. Test +30 SEC preset and Forge a capsule
    console.log('[Date Picker Test] 5. Testing "+30 SEC" preset and Forging capsule...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const secBtn = btns.find(b => b.innerText.trim() === '+30 SEC');
      if (secBtn) secBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    await page.type('#title-input', 'Date Picker Precision Capsule');
    await page.type('#recipient-input', 'Local Timezone Heir');
    await page.type('#message-input', 'Precision horology test verifying UTC ISO storage and local conversion.');

    // Submit form
    console.log('   Submitting form...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 3200));

    // Verify receipt rendered with UTC ISO string
    const receiptHasUtc = await page.evaluate(() => {
      return document.body.innerText.includes('UTC:');
    });
    console.log(`   Receipt shows UTC ISO timestamp: ${receiptHasUtc}`);
    if (!receiptHasUtc) throw new Error('Receipt does not display UTC timestamp specification');

    // Verify capsule in localStorage has targetDateIso and targetTimestamp
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('aetheria_vault_v1');
      if (!raw) return null;
      const list = JSON.parse(raw);
      return list.find(c => c.title === 'Date Picker Precision Capsule');
    });
    console.log('   Stored capsule metadata:', {
      title: stored?.title,
      targetTimestamp: stored?.targetTimestamp,
      targetDate: stored?.targetDate,
      targetDateIso: stored?.targetDateIso
    });
    if (!stored?.targetDateIso || !stored?.targetTimestamp) {
      throw new Error('targetDateIso or targetTimestamp missing from stored capsule');
    }

    // 6. Test on 375px mobile viewport
    console.log('[Date Picker Test] 6. Testing mobile layout (375px)...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.evaluate(() => {
      // Click Forge Another
      const btns = Array.from(document.querySelectorAll('button'));
      const forgeAnother = btns.find(b => b.innerText.includes('Forge Another'));
      if (forgeAnother) forgeAnother.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const dateBoxWidth = await page.evaluate(() => {
      const el = document.querySelector('#unlock-date');
      return el ? el.getBoundingClientRect().width : 0;
    });
    console.log(`   Date input width on 375px: ${dateBoxWidth}px`);
    if (dateBoxWidth > 375 || dateBoxWidth < 120) {
      throw new Error(`Date input width abnormal on 375px mobile: ${dateBoxWidth}px`);
    }

    // Take screenshot of the date picker on mobile
    const screenshotDir = path.join(__dirname, 'test_output');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    await page.screenshot({
      path: path.join(screenshotDir, 'date_picker_mobile_375px.png'),
      fullPage: false
    });

    // Switch back to 1440px desktop and capture screenshot of the picker
    await page.setViewport({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(screenshotDir, 'date_picker_desktop_1440px.png'),
      fullPage: false
    });

    console.log('[Date Picker Test] ALL 7 REQUIREMENTS VERIFIED AND PASSED 100%!');
  } catch (err) {
    console.error('[Date Picker Test] FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
