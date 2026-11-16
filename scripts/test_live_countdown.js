const puppeteer = require('puppeteer-core');
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log('[Live Countdown Test] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Press 'D' to seed demo data
    await page.keyboard.press('d');
    await new Promise(r => setTimeout(r, 1000));

    // Scroll to #seal-lock
    await page.evaluate(() => {
      const el = document.getElementById('seal-lock');
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click on VAULT REGISTRY
    await page.evaluate(() => {
      const registryBtn = document.querySelector('button[data-tab="vault"]');
      if (registryBtn) registryBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click "Inspect" on the 20s live unseal capsule
    console.log('[Live Countdown Test] Opening 20s Live Unseal capsule in modal...');
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('h4'));
      const card20s = rows.find(h => h.innerText.includes('Temporal Pulse (20s Live Unseal)'));
      if (card20s) {
        const parent = card20s.closest('div.rounded-2xl');
        const inspectBtn = parent.querySelector('button');
        if (inspectBtn) inspectBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify it is currently TIME-LOCKED
    const initialStatus = await page.evaluate(() => {
      return document.body.innerText.includes('TIME-LOCKED');
    });
    console.log(`   Initial status is TIME-LOCKED: ${initialStatus}`);
    if (!initialStatus) throw new Error('Expected capsule to be TIME-LOCKED initially');

    // Wait until 20 seconds elapse and observe autonomous unlock
    console.log('   Waiting for countdown to reach 0...');
    let flipped = false;
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const hasUnlocked = await page.evaluate(() => {
        return document.body.innerText.includes('UNLOCKED') && document.body.innerText.includes('UNSEALED TESTAMENT (DECRYPTED)');
      });
      if (hasUnlocked) {
        flipped = true;
        console.log(`   SUCCESS: Flipped to UNLOCKED live at second ${i + 1}!`);
        break;
      }
    }

    if (!flipped) {
      throw new Error('Countdown did not automatically flip to UNLOCKED without refresh');
    }

    // Verify decrypted text is rendered automatically
    const decryptedText = await page.evaluate(() => {
      return document.querySelector('.whitespace-pre-wrap')?.innerText;
    });
    console.log(`   Auto-decrypted content: "${decryptedText}"`);
    if (!decryptedText || !decryptedText.includes('The lock has dissolved!')) {
      throw new Error('Decrypted content missing after live unlock');
    }

    console.log('[Live Countdown Test] PASS: Live countdown and auto-unseal works flawlessly without page reload!');
  } catch (err) {
    console.error('[Live Countdown Test] FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

