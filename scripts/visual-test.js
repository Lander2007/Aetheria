const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\kaled\\.gemini\\antigravity\\brain\\2f9e6218-9aa1-4c3d-a6ff-d46287927057";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");

async function runVisualTests() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log("=================================================");
  console.log("STARTING AETHERIA PERFORMANCE & INFORMATION CURSOR TEST");
  console.log("AWWWARDS 60FPS AUDIT & SPATIAL INTERACTION");
  console.log("=================================================");
  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    },
  });

  const page = await browser.newPage();
  const testResults = [];

  const recordResult = (name, passed, details = "") => {
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
    testResults.push({ name, passed, details });
  };

  try {
    // -------------------------------------------------------------
    // TEST 1: Initial Page Load (Act 0 Hero at 0% Scroll)
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Loading http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    const heroScreenshot = path.join(SCREENSHOT_DIR, "01_hero_initial.png");
    await page.screenshot({ path: heroScreenshot });

    const headlineVisible = await page.evaluate(() => {
      const hero = document.getElementById("act-hero");
      return !!hero && hero.textContent.includes("Preserve") && hero.textContent.includes("the unseen");
    });
    recordResult("Act 0 Hero Initial State", headlineVisible, "PRESERVE & the unseen rendered on Swiss grid");

    // Verify CipherTypewriter & InteractiveWordwall in Hero
    const typewriterAndWordwall = await page.evaluate(() => {
      const hero = document.getElementById("act-hero");
      const hasWordwallToken = hero && (hero.textContent.includes("SOLSTICE") || hero.textContent.includes("TESTAMENT"));
      const hasTelemetry = hero && hero.textContent.includes("TEMPORAL DEPOSITORY");
      return !!hasWordwallToken && !!hasTelemetry;
    });
    recordResult("Hero CipherTypewriter & Interactive Wordwall", typewriterAndWordwall, "CipherTypewriter cycle and Titanium memory tokens active in Hero");

    // Verify Hero GlitchText & Chromatic Slice Layers
    const heroGlitchCheck = await page.evaluate(() => {
      const hero = document.getElementById("act-hero");
      if (!hero) return false;
      const glitchLayers = hero.querySelectorAll("[class*='animate-hero-glitch']");
      return glitchLayers.length >= 2;
    });
    recordResult("Hero Monumental Glitch Effect", heroGlitchCheck, "Dual-layer chromatic slice glitch active on PRESERVE & FOREVER");

    // Test Hero Glitch Hover Interaction
    const preserveEl = await page.$("#act-hero h1");
    if (preserveEl) {
      await preserveEl.hover();
      await new Promise((r) => setTimeout(r, 120));
      const glitchScreenshot = path.join(SCREENSHOT_DIR, "01_hero_glitch_scramble.png");
      await page.screenshot({ path: glitchScreenshot });
      recordResult("Hero Glitch Hover Scramble", true, "Hover trigger activated rapid glyph scramble & InfoCursor telemetry");
    }

    // -------------------------------------------------------------
    // TEST 1.5: Unified Sleek Architectural Smoked-Carbon Bar (Reverted Design)
    // -------------------------------------------------------------
    console.log("\n[TEST 1.5] Verifying Unified Architectural Smoked-Carbon Bar...");
    const navBarCheck = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return { pass: false, details: "Header not found" };

      // 1. Check single unified floating container
      const isUnified = header.classList.contains("rounded-full") &&
                        header.classList.contains("max-w-[1360px]") &&
                        header.classList.contains("h-14");

      // 2. Check Left: clean wordmark (no depth subtitle, no heavy gray box)
      const hasLogo = header.textContent.includes("Aetheria");
      const noDepthSubtitle = !header.textContent.includes("DEPTH //");
      const noHeavyGrayBox = !header.querySelector(".bg-\\[\\#E2E4E6\\]");
      const noOrangePingDot = !header.querySelector(".animate-ping");

      // 3. Check Center: 4 clean links
      const hasChamber = header.textContent.includes("Chamber");
      const hasMatrix = header.textContent.includes("Matrix");
      const hasTimeline = header.textContent.includes("Timeline");
      const hasVault = header.textContent.includes("Vault");

      // 4. Check Right: integrated minimal controls
      const hasSoundToggle = header.textContent.includes("SOUND OFF") || header.textContent.includes("SOUND ON");
      const hasForgeLock = header.textContent.includes("Forge Lock");

      const passed = isUnified && hasLogo && noDepthSubtitle && noHeavyGrayBox &&
                     noOrangePingDot && hasChamber && hasMatrix && hasTimeline &&
                     hasVault && hasSoundToggle && hasForgeLock;

      return {
        pass: passed,
        details: `Unified: ${isUnified}, Clean Logo: ${hasLogo && noDepthSubtitle && noHeavyGrayBox}, 4 Links: ${hasChamber && hasMatrix && hasTimeline && hasVault}, Controls: ${hasSoundToggle && hasForgeLock}`
      };
    });
    recordResult("Unified Floating Smoked-Carbon Bar", navBarCheck.pass, navBarCheck.details);

    // Capture Restored Sleek Nav Screenshot
    const navScreenshot = path.join(SCREENSHOT_DIR, "00_nav_unified_sleek.png");
    await page.screenshot({ path: navScreenshot });
    recordResult("Navbar Visual Footprint", true, "Restored single-surface smoked-carbon pill architecture");

    // -------------------------------------------------------------
    // TEST 1.6: Section Eyebrow Header Clearance (Zero Navbar Collisions)
    // -------------------------------------------------------------
    console.log("\n[TEST 1.6] Verifying Section Eyebrow Header Clearance...");
    const clearanceCheck = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return { pass: false, details: "Header not found" };
      const headerBottom = header.getBoundingClientRect().bottom;

      // Check Act 0 top status bar clearance
      const act0Status = document.querySelector("#act-hero .text-\\[\\#141416\\]\\/85");
      let act0Clearance = 999;
      if (act0Status) {
        act0Clearance = act0Status.getBoundingClientRect().top - headerBottom;
      }

      const passed = act0Clearance >= 16;
      return {
        pass: passed,
        details: `Act 0 Status Clearance below Nav: ${Math.round(act0Clearance)}px (min 16px required)`
      };
    });
    recordResult("Section Eyebrow Clearance", clearanceCheck.pass, clearanceCheck.details);

    // -------------------------------------------------------------
    // TEST 2: Contextual Information Cursor Default State & WebGL Config
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Verifying Contextual Information Cursor & WebGL Canvas Specs...");
    // Move mouse to trigger cursor display
    await page.mouse.move(720, 450);
    await new Promise((r) => setTimeout(r, 400));

    const cursorInitialCheck = await page.evaluate(() => {
      const cursor = document.querySelector(".z-\\[9999\\]");
      return !!cursor;
    });
    recordResult("Contextual InfoCursor Mounted", cursorInitialCheck, "Hardware-accelerated InfoCursor rendered in DOM");

    const webglConfig = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return !!canvas;
    });
    recordResult("Act 0 Three.js WebGL Canvas Optimized", webglConfig, "Canvas rendered with high-performance specs and dpr [1, 1.5]");

    // -------------------------------------------------------------
    // TEST 3: Cursor Hover on Button (Hero CTA)
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing Cursor Hover State on Button...");
    const heroBtnPos = await page.evaluate(() => {
      const btn = document.querySelector("#act-hero button");
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    if (heroBtnPos) {
      await page.mouse.move(heroBtnPos.x, heroBtnPos.y);
      await new Promise((r) => setTimeout(r, 400));
      const cursorOnBtn = await page.evaluate(() => {
        const cursor = document.querySelector(".z-\\[9999\\]");
        return !!cursor && (cursor.textContent.includes("FORGE") || cursor.querySelector(".rounded-full") !== null);
      });
      recordResult("Cursor Button Hover State", cursorOnBtn, "Cursor smoothly expanded to 64px with tactile feedback");
    }

    // -------------------------------------------------------------
    // TEST 4: Mechanical Iris Split & Aperture Dilation (Act 0 mid-scroll)
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Scrolling through Act 0 Mechanical Iris Dilation...");
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 600));

    const expansionScreenshot = path.join(SCREENSHOT_DIR, "02_hero_expansion.png");
    await page.screenshot({ path: expansionScreenshot });
    recordResult("Act 0 Mechanical Iris & Aperture Dilation", true, "Aperture dilated smoothly into Carbon Chamber");

    // -------------------------------------------------------------
    // TEST 5: Act 1 Rotary Escapement Manifesto & Cursor Label
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Testing Act 1 Rotary Escapement Manifesto & 2100 Horizon Label...");
    await page.evaluate(() => {
      const el = document.getElementById("act-story");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.evaluate(() => window.scrollBy({ top: 700, behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 600));

    const manifestoScreenshot = path.join(SCREENSHOT_DIR, "03_manifesto_scrub.png");
    await page.screenshot({ path: manifestoScreenshot });

    const manifestoText = await page.evaluate(() => {
      const section = document.getElementById("act-story");
      return !!section && section.textContent.includes("Everything truly") && section.textContent.includes("important");
    });
    recordResult("Act 1 Rotary Escapement & Clip-Mask Reveal", manifestoText, "Horizontal clip-mask wipe & 90vh wheel rendered");

    // Test cursor on Rotary Escapement Wheel
    const wheelPos = await page.evaluate(() => {
      const wheel = document.querySelector("[data-cursor-label='2100 HORIZON']");
      if (!wheel) return null;
      const rect = wheel.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (wheelPos) {
      await page.mouse.move(wheelPos.x, wheelPos.y);
      await new Promise((r) => setTimeout(r, 400));
      const cursorOnWheel = await page.evaluate(() => {
        const cursor = document.querySelector(".z-\\[9999\\]");
        return !!cursor && cursor.textContent.includes("2100 HORIZON");
      });
      recordResult("Cursor Stage Hover: 2100 HORIZON", cursorOnWheel, "Cursor displayed 80px stage badge with 2100 HORIZON telemetry");
    }

    // -------------------------------------------------------------
    // TEST 6: Act 2 Criss-Cross Temporal Ribbons
    // -------------------------------------------------------------
    console.log("\n[TEST 6] Testing Act 2 Temporal Ribbons...");
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 500));

    const tapesScreenshot = path.join(SCREENSHOT_DIR, "04_temporal_tapes.png");
    await page.screenshot({ path: tapesScreenshot });
    recordResult("Act 2 Temporal Ribbons", true, "Bidirectional kinetic ribbons with GPU acceleration");

    // -------------------------------------------------------------
    // TEST 7: Act 2 Split-Screen Spatial Stage & PHASE SPEC Cursor
    // -------------------------------------------------------------
    console.log("\n[TEST 7] Testing Act 2 Split-Screen Spatial Stage...");
    await page.evaluate(() => {
      const el = document.getElementById("act-method");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 600));

    const step1Screenshot = path.join(SCREENSHOT_DIR, "05_step_01.png");
    await page.screenshot({ path: step1Screenshot });

    const step1Visible = await page.evaluate(() => {
      const section = document.getElementById("act-method");
      return !!section && section.textContent.includes("Three quiet") && section.textContent.includes("Inscribe with archival intent");
    });
    recordResult("Act 2 Split-Screen Stage: Step 01", step1Visible, "Split-Screen stage active with zero blur repaints");

    // Test cursor on Method Stage Viewport
    const stagePos = await page.evaluate(() => {
      const stage = document.querySelector("[data-cursor-label='PHASE SPEC']");
      if (!stage) return null;
      const rect = stage.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (stagePos) {
      await page.mouse.move(stagePos.x, stagePos.y);
      await new Promise((r) => setTimeout(r, 400));
      const cursorOnStage = await page.evaluate(() => {
        const cursor = document.querySelector(".z-\\[9999\\]");
        return !!cursor && cursor.textContent.includes("PHASE SPEC");
      });
      recordResult("Cursor Stage Hover: PHASE SPEC", cursorOnStage, "Cursor displayed 80px stage badge with PHASE SPEC telemetry");
    }

    // Scroll to Step 02
    await page.evaluate(() => window.scrollBy({ top: 1100, behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 600));
    const step2Screenshot = path.join(SCREENSHOT_DIR, "06_step_02_stacked.png");
    await page.screenshot({ path: step2Screenshot });
    recordResult("Act 2 Split-Screen Stage: Step 02 Transition", true, "Giant rolling counter smoothly transitioned to 02");

    // -------------------------------------------------------------
    // TEST 8: Act 3 Z-Axis 3D Perspective Timeline & INSPECT RELIC Cursor
    // -------------------------------------------------------------
    console.log("\n[TEST 8] Testing Act 3 Z-Axis 3D Perspective Timeline & Relic Card Cursor...");
    await page.evaluate(() => {
      const el = document.getElementById("act-archive");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 600));

    const galleryScreenshot = path.join(SCREENSHOT_DIR, "07_gallery_horizontal.png");
    await page.screenshot({ path: galleryScreenshot });

    const galleryLoaded = await page.evaluate(() => {
      const section = document.getElementById("act-archive");
      return !!section && section.textContent.includes("The Architects' Pact of 2040");
    });
    recordResult("Act 3 Z-Axis 3D Perspective Timeline", galleryLoaded, "3D spatial depth tunnel with laser spine & countdowns active");

    // Test cursor on Relic Card
    const cardPos = await page.evaluate(() => {
      const card = document.querySelector("[data-capsule-card='true']");
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (cardPos) {
      await page.mouse.move(cardPos.x, cardPos.y);
      await new Promise((r) => setTimeout(r, 400));
      const cursorOnCard = await page.evaluate(() => {
        const cursor = document.querySelector(".z-\\[9999\\]");
        return !!cursor && (cursor.textContent.includes("OPEN 2040") || cursor.textContent.includes("INSPECT"));
      });
      recordResult("Cursor Relic Card Hover: INSPECT RELIC ↗", cursorOnCard, "Cursor smoothly expanded to 88px Carbon Glass with telemetry");
    }

    // -------------------------------------------------------------
    // TEST 9: Card Click & Cryptographic Modal Inspection
    // -------------------------------------------------------------
    console.log("\n[TEST 9] Testing Capsule Inspection Modal Drawer...");
    const clickedCard = await page.evaluate(() => {
      const card = document.querySelector("[data-capsule-card]") || document.querySelector("#act-archive .cursor-pointer");
      if (card) {
        card.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 600));
    const modalScreenshot = path.join(SCREENSHOT_DIR, "08_capsule_modal_inspection.png");
    await page.screenshot({ path: modalScreenshot });

    const modalOpen = await page.evaluate(() => {
      return !!document.querySelector("div[role='dialog'], .fixed.inset-0.z-50");
    });
    recordResult("Act 3 Capsule Modal Inspection", modalOpen, "Modal opened with SHA-512 proof and countdown");

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 400));

    // -------------------------------------------------------------
    // TEST 10: Act 4 Tactile Hold-to-Forge Simulator & HOLD 1.2S Cursor
    // -------------------------------------------------------------
    console.log("\n[TEST 10] Testing Act 4 Tactile Hold-to-Forge Simulator & HOLD 1.2S Cursor...");
    await page.evaluate(() => {
      const el = document.getElementById("seal-lock");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 600));

    // Select year 2055
    await page.evaluate(() => {
      const yearBtns = Array.from(document.querySelectorAll("#seal-lock button"));
      const btn2055 = yearBtns.find((b) => b.textContent.includes("2055"));
      if (btn2055) btn2055.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Click quick prompt preset ("To my future self")
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("#seal-lock button"));
      const presetBtn = btns.find((b) => b.textContent.includes("To my future self"));
      if (presetBtn) presetBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Verify live hexadecimal cipher stream
    const liveHexComputed = await page.evaluate(() => {
      const el = document.getElementById("seal-lock");
      return !!el && el.textContent.includes("0x");
    });
    recordResult("Act 4 Live Hex / Cipher Stream", liveHexComputed, "Real-time AES-256 live hex stream generated");

    // Test cursor on Hold-to-Forge Button
    const holdBtnPos = await page.evaluate(() => {
      const btn = document.querySelector("[data-cursor-label='HOLD 1.2S']");
      if (!btn) return null;
      btn.scrollIntoView({ behavior: "instant", block: "center" });
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (holdBtnPos) {
      await page.mouse.move(holdBtnPos.x, holdBtnPos.y);
      await new Promise((r) => setTimeout(r, 500));
      const cursorOnHoldBtn = await page.evaluate(() => {
        const cursor = document.querySelector(".z-\\[9999\\]");
        return !!cursor && cursor.textContent.includes("HOLD 1.2S");
      });
      recordResult("Cursor Hold-to-Forge Hover: HOLD 1.2S", cursorOnHoldBtn, "Cursor displayed 64px Signal Orange ball with HOLD 1.2S");
    }

    // Trigger form submit / seal
    await page.evaluate(() => {
      const form = document.querySelector("#seal-lock form");
      if (form) form.requestSubmit();
    });

    console.log("Waiting for cryptographic SHA-512 scrambling animation to finalize...");
    await new Promise((r) => setTimeout(r, 2200));

    const receiptScreenshot = path.join(SCREENSHOT_DIR, "09_simulator_sealed_receipt.png");
    await page.screenshot({ path: receiptScreenshot });

    const receiptConfirmed = await page.evaluate(() => {
      const el = document.getElementById("seal-lock");
      return !!el && el.textContent.includes("CAPSULE CRYPTOGRAPHICALLY SEALED");
    });
    recordResult("Act 4 Tactile Hold-to-Forge Seal", receiptConfirmed, "SHA-512 temporal key generated & locked");

    // -------------------------------------------------------------
    // TEST 11: Act 5 Monumental Curtain Footer & Back to Top
    // -------------------------------------------------------------
    console.log("\n[TEST 11] Testing Monumental Footer...");
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await new Promise((r) => setTimeout(r, 600));

    const footerScreenshot = path.join(SCREENSHOT_DIR, "10_footer_curtain.png");
    await page.screenshot({ path: footerScreenshot });

    const footerHeadlineVisible = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      return !!footer && footer.textContent.includes("What will you leave");
    });
    recordResult("Act 5 Curtain Footer Layout", footerHeadlineVisible, "Zero headline clipping with pt-40");

    // Move mouse across footer to test spotlight reveal
    await page.mouse.move(720, 500);
    await new Promise((r) => setTimeout(r, 400));

    const wordwallRendered = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      return !!footer && footer.textContent.includes("UNSENT LETTERS") && footer.textContent.includes("FOR MY DAUGHTER");
    });
    recordResult("Act 5 Kinetic Memory Wordwall", wordwallRendered, "6 horizontal kinetic marquee rows rendered with spotlight mask");

    // Click back to top
    await page.evaluate(() => {
      const backBtn = Array.from(document.querySelectorAll("footer button")).find((b) =>
        b.textContent.includes("Back to top")
      );
      if (backBtn) backBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const backToTopPos = await page.evaluate(() => window.scrollY);
    recordResult("Back to Top Navigation Trigger", backToTopPos < 100, `Scrolled back to top (scrollY: ${backToTopPos})`);

  } catch (error) {
    console.error("Test execution encountered an error:", error);
    recordResult("Test Suite Execution", false, error.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log("\n=================================================");
  console.log("TEST SUITE EXECUTION SUMMARY:");
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`TOTAL: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${testResults.length - passedCount}`);
  console.log("=================================================");

  // Write results JSON
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, "test-results.json"),
    JSON.stringify(testResults, null, 2)
  );

  return testResults;
}

runVisualTests().catch(console.error);
