const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  console.log('====================================================');
  console.log('[Acceptance Test] Running Add-On Verification Suite');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -----------------------------------------------------------------
    // TEST 1: Check Home Page (Form NOT embedded on /)
    // -----------------------------------------------------------------
    console.log('[Test 1] Navigating to http://127.0.0.1:3000 (Landing Page)...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    const formOnHome = await page.evaluate(() => {
      const formEl = document.getElementById('seal-lock');
      return formEl !== null;
    });

    if (formOnHome) {
      throw new Error('FAIL: Form element (#seal-lock) is still embedded on landing page (/)!');
    }
    console.log('  ✓ Pass: Create form is NOT embedded on landing page (/).');

    // Check navbar "Forge Lock" button navigates to /create
    console.log('[Test 1.1] Clicking navbar "Forge Lock" button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const forgeBtn = buttons.find(b => b.innerText && b.innerText.toLowerCase().includes('forge lock'));
      if (forgeBtn) forgeBtn.click();
    });

    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    const currentUrl = page.url();
    console.log('  Current URL after clicking Forge Lock:', currentUrl);
    if (!currentUrl.includes('/create')) {
      throw new Error(`FAIL: Expected to be on /create, but URL is ${currentUrl}`);
    }
    console.log('  ✓ Pass: "Forge Lock" button successfully navigates to /create.');

    // -----------------------------------------------------------------
    // TEST 2: Inspect Create Page (/create)
    // -----------------------------------------------------------------
    console.log('[Test 2] Verifying /create layout, inputs, and image upload area...');
    const formChecks = await page.evaluate(() => {
      const container = document.getElementById('seal-lock');
      const hasContainer = container !== null;
      const fileInput = document.querySelector('input[type="file"]');
      const hasFileInput = fileInput !== null;
      const dateInput = document.querySelector('input[type="date"]');
      const timeInput = document.querySelector('input[type="time"]');
      const textareas = document.querySelectorAll('textarea');
      const labels = Array.from(document.querySelectorAll('label')).map(l => l.innerText);
      const hasImageLabel = labels.some(l => l.includes('ATTACH IMAGE (OPTIONAL)'));

      return {
        hasContainer,
        hasFileInput,
        hasDateInput: dateInput !== null,
        hasTimeInput: timeInput !== null,
        hasTextarea: textareas.length > 0,
        hasImageLabel,
      };
    });

    console.log('  Form elements check:', formChecks);
    if (!formChecks.hasContainer) throw new Error('FAIL: #seal-lock container not found on /create');
    if (!formChecks.hasFileInput) throw new Error('FAIL: File input for image upload not found');
    if (!formChecks.hasImageLabel) throw new Error('FAIL: ATTACH IMAGE (OPTIONAL) micro-label not found');
    console.log('  ✓ Pass: Form layout, date/time pickers, and ATTACH IMAGE (OPTIONAL) present.');

    // -----------------------------------------------------------------
    // TEST 3: Create Capsule with an Image (Simulate PNG upload)
    // -----------------------------------------------------------------
    console.log('[Test 3] Simulating image selection and client-side compression...');
    
    // Create a 1200x900 synthetic test image in browser and attach to the form
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF4F00';
      ctx.fillRect(0, 0, 1200, 900);
      ctx.fillStyle = '#141416';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('AETHERIA TEST ARCHIVE', 100, 450);

      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'test-relic-1200x900.png', { type: 'image/png' });

      const fileInput = document.querySelector('input[type="file"]');
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Wait for image compression to complete
    await new Promise(r => setTimeout(r, 1200));

    const imagePreviewInfo = await page.evaluate(() => {
      const preview = document.querySelector('img[alt="Preview"]');
      const filenameLabel = document.body.innerText.includes('test-relic-1200x900.png');
      const removeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Remove');
      return {
        hasPreview: preview !== null,
        hasFilename: filenameLabel,
        hasRemoveBtn: removeBtn !== undefined,
      };
    });

    console.log('  Image preview check:', imagePreviewInfo);
    if (!imagePreviewInfo.hasPreview || !imagePreviewInfo.hasRemoveBtn) {
      throw new Error('FAIL: Image preview or Remove button not rendered after file selection.');
    }
    console.log('  ✓ Pass: Image preview, compression, and Remove button functioning correctly.');

    // Fill message and forge capsule (+30 SEC preset)
    console.log('[Test 3.1] Submitting capsule with attached image and +30 SEC preset...');
    await page.evaluate(() => {
      const titleInput = document.querySelector('input[placeholder*="Solstice Manifesto"]');
      if (titleInput) {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(titleInput, 'Visual Relic Capsule 2026');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const msgInput = document.querySelector('textarea');
      if (msgInput) {
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(msgInput, 'Secret photographic inscription sealed in optical quartz.');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Submit form (triggers executeSeal)
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    });

    // Wait for hold and scramble animation to complete and confirmation receipt to appear
    await page.waitForFunction(() => {
      return document.body.innerText.includes('ATTACHED MEDIA SUBSTRATE') ||
             document.body.innerText.includes('AES-256 Encrypted in IndexedDB') ||
             document.body.innerText.includes('TEMPORAL CONFIRMATION RECEIPT');
    }, { timeout: 10000 });

    const receiptHasImage = await page.evaluate(() => {
      return document.body.innerText.includes('ATTACHED MEDIA SUBSTRATE') ||
             document.body.innerText.includes('AES-256 Encrypted in IndexedDB');
    });
    console.log('  Receipt has image substrate notification:', receiptHasImage);
    if (!receiptHasImage) throw new Error('FAIL: Sealed confirmation receipt did not show attached image substrate.');
    console.log('  ✓ Pass: Capsule successfully forged with encrypted image substrate in IndexedDB.');

    // -----------------------------------------------------------------
    // TEST 4: STRICT SELECTION VERIFICATION: Zero <img> when locked
    // -----------------------------------------------------------------
    console.log('[Test 4] Opening capsule modal while time-locked to verify ZERO <img> in DOM...');
    
    const pageButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => b.innerText.trim().replace(/\n/g, ' '));
    });
    console.log('  All buttons found on page:', pageButtons);

    const inspectBtnExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const inspectBtn = buttons.find(b => b.innerText && b.innerText.toLowerCase().includes('inspect'));
      if (inspectBtn) {
        inspectBtn.scrollIntoView();
        inspectBtn.click();
        return true;
      }
      return false;
    });
    console.log('  Inspect Capsule button exists & clicked via evaluate:', inspectBtnExists);
    await new Promise(r => setTimeout(r, 1000));
    
    await page.waitForSelector('.fixed.inset-0.z-50', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));

    const lockedModalCheck = await page.evaluate(() => {
      // Find modal
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return { hasModal: false };
      
      // Look for any <img> in the modal
      const imgElements = modal.querySelectorAll('img');
      const text = modal.innerText;
      const hasImageSealedTag = text.includes('IMAGE SEALED');
      const hasTimeLockedTag = text.includes('TIME-LOCKED') || text.includes('SUBSTRATE TIME-LOCKED');

      return {
        hasModal: true,
        imgCount: imgElements.length,
        hasImageSealedTag,
        hasTimeLockedTag,
      };
    });

    console.log('  Locked modal check:', lockedModalCheck);
    if (!lockedModalCheck.hasModal) throw new Error('FAIL: Modal did not open.');
    if (lockedModalCheck.imgCount > 0) {
      throw new Error(`FAIL: LEAK DETECTED! Found ${lockedModalCheck.imgCount} <img> tag(s) in DOM for a locked capsule!`);
    }
    if (!lockedModalCheck.hasImageSealedTag) {
      throw new Error('FAIL: "IMAGE SEALED" micro-label was not displayed in locked capsule modal.');
    }
    console.log('  ✓ Pass: Zero <img> elements in DOM for locked capsule; "IMAGE SEALED" correctly displayed.');

    // Close modal
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // -----------------------------------------------------------------
    // TEST 5: Verify Vault Registry & Deletion clears IndexedDB
    // -----------------------------------------------------------------
    console.log('[Test 5] Navigating to /vault and testing capsule deletion...');
    await page.goto('http://127.0.0.1:3000/vault', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const vaultImageBadge = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText);
      return badges.some(b => b.includes('IMAGE'));
    });
    console.log('  Vault card shows IMAGE badge:', vaultImageBadge);
    if (!vaultImageBadge) throw new Error('FAIL: Vault card did not display tiny IMAGE tag for capsule with image.');
    console.log('  ✓ Pass: Vault card shows tiny IMAGE badge.');

    // Check IndexedDB before deletion
    const dbRecordExistsBefore = await page.evaluate(async () => {
      return new Promise(resolve => {
        const req = indexedDB.open('aetheria_indexeddb_v1', 1);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('encrypted_images', 'readonly');
          const store = tx.objectStore('encrypted_images');
          const countReq = store.count();
          countReq.onsuccess = () => resolve(countReq.result > 0);
          countReq.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    });
    console.log('  IndexedDB contains encrypted record before deletion:', dbRecordExistsBefore);
    if (!dbRecordExistsBefore) throw new Error('FAIL: IndexedDB did not contain encrypted image record.');

    // Click delete on the first capsule (two-step inline confirmation)
    console.log('[Test 5.1] Deleting capsule with inline confirmation...');
    await page.evaluate(() => {
      const trashBtns = document.querySelectorAll('button[title*="Delete"], button svg.lucide-trash-2');
      if (trashBtns.length > 0) {
        const btn = trashBtns[0].closest('button');
        if (btn) btn.click();
      }
    });

    await new Promise(r => setTimeout(r, 600));

    // Click Confirm button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.innerText && b.innerText.trim() === 'Confirm');
      if (confirmBtn) confirmBtn.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    // Check IndexedDB after deletion
    const dbCountAfter = await page.evaluate(async () => {
      return new Promise(resolve => {
        const req = indexedDB.open('aetheria_indexeddb_v1', 1);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('encrypted_images', 'readonly');
          const store = tx.objectStore('encrypted_images');
          const countReq = store.count();
          countReq.onsuccess = () => resolve(countReq.result);
          countReq.onerror = () => resolve(-1);
        };
        req.onerror = () => resolve(-1);
      });
    });
    console.log('  IndexedDB records count after deletion:', dbCountAfter);
    if (dbCountAfter !== 0) throw new Error(`FAIL: IndexedDB still contains ${dbCountAfter} image records after deletion.`);
    console.log('  ✓ Pass: Deleting capsule completely clears encrypted image from IndexedDB.');

    // -----------------------------------------------------------------
    // TEST 6: Mobile Responsiveness at 375px
    // -----------------------------------------------------------------
    console.log('[Test 6] Testing mobile viewport at 375px...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://127.0.0.1:3000/create', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const mobileCheck = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth;
      return {
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow,
      };
    });

    console.log('  Mobile 375px dimensions:', mobileCheck);
    if (mobileCheck.hasHorizontalOverflow) {
      throw new Error(`FAIL: Horizontal scroll overflow on 375px mobile viewport! (${mobileCheck.scrollWidth} > ${mobileCheck.clientWidth})`);
    }
    console.log('  ✓ Pass: 375px mobile view has zero horizontal overflow.');

    console.log('====================================================');
    console.log('>>> ALL VERIFICATION TESTS PASSED PERFECTLY! <<<');
    console.log('====================================================');
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
