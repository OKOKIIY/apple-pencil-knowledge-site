const iconPaths = {
  sparkles: '<path d="m12 3-1.2 3.2L7.5 7.5l3.3 1.3L12 12l1.2-3.2 3.3-1.3-3.3-1.3L12 3Z"/><path d="m19 13-.7 1.8-1.8.7 1.8.7.7 1.8.7-1.8 1.8-.7-1.8-.7L19 13Z"/><path d="m5 14-.7 1.8-1.8.7 1.8.7.7 1.8.7-1.8 1.8-.7-1.8-.7L5 14Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  pen: '<path d="m14 6 4 4"/><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z"/>',
  heart: '<path d="M20.8 8.9c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 8.8 2.6Z"/>',
  wallet: '<path d="M4 6h14a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V6Z"/><path d="M4 6V5a2 2 0 0 1 2-2h10"/><path d="M16 13h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  share: '<circle cx="18" cy="5" r="2.2"/><circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="19" r="2.2"/><path d="m8 11 7.8-4.5M8 13l7.8 4.5"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.4 2.1-2.4 3.8M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
  'shield-alert': '<path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z"/><path d="M12 8v4M12 15h.01"/>',
  'list-checks': '<path d="m4 6 1.5 1.5L8 5"/><path d="M11 6h9M11 12h9M11 18h9"/><path d="m4 12 1.5 1.5L8 11"/><path d="m4 18 1.5 1.5L8 17"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/>',
  shield: '<path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.4 2.1-2.4 3.8M12 17h.01"/>',
  'shopping-bag': '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  'external-link': '<path d="M14 5h5v5M19 5l-8 8"/><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/>'
};

document.querySelectorAll('[data-icon]').forEach((node) => {
  const name = node.dataset.icon;
  if (iconPaths[name]) {
    node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]}</svg>`;
  }
});

const siteData = window.APPLE_PENCIL_SITE_DATA || {};
const profileData = {
  shopName: '白术小铺｜专研 Apple Pencil',
  xiaohongshuId: '',
  avatarUrl: '',
  xiaohongshuUrl: '',
  socialProof: '',
  ...(siteData.profile || {})
};
const listingData = Array.isArray(siteData.listings) ? siteData.listings : [];
const priceData = siteData.pencilPrices && typeof siteData.pencilPrices === 'object' ? siteData.pencilPrices : {};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value), window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function renderProfile() {
  const shopName = document.querySelector('#profile-shop-name');
  const profileName = document.querySelector('#profile-name');
  const avatar = document.querySelector('#profile-avatar');
  const profileLink = document.querySelector('#profile-link');
  const profileProof = document.querySelector('#profile-proof');
  const copyButton = document.querySelector('#copy-xhs-id');
  const name = String(profileData.shopName || '').trim();
  const accountId = String(profileData.xiaohongshuId || '').trim();
  const socialProof = String(profileData.socialProof || '').trim();
  const avatarUrl = safeUrl(profileData.avatarUrl);
  const xiaohongshuUrl = safeUrl(profileData.xiaohongshuUrl);

  if (name) shopName.textContent = name;
  if (accountId) profileName.textContent = `小红书：${accountId}`;
  if (copyButton) {
    copyButton.hidden = !accountId;
    copyButton.dataset.copyValue = accountId;
    copyButton.setAttribute('aria-label', accountId ? `复制小红书号 ${accountId}` : '复制小红书号');
  }
  if (profileProof) {
    profileProof.hidden = !socialProof;
    if (socialProof) profileProof.textContent = socialProof;
  }
  if (profileLink) {
    profileLink.hidden = !xiaohongshuUrl;
    if (xiaohongshuUrl) profileLink.href = xiaohongshuUrl;
    else profileLink.removeAttribute('href');
  }
  if (!avatarUrl) return;

  avatar.textContent = '';
  const image = document.createElement('img');
  image.src = avatarUrl;
  image.alt = '';
  image.width = 48;
  image.height = 48;
  image.loading = 'lazy';
  avatar.append(image);
}

function renderShop() {
  const list = document.querySelector('#shop-list');
  if (!listingData.length) {
    const xiaohongshuUrl = safeUrl(profileData.xiaohongshuUrl);
    const followAction = xiaohongshuUrl
      ? `<a class="outline-button" href="${escapeHtml(xiaohongshuUrl)}" target="_blank" rel="noreferrer">去小红书看最新信息</a>`
      : '';
    list.innerHTML = `<div class="listing-empty"><strong>当前没有公开在售信息</strong><p>不放来源、成色、价格或链接还没核验清楚的商品。先用兼容查询确认型号，后续更新会放在这里。</p>${followAction}</div>`;
    return;
  }

  const allowedThumbs = new Set(['product-thumb-gen1', 'product-thumb-usbc', 'product-thumb-gen2', 'product-thumb-pro']);
  list.innerHTML = listingData.map((listing) => {
    const thumb = allowedThumbs.has(listing.kind) ? listing.kind : 'product-thumb-gen1';
    const name = escapeHtml(listing.name || 'Apple Pencil');
    const badge = escapeHtml(listing.badge || '已核验信息');
    const condition = escapeHtml(listing.condition || '成色以详情为准');
    const note = escapeHtml(listing.note || '购买前先确认兼容型号。');
    const price = escapeHtml(listing.price || '请看购买页');
    const priceLabel = escapeHtml(listing.priceLabel || '当前在售价');
    const sold = escapeHtml(listing.sold || '');
    const service = escapeHtml(listing.service || '');
    const url = safeUrl(listing.url);
    const actionLabel = escapeHtml(listing.actionLabel || '前往购买链接');
    const action = url
      ? `<a class="outline-button" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${actionLabel}</a>`
      : '<span class="listing-link-pending">购买链接核验中</span>';
    const supporting = [sold, service].filter(Boolean).map((item) => `<span>${item}</span>`).join('');
    return `<article class="shop-item"><div class="shop-thumb ${thumb}" aria-hidden="true"><span></span></div><div class="shop-copy"><div class="shop-meta"><span class="status-chip status-good">${badge}</span><span>${condition}</span></div><h2>${name}</h2><p>${note}</p>${supporting ? `<div class="shop-supporting">${supporting}</div>` : ''}<div class="shop-price"><span>${priceLabel}</span><strong>${price}</strong></div>${action}</div></article>`;
  }).join('');
}

const pencils = {
  'usb-c': {
    name: 'USB-C 第三代笔',
    official: '用户常说“第三代”；正式名称：Apple Pencil（USB-C）',
    pressure: '不支持真实压感',
    storage: '支持磁吸收纳',
    pair: '不支持磁吸配对',
    charge: 'USB-C 数据线直连充电',
    adapter: '无需转接器',
    system: 'iPadOS 17.1.1 或更高版本',
    retail: '',
    used: '',
    kind: 'product-thumb-usbc'
  },
  gen1: {
    name: 'Apple Pencil 一代',
    official: '有压感；连接方式看 iPad 型号',
    pressure: '支持压感',
    storage: '不支持磁吸收纳',
    pair: 'Lightning 配对',
    charge: 'Lightning 直连充电',
    adapter: '无需转接器',
    retail: '¥799',
    used: '',
    kind: 'product-thumb-gen1'
  },
  gen2: {
    name: 'Apple Pencil 二代',
    official: '有压感；磁吸配对和充电',
    pressure: '支持压感',
    storage: '支持磁吸收纳',
    pair: '支持磁吸配对',
    charge: '支持磁吸充电',
    adapter: '无需转接器',
    retail: '',
    used: '',
    kind: 'product-thumb-gen2'
  },
  pro: {
    name: 'Apple Pencil Pro',
    official: '有压感；适合画画和专业功能',
    pressure: '支持压感',
    storage: '支持磁吸收纳',
    pair: '支持磁吸配对',
    charge: '支持磁吸充电',
    adapter: '无需转接器',
    system: 'iPadOS 17.5 或更高版本',
    retail: '',
    used: '',
    kind: 'product-thumb-pro'
  }
};

const model = (label, compatible, primary, options = {}) => ({
  label,
  compatible,
  primary,
  ...options
});

const noPencil = (label) => model(label, [], {});

const one = (key, label, options = {}) => model(label, [key], { notes: key, draw: key, carefree: key, budget: key }, options);
const classicPair = (label, options = {}) => model(label, ['usb-c', 'gen1'], { notes: 'usb-c', draw: 'gen1', carefree: 'usb-c', budget: 'gen1' }, options);
const magneticPair = (label, options = {}) => model(label, ['gen2', 'usb-c'], { notes: 'usb-c', draw: 'gen2', carefree: 'gen2', budget: 'usb-c' }, options);
const proPair = (label, options = {}) => model(label, ['pro', 'usb-c'], { notes: 'usb-c', draw: 'pro', carefree: 'pro', budget: 'usb-c' }, options);

const catalog = {
  '2015': {
    pro: {
      label: 'Pro',
      variants: { pro129_1: '12.9 英寸 · 第 1 代' },
      devices: { pro129_1: one('gen1', '12.9 英寸 · 第 1 代') }
    },
    mini: {
      label: 'mini',
      variants: { mini4: 'mini 4 · 7.9 英寸' },
      devices: { mini4: noPencil('mini 4 · 7.9 英寸') }
    }
  },
  '2016': {
    pro: {
      label: 'Pro',
      variants: { pro97: '9.7 英寸 · 第 1 代' },
      devices: {
        pro97: one('gen1', '9.7 英寸 · 第 1 代')
      }
    }
  },
  '2017': {
    digital: {
      label: '数字版',
      variants: { ipad5: 'iPad · 第 5 代 / 9.7 英寸' },
      devices: { ipad5: noPencil('iPad · 第 5 代 / 9.7 英寸') }
    },
    pro: {
      label: 'Pro',
      variants: { pro105: '10.5 英寸', pro129_2: '12.9 英寸 · 第 2 代' },
      devices: {
        pro105: one('gen1', '10.5 英寸'),
        pro129_2: one('gen1', '12.9 英寸 · 第 2 代')
      }
    }
  },
  '2018': {
    digital: {
      label: '数字版',
      variants: { ipad6: 'iPad · 第 6 代 / 9.7 英寸' },
      devices: { ipad6: one('gen1', 'iPad · 第 6 代 / 9.7 英寸') }
    },
    pro: {
      label: 'Pro',
      variants: { pro11_1: '11 英寸 · 第 1 代', pro129_3: '12.9 英寸 · 第 3 代' },
      devices: {
        pro11_1: magneticPair('11 英寸 · 第 1 代'),
        pro129_3: magneticPair('12.9 英寸 · 第 3 代')
      }
    }
  },
  '2019': {
    digital: {
      label: '数字版',
      variants: { ipad7: 'iPad · 第 7 代 / 10.2 英寸' },
      devices: { ipad7: one('gen1', 'iPad · 第 7 代 / 10.2 英寸') }
    },
    air: {
      label: 'Air',
      variants: { air3: 'Air · 第 3 代 / 10.5 英寸' },
      devices: { air3: one('gen1', 'Air · 第 3 代 / 10.5 英寸') }
    },
    mini: {
      label: 'mini',
      variants: { mini5: 'mini · 第 5 代 / 7.9 英寸' },
      devices: { mini5: one('gen1', 'mini · 第 5 代 / 7.9 英寸') }
    }
  },
  '2020': {
    digital: {
      label: '数字版',
      variants: { ipad8: 'iPad · 第 8 代 / 10.2 英寸' },
      devices: { ipad8: one('gen1', 'iPad · 第 8 代 / 10.2 英寸') }
    },
    air: {
      label: 'Air',
      variants: { air4: 'Air · 第 4 代 / 10.9 英寸' },
      devices: { air4: magneticPair('Air · 第 4 代 / 10.9 英寸') }
    },
    pro: {
      label: 'Pro',
      variants: { pro11_2: '11 英寸 · 第 2 代', pro129_4: '12.9 英寸 · 第 4 代' },
      devices: {
        pro11_2: magneticPair('11 英寸 · 第 2 代'),
        pro129_4: magneticPair('12.9 英寸 · 第 4 代')
      }
    }
  },
  '2021': {
    digital: {
      label: '数字版',
      variants: { ipad9: 'iPad · 第 9 代 / 10.2 英寸' },
      devices: { ipad9: one('gen1', 'iPad · 第 9 代 / 10.2 英寸') }
    },
    pro: {
      label: 'Pro',
      variants: { pro11_3: '11 英寸 · 第 3 代', pro129_5: '12.9 英寸 · 第 5 代' },
      devices: {
        pro11_3: magneticPair('11 英寸 · 第 3 代'),
        pro129_5: magneticPair('12.9 英寸 · 第 5 代')
      }
    },
    mini: {
      label: 'mini',
      variants: { mini6: 'mini · 第 6 代 / 8.3 英寸' },
      devices: { mini6: magneticPair('mini · 第 6 代 / 8.3 英寸') }
    }
  },
  '2022': {
    digital: {
      label: '数字版',
      variants: { ipad10: 'iPad · 第 10 代 / 10.9 英寸' },
      devices: { ipad10: classicPair('iPad · 第 10 代 / 10.9 英寸', { adapter: 'usb-c' }) }
    },
    air: {
      label: 'Air',
      variants: { air5: 'Air · 第 5 代 / 10.9 英寸' },
      devices: { air5: magneticPair('Air · 第 5 代 / 10.9 英寸') }
    },
    pro: {
      label: 'Pro',
      variants: { pro11_4: '11 英寸 · 第 4 代', pro129_6: '12.9 英寸 · 第 6 代' },
      devices: {
        pro11_4: magneticPair('11 英寸 · 第 4 代'),
        pro129_6: magneticPair('12.9 英寸 · 第 6 代')
      }
    }
  },
  '2023': {},
  '2024': {
    air: {
      label: 'Air',
      variants: { air_m2_11: 'M2 / 11 英寸', air_m2_13: 'M2 / 13 英寸' },
      devices: {
        air_m2_11: proPair('M2 / 11 英寸'),
        air_m2_13: proPair('M2 / 13 英寸')
      }
    },
    pro: {
      label: 'Pro',
      variants: { pro_m4_11: 'M4 / 11 英寸', pro_m4_13: 'M4 / 13 英寸' },
      devices: {
        pro_m4_11: proPair('M4 / 11 英寸'),
        pro_m4_13: proPair('M4 / 13 英寸')
      }
    },
    mini: {
      label: 'mini',
      variants: { mini_a17: 'A17 Pro / 8.3 英寸' },
      devices: { mini_a17: proPair('A17 Pro / 8.3 英寸') }
    }
  },
  '2025': {
    digital: {
      label: '数字版',
      variants: { ipad_a16: 'A16 / 11 英寸（iPad 11）' },
      devices: { ipad_a16: classicPair('A16 / 11 英寸（iPad 11）', { adapter: 'usb-c' }) }
    },
    air: {
      label: 'Air',
      variants: { air_m3_11: 'M3 / 11 英寸', air_m3_13: 'M3 / 13 英寸' },
      devices: {
        air_m3_11: proPair('M3 / 11 英寸'),
        air_m3_13: proPair('M3 / 13 英寸')
      }
    },
    pro: {
      label: 'Pro',
      variants: { pro_m5_11: 'M5 / 11 英寸', pro_m5_13: 'M5 / 13 英寸' },
      devices: {
        pro_m5_11: proPair('M5 / 11 英寸'),
        pro_m5_13: proPair('M5 / 13 英寸')
      }
    }
  },
  '2026': {
    air: {
      label: 'Air',
      variants: { air_m4_11: 'M4 / 11 英寸', air_m4_13: 'M4 / 13 英寸' },
      devices: {
        air_m4_11: proPair('M4 / 11 英寸'),
        air_m4_13: proPair('M4 / 13 英寸')
      }
    }
  }
};

const purposeCopy = {
  notes: { note: '适合记笔记 / 批注', summary: '如果你主要记笔记，我会先把 {primary} 放在前面：少一个折腾步骤，拿起来就能写。' },
  draw: { note: '画画优先', summary: '如果你要画画，先看有没有真实压感；能写不等于能画出力度变化。' },
  carefree: { note: '少折腾优先', summary: '你更在意拿起来就用，所以我会优先推荐连接和收纳更省心的那支。' },
  budget: { note: '预算优先', summary: '预算优先可以考虑老型号，但要把转接器、电池和二手状态一起算进来。' }
};

const purposeLabels = {
  notes: '记笔记',
  draw: '画画',
  carefree: '想省心',
  budget: '预算优先'
};

const flowOrder = ['year', 'series', 'variant', 'purpose'];
const state = { purpose: '', page: 'match', hasQueried: false };
const yearSelect = document.querySelector('#year-select');
const seriesSelect = document.querySelector('#series-select');
const variantSelect = document.querySelector('#variant-select');
const resultSection = document.querySelector('#result-section');
const queryButton = document.querySelector('#query-button');
const queryButtonLabel = document.querySelector('#query-button-label');
const queryStatus = document.querySelector('#query-status');
const resultTitle = document.querySelector('#result-title');
const queryPanel = document.querySelector('.query-panel');
const queryFormBody = document.querySelector('#query-form-body');
const queryDescription = document.querySelector('#query-description');
const queryHint = document.querySelector('#query-hint');
const resultBridge = document.querySelector('#result-bridge');
const resultBridgeTitle = document.querySelector('#result-bridge-title');

function isEmptyYear() {
  return Boolean(yearSelect.value) && Object.keys(catalog[yearSelect.value] || {}).length === 0;
}

function fillSeries() {
  const yearData = catalog[yearSelect.value] || {};
  const seriesEntries = Object.entries(yearData);

  if (!yearSelect.value) {
    seriesSelect.disabled = true;
    seriesSelect.innerHTML = '<option value="">请先选择发布年份</option>';
    variantSelect.disabled = true;
    variantSelect.innerHTML = '<option value="">请先选择 iPad 类型</option>';
    return;
  }

  if (!seriesEntries.length) {
    seriesSelect.disabled = true;
    seriesSelect.innerHTML = '<option value="">当年没有新款 iPad</option>';
    variantSelect.disabled = true;
    variantSelect.innerHTML = '<option value="">请选择其他年份</option>';
    return;
  }

  seriesSelect.disabled = false;
  seriesSelect.innerHTML = `<option value="">请选择 iPad 类型</option>${seriesEntries
    .map(([value, series]) => `<option value="${value}">${series.label}</option>`)
    .join('')}`;
  variantSelect.disabled = true;
  variantSelect.innerHTML = '<option value="">请先选择 iPad 类型</option>';
}

function fillVariants() {
  const yearData = catalog[yearSelect.value] || {};
  const series = yearData[seriesSelect.value];

  if (!series) {
    variantSelect.disabled = true;
    variantSelect.innerHTML = '<option value="">请先选择 iPad 类型</option>';
    return;
  }

  variantSelect.disabled = false;
  variantSelect.innerHTML = `<option value="">请选择具体版本</option>${Object.entries(series.variants)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join('')}`;
}

function getActiveStep() {
  if (!yearSelect.value) return 'year';
  if (isEmptyYear()) return 'empty';
  if (!seriesSelect.value) return 'series';
  if (!variantSelect.value) return 'variant';
  if (!state.purpose) return 'purpose';
  return 'complete';
}

function renderPurposeButtons() {
  const purposeLocked = !variantSelect.value || variantSelect.disabled;
  document.querySelectorAll('[data-purpose]').forEach((button) => {
    const selected = button.dataset.purpose === state.purpose;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.disabled = purposeLocked;
  });
}

function updateProgress(activeStep) {
  const complete = {
    year: Boolean(yearSelect.value),
    series: Boolean(seriesSelect.value) && !seriesSelect.disabled,
    variant: Boolean(variantSelect.value) && !variantSelect.disabled,
    purpose: Boolean(state.purpose)
  };
  const stepIndex = flowOrder.indexOf(activeStep);

  document.querySelectorAll('[data-flow-dot]').forEach((node) => {
    const step = node.dataset.flowDot;
    node.classList.toggle('is-complete', complete[step]);
    node.classList.toggle('is-current', step === activeStep);
  });

  const label = activeStep === 'empty'
    ? '年份已确认 / 需更换'
    : activeStep === 'complete'
      ? '已选好 / 共 4 步'
      : `第 ${stepIndex + 1} 步 / 共 4 步`;
  document.querySelector('#flow-step-count').textContent = label;
}

function renderQueryFlow() {
  const activeStep = getActiveStep();
  const copy = {
    year: ['先把 iPad 选准确', '先选机型，再告诉我用途。我会把结论紧接着放在下面。', '先选发布年份；这里指机型发布年份，不是购买年份。'],
    series: ['继续选 iPad 类型', `${yearSelect.value} 年的机型已经准备好。`, '年份已选，继续选数字版、Air、Pro 或 mini。'],
    variant: ['再确认具体版本', '尺寸、芯片或代数会决定兼容关系。', '类型已选，再确认具体尺寸、芯片或代数。'],
    purpose: ['最后选一下用途', '用途只改变推荐顺序，不改变兼容结论。', '还差最后一项；选好后，下面就会给出结论。'],
    complete: ['已选好 iPad', state.hasQueried ? '' : '选好后点击按钮查看结论。', '4 项都选好了，点击下方按钮查看适配结论。'],
    empty: [`${yearSelect.value} 年没有新款 iPad`, '这个年份没有新款 iPad 发布，不需要继续往下选。', '请换一个有 iPad 发布的年份，再继续查询。']
  };
  const [title, description, hint] = copy[activeStep];

  document.querySelector('#query-title').textContent = title;
  if (queryDescription) {
    queryDescription.hidden = state.hasQueried;
    queryDescription.textContent = description;
  }
  if (queryHint) {
    queryHint.hidden = state.hasQueried;
    queryHint.textContent = hint;
  }
  if (queryStatus) {
    queryStatus.hidden = state.hasQueried;
    queryStatus.textContent = hint;
  }
  if (queryFormBody) {
    queryFormBody.inert = false;
    queryFormBody.removeAttribute('aria-hidden');
  }

  const complete = {
    year: Boolean(yearSelect.value),
    series: Boolean(seriesSelect.value) && !seriesSelect.disabled,
    variant: Boolean(variantSelect.value) && !variantSelect.disabled,
    purpose: Boolean(state.purpose)
  };
  const enabled = {
    year: true,
    series: complete.year && !isEmptyYear(),
    variant: complete.series,
    purpose: complete.variant
  };
  const lockedCopy = {
    year: '待选择',
    series: '先选年份',
    variant: '先选类型',
    purpose: '先选版本'
  };

  document.querySelectorAll('[data-step-panel]:not([data-step-panel="empty"])').forEach((panel) => {
    const step = panel.dataset.stepPanel;
    const stateNode = panel.querySelector('[data-step-state]');
    panel.hidden = false;
    panel.classList.toggle('is-current', step === activeStep);
    panel.classList.toggle('is-complete', complete[step]);
    panel.classList.toggle('is-locked', !enabled[step]);
    panel.dataset.flowState = complete[step] ? 'complete' : enabled[step] ? 'ready' : 'locked';
    if (stateNode) stateNode.textContent = complete[step] ? '已选' : enabled[step] ? '请选择' : lockedCopy[step];
  });
  const emptyPanel = document.querySelector('[data-step-panel="empty"]');
  if (emptyPanel) emptyPanel.hidden = activeStep !== 'empty';

  renderPurposeButtons();
  updateProgress(activeStep);

  const canSubmit = activeStep === 'complete' || activeStep === 'empty';
  queryButton.disabled = !canSubmit;
  queryButtonLabel.textContent = activeStep === 'empty'
    ? '查看年份说明'
    : activeStep === 'complete'
      ? state.hasQueried ? '更新适配结论' : '看我能用哪支笔'
      : '还差几步，先继续选择';
  queryButton.dataset.flowReady = String(canSubmit);
}

function chipClass(value) {
  if (value.includes('不支持') || value.includes('无真实')) return 'is-negative';
  if (value.includes('无需转接器')) return 'is-positive';
  if (value.includes('需要转接') || value.includes('通过转接') || value.includes('部分')) return 'is-caution';
  if (value.includes('支持') || value.includes('直连') || value.includes('磁吸充电')) return 'is-positive';
  if (value.includes('转接') || value.includes('Lightning')) return 'is-caution';
  return '';
}

function getPencil(key, device) {
  const pencil = { ...pencils[key], ...(priceData[key] || {}) };
  if (key === 'gen1' && device.adapter === 'usb-c') {
    pencil.official = '有压感；iPad 10/11 需要转接器';
    pencil.pair = '通过转接器配对';
    pencil.charge = 'USB-C 转接配对/充电';
    pencil.adapter = '需要转接器（iPad 10/11）';
  } else if (key === 'gen1') {
    pencil.official = '有压感；这台 iPad 可直接连接';
  }
  return pencil;
}

function renderFacts(pencil) {
  const facts = [
    ['真实压感', pencil.pressure],
    ['磁吸收纳', pencil.storage],
    ['配对方式', pencil.pair],
    ['充电方式', pencil.charge],
    ['转接器', pencil.adapter],
    ...(pencil.system ? [['系统要求', pencil.system]] : [])
  ];
  return facts
    .map(([label, value]) => {
      const tone = chipClass(value);
      return `<div class="fact-tile ${tone}"><span class="fact-label">${escapeHtml(label)}</span><strong class="fact-value">${escapeHtml(value)}</strong></div>`;
    })
    .join('');
}

function renderPrice(selector, value, fallback) {
  document.querySelector(selector).textContent = String(value || '').trim() || fallback;
}

function getListingFor(key) {
  return listingData.find((listing) => listing.pencil === key && Boolean(safeUrl(listing.url))) || null;
}

function hasListingFor(key) {
  return Boolean(getListingFor(key));
}

function renderUsedPrice(key, pencil, valueSelector, labelSelector) {
  const listing = getListingFor(key);
  const label = document.querySelector(labelSelector);
  if (label) label.textContent = listing ? (listing.priceLabel || '在售价') : '二手参考';
  renderPrice(valueSelector, listing?.price || pencil.used, listing ? '以在售页为准' : '暂未提供参考');
}

function setThumbClass(node, pencil) {
  node.className = `product-thumb ${pencil.kind}`;
}

function selectedContext() {
  const year = yearSelect.value;
  const seriesData = catalog[year]?.[seriesSelect.value];
  const seriesLabel = seriesData?.label;
  const variantLabel = seriesData?.variants?.[variantSelect.value];
  const purposeLabel = purposeLabels[state.purpose];
  return [year && `${year} 年`, seriesLabel, variantLabel, purposeLabel].filter(Boolean).join(' · ');
}

function renderResult() {
  const year = yearSelect.value;
  const series = seriesSelect.value;
  const variant = variantSelect.value;
  const seriesData = catalog[year]?.[series];
  const device = seriesData?.devices?.[variant];
  const emptyResult = document.querySelector('#empty-result');
  const primaryCard = document.querySelector('#primary-card');
  const secondaryCard = document.querySelector('#secondary-card');

  if (!state.hasQueried) {
    resultSection.hidden = true;
    primaryCard.hidden = true;
    secondaryCard.hidden = true;
    if (resultBridge) resultBridge.hidden = true;
    return;
  }

  resultSection.hidden = false;
  if (resultBridge) resultBridge.hidden = false;
  if (resultBridgeTitle) resultBridgeTitle.textContent = '结论已生成';

  if (!device || !device.compatible.length) {
    document.querySelector('#result-title').textContent = device?.label || `${year} 年没有新款 iPad`;
    document.querySelector('#result-count').textContent = '不支持';
    document.querySelector('#result-summary').textContent = '这台 iPad 不支持 Apple Pencil，不建议为了写字买第三方平替冒充原装功能。';
    document.querySelector('#empty-result-title').textContent = device?.label
      ? '这台 iPad 不支持 Apple Pencil'
      : `${year} 年没有新款 iPad 可供查询`;
    document.querySelector('#empty-result-copy').textContent = device?.label
      ? '它不是“缺一个转接器”，而是产品本身没有 Apple Pencil 兼容性。'
      : '请选择有 iPad 新款发布的年份，或确认设备的实际上市年份。';
    emptyResult.className = `empty-result ${device?.label ? 'empty-result-danger' : 'empty-result-neutral'}`;
    emptyResult.hidden = false;
    primaryCard.hidden = true;
    secondaryCard.hidden = true;
    resultSection.dataset.resultState = 'empty';
    return;
  }

  const primaryKey = device.primary[state.purpose];
  const secondaryKey = device.compatible.find((key) => key !== primaryKey);
  const primary = getPencil(primaryKey, device);
  const secondary = secondaryKey ? getPencil(secondaryKey, device) : null;
  const deviceLabel = seriesData.variants[variant];

  emptyResult.className = 'empty-result empty-result-neutral';
  emptyResult.hidden = true;
  primaryCard.hidden = false;
  resultSection.dataset.resultState = 'ready';

  document.querySelector('#result-title').textContent = `${year} · ${deviceLabel}`;
  document.querySelector('#result-count').textContent = `能用 ${device.compatible.length} 支`;
  document.querySelector('#result-summary').textContent = purposeCopy[state.purpose].summary.replace('{primary}', primary.name);

  document.querySelector('#primary-note').textContent = purposeCopy[state.purpose].note;
  document.querySelector('#primary-name').textContent = primary.name;
  document.querySelector('#primary-official').textContent = primary.official;
  document.querySelector('#primary-facts').innerHTML = renderFacts(primary);
  document.querySelector('#primary-explain').textContent = explanation(primaryKey, state.purpose, device);
  setThumbClass(document.querySelector('#primary-card .product-thumb'), primary);

  renderPrice('#primary-retail', primary.retail, '以 Apple 当前页面为准');
  renderUsedPrice(primaryKey, primary, '#primary-used', '#primary-used-label');
  document.querySelector('#primary-shop-button').hidden = !hasListingFor(primaryKey);

  if (secondary) {
    secondaryCard.hidden = false;
    document.querySelector('#secondary-note').textContent = secondaryKey === 'gen1' ? '有压感，但多一步' : '另一种取舍';
    document.querySelector('#secondary-name').textContent = secondary.name;
    document.querySelector('#secondary-official').textContent = secondary.official;
    document.querySelector('#secondary-facts').innerHTML = renderFacts(secondary);
    document.querySelector('#secondary-explain').textContent = explanation(secondaryKey, state.purpose, device);
    renderPrice('#secondary-retail', secondary.retail, '以 Apple 当前页面为准');
    renderUsedPrice(secondaryKey, secondary, '#secondary-used', '#secondary-used-label');
    setThumbClass(document.querySelector('#secondary-card .product-thumb'), secondary);
    document.querySelector('#secondary-card [data-action="adapter-faq"]').hidden = !(secondaryKey === 'gen1' && device.adapter === 'usb-c');
    document.querySelector('#secondary-shop-button').hidden = !hasListingFor(secondaryKey);
  } else {
    secondaryCard.hidden = true;
  }
}

function explanation(key, purpose, device) {
  if (key === 'usb-c') {
    return purpose === 'draw'
      ? '它写字很轻松，但没有真实压感。想画出线条粗细变化，就不要只因为价格低而选它。'
      : '它通过 USB-C 数据线配对和充电，支持倾斜，但没有真实压感。日常写字、批注和备课够用。';
  }
  if (key === 'gen1') {
    return device.adapter === 'usb-c'
      ? '它有真实压感，画画更有发挥空间；但 iPad 10/11 需要转接器完成配对和充电，买之前要确认配件齐全。'
      : '它有真实压感，适合画画和手写；接口老一点，但如果你的 iPad 原生支持，日常并不难用。';
  }
  if (key === 'gen2') return '它有压感，磁吸配对和充电也更省心。适合想少折腾、又不想牺牲画画体验的人。';
  return '它把压感、悬停和磁吸交互都放在一起，适合画画或想长期用得舒服的人，但先确认你的 iPad 在支持范围内。';
}

function normalizePage(hash) {
  const page = hash.replace(/^#/, '').split('?')[0];
  return ['match', 'avoid', 'faq', 'shop'].includes(page) ? page : 'match';
}

function syncQueryState() {
  const url = new URL(window.location.href);
  ['year', 'series', 'variant', 'purpose', 'result'].forEach((key) => url.searchParams.delete(key));
  if (state.page === 'match') {
    if (yearSelect.value) url.searchParams.set('year', yearSelect.value);
    if (seriesSelect.value) url.searchParams.set('series', seriesSelect.value);
    if (variantSelect.value) url.searchParams.set('variant', variantSelect.value);
    if (state.purpose) url.searchParams.set('purpose', state.purpose);
    if (state.hasQueried) url.searchParams.set('result', '1');
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function restoreQueryState() {
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || '';
  const series = params.get('series') || '';
  const variant = params.get('variant') || '';
  const purpose = params.get('purpose') || '';

  yearSelect.value = Object.prototype.hasOwnProperty.call(catalog, year) ? year : '';
  fillSeries();
  if (yearSelect.value && catalog[yearSelect.value]?.[series]) {
    seriesSelect.value = series;
    fillVariants();
  }
  if (seriesSelect.value && catalog[yearSelect.value]?.[seriesSelect.value]?.variants?.[variant]) {
    variantSelect.value = variant;
  }

  state.purpose = Object.prototype.hasOwnProperty.call(purposeLabels, purpose) ? purpose : '';
  state.hasQueried = params.get('result') === '1' && Boolean(
    yearSelect.value && (isEmptyYear() || (seriesSelect.value && variantSelect.value && state.purpose))
  );
  renderQueryFlow();
  renderResult();
}

function goTo(page, { writeHistory = true, scrollBehavior = 'smooth' } = {}) {
  state.page = page;
  document.querySelectorAll('.page').forEach((node) => {
    const active = node.dataset.page === page;
    node.hidden = !active;
    node.classList.toggle('page-active', active);
  });
  document.querySelectorAll('.nav-item').forEach((node) => {
    const active = node.dataset.nav === page;
    node.classList.toggle('is-active', active);
    if (active) node.setAttribute('aria-current', 'page');
    else node.removeAttribute('aria-current');
  });
  if (writeHistory && window.location.hash !== `#${page}`) {
    const url = new URL(window.location.href);
    url.hash = `#${page}`;
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  window.scrollTo({ top: 0, behavior: scrollBehavior });
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

async function copyText(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  } catch {
    return false;
  }
}

function pulseStep(step) {
  const panel = document.querySelector(`[data-step-panel="${step}"]`);
  if (!panel) return;
  panel.classList.remove('is-pulsing');
  window.requestAnimationFrame(() => panel.classList.add('is-pulsing'));
}

function guideToNextStep(step, message) {
  if (queryStatus) queryStatus.textContent = message;
  pulseStep(step);
  const panel = document.querySelector(`[data-step-panel="${step}"]`);
  if (!panel) return;
  panel.dataset.justUnlocked = 'true';
  window.setTimeout(() => panel.removeAttribute('data-just-unlocked'), 520);
}

function focusCurrentQueryControl() {
  yearSelect?.focus({ preventScroll: true });
}

yearSelect.addEventListener('change', () => {
  state.hasQueried = false;
  state.purpose = '';
  fillSeries();
  renderQueryFlow();
  renderResult();
  syncQueryState();
  if (!yearSelect.value) {
    guideToNextStep('year', '先选发布年份；这里指机型发布年份，不是购买年份。');
  } else {
    guideToNextStep(isEmptyYear() ? 'empty' : 'series', isEmptyYear() ? '这个年份没有新款 iPad，请换一个年份。' : '年份已选，继续选择 iPad 类型。');
  }
});

seriesSelect.addEventListener('change', () => {
  state.hasQueried = false;
  fillVariants();
  renderQueryFlow();
  renderResult();
  syncQueryState();
  guideToNextStep('variant', '类型已选，继续选择具体版本。');
});

variantSelect.addEventListener('change', () => {
  state.hasQueried = false;
  renderQueryFlow();
  renderResult();
  syncQueryState();
  guideToNextStep('purpose', '版本已选，最后告诉我你主要怎么用。');
});

document.querySelectorAll('[data-purpose]').forEach((button) => {
  button.addEventListener('click', () => {
    state.purpose = button.dataset.purpose;
    state.hasQueried = false;
    renderQueryFlow();
    renderResult();
    syncQueryState();
    guideToNextStep('purpose', '用途已选，点击下方按钮查看适配结论。');
    queryButton.focus({ preventScroll: true });
  });
});

document.querySelector('#query-button').addEventListener('click', () => {
  if (queryButton.disabled) return;
  state.hasQueried = true;
  syncQueryState();
  queryButton.classList.add('is-processing');
  renderQueryFlow();
  renderResult();
  queryButton.setAttribute('aria-busy', 'true');
  resultSection.classList.remove('is-revealing');
  if (resultBridge) resultBridge.classList.remove('is-revealing');
  window.requestAnimationFrame(() => {
    resultSection.classList.add('is-revealing');
    if (resultBridge) resultBridge.classList.add('is-revealing');
    window.setTimeout(() => {
      queryButton.classList.remove('is-processing');
      queryButton.removeAttribute('aria-busy');
      resultTitle?.focus({ preventScroll: true });
    }, 260);
  });
});

document.querySelector('#edit-query-button').addEventListener('click', () => {
  state.hasQueried = false;
  renderQueryFlow();
  renderResult();
  syncQueryState();
  queryPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(focusCurrentQueryControl, 340);
});

document.querySelectorAll('[data-nav]').forEach((link) => link.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goTo(link.dataset.nav);
}));

function restoreRoute() {
  restoreQueryState();
  goTo(normalizePage(window.location.hash), { writeHistory: false, scrollBehavior: 'auto' });
}

window.addEventListener('popstate', restoreRoute);
window.addEventListener('hashchange', restoreRoute);

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    const action = button.dataset.action;
    if (action === 'scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
    if (action === 'share') {
      if (navigator.share) {
        navigator.share({ title: document.title, text: '先查 iPad，再买 Apple Pencil。', url: window.location.href }).catch(() => {});
      } else {
        showToast('可以把这个页面分享给需要买笔的人。');
      }
    }
    if (action === 'shop') goTo('shop');
    if (action === 'copy-xhs-id') {
      const copied = await copyText(button.dataset.copyValue || '');
      showToast(copied ? '小红书号已复制' : '复制失败，请长按账号号复制');
    }
    if (action === 'adapter-faq') {
      goTo('faq');
      const detail = [...document.querySelectorAll('#faq-list details')].find((node) => node.textContent.includes('转接器'));
      if (detail) detail.open = true;
    }
    if (action === 'show-checklist') {
      const checklist = document.querySelector('#receipt-checklist-details');
      checklist.open = true;
      checklist.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

document.querySelector('#faq-search').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('#faq-list details').forEach((detail) => {
    detail.hidden = query && !detail.textContent.toLowerCase().includes(query);
  });
});

yearSelect.innerHTML = `<option value="">请选择发布年份</option>${Object.keys(catalog)
  .sort((a, b) => Number(b) - Number(a))
  .map((year) => `<option value="${year}">${year} 年</option>`)
  .join('')}`;
renderProfile();
renderShop();
restoreQueryState();
const initialPage = normalizePage(window.location.hash);
if (!window.location.hash) {
  const url = new URL(window.location.href);
  url.hash = '#match';
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}
goTo(initialPage, { writeHistory: false, scrollBehavior: 'auto' });
