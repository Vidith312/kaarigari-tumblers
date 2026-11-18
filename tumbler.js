import { createTumblerViewer } from './viewer.js?v=9';

/* ============================================================
   THE COLLECTION
   ============================================================ */
const PERSONALITIES = [
  {
    id: 'utsav',
    name: 'The Utsav',
    badge: 'Festive',
    desc: 'Ivory steel with a hand-painted marigold mandala, made for celebrations big and small.',
    story: 'A cream tumbler hand-painted with a marigold mandala in burnt orange and gold. Every petal is brushed on in the studio, so no two are exactly alike.',
    price: '₹1,799',
    colorHex: '#EDE4D2',
    rimColorHex: '#C98A3E',
    accentColorHex: '#C8772E',
    roughness: 0.58,
    metalness: 0.14,
    image: 'images/utsav.jpg',
    artwork: 'mandala'
  },
  {
    id: 'chill-chyaar',
    name: 'The Chill यार',
    badge: 'Chai break',
    desc: 'Matte black, fat groovy lettering, and full permission to do nothing at all.',
    story: 'A soft-touch matte black tumbler with a chunky “Chill, यार” lockup in chalk white. Built for long chai breaks, slow Sundays and the seat by the window.',
    price: '₹1,799',
    colorHex: '#1D1C1A',
    rimColorHex: '#3A3835',
    accentColorHex: '#F3EFE5',
    roughness: 0.72,
    metalness: 0.22,
    image: 'images/chill-chyaar.jpg',
    artwork: 'chyaar'
  },
  {
    id: 'pooja',
    name: 'The Pooकी',
    badge: 'Sweetheart',
    desc: 'Blush pink with cherries, bows and a little disco shimmer. For the main character.',
    story: 'A blush-pink tumbler with a cherry-red “Pooकी” print, tiny bows, flowers and a disco ball. Sweet, a little dramatic, completely one of a kind.',
    price: '₹1,799',
    colorHex: '#E7A2B1',
    rimColorHex: '#F0C3CE',
    accentColorHex: '#F2C14E',
    roughness: 0.55,
    metalness: 0.12,
    image: 'images/pooja.jpg',
    artwork: 'pooja'
  },
  {
    id: 'fourth',
    name: 'The Fourth',
    badge: 'Coming soon',
    desc: 'A new character is still being hand-painted in the studio. Their portrait arrives shortly.',
    story: 'We are finishing the fourth piece now — same steel, same promise, a brand-new mood. Check back soon to meet them.',
    price: '₹1,799',
    colorHex: '#D8C6AD',
    rimColorHex: '#EFE2CF',
    accentColorHex: '#B85C3E',
    roughness: 0.7,
    metalness: 0.15,
    image: null,
    artwork: 'blank',
    comingSoon: true
  }
];

const byId = function (id) {
  return PERSONALITIES.find(function (p) { return p.id === id; });
};

/* ============================================================
   DOM
   ============================================================ */
const stage = document.getElementById('stage');
const canvas = document.getElementById('tumbler-canvas');
const cardsEl = document.getElementById('cards');
const pickBar = document.getElementById('active-bar');
const pickName = document.getElementById('pick-name');
const pickDesc = document.getElementById('pick-desc');
const pickPrice = document.getElementById('pick-price');
const pickSwatch = document.getElementById('pick-swatch');
const addBtn = document.getElementById('add-to-bag');
const pickAddLabel = document.getElementById('pick-add-label');

const body = document.body;
const bagOpenBtn = document.getElementById('bag-open');
const bagCountEl = document.getElementById('bag-count');
const bagOverlay = document.getElementById('bag-overlay');
const bagCloseBtn = document.getElementById('bag-close');
const bagItemsEl = document.getElementById('bag-items');
const bagEmptyEl = document.getElementById('bag-empty');
const bagFootEl = document.getElementById('bag-foot');
const bagSubtotalEl = document.getElementById('bag-subtotal');
const bagShippingEl = document.getElementById('bag-shipping');
const bagTotalEl = document.getElementById('bag-total');
const goCheckoutBtn = document.getElementById('go-checkout');

const checkout = document.getElementById('checkout');
const checkoutCloseBtn = document.getElementById('checkout-close');
const checkoutBackBtn = document.getElementById('checkout-back');
const checkoutViewerEl = document.getElementById('checkout-viewer');
const checkoutCanvas = document.getElementById('checkout-canvas');
const checkoutNameEl = document.getElementById('checkout-name');
const checkoutMoodEl = document.getElementById('checkout-mood');
const checkoutPriceEl = document.getElementById('checkout-price');
const checkoutSwatchEl = document.getElementById('checkout-swatch');
const checkoutChipsEl = document.getElementById('checkout-chips');
const checkoutSummaryEl = document.getElementById('checkout-summary');
const checkoutForm = document.getElementById('checkout-form');
const checkoutSuccess = document.getElementById('checkout-success');
const successName = document.getElementById('success-name');
const successLine = document.getElementById('success-line');
const successNumber = document.getElementById('success-number');
const placeTotalEl = document.getElementById('place-total');
const viewerFallback = document.getElementById('viewer-fallback');

const checkoutEmail = document.getElementById('checkout-email');
const checkoutFirst = document.getElementById('checkout-first');
const successCloseBtn = document.getElementById('success-close');

const productEl = document.getElementById('product');
const productInfoEl = productEl ? productEl.querySelector('.product__info') : null;
const productCloseBtn = document.getElementById('product-close');
const productViewerEl = document.getElementById('product-viewer');
const productCanvas = document.getElementById('product-canvas');
const productSwatchEl = document.getElementById('product-swatch');
const productMoodEl = document.getElementById('product-mood');
const productNameEl = document.getElementById('product-name');
const productPriceEl = document.getElementById('product-price');
const productDescEl = document.getElementById('product-desc');
const productStoryEl = document.getElementById('product-story');
const productQtyEl = document.getElementById('product-qty');
const productDecBtn = document.getElementById('product-dec');
const productIncBtn = document.getElementById('product-inc');
const productAddBtn = document.getElementById('product-add');
const productAddLabelEl = document.getElementById('product-add-label');
const productTotalEl = document.getElementById('product-total');
const productPhotoEl = document.getElementById('product-photo');
const productTabsEl = document.getElementById('product-tabs');
const productTabPhoto = document.getElementById('product-tab-photo');
const productTabThree = document.getElementById('product-tab-three');
const productStockEl = productEl ? productEl.querySelector('.product__stock') : null;

let activeIndex = 0;
let heroViewer = null;
let checkoutViewer = null;
let productViewer = null;
let productIndex = 0;
let productQty = 1;
let productHideTimer = null;
let productTrigger = null;

/* ============================================================
   HELPERS
   ============================================================ */
function priceValue(p) {
  return Number(String(p.price).replace(/[^0-9.]/g, '')) || 0;
}
function money(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function cartLines() {
  const lines = [];
  cart.forEach(function (qty, id) {
    const p = byId(id);
    if (p) lines.push({ p: p, qty: qty });
  });
  return lines;
}
function subtotalValue() {
  return cartLines().reduce(function (sum, line) {
    return sum + priceValue(line.p) * line.qty;
  }, 0);
}
function cartCount() {
  let count = 0;
  cart.forEach(function (qty) { count += qty; });
  return count;
}
function currentShippingMethod() {
  if (!checkoutForm) return 'standard';
  const checked = checkoutForm.querySelector('input[name="shipping"]:checked');
  return checked ? checked.value : 'standard';
}
function shippingCost(subtotal, method) {
  if (method === 'express') return 249;
  return subtotal >= 1999 ? 0 : 99;
}

/* ============================================================
   COLLECTION UI
   ============================================================ */
function buildCards() {
  if (!cardsEl) return;
  const fragment = document.createDocumentFragment();

  PERSONALITIES.forEach(function (p, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.index = String(index);
    card.style.setProperty('--swatch', p.colorHex);
    card.style.setProperty('--i', String(index));
    if (p.comingSoon) card.classList.add('card--soon');
    card.setAttribute('aria-pressed', String(index === activeIndex));
    card.setAttribute('aria-label', 'View details for ' + p.name + ', ' + p.price);

    card.innerHTML =
      '<span class="card__media">' +
        (p.image
          ? '<img class="card__img" src="' + p.image + '" alt="' + p.name + ' tumbler" loading="lazy" />'
          : '<span class="card__blank" aria-hidden="true"><span>Portrait<br />coming soon</span></span>') +
        '<span class="card__badge">' + p.badge + '</span>' +
      '</span>' +
      '<span class="card__body">' +
        '<span class="card__name">' + p.name + '</span>' +
        '<span class="card__desc">' + p.desc + '</span>' +
      '</span>' +
      '<span class="card__footer">' +
        '<span class="card__price">' + p.price + '</span>' +
        '<span class="card__choose">Details' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span>' +
      '</span>';

    card.addEventListener('focus', function () { selectPersonality(index); });
    card.addEventListener('click', function () {
      selectPersonality(index);
      openProduct(p.id, card);
    });

    fragment.appendChild(card);
  });

  cardsEl.appendChild(fragment);
}

function updateUI(p, index) {
  if (pickName) pickName.textContent = p.name;
  if (pickDesc) pickDesc.textContent = p.desc;
  if (pickPrice) {
    pickPrice.textContent = p.comingSoon ? 'Coming soon' : p.price;
    pickPrice.classList.toggle('is-soon', !!p.comingSoon);
  }
  if (pickAddLabel) pickAddLabel.textContent = p.comingSoon ? 'See details' : 'Add to bag';
  if (addBtn) {
    addBtn.setAttribute('aria-label', p.comingSoon
      ? 'See details for ' + p.name
      : 'Add ' + p.name + ' to your bag');
  }
  if (pickSwatch) {
    if (p.image) {
      pickSwatch.style.backgroundImage = 'url("' + p.image + '")';
      pickSwatch.style.backgroundSize = 'cover';
      pickSwatch.style.backgroundPosition = 'center 42%';
    } else {
      pickSwatch.style.backgroundImage = 'none';
      pickSwatch.style.background = p.colorHex;
    }
  }
  if (pickBar) {
    pickBar.classList.remove('is-changing');
    void pickBar.offsetWidth;
    pickBar.classList.add('is-changing');
  }

  if (cardsEl) {
    cardsEl.querySelectorAll('.card').forEach(function (card, i) {
      const isActive = i === index;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });
  }
}

function updateFallback(p) {
  if (!stage) return;
  stage.style.setProperty('--fallback-body', p.colorHex);
  stage.style.setProperty('--fallback-accent', p.accentColorHex);
}

function selectPersonality(index) {
  const p = PERSONALITIES[index];
  if (!p) return;
  activeIndex = index;
  updateUI(p, index);
  updateFallback(p);
  if (heroViewer) heroViewer.setPersonality(p);
}

/* ============================================================
   BAG
   ============================================================ */
const cart = new Map();
let checkoutItemId = null;
let bagHideTimer = null;
let checkoutHideTimer = null;
let checkoutOpen = false;

function updateCart() {
  const count = cartCount();
  if (bagCountEl) {
    bagCountEl.textContent = String(count);
    bagCountEl.hidden = count === 0;
  }
  if (bagOpenBtn) {
    bagOpenBtn.setAttribute('aria-label', 'Open your bag, ' + count + (count === 1 ? ' item' : ' items'));
  }

  renderBag();
  if (checkoutOpen) {
    renderCheckoutChips();
    syncCheckoutItem();
    updateCheckoutSummary();
  }
}

function renderBag() {
  if (!bagItemsEl) return;
  const lines = cartLines();
  const subtotal = subtotalValue();

  if (!lines.length) {
    if (bagEmptyEl) bagEmptyEl.hidden = false;
    if (bagFootEl) bagFootEl.hidden = true;
    bagItemsEl.innerHTML = '';
    return;
  }

  if (bagEmptyEl) bagEmptyEl.hidden = true;
  if (bagFootEl) bagFootEl.hidden = false;

  bagItemsEl.innerHTML = lines.map(function (line) {
    const p = line.p;
    return '' +
      '<div class="bag-item" data-id="' + p.id + '">' +
        (p.image
          ? '<img class="bag-item__thumb" src="' + p.image + '" alt="" />'
          : '<span class="bag-item__thumb bag-item__thumb--blank" style="background:' + p.colorHex + '" aria-hidden="true"></span>') +
        '<span class="bag-item__info">' +
          '<b>' + p.name + '</b>' +
          '<small>' + p.badge + ' · ' + p.price + '</small>' +
        '</span>' +
        '<span class="qty">' +
          '<button type="button" data-act="dec" aria-label="One fewer ' + p.name + '">−</button>' +
          '<span aria-live="polite">' + line.qty + '</span>' +
          '<button type="button" data-act="inc" aria-label="One more ' + p.name + '">+</button>' +
        '</span>' +
        '<button type="button" class="bag-item__remove" data-act="remove" aria-label="Remove ' + p.name + '">' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>';
  }).join('');

  const shipping = shippingCost(subtotal, 'standard');
  if (bagSubtotalEl) bagSubtotalEl.textContent = money(subtotal);
  if (bagShippingEl) bagShippingEl.textContent = shipping === 0 ? 'Free' : money(shipping);
  if (bagTotalEl) bagTotalEl.textContent = money(subtotal + shipping);
}

function openBag() {
  if (!bagOverlay) return;
  const navLinks = document.getElementById('nav-links');
  const burger = document.getElementById('burger');
  if (navLinks && navLinks.classList.contains('is-open') && burger) burger.click();
  window.clearTimeout(bagHideTimer);
  bagOverlay.hidden = false;
  requestAnimationFrame(function () { bagOverlay.classList.add('is-open'); });
  body.classList.add('modal-open');
  updateCart();
  window.setTimeout(function () {
    if (bagCloseBtn) bagCloseBtn.focus();
  }, 80);
}

function closeBag() {
  if (!bagOverlay) return;
  bagOverlay.classList.remove('is-open');
  body.classList.remove('modal-open');
  window.clearTimeout(bagHideTimer);
  bagHideTimer = window.setTimeout(function () {
    bagOverlay.hidden = true;
  }, 360);
}

function addToBag(id, qty) {
  const p = byId(id);
  if (!p) return;
  if (p.comingSoon) {
    openProduct(p.id, document.getElementById('add-to-bag'));
    return;
  }
  const amount = Math.max(1, Math.min(9, Number(qty) || 1));
  cart.set(id, (cart.get(id) || 0) + amount);
  checkoutItemId = id;
  updateCart();
  openBag();
}

/* ============================================================
   PRODUCT DETAILS
   ============================================================ */
function ensureProductViewer(p) {
  if (productViewer || !productCanvas || !productViewerEl) return;
  productViewer = createTumblerViewer({
    canvas: productCanvas,
    container: productViewerEl,
    personality: p,
    cameraZ: 12.3,
    cameraY: 0.8,
    targetY: 0.2,
    autoRotateSpeed: 0.75,
    mobileInteractive: true,
    spinOnSelect: true
  });
  if (!productViewer) productViewerEl.classList.add('is-fallback');
}

function setProductView(view) {
  const p = PERSONALITIES[productIndex];
  const canPhoto = !!(p && p.image);
  const next = view === 'photo' && canPhoto ? 'photo' : 'three';

  if (productViewerEl) productViewerEl.classList.toggle('is-photo', next === 'photo');
  if (productTabsEl) productTabsEl.hidden = !canPhoto;
  if (productTabPhoto) {
    productTabPhoto.hidden = !canPhoto;
    productTabPhoto.classList.toggle('is-active', next === 'photo');
    productTabPhoto.setAttribute('aria-pressed', String(next === 'photo'));
  }
  if (productTabThree) {
    productTabThree.classList.toggle('is-active', next === 'three');
    productTabThree.setAttribute('aria-pressed', String(next === 'three'));
  }
  if (next === 'three' && productViewer) {
    window.requestAnimationFrame(function () { productViewer.resize(); });
  }
}

function updateProductQty() {
  if (productQtyEl) productQtyEl.textContent = String(productQty);
  if (productDecBtn) productDecBtn.disabled = productQty <= 1;
  if (productIncBtn) productIncBtn.disabled = productQty >= 9;
  const p = PERSONALITIES[productIndex];
  if (p && productTotalEl) productTotalEl.textContent = money(priceValue(p) * productQty);
}

function populateProduct(p, index) {
  productIndex = index;
  productQty = 1;

  if (productNameEl) productNameEl.textContent = p.name;
  if (productPriceEl) productPriceEl.textContent = p.price;
  if (productDescEl) productDescEl.textContent = p.desc;
  if (productStoryEl) productStoryEl.textContent = p.story || '';
  if (productMoodEl) productMoodEl.textContent = p.badge;
  if (productSwatchEl) {
    if (p.image) {
      productSwatchEl.style.backgroundImage = 'url("' + p.image + '")';
      productSwatchEl.style.backgroundSize = 'cover';
      productSwatchEl.style.backgroundPosition = 'center';
    } else {
      productSwatchEl.style.backgroundImage = 'none';
      productSwatchEl.style.background = p.colorHex;
    }
  }
  if (productViewerEl) productViewerEl.style.setProperty('--viewer-color', p.colorHex);

  if (productPhotoEl) {
    if (p.image) {
      productPhotoEl.src = p.image;
      productPhotoEl.alt = p.name + ' tumbler';
    } else {
      productPhotoEl.removeAttribute('src');
      productPhotoEl.alt = '';
    }
  }

  if (productStockEl) {
    productStockEl.innerHTML = '<span aria-hidden="true"></span> ' +
      (p.comingSoon ? 'Portrait coming soon · on the way' : 'In stock · ready to wrap');
    productStockEl.classList.toggle('is-soon', !!p.comingSoon);
  }

  if (productAddBtn) {
    productAddBtn.disabled = !!p.comingSoon;
    productAddBtn.classList.toggle('is-soon', !!p.comingSoon);
  }
  if (productAddLabelEl) productAddLabelEl.textContent = p.comingSoon ? 'Arriving soon' : 'Add to bag';

  updateProductQty();
  ensureProductViewer(p);
  if (productViewer) productViewer.setPersonality(p);
  setProductView('three');
}

function openProduct(id, trigger) {
  const index = PERSONALITIES.findIndex(function (p) { return p.id === id; });
  const p = PERSONALITIES[index < 0 ? 0 : index];
  if (!productEl || !p) return;

  const navLinks = document.getElementById('nav-links');
  const burger = document.getElementById('burger');
  if (navLinks && navLinks.classList.contains('is-open') && burger) burger.click();
  if (bagOverlay && !bagOverlay.hidden) closeBag();

  productTrigger = trigger || document.activeElement;
  window.clearTimeout(productHideTimer);
  productEl.hidden = false;
  if (productInfoEl) productInfoEl.scrollTop = 0;
  requestAnimationFrame(function () { productEl.classList.add('is-open'); });
  body.classList.add('modal-open');

  populateProduct(p, index < 0 ? 0 : index);

  requestAnimationFrame(function () {
    if (productViewer) productViewer.resize();
  });
  window.setTimeout(function () {
    if (productViewer) productViewer.resize();
    if (productCloseBtn) productCloseBtn.focus();
  }, 120);
}

function closeProduct(immediate, restoreFocus) {
  if (!productEl) return;
  productEl.classList.remove('is-open');
  if (!bagOverlay || bagOverlay.hidden) body.classList.remove('modal-open');

  window.clearTimeout(productHideTimer);
  if (immediate) {
    productEl.hidden = true;
  } else {
    productHideTimer = window.setTimeout(function () {
      productEl.hidden = true;
    }, 340);
  }

  if (restoreFocus !== false && productTrigger && typeof productTrigger.focus === 'function') {
    productTrigger.focus();
  }
}

/* ============================================================
   CHECKOUT
   ============================================================ */
function ensureCheckoutViewer() {
  if (checkoutViewer || !checkoutCanvas || !checkoutViewerEl) return;
  const p = byId(checkoutItemId) || cartLines()[0]?.p || PERSONALITIES[0];
  checkoutViewer = createTumblerViewer({
    canvas: checkoutCanvas,
    container: checkoutViewerEl,
    personality: p,
    cameraZ: 12.3,
    cameraY: 0.8,
    targetY: 0.2,
    autoRotateSpeed: 0.8,
    mobileInteractive: true,
    spinOnSelect: true
  });
  if (!checkoutViewer) checkoutViewerEl.classList.add('is-fallback');
}

function syncCheckoutItem() {
  const lines = cartLines();
  if (!lines.length) return;

  if (!checkoutItemId || !cart.has(checkoutItemId)) {
    checkoutItemId = lines[0].p.id;
  }
  const p = byId(checkoutItemId) || lines[0].p;

  if (checkoutNameEl) checkoutNameEl.textContent = p.name;
  if (checkoutMoodEl) checkoutMoodEl.textContent = p.badge + ' · 18/8 steel';
  if (checkoutPriceEl) checkoutPriceEl.textContent = p.price;
  if (checkoutSwatchEl) {
    if (p.image) {
      checkoutSwatchEl.style.backgroundImage = 'url("' + p.image + '")';
      checkoutSwatchEl.style.backgroundSize = 'cover';
      checkoutSwatchEl.style.backgroundPosition = 'center';
    } else {
      checkoutSwatchEl.style.backgroundImage = 'none';
      checkoutSwatchEl.style.background = p.colorHex;
    }
  }
  if (checkoutViewerEl) checkoutViewerEl.style.setProperty('--viewer-color', p.colorHex);
  if (viewerFallback) viewerFallback.style.background = p.colorHex;

  if (checkoutViewer) checkoutViewer.setPersonality(p);

  if (checkoutChipsEl) {
    checkoutChipsEl.querySelectorAll('button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.id === p.id));
    });
  }
}

function renderCheckoutChips() {
  if (!checkoutChipsEl) return;
  const lines = cartLines();
  if (lines.length < 2) {
    checkoutChipsEl.hidden = true;
    checkoutChipsEl.innerHTML = '';
    return;
  }
  checkoutChipsEl.hidden = false;
  checkoutChipsEl.innerHTML = lines.map(function (line) {
    const p = line.p;
    const dot = p.image
      ? '<span style="background-image:url(&quot;' + p.image + '&quot;);background-size:cover;background-position:center"></span>'
      : '<span style="background:' + p.colorHex + '"></span>';
    return '<button type="button" class="viewer-chip" data-id="' + p.id + '" aria-pressed="' +
      String(p.id === checkoutItemId) + '" aria-label="Inspect ' + p.name + ' in 360 degrees">' +
      dot + p.name +
      '</button>';
  }).join('');
}

function updateCheckoutSummary() {
  const subtotal = subtotalValue();
  const method = currentShippingMethod();
  const shipping = shippingCost(subtotal, method);
  const total = subtotal + shipping;

  const standardEl = document.getElementById('ship-standard');
  if (standardEl) standardEl.textContent = subtotal >= 1999 ? 'Free' : '₹99';

  if (checkoutSummaryEl) {
    checkoutSummaryEl.innerHTML =
      '<div class="summary-row"><span>Subtotal</span><span>' + money(subtotal) + '</span></div>' +
      '<div class="summary-row"><span>Shipping</span><span>' + (shipping === 0 ? 'Free' : money(shipping)) + '</span></div>' +
      '<div class="summary-row summary-row--total"><span>Total</span><b>' + money(total) + '</b></div>';
  }
  if (placeTotalEl) placeTotalEl.textContent = money(total);
}

function openCheckout() {
  if (!checkout || !cart.size) return;
  closeBag();

  window.clearTimeout(checkoutHideTimer);
  checkoutOpen = true;
  checkout.hidden = false;
  requestAnimationFrame(function () { checkout.classList.add('is-open'); });
  body.classList.add('modal-open');

  ensureCheckoutViewer();
  if (checkoutForm) {
    checkoutForm.hidden = false;
    checkoutForm.reset();
  }
  if (checkoutBackBtn) checkoutBackBtn.hidden = false;
  if (checkoutSuccess) checkoutSuccess.hidden = true;

  renderCheckoutChips();
  syncCheckoutItem();
  updateCheckoutSummary();
  checkout.scrollTop = 0;

  requestAnimationFrame(function () {
    if (checkoutViewer) checkoutViewer.resize();
  });
  window.setTimeout(function () {
    if (checkoutViewer) checkoutViewer.resize();
    if (checkoutCloseBtn) checkoutCloseBtn.focus();
  }, 120);
}

function closeCheckout() {
  if (!checkout) return;
  checkoutOpen = false;
  checkout.classList.remove('is-open');
  body.classList.remove('modal-open');
  window.clearTimeout(checkoutHideTimer);
  checkoutHideTimer = window.setTimeout(function () {
    checkout.hidden = true;
    if (checkoutForm) checkoutForm.hidden = false;
    if (checkoutSuccess) checkoutSuccess.hidden = true;
  }, 340);
}

/* ============================================================
   EVENTS
   ============================================================ */
if (addBtn) {
  addBtn.addEventListener('click', function () {
    addToBag(PERSONALITIES[activeIndex].id);
  });
}

if (productCloseBtn) productCloseBtn.addEventListener('click', function () { closeProduct(); });

if (productTabsEl) {
  productTabsEl.addEventListener('click', function (event) {
    const btn = event.target.closest('.product__tab');
    if (!btn || btn.hidden) return;
    setProductView(btn.dataset.view);
  });
}

if (productEl) {
  productEl.querySelectorAll('[data-close="product"]').forEach(function (el) {
    el.addEventListener('click', function () { closeProduct(); });
  });
}

if (productDecBtn) {
  productDecBtn.addEventListener('click', function () {
    if (productQty <= 1) return;
    productQty -= 1;
    updateProductQty();
  });
}
if (productIncBtn) {
  productIncBtn.addEventListener('click', function () {
    if (productQty >= 9) return;
    productQty += 1;
    updateProductQty();
  });
}
if (productAddBtn) {
  productAddBtn.addEventListener('click', function () {
    const p = PERSONALITIES[productIndex];
    if (!p) return;
    const qty = productQty;
    closeProduct(true, false);
    addToBag(p.id, qty);
  });
}

if (bagOpenBtn) bagOpenBtn.addEventListener('click', openBag);
if (bagCloseBtn) bagCloseBtn.addEventListener('click', closeBag);

if (bagOverlay) {
  bagOverlay.querySelectorAll('[data-close="bag"]').forEach(function (el) {
    el.addEventListener('click', closeBag);
  });
}

if (bagItemsEl) {
  bagItemsEl.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-act]');
    const item = event.target.closest('.bag-item');
    if (!btn || !item) return;
    const id = item.dataset.id;
    const qty = cart.get(id) || 0;
    const act = btn.dataset.act;

    if (act === 'inc') cart.set(id, qty + 1);
    if (act === 'dec') {
      if (qty <= 1) cart.delete(id);
      else cart.set(id, qty - 1);
    }
    if (act === 'remove') cart.delete(id);

    updateCart();

    // Keep keyboard focus on the same control after the list re-renders.
    window.requestAnimationFrame(function () {
      if (act === 'remove') {
        const nextRemove = bagItemsEl.querySelector('.bag-item [data-act="remove"]');
        if (nextRemove) nextRemove.focus();
        else if (bagCloseBtn) bagCloseBtn.focus();
        return;
      }
      const row = bagItemsEl.querySelector('.bag-item[data-id="' + id + '"]');
      const next = row && row.querySelector('[data-act="' + act + '"]');
      if (next) next.focus();
      else if (bagCloseBtn) bagCloseBtn.focus();
    });
  });
}

if (goCheckoutBtn) goCheckoutBtn.addEventListener('click', openCheckout);
if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckout);

const checkoutHome = document.getElementById('checkout-home');
if (checkoutHome) {
  checkoutHome.addEventListener('click', function (event) {
    event.preventDefault();
    closeCheckout();
  });
}

if (checkoutBackBtn) {
  checkoutBackBtn.addEventListener('click', function () {
    closeCheckout();
    window.setTimeout(openBag, 360);
  });
}

if (checkoutChipsEl) {
  checkoutChipsEl.addEventListener('click', function (event) {
    const btn = event.target.closest('.viewer-chip');
    if (!btn || !btn.dataset.id) return;
    checkoutItemId = btn.dataset.id;
    syncCheckoutItem();
    renderCheckoutChips();
  });
}

if (checkoutForm) {
  checkoutForm.querySelectorAll('input[name="shipping"]').forEach(function (input) {
    input.addEventListener('change', updateCheckoutSummary);
  });

  checkoutForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    const lines = cartLines();
    const firstName = checkoutFirst && checkoutFirst.value.trim() ? checkoutFirst.value.trim() : 'friend';
    const names = lines.map(function (line) { return line.p.name; });
    const orderNumber = '#K-' + String(Math.floor(1000 + Math.random() * 9000));

    if (successName) successName.textContent = firstName;
    if (successLine) {
      successLine.textContent = names.length === 1
        ? 'Your order — ' + names[0] + ' — is on its way'
        : 'Your order of ' + names.length + ' tumblers is on its way';
    }
    if (successNumber) successNumber.textContent = orderNumber;

    checkoutForm.hidden = true;
    if (checkoutBackBtn) checkoutBackBtn.hidden = true;
    if (checkoutSuccess) {
      checkoutSuccess.hidden = false;
      checkout.scrollTop = 0;
    }

    cart.clear();
    updateCart();
    if (bagCountEl) bagCountEl.hidden = true;
  });
}

if (successCloseBtn) {
  successCloseBtn.addEventListener('click', function () {
    closeCheckout();
    window.setTimeout(function () {
      const collection = document.getElementById('collection');
      if (collection) collection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 380);
  });
}

/* ---- keyboard + focus trap ---- */
function activeDialog() {
  if (productEl && !productEl.hidden) return productEl;
  if (checkout && !checkout.hidden) return checkout;
  if (bagOverlay && !bagOverlay.hidden) return bagOverlay;
  return null;
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    if (productEl && !productEl.hidden) {
      closeProduct();
    } else if (checkout && !checkout.hidden) {
      closeCheckout();
    } else if (bagOverlay && !bagOverlay.hidden) {
      closeBag();
    }
    return;
  }

  if (event.key !== 'Tab') return;
  const dialog = activeDialog();
  if (!dialog) return;

  const focusable = Array.prototype.slice.call(
    dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter(function (el) {
    return el.offsetParent !== null && !el.hasAttribute('hidden');
  });
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* ============================================================
   HERO VIEWER + BOOT
   ============================================================ */
function initHeroViewer() {
  if (!stage || !canvas) return;
  heroViewer = createTumblerViewer({
    canvas: canvas,
    container: stage,
    personality: PERSONALITIES[activeIndex],
    cameraZ: 12.5,
    cameraY: 0.8,
    targetY: 0.55,
    autoRotateSpeed: 0.55,
    mobileInteractive: false,
    spinOnSelect: true
  });
  if (!heroViewer) stage.classList.add('is-fallback');
}

buildCards();
updateUI(PERSONALITIES[activeIndex], activeIndex);
updateFallback(PERSONALITIES[activeIndex]);
updateCart();
initHeroViewer();
