const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log('[Acceptance Test] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('[Acceptance Test] Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // 1. Check CurtainFooter "Seal a memory" button text
    console.log('[Acceptance Test] 1. Checking CurtainFooter button text...');
    const footerBtnText = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sealBtn = btns.find(b => b.innerText && b.innerText.toLowerCase().includes('seal a memory'));
      return sealBtn ? sealBtn.innerText.trim() : null;
    });

    console.log(`   Found button text: "${footerBtnText}"`);
    if (!footerBtnText) {
      throw new Error('Seal a memory button not found in footer');
    }
    if (footerBtnText.includes('+')) {
      throw new Error(`FAIL: Button still contains "+" sign: "${footerBtnText}"`);
    }
    console.log('   PASS: "+" has been removed successfully from the button!');

    // 2. Test Pressing 'D' to seed demo data
    console.log('[Acceptance Test] 2. Testing keyboard shortcut "D" to seed demo data...');
    await page.keyboard.press('d');
    await new Promise(r => setTimeout(r, 1500));

    // Verify localStorage has 3 capsules
    const vaultData = await page.evaluate(() => {
      const raw = localStorage.getItem('aetheria_vault_v1');
      return raw ? JSON.parse(raw) : [];
    });
    console.log(`   Vault items count: ${vaultData.length}`);
    if (vaultData.length !== 3) {
      throw new Error(`Expected 3 demo capsules, found: ${vaultData.length}`);
    }
    console.log('   PASS: Demo data loaded into vault correctly!');

    // 3. Scroll to Vault Console (#seal-lock)
    console.log('[Acceptance Test] 3. Inspecting Vault Console (#seal-lock)...');
    await page.evaluate(() => {
      const el = document.getElementById('seal-lock');
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click on "VAULT REGISTRY" tab
    await page.evaluate(() => {
      const registryBtn = document.querySelector('button[data-tab="vault"]');
      if (registryBtn) registryBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 4. Test Passcode Capsule
    console.log('[Acceptance Test] 4. Testing Passcode-protected capsule decryption...');
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('h4'));
      const passcodeCard = rows.find(h => h.innerText.includes("The Custodian's Classified Archive"));
      if (passcodeCard) {
        const parent = passcodeCard.closest('div.rounded-2xl');
        const inspectBtn = parent.querySelector('button');
        if (inspectBtn) inspectBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    // Check if passcode modal opened
    const isModalOpen = await page.evaluate(() => {
      return !!document.querySelector('input[type="password"]');
    });
    if (!isModalOpen) {
      throw new Error('Passcode input not found in modal');
    }

    // Try wrong passcode first
    console.log('   Testing invalid passcode "9999"...');
    await page.type('input[type="password"]', '9999');
    await page.evaluate(() => {
      const unlockBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'UNLOCK');
      if (unlockBtn) unlockBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const errorMsg = await page.evaluate(() => {
      const err = document.querySelector('.text-rose-400');
      return err ? err.innerText : null;
    });
    console.log(`   Error message shown: "${errorMsg}"`);
    if (!errorMsg) {
      throw new Error('Expected error message for invalid passcode, but none found');
    }

    // Now try correct passcode "1234"
    console.log('   Testing correct passcode "1234"...');
    await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      if (inp) inp.value = '';
    });
    await page.type('input[type="password"]', '1234');
    await page.evaluate(() => {
      const unlockBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'UNLOCK');
      if (unlockBtn) unlockBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify decrypted content is displayed
    const decryptedContent = await page.evaluate(() => {
      const p = document.querySelector('.whitespace-pre-wrap');
      return p ? p.innerText : null;
    });
    console.log(`   Decrypted text: "${decryptedContent}"`);
    if (!decryptedContent || !decryptedContent.includes('Classified clearance verified')) {
      throw new Error('Decryption with correct passcode failed or text missing');
    }
    console.log('   PASS: Passcode PBKDF2/AES-GCM decryption works perfectly!');

    // Close modal by clicking close button
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close modal"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 5. Test Forge Lock form creation
    console.log('[Acceptance Test] 5. Testing Capsule Forging in Console...');
    // Switch to FORGE LOCK tab
    await page.evaluate(() => {
      const forgeTab = document.querySelector('button[data-tab="forge"]');
      if (forgeTab) forgeTab.click();
    });
    await page.waitForSelector('#title-input', { timeout: 5000 });

    // Select 20s quick demo button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.innerText && b.innerText.includes('20s (DEMO)'));
      if (demoBtn) demoBtn.click();
    });

    await page.type('#title-input', 'Autonomous Acceptance Capsule');
    await page.type('#recipient-input', 'Future Tester');
    await page.type('#message-input', 'This capsule was forged and sealed live using Web Crypto AES-GCM 256.');

    // Submit form
    console.log('   Submitting form to forge lock...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });

    // Wait for VDF scramble and receipt
    await new Promise(r => setTimeout(r, 3000));

    const receiptConfirmed = await page.evaluate(() => {
      return document.body.innerText.includes('CAPSULE CRYPTOGRAPHICALLY SEALED');
    });

    if (!receiptConfirmed) {
      throw new Error('Sealed receipt confirmation was not rendered');
    }
    console.log('   PASS: Capsule sealed, encrypted, and confirmation receipt rendered!');

    // Capture visual proof of the button and the console
    const screenshotDir = path.join(__dirname, 'test_output');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    await page.screenshot({
      path: path.join(screenshotDir, 'sealed_receipt.png'),
      fullPage: false
    });

    // Scroll to footer and take screenshot of the button
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({
      path: path.join(screenshotDir, 'footer_button_no_plus.png'),
      fullPage: false
    });

    console.log('[Acceptance Test] All tests PASSED with 100% success!');
  } catch (err) {
    console.error('[Acceptance Test] FAILED:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
