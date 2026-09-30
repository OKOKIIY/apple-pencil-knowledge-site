const { chromium } = require('playwright');
const path = require('path');

const screenshots = path.resolve(__dirname, '..', 'docs', 'stitch-reference');
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertText(page, selector, expected) {
  const value = await page.locator(selector).innerText();
  assert(value.includes(expected), `${expected} not found in ${selector}: ${value}`);
}

async function assertTextAbsent(page, selector, unexpected) {
  const value = await page.locator(selector).innerText();
  assert(!value.includes(unexpected), `${unexpected} should not appear in ${selector}: ${value}`);
}

async function assertFactText(page, cardSelector, expected) {
  const value = await page.locator(`${cardSelector} .result-facts`).textContent();
  assert(String(value || '').includes(expected), `${expected} not found in ${cardSelector} supporting facts: ${value}`);
}

async function openSupportingFacts(page, cardSelector) {
  const details = page.locator(`${cardSelector} .fact-more`);
  assert(await details.count() === 1, `${cardSelector} should expose one supporting-facts disclosure`);
  assert(!(await details.evaluate((node) => node.open)), `${cardSelector} supporting facts should start collapsed`);
  await details.locator('summary').click();
  assert(await details.evaluate((node) => node.open), `${cardSelector} supporting facts should open from its summary`);
}

async function assertNoHorizontalOverflow(page) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert(size.content <= size.viewport, `horizontal overflow: ${JSON.stringify(size)}`);
}

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((part) => Number.parseInt(part, 16) / 255);
  return channels
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function assertSemanticTextContrast(page) {
  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      rose: styles.getPropertyValue('--rose-deep').trim(),
      canvas: styles.getPropertyValue('--canvas').trim(),
      mint: styles.getPropertyValue('--mint-ink').trim(),
      mintSoft: styles.getPropertyValue('--mint-soft').trim(),
      amber: styles.getPropertyValue('--amber-ink').trim(),
      amberSoft: styles.getPropertyValue('--amber-soft').trim(),
      red: styles.getPropertyValue('--red-ink').trim(),
      redSoft: styles.getPropertyValue('--red-soft').trim()
    };
  });
  for (const [name, foreground, background] of [
    ['brand', tokens.rose, tokens.canvas],
    ['compatible', tokens.mint, tokens.mintSoft],
    ['caution', tokens.amber, tokens.amberSoft],
    ['not-supported', tokens.red, tokens.redSoft]
  ]) {
    assert(contrastRatio(foreground, background) >= 4.5, `${name} state text contrast is below 4.5:1: ${foreground} on ${background}`);
  }
}

async function assertQueryStateRestores(page) {
  const url = new URL(page.url());
  assert(url.searchParams.get('year') === '2025', `query URL year was not written: ${url}`);
  assert(url.searchParams.get('series') === 'digital', `query URL series was not written: ${url}`);
  assert(url.searchParams.get('variant') === 'ipad_a16', `query URL variant was not written: ${url}`);
  assert(url.searchParams.get('purpose') === 'notes', `query URL purpose was not written: ${url}`);
  assert(url.searchParams.get('result') === '1', `query URL result state was not written: ${url}`);

  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('#year-select').inputValue() === '2025', 'year did not restore from query URL');
  assert(await page.locator('#series-select').inputValue() === 'digital', 'series did not restore from query URL');
  assert(await page.locator('#variant-select').inputValue() === 'ipad_a16', 'variant did not restore from query URL');
  assert(await page.locator('[data-purpose="notes"]').getAttribute('aria-pressed') === 'true', 'purpose did not restore from query URL');
  assert(await page.locator('#result-section').isVisible(), 'queried result did not restore from query URL');
  assert(await page.locator('#result-bridge').isVisible(), 'queried state should preserve its compact selection summary');
  assert(await page.locator('#query-form-body').evaluate((node) => !node.inert && node.getBoundingClientRect().height > 200), 'queried state should keep the completed form visible');
  assert(await page.locator('#year-select').isVisible() && await page.locator('#variant-select').isVisible(), 'queried state should keep selected controls visible');
}

async function assertCompactTitleWrap(page, width) {
  const titleParts = page.locator('#match-title > span');
  const layout = await titleParts.evaluateAll((nodes) => nodes.map((node) => ({
    display: getComputedStyle(node).display,
    top: node.getBoundingClientRect().top,
    bottom: node.getBoundingClientRect().bottom
  })));
  if (width <= 379) {
    assert(layout[1].display === 'block' && layout[1].top > layout[0].top, `compact title is not intentionally balanced: ${JSON.stringify(layout)}`);
  } else {
    assert(layout[1].display === 'inline', `wide mobile title should stay on one line when space allows: ${JSON.stringify(layout)}`);
  }
}

async function assertYearCoverage(page) {
  const years = await page.locator('#year-select option').evaluateAll((nodes) => nodes.map((node) => node.value));
  const expected = Array.from({ length: 12 }, (_, index) => String(2015 + index));
  assert(expected.every((year) => years.includes(year)), `year coverage is incomplete: ${JSON.stringify(years)}`);
}

async function assertReleaseYearOptions(page) {
  await page.locator('#year-select').selectOption('2016');
  await page.locator('#series-select').selectOption('pro');
  const variants = await page.locator('#variant-select option').evaluateAll((nodes) => nodes.map((node) => node.textContent));
  const deviceOptions = variants.filter((label) => !label.includes('请选择'));
  assert(deviceOptions.length === 1 && deviceOptions[0].includes('9.7 英寸'), `2016 release-year options are incorrect: ${JSON.stringify(variants)}`);
  await page.locator('#year-select').selectOption('');
}

async function assertMobileNavDoesNotCoverQueryControls(page) {
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const control = [...document.querySelectorAll('.query-panel select, .query-panel button')]
      .find((node) => !node.disabled && node.getBoundingClientRect().height > 0);
    if (!control) return 0;
    const rect = control.getBoundingClientRect();
    return Math.max(0, Math.min(nav.bottom, rect.bottom) - Math.max(nav.top, rect.top));
  });
  assert(overlap <= 1, `bottom nav covers the active query control: ${overlap}px`);
}

async function assertMobileNavDoesNotCoverResult(page) {
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const result = document.querySelector('.result-section').getBoundingClientRect();
    return Math.max(0, Math.min(nav.bottom, result.bottom) - Math.max(nav.top, result.top));
  });
  assert(overlap <= 1, `bottom nav covers the default result section: ${overlap}px`);
}

async function assertBottomContentAboveNav(page, selector = '.trust-strip') {
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(100);
  const positions = await page.evaluate((targetSelector) => {
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const content = document.querySelector(targetSelector).getBoundingClientRect();
    return { navTop: nav.top, contentBottom: content.bottom };
  }, selector);
  assert(positions.contentBottom <= positions.navTop - 8, `bottom nav covers final content for ${selector}: ${JSON.stringify(positions)}`);
}

async function assertKeyboardEntryPoint(page) {
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('skip-link'));
  assert(focused, 'first keyboard focus should expose the skip link');
}

async function query(page, year, series, variant, purpose) {
  if (await page.locator('#edit-query-button').isVisible()) {
    await page.locator('#edit-query-button').click();
    await page.waitForTimeout(320);
  }
  await page.locator('#year-select').selectOption(year);
  if (series) await page.locator('#series-select').selectOption(series);
  if (variant) await page.locator('#variant-select').selectOption(variant);
  if (purpose && await page.locator(`[data-purpose="${purpose}"]`).isEnabled()) {
    await page.locator(`[data-purpose="${purpose}"]`).click();
  }
  await page.locator('#query-button').click();
  await page.waitForTimeout(100);
}

const officialCatalogCoverage = {
  unsupported: [
    ['2015', 'mini', 'mini4'],
    ['2017', 'digital', 'ipad5']
  ],
  gen1: [
    ['2015', 'pro', 'pro129_1'],
    ['2016', 'pro', 'pro97'],
    ['2017', 'pro', 'pro105'],
    ['2017', 'pro', 'pro129_2'],
    ['2018', 'digital', 'ipad6'],
    ['2019', 'digital', 'ipad7'],
    ['2019', 'air', 'air3'],
    ['2019', 'mini', 'mini5'],
    ['2020', 'digital', 'ipad8'],
    ['2021', 'digital', 'ipad9']
  ],
  usbCGen1: [
    ['2022', 'digital', 'ipad10'],
    ['2025', 'digital', 'ipad_a16']
  ],
  usbCGen2: [
    ['2018', 'pro', 'pro11_1'],
    ['2018', 'pro', 'pro129_3'],
    ['2020', 'air', 'air4'],
    ['2020', 'pro', 'pro11_2'],
    ['2020', 'pro', 'pro129_4'],
    ['2021', 'pro', 'pro11_3'],
    ['2021', 'pro', 'pro129_5'],
    ['2021', 'mini', 'mini6'],
    ['2022', 'air', 'air5'],
    ['2022', 'pro', 'pro11_4'],
    ['2022', 'pro', 'pro129_6']
  ],
  usbCPro: [
    ['2024', 'air', 'air_m2_11'],
    ['2024', 'air', 'air_m2_13'],
    ['2024', 'pro', 'pro_m4_11'],
    ['2024', 'pro', 'pro_m4_13'],
    ['2024', 'mini', 'mini_a17'],
    ['2025', 'air', 'air_m3_11'],
    ['2025', 'air', 'air_m3_13'],
    ['2025', 'pro', 'pro_m5_11'],
    ['2025', 'pro', 'pro_m5_13'],
    ['2026', 'air', 'air_m4_11'],
    ['2026', 'air', 'air_m4_13']
  ]
};

async function assertOfficialCatalogCoverage(page) {
  for (const [year, series, variant] of officialCatalogCoverage.unsupported) {
    await query(page, year, series, variant, 'notes');
    await assertText(page, '#result-count', '不支持');
  }

  for (const [year, series, variant] of officialCatalogCoverage.gen1) {
    await query(page, year, series, variant, 'notes');
    await assertText(page, '#result-count', '能用 1 支');
    await assertText(page, '#primary-name', 'Apple Pencil 一代');
  }

  for (const [year, series, variant] of officialCatalogCoverage.usbCGen1) {
    await query(page, year, series, variant, 'notes');
    await assertText(page, '#result-count', '能用 2 支');
    await assertText(page, '#primary-name', 'USB-C 第三代笔');
    await query(page, year, series, variant, 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil 一代');
    await assertText(page, '#primary-facts', '需要转接器（iPad 10/11）');
  }

  for (const [year, series, variant] of officialCatalogCoverage.usbCGen2) {
    await query(page, year, series, variant, 'notes');
    await assertText(page, '#result-count', '能用 2 支');
    await assertText(page, '#primary-name', 'USB-C 第三代笔');
    await query(page, year, series, variant, 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil 二代');
  }

  for (const [year, series, variant] of officialCatalogCoverage.usbCPro) {
    await query(page, year, series, variant, 'notes');
    await assertText(page, '#result-count', '能用 2 支');
    await assertText(page, '#primary-name', 'USB-C 第三代笔');
    await query(page, year, series, variant, 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil Pro');
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height, name] of [[375, 812, 'ux-flow-top-375'], [390, 844, 'gradient-top-390'], [430, 932, 'gradient-top-430'], [768, 1024, 'ux-flow-top-768'], [1280, 900, 'ux-flow-top-1280'], [1440, 1000, 'gradient-top-1440']]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.on('console', (message) => { if (message.type() === 'error') failures.push(`console ${message.text()}`); });
      page.on('pageerror', (error) => failures.push(`pageerror ${error.message}`));
      await page.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });
      assert(new URL(page.url()).hash === '#match', `initial route should be #match: ${page.url()}`);
      await assertNoHorizontalOverflow(page);
      await assertCompactTitleWrap(page, width);
      await assertKeyboardEntryPoint(page);
      assert(await page.locator('#profile-link').isVisible(), 'profile link should render when the supplied Xiaohongshu URL is available');
      assert((await page.locator('#profile-link').getAttribute('href')).includes('xhslink.cn/m/5wHE9dbgPI5'), 'profile link should retain the supplied Xiaohongshu URL');
      await assertText(page, '#profile-name', '2373051060');
      assert(await page.locator('#copy-xhs-id').isVisible(), 'copy button should render for the supplied Xiaohongshu ID');
      assert(await page.locator('#profile-avatar img').isVisible(), 'supplied profile avatar should render');
      await assertText(page, '#profile-proof', '7850');
      await assertSemanticTextContrast(page);
      await assertYearCoverage(page);
      await assertReleaseYearOptions(page);
      assert(await page.locator('#year-select').inputValue() === '', 'year selector should not fake a default device');
      assert(await page.locator('[data-step-panel="year"]').isVisible(), 'year query step should be visible');
      assert(await page.locator('[data-step-panel="series"]').isVisible(), 'series query step should remain visible for context');
      assert(await page.locator('[data-step-panel="variant"]').isVisible(), 'variant query step should remain visible for context');
      assert(await page.locator('[data-step-panel="purpose"]').isVisible(), 'purpose query step should remain visible for context');
      assert(await page.locator('#series-select').isDisabled(), 'series should stay locked until a year is selected');
      assert(await page.locator('#variant-select').isDisabled(), 'variant should stay locked until a series is selected');
      assert(await page.locator('[data-purpose="notes"]').isDisabled(), 'purpose should stay locked until a variant is selected');
      if (width < 500) {
        await assertMobileNavDoesNotCoverQueryControls(page);
        await assertMobileNavDoesNotCoverResult(page);
      }
      assert(await page.locator('#primary-card').isHidden(), 'primary card is visible before query');
      assert(await page.locator('#result-section').isHidden(), 'result section is visible before query');
      assert(await page.locator('#query-button').isDisabled(), 'query button should stay disabled before all four choices');
      const gradient = await page.locator('#query-button').evaluate((node) => getComputedStyle(node).backgroundImage);
      assert(gradient.includes('gradient'), `primary button is not using a gradient: ${gradient}`);
      await page.screenshot({ path: path.join(screenshots, `${name}.png`), fullPage: true });
      await page.close();
    }

    const flowPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await flowPage.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });
    await flowPage.locator('#year-select').selectOption('2025');
    assert(await flowPage.locator('[data-step-panel="series"]').evaluate((node) => node.classList.contains('is-current')), 'next step should be highlighted after selecting a year');
    await flowPage.locator('#series-select').selectOption('digital');
    await flowPage.locator('#variant-select').selectOption('ipad_a16');
    assert(await flowPage.locator('[data-purpose="notes"]').isEnabled(), 'purpose choices should unlock after selecting a concrete variant');
    await flowPage.locator('[data-purpose="notes"]').click();
    assert(await flowPage.locator('#query-button').isEnabled(), 'query button should unlock after all four choices');
    await flowPage.locator('#query-button').click();
    await flowPage.waitForTimeout(380);
    assert(await flowPage.locator('#result-section').isVisible(), 'result section should appear after submitting the query');
    assert((await flowPage.locator('#result-section').getAttribute('class')).includes('is-revealing'), 'result section should use the result entrance transition');
    assert(await flowPage.evaluate(() => document.activeElement?.id === 'result-title'), 'result title should receive focus after the result is revealed');
    const submittedLayout = await flowPage.evaluate(() => {
      const form = document.querySelector('#query-form-body');
      const bridge = document.querySelector('#result-bridge');
      const result = document.querySelector('#result-section').getBoundingClientRect();
      const formRect = form.getBoundingClientRect();
      return { formHeight: formRect.height, formBottom: formRect.bottom, formInert: form.inert, bridgeVisible: !bridge.hidden, resultTop: result.top };
    });
    assert(!submittedLayout.formInert && submittedLayout.formHeight > 200, `submitted form should stay open so selected choices remain visible: ${JSON.stringify(submittedLayout)}`);
    assert(submittedLayout.bridgeVisible, `selection status bridge should be visible after submit: ${JSON.stringify(submittedLayout)}`);
    await assertText(flowPage, '#result-bridge', '结论已生成');
    assert(!(await flowPage.locator('#result-bridge').innerText()).includes('上方条件仍保留'), 'result bridge should not repeat helper copy');
    assert(await flowPage.locator('#query-description').isHidden(), 'completed query should hide the redundant description');
    assert(await flowPage.locator('#query-hint').isHidden(), 'completed query should hide the redundant helper copy');
    assert(submittedLayout.resultTop >= submittedLayout.formBottom - 2, `result should follow the open query form: ${JSON.stringify(submittedLayout)}`);
    await flowPage.screenshot({ path: path.join(screenshots, 'query-flow-result-390.png'), fullPage: false });
    await flowPage.locator('#edit-query-button').click();
    await flowPage.waitForTimeout(420);
    assert(await flowPage.locator('#query-form-body').evaluate((node) => !node.inert && node.getBoundingClientRect().height > 200), 'modify action should keep the query form available');
    await flowPage.close();

    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page.on('console', (message) => { if (message.type() === 'error') failures.push(`console ${message.text()}`); });
    page.on('pageerror', (error) => failures.push(`pageerror ${error.message}`));
    await page.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });

    await query(page, '2025', 'digital', 'ipad_a16', 'notes');
    await assertText(page, '#primary-name', 'USB-C 第三代笔');
    await assertText(page, '#primary-facts', '无需转接器');
    await assertFactText(page, '#primary-card', 'iPadOS 17.1.1 或更高版本');
    assert(await page.locator('#primary-card .fact-grid-core .fact-tile').count() === 3, 'primary result should lead with three core facts');
    await openSupportingFacts(page, '#primary-card');
    await assertText(page, '#primary-used', '暂未提供参考');
    assert(await page.locator('#primary-shop-button').isHidden(), 'query results should not expose a shop action without a verified listing');
    assert(await page.locator('#secondary-shop-button').isVisible(), 'a verified alternative listing should expose its shop action');
    assert(await page.locator('#secondary-card .fact-grid-core .fact-tile').count() <= 2, 'alternative result should stay compact and avoid repeating every feature');
    await assertQueryStateRestores(page);
    assert(await page.locator('.bottom-nav').isVisible(), 'bottom nav should remain visible as a standard mobile tab bar');
    await assertBottomContentAboveNav(page);
    await page.screenshot({ path: path.join(screenshots, 'gradient-a16-result-390.png'), fullPage: false });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(100);
    assert(await page.locator('.bottom-nav').isVisible(), 'bottom nav should remain visible at the page top');

    await query(page, '2022', 'digital', 'ipad10', 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil 一代');
    await assertText(page, '#primary-facts', '需要转接器（iPad 10/11）');
    await assertText(page, '#primary-retail', '¥799');
    await assertText(page, '#primary-used', '¥378');
    await assertText(page, '#primary-used-label', '在售价（二手99新）');
    assert(await page.locator('#primary-facts .fact-tile').count() >= 5, 'facts should render as scannable feature tiles');
    assert(await page.locator('#primary-card .feature-guide').isVisible(), 'primary result should include a static feature guide');
    assert(await page.locator('#primary-shop-button').isVisible(), 'the listed first-generation Pencil should expose its shop action');

    await query(page, '2024', 'air', 'air_m2_11', 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil Pro');
    await assertFactText(page, '#primary-card', 'iPadOS 17.5 或更高版本');

    await query(page, '2020', 'air', 'air4', 'draw');
    await assertText(page, '#primary-name', 'Apple Pencil 二代');
    await assertFactText(page, '#primary-card', '配对方式');
    await assertTextAbsent(page, '#primary-facts .fact-grid-core', 'iPadOS');

    await query(page, '2015', 'pro', 'pro129_1', 'notes');
    await assertText(page, '#primary-name', 'Apple Pencil 一代');

    await query(page, '2015', 'mini', 'mini4', 'notes');
    await assertText(page, '#empty-result-title', '不支持 Apple Pencil');

    await query(page, '2017', 'digital', 'ipad5', 'notes');
    await assertText(page, '#empty-result-title', '不支持 Apple Pencil');

    await query(page, '2023', '', '', 'notes');
    await assertText(page, '#empty-result-title', '2023 年没有新款 iPad');

    await assertOfficialCatalogCoverage(page);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(100);
    await page.locator('[data-nav="avoid"]').click();
    assert(await page.locator('[data-page="avoid"]').isVisible(), 'avoid page is not visible');
    assert(new URL(page.url()).hash === '#avoid', `avoid route was not written to the URL: ${page.url()}`);
    assert(await page.locator('[data-page="avoid"] .case-item').count() === 5, 'avoid page should expose all five settled cases');
    assert(await page.locator('[data-page="avoid"] .avoid-gate').count() === 3, 'avoid page should expose three risk gates');
    assert(await page.locator('[data-page="avoid"] .avoid-gate[open]').count() === 0, 'risk gates should start collapsed so the first screen stays scannable');
    await page.locator('[data-page="avoid"] .avoid-gate-test summary').click();
    assert(await page.locator('[data-page="avoid"] .avoid-gate-test').evaluate((node) => node.open), 'risk gate should reveal its detail in place');
    await page.locator('[data-action="show-checklist"]').click();
    assert(await page.locator('#receipt-checklist-details').evaluate((node) => node.open), 'receipt checklist should open from its call to action');
    assert(await page.locator('#receipt-checklist-details .checklist-steps li').count() === 5, 'receipt checklist should include five functional checks');
    await page.screenshot({ path: path.join(screenshots, 'avoid-checklist-390.png'), fullPage: true });
    await assertBottomContentAboveNav(page, '[data-page="avoid"] .primary-button');
    await page.locator('[data-nav="faq"]').click();
    assert(new URL(page.url()).hash === '#faq', `faq route was not written to the URL: ${page.url()}`);
    await page.locator('#faq-search').fill('转接器');
    assert(await page.locator('#faq-list details:not([hidden])').count() >= 1, 'FAQ search returned no results');
    await assertBottomContentAboveNav(page, '#faq-list details:last-child');
    await page.locator('[data-nav="shop"]').click();
    assert(await page.locator('[data-page="shop"]').isVisible(), 'shop page is not visible');
    assert(new URL(page.url()).hash === '#shop', `shop route was not written to the URL: ${page.url()}`);
    assert(await page.locator('#shop-list .listing-empty').count() === 0, 'shop page should not show the empty state when a listing is supplied');
    assert(await page.locator('#shop-list .shop-item').count() === 1, 'shop page should render the supplied listing');
    await assertText(page, '#shop-list .shop-item', '¥378');
    await assertText(page, '#shop-list .shop-item', 'iPad 11（A16）');
    await assertText(page, '#shop-list .shop-item', '全套带盒');
    await assertText(page, '#shop-list .shop-item', '支持验货');
    await assertText(page, '#shop-list .shop-item', '已售 100');
    await assertText(page, '#shop-list .shop-item', '2026-09-30');
    await assertText(page, '#shop-list .shop-item', '去小红书主页找商品');
    await assertText(page, '#shop-list .shop-item', '没有独立商品页');
    await page.screenshot({ path: path.join(screenshots, 'shop-live-390.png'), fullPage: true });
    await assertBottomContentAboveNav(page, '#shop-list .shop-item');
    await assertNoHorizontalOverflow(page);
    await page.close();

    const configuredPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await configuredPage.route('**/site-data.js', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: `window.APPLE_PENCIL_SITE_DATA = { profile: { shopName: '白术小铺｜测试资料', xiaohongshuId: 'baizhu-pencil', avatarUrl: '', xiaohongshuUrl: 'https://example.com/xiaohongshu' }, listings: [{ pencil: 'gen1', name: 'Apple Pencil 一代', kind: 'product-thumb-gen1', badge: '已核验', condition: '95 新', note: '已完成发货前功能测试。', price: '¥288', url: 'https://example.com/apple-pencil' }] };`
    }));
    await configuredPage.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });
    await assertText(configuredPage, '#profile-shop-name', '白术小铺｜测试资料');
    await assertText(configuredPage, '#profile-name', '小红书：baizhu-pencil');
    assert(await configuredPage.locator('#copy-xhs-id').isVisible(), 'copy button should render when a Xiaohongshu ID is supplied');
    assert(await configuredPage.locator('#profile-link').isVisible(), 'profile link should render when a verified Xiaohongshu URL is supplied');
    assert((await configuredPage.locator('#profile-link').getAttribute('href')).includes('example.com/xiaohongshu'), 'profile link should retain the verified Xiaohongshu URL');
    await query(configuredPage, '2025', 'digital', 'ipad_a16', 'draw');
    assert(await configuredPage.locator('#primary-shop-button').isVisible(), 'query results should expose a matching verified listing');
    await configuredPage.locator('[data-nav="shop"]').click();
    assert(await configuredPage.locator('#shop-list .shop-item').count() === 1, 'configured shop should render supplied listing data');
    assert((await configuredPage.locator('#shop-list .outline-button').getAttribute('href')).includes('example.com/apple-pencil'), 'configured shop should retain a verified purchase URL');
    await assertNoHorizontalOverflow(configuredPage);
    await configuredPage.close();

    const budgetPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await budgetPage.route('**/site-data.js', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: 'window.APPLE_PENCIL_SITE_DATA = { pencilPrices: { gen1: { used: "¥999" }, "usb-c": { used: "¥100" } }, listings: [] };'
    }));
    await budgetPage.goto('http://127.0.0.1:3012/?year=2022&series=digital&variant=ipad10&purpose=budget&result=1#match', { waitUntil: 'networkidle' });
    await assertText(budgetPage, '#primary-name', 'USB-C 第三代笔');
    await assertText(budgetPage, '#secondary-name', 'Apple Pencil 一代');
    await budgetPage.close();

    const malformedConfigPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const malformedErrors = [];
    malformedConfigPage.on('pageerror', (error) => malformedErrors.push(error.message));
    await malformedConfigPage.route('**/site-data.js', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: 'window.APPLE_PENCIL_SITE_DATA = { listings: [null, { pencil: "gen1", status: "inactive", url: "https://example.com" }] };'
    }));
    await malformedConfigPage.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });
    assert(malformedErrors.length === 0, `malformed listing data should not break app startup: ${malformedErrors.join('; ')}`);
    assert(await malformedConfigPage.locator('#series-select option').count() === 1, 'query flow should initialize with malformed listing data');
    assert(await malformedConfigPage.locator('#shop-list .shop-item').count() === 0, 'inactive listing should stay hidden');
    await malformedConfigPage.close();

    const emptyYearPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await emptyYearPage.goto('http://127.0.0.1:3012/?year=2023&result=1#match', { waitUntil: 'networkidle' });
    await assertText(emptyYearPage, '#result-count', '无新款');
    await assertText(emptyYearPage, '#empty-result-title', '没有新款 iPad');
    assert(!(await emptyYearPage.locator('#result-summary').innerText()).includes('这台 iPad 不支持'), 'empty year should not be described as an unsupported device');
    await emptyYearPage.close();

    const faqJumpPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await faqJumpPage.goto('http://127.0.0.1:3012/', { waitUntil: 'networkidle' });
    await faqJumpPage.locator('#year-select').selectOption('2022');
    await faqJumpPage.locator('#series-select').selectOption('digital');
    await faqJumpPage.locator('#variant-select').selectOption('ipad10');
    await faqJumpPage.locator('[data-purpose="notes"]').click();
    await faqJumpPage.locator('#query-button').click();
    await faqJumpPage.waitForTimeout(350);
    await faqJumpPage.locator('[data-nav="faq"]').click();
    await faqJumpPage.locator('#faq-search').fill('完全找不到');
    assert(await faqJumpPage.locator('#faq-empty').isVisible(), 'FAQ should expose a no-results state');
    await faqJumpPage.locator('[data-nav="match"]').click();
    await faqJumpPage.locator('[data-action="adapter-faq"]').click();
    assert(await faqJumpPage.locator('#faq-search').inputValue() === '', 'targeted FAQ navigation should clear the previous filter');
    assert(await faqJumpPage.locator('#faq-list details:not([hidden])').count() === 8, 'targeted FAQ navigation should restore all questions');
    assert(await faqJumpPage.locator('#faq-list details[open]').count() >= 1, 'targeted FAQ navigation should open the relevant answer');
    await faqJumpPage.close();

    const invalidRoutePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await invalidRoutePage.goto('http://127.0.0.1:3012/?year=2023&result=1#invalid', { waitUntil: 'networkidle' });
    assert(new URL(invalidRoutePage.url()).hash === '#match', 'invalid hash should be canonicalized to #match');
    await invalidRoutePage.close();
  } finally {
    await browser.close();
  }
  assert(failures.length === 0, failures.join('\n'));
  console.log('UI verification passed: responsive layouts, 36 official-compatibility paths, query restoration, empty-year and malformed-config states, budget ordering, avoidance checklist, FAQ search and targeted navigation, live listing state, and safe route handling');
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
