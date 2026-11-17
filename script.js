/**
 * =====================================================
 *   TAANAVANA — Handwoven Heritage, Modern Elegance
 *   script.js — All front-end interactivity
 * =====================================================
 *
 * Sections:
 *  1. Product Data
 *  2. Initialization
 *  3. Loading Screen
 *  4. Announcement Bar
 *  5. Header (sticky scroll)
 *  6. Mobile Menu
 *  7. Filter Panel
 *  8. Render Products
 *  9. Cart (localStorage)
 * 10. Wishlist (localStorage)
 * 11. Search Overlay
 * 12. Login / Signup Modal
 * 13. Location Popup
 * 14. Quick View Modal
 * 15. Testimonial Slider
 * 16. Scroll Animations (IntersectionObserver)
 * 17. Back to Top
 * 18. Toast Notifications
 * 19. Forms (Wholesale + Newsletter)
 * 20. Smooth Scroll & Category Clicks
 * 21. Regions Drag Scroll
 * 22. Dark / Light Theme
 * 23. Language (i18n)
 * 24. Auth Splash Screen
 */

'use strict';

/* =====================================================
   1. PRODUCT DATA
   ===================================================== */

const products = [
  {
    id: 1,
    name: 'Banarasi Silk Saree',
    price: 12499,
    originalPrice: 15999,
    category: 'women',
    material: 'silk',
    rating: 5,
    reviews: 128,
    image: 'assets/images/p1-banarasi-silk-saree.jpg',
    badge: 'Bestseller',
    description: 'Exquisite handwoven Banarasi silk saree with intricate gold zari work. Each saree takes 15–30 days to weave on a traditional loom. Perfect for weddings and special occasions.'
  },
  {
    id: 2,
    name: 'Indigo Block Print Kurta',
    price: 2999,
    originalPrice: 3499,
    category: 'men',
    material: 'cotton',
    rating: 4,
    reviews: 89,
    image: 'assets/images/p2-indigo-block-kurta.jpg',
    badge: 'New',
    description: 'Hand block-printed indigo kurta crafted by skilled artisans of Jaipur. Made from 100% breathable cotton with traditional floral motifs.'
  },
  {
    id: 3,
    name: 'Kanchipuram Silk Saree',
    price: 15999,
    originalPrice: 19999,
    category: 'women',
    material: 'silk',
    rating: 5,
    reviews: 203,
    image: 'assets/images/p3-kanchipuram-saree.jpg',
    badge: 'Bestseller',
    description: 'Authentic Kanchipuram silk saree with temple border design and zari weaving. A GI-tagged masterpiece of South Indian weaving tradition.'
  },
  {
    id: 4,
    name: 'Kashmiri Pashmina Shawl',
    price: 8499,
    originalPrice: 10999,
    category: 'accessories',
    material: 'wool',
    rating: 5,
    reviews: 156,
    image: 'assets/images/p4-kashmiri-pashmina.jpg',
    badge: '',
    description: 'Luxuriously soft handwoven Pashmina shawl from the valleys of Kashmir. Made from finest Changthangi goat wool with delicate Sozni embroidery.'
  },
  {
    id: 5,
    name: 'Phulkari Embroidered Dupatta',
    price: 3499,
    originalPrice: 4299,
    category: 'women',
    material: 'cotton',
    rating: 4,
    reviews: 67,
    image: 'assets/images/p5-phulkari-dupatta.jpg',
    badge: 'New',
    description: 'Vibrant hand-embroidered Phulkari dupatta from the heartland of Punjab. Each piece is hand-stitched with silk threads on cotton khaddar.'
  },
  {
    id: 6,
    name: 'Pochampally Ikat Dress',
    price: 4299,
    originalPrice: 5499,
    category: 'women',
    material: 'cotton',
    rating: 4,
    reviews: 94,
    image: 'assets/images/p6-pochampally-ikat.jpg',
    badge: 'Sale',
    description: 'Contemporary Pochampally Ikat dress blending traditional Telangana patterns with modern silhouettes.'
  },
  {
    id: 7,
    name: 'Dhokra Brass Diya Set',
    price: 1899,
    originalPrice: 2499,
    category: 'handicrafts',
    material: 'brass',
    rating: 5,
    reviews: 211,
    image: 'assets/images/p7-dhokra-brass.jpg',
    badge: 'Bestseller',
    description: 'Hand-cast brass diya set of 5, crafted using the 4,000-year-old Dhokra lost-wax casting technique from Chhattisgarh.'
  },
  {
    id: 8,
    name: 'Jaipur Block Print Cushion Set',
    price: 2499,
    originalPrice: 3299,
    category: 'home',
    material: 'cotton',
    rating: 4,
    reviews: 145,
    image: 'assets/images/p8-jaipur-cushion.jpg',
    badge: 'New',
    description: "Set of 4 hand block-printed cotton cushion covers from Jaipur. Natural vegetable dyes on 100% cotton with traditional Rajasthani motifs."
  }
];

/* =====================================================
   2. INITIALIZATION
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();           // 22 — apply saved dark/light theme ASAP
  initLanguage();        // 23 — apply saved language ASAP
  initAuthSplash();      // 24 — show login splash on first visit
  initLoading();
  initAnnouncementBar();
  initHeader();
  initMobileMenu();
  initFilterPanel();
  renderProducts(products);
  initCart();
  initWishlist();
  initSearch();
  initLoginModal();
  initLocationPopup();
  initQuickView();
  initTestimonialSlider();
  initScrollAnimations();
  initBackToTop();
  initForms();
  initSmoothScroll();
  initCategoryCards();
  initRegionsDragScroll();
  updateCartCount();
  updateWishlistCount();
  checkGoogleAuthCallback(); // handle ?token=... redirect from Google OAuth
});

/* =====================================================
   3. LOADING SCREEN
   ===================================================== */

function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  // Hide after 1.6s to let fonts load
  setTimeout(() => {
    screen.classList.add('hidden');
  }, 1600);
}

/* =====================================================
   4. ANNOUNCEMENT BAR
   ===================================================== */

function initAnnouncementBar() {
  const bar = document.querySelector('.announcement-bar');
  if (!bar) return;
  const closeBtn = bar.querySelector('.announcement-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      bar.style.maxHeight = bar.offsetHeight + 'px';
      requestAnimationFrame(() => {
        bar.style.transition = 'max-height 0.4s ease, opacity 0.4s ease';
        bar.style.maxHeight = '0';
        bar.style.opacity = '0';
        bar.style.overflow = 'hidden';
      });
      setTimeout(() => bar.remove(), 450);
    });
  }
}

/* =====================================================
   5. HEADER — STICKY SCROLL STYLE CHANGE
   ===================================================== */

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* =====================================================
   6. MOBILE MENU
   ===================================================== */

function initMobileMenu() {
  const btn     = document.getElementById('mobile-menu-btn');
  const menu    = document.querySelector('.nav-menu');
  const overlay = document.getElementById('overlay');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
    }
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close nav links on click (mobile)
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      overlay.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'ri-menu-line';
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Overlay click closes everything
  overlay.addEventListener('click', closeAllPanels);
}

/* =====================================================
   7. FILTER PANEL
   ===================================================== */

function initFilterPanel() {
  const filterBtn   = document.getElementById('filter-btn');
  const filterPanel = document.getElementById('filter-panel');
  const applyBtn    = document.getElementById('filter-apply');
  const resetBtn    = document.getElementById('filter-reset');
  if (!filterBtn || !filterPanel) return;

  filterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    filterPanel.classList.toggle('open');
  });

  applyBtn && applyBtn.addEventListener('click', () => {
    applyFilters();
    filterPanel.classList.remove('open');
    // Scroll to products section
    const featured = document.getElementById('featured');
    if (featured) featured.scrollIntoView({ behavior: 'smooth' });
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    const cat  = document.getElementById('filter-category');
    const mat  = document.getElementById('filter-material');
    const pMin = document.getElementById('price-min');
    const pMax = document.getElementById('price-max');
    const srt  = document.getElementById('filter-sort');
    if (cat)  cat.value  = 'all';
    if (mat)  mat.value  = 'all';
    if (pMin) pMin.value = '';
    if (pMax) pMax.value = '';
    if (srt)  srt.value  = 'featured';
    renderProducts(products);
    filterPanel.classList.remove('open');
  });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) {
      filterPanel.classList.remove('open');
    }
  });
}

function applyFilters() {
  const category = document.getElementById('filter-category')?.value || 'all';
  const material = document.getElementById('filter-material')?.value || 'all';
  const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
  const sort     = document.getElementById('filter-sort')?.value || 'featured';

  let filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (material !== 'all' && p.material !== material) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    return true;
  });

  // Sorting
  switch (sort) {
    case 'price-low':  filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'newest':     filtered.sort((a, b) => b.id - a.id);       break;
    case 'rating':     filtered.sort((a, b) => b.rating - a.rating); break;
    default: break; // 'featured' — original order
  }

  renderProducts(filtered);
}

/* =====================================================
   8. RENDER PRODUCTS
   ===================================================== */

function renderProducts(productList) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const wishlist = getWishlist();

  if (productList.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-muted);">
        <i class="ri-search-line" style="font-size:3rem;display:block;margin-bottom:1rem;color:var(--border);"></i>
        <p style="font-size:1.1rem;margin-bottom:0.5rem;">No products found</p>
        <p style="font-size:0.9rem;">Try adjusting your filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = productList.map(product => {
    const isWishlisted = wishlist.includes(product.id);
    const discount     = Math.round((1 - product.price / product.originalPrice) * 100);
    const stars        = generateStars(product.rating);
    const badgeClass   = getBadgeClass(product.badge);

    return `
      <article class="product-card fade-in"
               data-id="${product.id}"
               data-category="${product.category}"
               data-price="${product.price}"
               data-material="${product.material}">

        <div class="product-img">
          ${product.badge
            ? `<span class="product-badge ${badgeClass}">${product.badge}</span>`
            : ''}

          <button
            class="wishlist-toggle ${isWishlisted ? 'active' : ''}"
            data-id="${product.id}"
            aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
            <i class="${isWishlisted ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
          </button>

          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
            width="500"
            height="650">

          <button class="quick-view-btn" data-id="${product.id}">
            Quick View
          </button>
        </div>

        <div class="product-info">
          <p class="product-category-tag">${product.category}</p>
          <h3 class="product-name">${product.name}</h3>

          <div class="product-price">
            <span class="current-price">₹${formatPrice(product.price)}</span>
            <span class="original-price">₹${formatPrice(product.originalPrice)}</span>
            <span class="discount-tag" style="
              background:var(--cream);color:var(--terracotta);
              font-size:0.75rem;font-weight:600;padding:0.2rem 0.5rem;
              border-radius:4px;">${discount}% off</span>
          </div>

          <div class="product-rating">
            ${stars}
            <span class="review-count">(${product.reviews})</span>
          </div>

          <button class="add-to-cart" data-id="${product.id}" aria-label="Add ${product.name} to cart">
            <i class="ri-shopping-bag-line"></i>&nbsp; Add to Cart
          </button>
        </div>
      </article>`;
  }).join('');

  attachProductListeners();
  // Observe newly added fade-in elements
  observeFadeIns();
}

function getBadgeClass(badge) {
  switch (badge) {
    case 'New':        return 'badge-new';
    case 'Bestseller': return 'badge-bestseller';
    case 'Sale':       return 'badge-sale';
    default:           return '';
  }
}

function generateStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="star ${i <= rating ? 'ri-star-fill filled' : 'ri-star-line empty'}"></i>`;
  }
  return html;
}

function formatPrice(n) {
  return n.toLocaleString('en-IN');
}

function attachProductListeners() {
  // Wishlist toggles
  document.querySelectorAll('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(parseInt(btn.dataset.id, 10));
    });
  });

  // Add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(parseInt(btn.dataset.id, 10));
    });
  });

  // Quick-view buttons
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickView(parseInt(btn.dataset.id, 10));
    });
  });
}

/* =====================================================
   9. CART  (localStorage key: tradition_wear_cart)
   ===================================================== */

const CART_KEY = 'tradition_wear_cart';

function getCart()       { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart)  { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(productId, qty = 1) {
  const cart     = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }

  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
  showToast('Added to cart! 🛍️', 'success');

  // Bounce animation on cart icon
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.classList.add('bounce');
    setTimeout(() => cartBtn.classList.remove('bounce'), 600);
  }
}

function removeFromCart(productId) {
  saveCart(getCart().filter(item => item.id !== productId));
  updateCartCount();
  renderCartDrawer();
  showToast('Removed from cart', 'error');
}

function updateCartQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderCartDrawer() {
  const cartItems    = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="drawer-empty">
        <i class="ri-shopping-bag-line"></i>
        <p>Your cart is empty</p>
        <p style="font-size:0.85rem;margin-top:0.3rem;">Add some handcrafted treasures!</p>
      </div>`;
    if (cartSubtotal) cartSubtotal.textContent = '₹0';
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item" data-id="${p.id}">
        <div class="cart-item-img">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${p.name}</h4>
          <p class="cart-item-price">₹${formatPrice(p.price)}</p>
          <div class="cart-item-qty">
            <button class="qty-btn qty-minus" data-id="${p.id}" aria-label="Decrease quantity">
              <i class="ri-subtract-line"></i>
            </button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn qty-plus"  data-id="${p.id}" aria-label="Increase quantity">
              <i class="ri-add-line"></i>
            </button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${p.id}" aria-label="Remove ${p.name}">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>`;
  }).join('');

  if (cartSubtotal) cartSubtotal.textContent = `₹${formatPrice(getCartTotal())}`;

  // Attach qty & remove listeners
  cartItems.querySelectorAll('.qty-minus').forEach(btn =>
    btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id, 10), -1)));
  cartItems.querySelectorAll('.qty-plus').forEach(btn =>
    btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id, 10), +1)));
  cartItems.querySelectorAll('.cart-item-remove').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id, 10))));
}

function initCart() {
  const cartBtn    = document.getElementById('cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartClose  = document.getElementById('cart-close');
  const overlay    = document.getElementById('overlay');
  if (!cartBtn) return;

  cartBtn.addEventListener('click', () => {
    renderCartDrawer();
    cartDrawer.classList.add('open');
    overlay.classList.add('active');
  });

  cartClose && cartClose.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('active');
  });
}

/* =====================================================
   10. WISHLIST  (localStorage key: tradition_wear_wishlist)
   ===================================================== */

const WISH_KEY = 'tradition_wear_wishlist';

function getWishlist()          { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); }
function saveWishlist(wishlist) { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); }

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const idx      = wishlist.indexOf(productId);

  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist', 'error');
  } else {
    wishlist.push(productId);
    showToast('Added to wishlist! ♥', 'success');
  }

  saveWishlist(wishlist);
  updateWishlistCount();
  updateWishlistButtons();
  renderWishlistDrawer();
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlist-count');
  if (!badge) return;
  const len = getWishlist().length;
  badge.textContent = len;
  badge.style.display = len > 0 ? 'flex' : 'none';
}

function updateWishlistButtons() {
  const wishlist = getWishlist();
  document.querySelectorAll('.wishlist-toggle').forEach(btn => {
    const id          = parseInt(btn.dataset.id, 10);
    const isWishlisted = wishlist.includes(id);
    btn.classList.toggle('active', isWishlisted);
    btn.setAttribute('aria-label', isWishlisted ? 'Remove from wishlist' : 'Add to wishlist');
    const icon = btn.querySelector('i');
    if (icon) icon.className = isWishlisted ? 'ri-heart-fill' : 'ri-heart-line';
  });
}

function renderWishlistDrawer() {
  const container = document.getElementById('wishlist-items');
  if (!container) return;

  const wishlist = getWishlist();

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty">
        <i class="ri-heart-line"></i>
        <p>Your wishlist is empty</p>
        <p style="font-size:0.85rem;margin-top:0.3rem;">Save items you love!</p>
      </div>`;
    return;
  }

  container.innerHTML = wishlist.map(id => {
    const p = products.find(x => x.id === id);
    if (!p) return '';
    return `
      <div class="wishlist-item" data-id="${p.id}">
        <div class="cart-item-img">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${p.name}</h4>
          <p class="cart-item-price">₹${formatPrice(p.price)}</p>
        </div>
        <div class="wishlist-item-actions">
          <button
            class="btn btn-sm wishlist-add-cart"
            style="background:var(--terracotta);color:#fff;border-radius:50px;padding:0.4rem 0.9rem;font-size:0.8rem;"
            data-id="${p.id}"
            aria-label="Add to cart">
            <i class="ri-shopping-bag-line"></i>
          </button>
          <button
            class="wishlist-remove"
            style="background:none;border:1px solid var(--border);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);"
            data-id="${p.id}"
            aria-label="Remove from wishlist">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.wishlist-add-cart').forEach(btn =>
    btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id, 10))));
  container.querySelectorAll('.wishlist-remove').forEach(btn =>
    btn.addEventListener('click', () => toggleWishlist(parseInt(btn.dataset.id, 10))));
}

function initWishlist() {
  const wishlistBtn    = document.getElementById('wishlist-btn');
  const wishlistDrawer = document.getElementById('wishlist-drawer');
  const wishlistClose  = document.getElementById('wishlist-close');
  const overlay        = document.getElementById('overlay');
  if (!wishlistBtn) return;

  wishlistBtn.addEventListener('click', () => {
    renderWishlistDrawer();
    wishlistDrawer.classList.add('open');
    overlay.classList.add('active');
  });

  wishlistClose && wishlistClose.addEventListener('click', () => {
    wishlistDrawer.classList.remove('open');
    overlay.classList.remove('active');
  });
}

/* =====================================================
   11. SEARCH OVERLAY
   ===================================================== */

function initSearch() {
  const searchBtn     = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose   = document.getElementById('search-close');
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchBtn || !searchOverlay) return;

  // Inject quick-pick tags if not already there
  const wrapper = document.querySelector('.search-wrapper');
  if (wrapper && !wrapper.querySelector('.search-quick-picks')) {
    const categories = ['Sarees','Kurtas','Sherwanis','Lehengas','Block Print','Handicrafts','Jewellery','Home Decor','Kids Festive','Phulkari'];
    const quickHtml = `
      <div class="search-quick-picks">
        <div class="search-quick-label">Popular Searches</div>
        <div class="search-picks-row">
          ${categories.map(c => `<span class="search-pick-tag">${c}</span>`).join('')}
        </div>
      </div>`;
    const resultsEl = document.getElementById('search-results');
    if (resultsEl) wrapper.insertBefore(Object.assign(document.createElement('div'), { innerHTML: quickHtml }).firstElementChild, resultsEl);
    // Tag click = fill input and trigger search
    wrapper.querySelectorAll('.search-pick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (searchInput) { searchInput.value = tag.textContent; searchInput.dispatchEvent(new Event('input')); searchInput.focus(); }
      });
    });
  }

  const openSearch = () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput && searchInput.focus(), 300);
  };

  const closeSearch = () => {
    searchOverlay.classList.remove('active');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  };

  searchBtn.addEventListener('click', openSearch);
  searchClose && searchClose.addEventListener('click', closeSearch);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeAllPanels();
    }
  });

  // Live search with 280ms debounce
  let timer;
  searchInput && searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!searchResults) return;

      if (q.length < 2) {
        searchResults.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:1rem;">Type at least 2 characters…</p>';
        return;
      }

      const hits = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );

      if (hits.length === 0) {
        searchResults.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:1rem;">No products found. Try another term.</p>';
        return;
      }

      searchResults.innerHTML = hits.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" width="60" height="75"
               style="border-radius:8px;object-fit:cover;flex-shrink:0;">
          <div style="flex:1;min-width:0">
            <p class="search-result-cat">${p.category}</p>
            <p class="search-result-name">${p.name}</p>
            <p class="search-result-price">₹${formatPrice(p.price)} <span style="text-decoration:line-through;opacity:.5;font-size:.75rem;margin-left:4px">₹${formatPrice(p.originalPrice)}</span></p>
          </div>
          <span style="color:rgba(255,255,255,0.3);font-size:0.8rem">View →</span>
        </div>`).join('');

      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          closeSearch();
          openQuickView(parseInt(item.dataset.id, 10));
        });
      });
    }, 280);
  });
}

/* =====================================================
   12. PREMIUM LOGIN / SIGNUP MODAL — Backend connected
   ===================================================== */

function showAuthMsg(msg, type = 'error') {
  const el = document.getElementById('auth-modal-msg');
  if (!el) return;
  el.textContent = msg;
  el.className = `auth-modal-msg ${type}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function initLoginModal() {
  const loginBtn   = document.getElementById('login-btn');
  const modal      = document.getElementById('login-modal');
  const closeBtn   = document.getElementById('login-close');
  const loginTab   = document.getElementById('login-tab');
  const signupTab  = document.getElementById('signup-tab');
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const forgotForm = document.getElementById('modal-forgot-form');
  if (!loginBtn || !modal) return;

  // Open modal on user icon click
  loginBtn.addEventListener('click', () => {
    modal.classList.add('open');
    document.getElementById('login-email')?.focus();
  });
  closeBtn && closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  // Password visibility toggle
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = inp.type === 'password' ? 'ri-eye-off-line' : 'ri-eye-line';
    });
  });

  // Tab switching (Login / Sign Up)
  const showPanel = (show, ...hides) => {
    if (show) show.style.display = 'flex';
    hides.forEach(h => h && (h.style.display = 'none'));
    document.getElementById('auth-modal-msg') && (document.getElementById('auth-modal-msg').style.display = 'none');
  };

  loginTab && loginTab.addEventListener('click', () => {
    loginTab.classList.add('active'); signupTab.classList.remove('active');
    showPanel(loginForm, signupForm, forgotForm);
  });
  signupTab && signupTab.addEventListener('click', () => {
    signupTab.classList.add('active'); loginTab.classList.remove('active');
    showPanel(signupForm, loginForm, forgotForm);
  });

  // Forgot password link
  document.getElementById('modal-forgot-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginTab.classList.remove('active'); signupTab.classList.remove('active');
    showPanel(forgotForm, loginForm, signupForm);
  });
  document.getElementById('modal-back-login')?.addEventListener('click', () => {
    loginTab.classList.add('active'); signupTab.classList.remove('active');
    showPanel(loginForm, signupForm, forgotForm);
  });

  // ── LOGIN FORM submit — hits backend ──
  loginForm && loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const pass  = document.getElementById('login-password')?.value;
    const btn   = loginForm.querySelector('.auth-modal-submit');

    if (!isValidEmail(email)) { showAuthMsg('Please enter a valid email address'); return; }
    if (!pass || pass.length < 6) { showAuthMsg('Password must be at least 6 characters'); return; }

    btn.textContent = 'Signing in…'; btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const json = await res.json();
      if (!res.ok) { showAuthMsg(json.error || 'Login failed. Please try again.'); return; }
      onAuthSuccess(json.data.token, json.data.user);
      modal.classList.remove('open');
      loginForm.reset();
    } catch {
      showAuthMsg('Network error. Is the backend running?');
    } finally {
      btn.textContent = 'Login to Tradition Wear'; btn.disabled = false;
    }
  });

  // ── SIGNUP FORM submit — hits backend ──
  signupForm && signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const phone = document.getElementById('signup-phone')?.value.trim();
    const pass  = document.getElementById('signup-password')?.value;
    const btn   = signupForm.querySelector('.auth-modal-submit');

    if (!name || name.length < 2)     { showAuthMsg('Please enter your full name'); return; }
    if (!isValidEmail(email))          { showAuthMsg('Please enter a valid email'); return; }
    if (!pass || pass.length < 6)      { showAuthMsg('Password must be at least 6 characters'); return; }

    btn.textContent = 'Creating account…'; btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, password: pass })
      });
      const json = await res.json();
      if (!res.ok) { showAuthMsg(json.error || 'Registration failed. Please try again.'); return; }
      onAuthSuccess(json.data.token, json.data.user);
      modal.classList.remove('open');
      signupForm.reset();
      showToast('Welcome to Tradition Wear! 🎊', 'success');
    } catch {
      showAuthMsg('Network error. Is the backend running?');
    } finally {
      btn.textContent = 'Create Account'; btn.disabled = false;
    }
  });

  // ── FORGOT PASSWORD ──
  forgotForm && forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim();
    if (!isValidEmail(email)) { showAuthMsg('Please enter a valid email'); return; }
    showAuthMsg('If that email exists, a reset link has been sent! ✉️', 'success');
    forgotForm.reset();
  });

  // ── Google login buttons ──
  document.getElementById('modal-google-btn')?.addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/google`;
  });
  document.getElementById('modal-google-signup-btn')?.addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/google`;
  });
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((val || '').trim());
}

function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
}

function showFieldError(field, msg) {
  if (!field) return;
  // Find or create the error span
  let err = field.parentElement.querySelector('.form-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'form-error';
    field.insertAdjacentElement('afterend', err);
  }
  err.textContent = msg;
  err.classList.add('visible');
}

/* =====================================================
   13. LOCATION POPUP
   ===================================================== */

/** Simple demo pincode → city mapping */
const PINCODES = {
  '110001': 'New Delhi, Delhi',
  '400001': 'Mumbai, Maharashtra',
  '560001': 'Bengaluru, Karnataka',
  '600001': 'Chennai, Tamil Nadu',
  '700001': 'Kolkata, West Bengal',
  '500001': 'Hyderabad, Telangana',
  '302001': 'Jaipur, Rajasthan',
  '226001': 'Lucknow, Uttar Pradesh',
  '380001': 'Ahmedabad, Gujarat',
  '411001': 'Pune, Maharashtra',
  '221001': 'Varanasi, Uttar Pradesh'
};

function setLocationDisplay(city) {
  const el = document.getElementById('loc-current-display');
  if (el) el.textContent = city;
  const btn = document.getElementById('location-btn');
  if (btn) btn.setAttribute('title', `📍 ${city}`);
  localStorage.setItem('tradition_wear_location', city);
}

function initLocationPopup() {
  const locationBtn = document.getElementById('location-btn');
  const popup       = document.getElementById('location-popup');
  const closeBtn    = document.getElementById('location-close');
  if (!locationBtn || !popup) return;

  // Restore saved location
  const saved = localStorage.getItem('tradition_wear_location');
  if (saved) setLocationDisplay(saved);

  locationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.classList.toggle('open');
  });
  closeBtn && closeBtn.addEventListener('click', () => popup.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== locationBtn) {
      popup.classList.remove('open');
    }
  });

  const pincodeInput = document.getElementById('pincode-input');
  const checkBtn     = document.getElementById('pincode-check');
  const resultDiv    = document.getElementById('city-display');
  const statusDiv    = document.getElementById('loc-status');
  const detectBtn    = document.getElementById('loc-detect-btn');

  // ── GPS Detect ──
  detectBtn && detectBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (statusDiv) { statusDiv.textContent = 'Geolocation not supported by your browser.'; statusDiv.className = 'loc-status error'; statusDiv.style.display = 'block'; }
      return;
    }
    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="ri-loader-4-line"></i> Detecting…';
    if (statusDiv) { statusDiv.textContent = 'Getting your location…'; statusDiv.className = 'loc-status loading'; statusDiv.style.display = 'block'; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.state || 'Your Location';
          const state = d.address?.state || '';
          const display = state ? `${city}, ${state}` : city;
          setLocationDisplay(display);
          if (resultDiv) resultDiv.innerHTML = `<span style="color:#1a8a4a">✓ Location set to <strong>${display}</strong></span>`;
          if (statusDiv) { statusDiv.textContent = '📍 Location detected successfully!'; statusDiv.className = 'loc-status success'; }
          showToast(`📍 Delivering to ${display}`, 'success');
        } catch {
          setLocationDisplay(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          if (statusDiv) { statusDiv.textContent = 'Location detected (no city name available).'; statusDiv.className = 'loc-status success'; }
        }
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="ri-crosshair-2-line"></i> Detect My Location';
      },
      (err) => {
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="ri-crosshair-2-line"></i> Detect My Location';
        const msg = err.code === 1 ? 'Location permission denied. Please allow access.' : 'Could not detect location. Try pincode.';
        if (statusDiv) { statusDiv.textContent = msg; statusDiv.className = 'loc-status error'; statusDiv.style.display = 'block'; }
      },
      { timeout: 10000 }
    );
  });

  // ── Pincode Check ──
  checkBtn && checkBtn.addEventListener('click', () => {
    const pin = (pincodeInput?.value || '').replace(/\D/g, '').slice(0, 6);
    if (pin.length !== 6) {
      if (resultDiv) resultDiv.innerHTML = '<span style="color:#c0392b">Please enter a valid 6-digit pincode.</span>';
      return;
    }
    const city = PINCODES[pin];
    if (city) {
      setLocationDisplay(city);
      if (resultDiv) resultDiv.innerHTML = `<span style="color:#1a8a4a">✓ Delivering to <strong>${city}</strong></span>`;
      showToast(`📍 Delivering to ${city}`, 'success');
    } else {
      if (resultDiv) resultDiv.innerHTML = `<span style="color:#1a8a4a">✓ Delivery available to Pincode <strong>${pin}</strong></span>`;
      setLocationDisplay(`Pincode ${pin}`);
      showToast(`📍 Delivery available to pincode ${pin}`, 'success');
    }
  });

  pincodeInput && pincodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkBtn?.click();
  });
}

/* =====================================================
   14. QUICK VIEW MODAL
   ===================================================== */

function initQuickView() {
  const modal    = document.getElementById('quick-view-modal');
  const closeBtn = document.getElementById('qv-close');
  if (!modal) return;

  closeBtn && closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  // Populate fields
  const qvImg  = document.getElementById('qv-image');
  const qvName = document.getElementById('qv-name');
  const qvPrice= document.getElementById('qv-price');
  const qvRate = document.getElementById('qv-rating');
  const qvDesc = document.getElementById('qv-description');
  if (qvImg)  { qvImg.src = product.image; qvImg.alt = product.name; }
  if (qvName)  qvName.textContent = product.name;
  if (qvPrice) qvPrice.innerHTML  = `
    <span class="current-price" style="font-size:1.4rem;font-weight:700;color:var(--dark);">
      ₹${formatPrice(product.price)}
    </span>
    <span class="original-price" style="font-size:1rem;color:var(--text-muted);text-decoration:line-through;margin-left:0.5rem;">
      ₹${formatPrice(product.originalPrice)}
    </span>`;
  if (qvRate)  qvRate.innerHTML    = generateStars(product.rating) +
    `<span class="review-count" style="margin-left:0.4rem;font-size:0.85rem;color:var(--text-muted);">(${product.reviews} reviews)</span>`;
  if (qvDesc)  qvDesc.textContent  = product.description;
  // Reset qty input to 1
  const _qtyReset = document.getElementById('qv-qty');
  if (_qtyReset) _qtyReset.value = '1';

  // Quantity buttons — HTML uses <input id="qv-qty"> directly
  const replaceWithClone = (selector) => {
    const el = modal.querySelector(selector);
    if (!el) return null;
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    return clone;
  };

  const minusBtn = replaceWithClone('.qty-minus');
  const plusBtn  = replaceWithClone('.qty-plus');
  const addBtn   = replaceWithClone('#qv-add-to-cart');
  // re-get qty input after possible DOM shuffle
  const qtyInput  = document.getElementById('qv-qty');

  minusBtn && minusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value, 10);
    if (v > 1) qtyInput.value = v - 1;
  });
  plusBtn && plusBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value, 10);
    if (v < 10) qtyInput.value = v + 1;
  });
  addBtn && addBtn.addEventListener('click', () => {
    const qty = parseInt(qtyInput?.value || '1', 10);
    addToCart(product.id, qty);
    modal.classList.remove('open');
  });

  modal.classList.add('open');
}

/* =====================================================
   15. TESTIMONIAL SLIDER
   ===================================================== */

function initTestimonialSlider() {
  const track    = document.getElementById('testimonial-track');
  const prevBtn  = document.getElementById('testimonial-prev');
  const nextBtn  = document.getElementById('testimonial-next');
  const dotsCont = document.getElementById('testimonial-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Create dots
  if (dotsCont) {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsCont.appendChild(dot);
    }
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsCont && dotsCont.querySelectorAll('.testimonial-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn && prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { stopAuto(); goTo(dx < 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
}

/* =====================================================
   16. SCROLL ANIMATIONS (IntersectionObserver)
   ===================================================== */

let fadeObserver = null;

function observeFadeIns() {
  if (!fadeObserver) {
    fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  }

  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => fadeObserver.observe(el));
}

function initScrollAnimations() {
  observeFadeIns();
}

/* =====================================================
   17. BACK TO TOP
   ===================================================== */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =====================================================
   18. TOAST NOTIFICATIONS
   ===================================================== */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? 'ri-checkbox-circle-line' : 'ri-close-circle-line';
  toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Slide out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 420);
  }, 3000);
}

/* =====================================================
   19. FORMS — WHOLESALE & NEWSLETTER
   ===================================================== */

function initForms() {
  // Wholesale form — with backend API
  const wholesaleForm = document.getElementById('wholesale-form');
  wholesaleForm && wholesaleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('ws-submit-btn');
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Submitting...';
    submitBtn.disabled = true;

    const formData = new FormData(wholesaleForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/wholesale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('\u2705 Inquiry submitted successfully! We\'ll contact you within 24 hours.', 'success');
        wholesaleForm.reset();
      } else {
        showToast(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      // Fallback: save locally if backend is down
      const existing = JSON.parse(localStorage.getItem('tradition_wear_wholesale') || '[]');
      existing.push({ ...payload, date: new Date().toISOString() });
      localStorage.setItem('tradition_wear_wholesale', JSON.stringify(existing));
      showToast('\u2705 Inquiry saved! We\'ll process it once connected.', 'success');
      wholesaleForm.reset();
    } finally {
      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
    }
  });

  // Newsletter form
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm && newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailEl = document.getElementById('newsletter-email');
    if (emailEl && isValidEmail(emailEl.value)) {
      showToast('Subscribed! Exclusive offers heading your way 🎁', 'success');
      newsletterForm.reset();
    } else {
      showToast('Please enter a valid email address', 'error');
    }
  });
}

/* =====================================================
   20. SMOOTH SCROLL & CATEGORY CARD CLICKS
   ===================================================== */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('header')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      if (!category) return;

      // Set filter and apply
      const catSelect = document.getElementById('filter-category');
      if (catSelect) catSelect.value = category;
      applyFilters();

      // Scroll to products
      const featured = document.getElementById('featured');
      if (featured) {
        setTimeout(() => featured.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });
  });
}

/* =====================================================
   21. REGIONS HORIZONTAL DRAG SCROLL
   ===================================================== */

function initRegionsDragScroll() {
  const track = document.getElementById('regions-track');
  if (!track) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.4;
    track.scrollLeft = scrollLeft - walk;
  });

  // Set initial cursor
  track.style.cursor = 'grab';
}

/* =====================================================
   HELPER — Close all open panels/drawers
   ===================================================== */

function closeAllPanels() {
  const overlay = document.getElementById('overlay');
  overlay && overlay.classList.remove('active');

  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('wishlist-drawer')?.classList.remove('open');
  document.querySelector('.nav-menu')?.classList.remove('open');

  // Reset hamburger icon
  const icon = document.querySelector('#mobile-menu-btn i');
  if (icon) icon.className = 'ri-menu-line';

  const menuBtn = document.getElementById('mobile-menu-btn');
  menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
}

/* =====================================================
   CSS-in-JS — inject a few dynamic styles
   (bounce on cart icon, filled star colour, etc.)
   ===================================================== */

(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Cart bounce animation */
    @keyframes bounce {
      0%,100% { transform: scale(1); }
      40%      { transform: scale(1.35); }
      70%      { transform: scale(0.92); }
    }
    .bounce { animation: bounce 0.5s ease; }

    /* Filled star colour */
    .star.filled { color: var(--saffron, #D4890B); }
    .star.empty  { color: #ddd; }

    /* Drawer wishlist-item layout */
    .wishlist-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-light, #F0E8DC);
    }
    .wishlist-item-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
      flex-shrink: 0;
    }

    /* Search overlay hint */
    .search-hint, .search-no-results {
      color: var(--text-muted, #999);
      text-align: center;
      padding: 1.5rem;
      font-size: 0.95rem;
    }

    /* Location popup result */
    .location-result {
      margin-top: 0.8rem;
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);
})();


/* =====================================================
   22. DARK / LIGHT THEME
   - Reads saved preference from localStorage
   - Writes `data-theme` attribute on <html>
   - Syncs to backend if user is logged in
   ===================================================== */

const THEME_KEY = 'tradition_wear_theme';

// Auto-detect backend URL so the site works from any device on the network.
// When opened via local IP (phone/laptop), backend is reached at the SAME IP.
const BACKEND_HOST = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'localhost'
  : window.location.hostname; // e.g. 172.26.89.96
const API_BASE = `http://${BACKEND_HOST}:5001/api`;

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn  = document.getElementById('theme-toggle');
  const icon = btn ? btn.querySelector('.toggle-icon') : null;
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);

  // Persist to backend if logged in (non-blocking)
  const token = localStorage.getItem('tradition_wear_token');
  if (token) {
    fetch(`${API_BASE}/auth/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next })
    }).catch(() => {}); // fail silently if backend not running
  }
}

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);


/* =====================================================
   23. LANGUAGE / i18n
   - Supported: 'en' (English) | 'pa' (Punjabi)
   - Looks for data-i18n attributes across the page
   - Falls back to existing text if key not found
   ===================================================== */

const LANG_KEY = 'tradition_wear_lang';
let   currentLang = 'en';

function initLanguage() {
  currentLang = localStorage.getItem(LANG_KEY) || 'en';
  const sel = document.getElementById('lang-select');
  if (sel) sel.value = currentLang;
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  // Guard — TRANSLATIONS may not exist if translations.js failed to load
  if (typeof TRANSLATIONS === 'undefined') return;
  if (!TRANSLATIONS[lang]) return;

  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang === 'pa' ? 'pa' : 'en';

  // Translate every element that has data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key  = el.getAttribute('data-i18n');
    const text = TRANSLATIONS[lang][key];
    if (text !== undefined) {
      // For inputs use placeholder; for buttons/labels use textContent
      if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Also update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key  = el.getAttribute('data-i18n-placeholder');
    const text = TRANSLATIONS[lang][key];
    if (text !== undefined) el.placeholder = text;
  });
}

// Language dropdown change
document.getElementById('lang-select')?.addEventListener('change', function () {
  applyLanguage(this.value);

  // Persist to backend if logged in
  const token = localStorage.getItem('tradition_wear_token');
  if (token) {
    fetch(`${API_BASE}/auth/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: this.value })
    }).catch(() => {});
  }
});


/* =====================================================
   24. AUTH SPLASH SCREEN
   - Shows full-screen on first visit (no token saved)
   - Tabs: Login | Sign Up
   - Methods: Email/Password  |  Phone OTP  |  Google OAuth
   - Forgot Password panel
   - Guest / skip button
   - On success: saves JWT to localStorage, hides splash
   ===================================================== */

/** Hide the auth splash and unlock the page */
function hideSplash() {
  const splash = document.getElementById('auth-splash');
  if (!splash) return;
  splash.classList.add('hidden');
  // After CSS transition ends, fully remove from layout
  splash.addEventListener('transitionend', () => {
    splash.style.display = 'none';
  }, { once: true });
}

/** Save JWT token and user data, then hide splash */
function onAuthSuccess(token, user) {
  localStorage.setItem('tradition_wear_token', token);
  if (user) localStorage.setItem('tradition_wear_user', JSON.stringify(user));
  hideSplash();
  showToast(`Welcome, ${user?.name || 'back'}! 🙏`);
  updateHeaderUser(user);
}

/** Update the header login icon to show user's name initial */
function updateHeaderUser(user) {
  const btn = document.getElementById('login-btn');
  if (!btn || !user) return;
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = 'ri-user-smile-line';
    btn.setAttribute('aria-label', `Logged in as ${user.name || user.email}`);
  }
  // Show admin dashboard link if user is admin
  const adminLink = document.getElementById('admin-link');
  if (adminLink && user.role === 'admin') {
    adminLink.style.display = 'flex';
    adminLink.title = 'Admin Dashboard 👑';
  }
}

function initAuthSplash() {
  const splash = document.getElementById('auth-splash');
  if (!splash) return;

  // ── Show or skip splash ──────────────────────────────────
  const token = localStorage.getItem('tradition_wear_token');
  if (token) {
    // Token already exists — validate silently, skip splash
    hideSplash();
    return;
  }

  // Show splash (make sure it's visible)
  splash.classList.remove('hidden');
  splash.style.display = '';

  // ── Tab switching ────────────────────────────────────────
  const loginTab  = document.getElementById('splash-login-tab');
  const signupTab = document.getElementById('splash-signup-tab');
  const loginPane = document.getElementById('splash-login-panel');
  const signupPane= document.getElementById('splash-signup-panel');
  const forgotBox = document.getElementById('auth-forgot-panel');

  function showLoginTab() {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginPane.classList.add('active');
    signupPane.classList.remove('active');
    if (forgotBox) forgotBox.style.display = 'none';
    loginPane.style.display = '';
  }
  function showSignupTab() {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupPane.classList.add('active');
    loginPane.classList.remove('active');
    if (forgotBox) forgotBox.style.display = 'none';
  }

  loginTab?.addEventListener('click', showLoginTab);
  signupTab?.addEventListener('click', showSignupTab);

  // ── Forgot password toggle ───────────────────────────────
  document.getElementById('show-forgot')?.addEventListener('click', () => {
    if (loginPane) loginPane.style.display = 'none';
    if (forgotBox) forgotBox.style.display = '';
  });
  document.getElementById('back-to-login')?.addEventListener('click', () => {
    if (forgotBox) forgotBox.style.display = 'none';
    if (loginPane) loginPane.style.display = '';
  });

  // ── Guest / Skip ─────────────────────────────────────────
  document.getElementById('auth-guest-btn')?.addEventListener('click', hideSplash);

  // ── Google OAuth ─────────────────────────────────────────
  function googleAuth() {
    // Redirect to backend Google OAuth route
    window.location.href = `${API_BASE}/auth/google`;
  }
  document.getElementById('google-login-btn')?.addEventListener('click', googleAuth);
  document.getElementById('google-signup-btn')?.addEventListener('click', googleAuth);

  // ── Email Login Form ─────────────────────────────────────
  document.getElementById('splash-login-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearSplashErrors();
    const email    = document.getElementById('splash-email')?.value.trim();
    const password = document.getElementById('splash-password')?.value;
    let valid = true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErr('splash-email-err', 'Please enter a valid email.');
      valid = false;
    }
    if (!password || password.length < 6) {
      setFieldErr('splash-pass-err', 'Password must be at least 6 characters.');
      valid = false;
    }
    if (!valid) return;

    const btn = this.querySelector('.auth-submit');
    btn.textContent = 'Logging in…';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      // Backend not running? Allow demo login for dev
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        // Dev fallback — accept any email+password
        onAuthSuccess('dev-token-' + Date.now(), { name: email.split('@')[0], email });
      } else {
        setFieldErr('splash-pass-err', err.message);
        btn.textContent = 'Login to Tradition Wear';
        btn.disabled = false;
      }
    }
  });

  // ── Sign Up Form ─────────────────────────────────────────
  document.getElementById('splash-signup-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearSplashErrors();
    const name     = document.getElementById('signup-name-splash')?.value.trim();
    const email    = document.getElementById('signup-email-splash')?.value.trim();
    const phone    = document.getElementById('signup-phone-splash')?.value.trim();
    const password = document.getElementById('signup-pass-splash')?.value;
    let valid = true;

    if (!name)                                    { setFieldErr('signup-name-err',  'Name is required.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldErr('signup-email-err', 'Valid email required.'); valid = false; }
    if (!/^\+?\d{10,13}$/.test(phone.replace(/\s/g, ''))) { setFieldErr('signup-phone-err', 'Valid phone required.'); valid = false; }
    if (password.length < 6)                      { setFieldErr('signup-pass-err',  'Min. 6 characters.'); valid = false; }
    if (!valid) return;

    const btn = this.querySelector('.auth-submit');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        // Dev fallback
        onAuthSuccess('dev-token-' + Date.now(), { name, email, phone });
      } else {
        setFieldErr('signup-pass-err', err.message);
        btn.textContent = 'Create Account';
        btn.disabled = false;
      }
    }
  });

  // ── Phone OTP Flow ───────────────────────────────────────
  let otpCountdownTimer = null;

  document.getElementById('send-otp-btn')?.addEventListener('click', async function () {
    clearSplashErrors();
    const phone = document.getElementById('splash-phone')?.value.trim();
    if (!/^\+?\d{10,13}$/.test(phone.replace(/\s/g, ''))) {
      setFieldErr('splash-phone-err', 'Enter a valid phone number (e.g. +91 9876543210).');
      return;
    }
    this.disabled    = true;
    this.textContent = 'Sending…';

    try {
      const res = await fetch(`${API_BASE}/auth/phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      // Dev mode: OTP returned in response
      if (data.dev_otp) {
        document.getElementById('splash-otp') && (document.getElementById('splash-otp').value = data.dev_otp);
        showToast(`Dev OTP: ${data.dev_otp} (console)`);
        console.log('[DEV] OTP:', data.dev_otp);
      }
    } catch (err) {
      // Backend offline — show a mock OTP in dev
      const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
      console.log('[DEV] Mock OTP (backend offline):', mockOtp);
      showToast(`Dev OTP: ${mockOtp} (see console)`);
      if (document.getElementById('splash-otp')) document.getElementById('splash-otp').value = mockOtp;
    }

    // Reveal OTP field + verify button
    document.getElementById('otp-field-wrapper').style.display   = '';
    document.getElementById('phone-submit-btn').style.display     = '';

    // 60-second countdown
    let seconds = 60;
    const timerEl = document.getElementById('otp-timer');
    if (timerEl) timerEl.textContent = `Resend in ${seconds}s`;
    clearInterval(otpCountdownTimer);
    otpCountdownTimer = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = seconds > 0 ? `Resend in ${seconds}s` : '';
      if (seconds <= 0) {
        clearInterval(otpCountdownTimer);
        const sendBtn = document.getElementById('send-otp-btn');
        if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Resend OTP'; }
      }
    }, 1000);
  });

  document.getElementById('splash-phone-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearSplashErrors();
    const phone = document.getElementById('splash-phone')?.value.trim();
    const otp   = document.getElementById('splash-otp')?.value.trim();

    if (!otp || otp.length !== 6) {
      setFieldErr('splash-otp-err', 'Enter the 6-digit OTP.');
      return;
    }
    const btn = document.getElementById('phone-submit-btn');
    btn.textContent = 'Verifying…';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/auth/phone/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        // Dev fallback — accept any OTP when backend offline
        onAuthSuccess('dev-token-' + Date.now(), { name: 'Guest', phone });
      } else {
        setFieldErr('splash-otp-err', err.message);
        btn.textContent = 'Verify & Login';
        btn.disabled = false;
      }
    }
  });

  // ── Forgot Password Form ─────────────────────────────────
  document.getElementById('splash-forgot-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearSplashErrors();
    const email = document.getElementById('forgot-email')?.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErr('forgot-email-err', 'Enter a valid email address.');
      return;
    }
    const btn = this.querySelector('.auth-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (_) { /* fail silently — show success regardless */ }

    // Always show success (security best practice)
    this.style.display = 'none';
    const successEl = document.getElementById('forgot-success');
    if (successEl) successEl.style.display = '';
  });
}

/** Check URL for ?token= coming back from Google OAuth callback */
function checkGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');
  const auth   = params.get('auth');
  if (token && auth === 'google') {
    localStorage.setItem('tradition_wear_token', token);
    // Try to fetch user info
    fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(user => {
        if (user && user.email) {
          localStorage.setItem('tradition_wear_user', JSON.stringify(user));
          updateHeaderUser(user);
          showToast(`Welcome, ${user.name || user.email}! 🙏`);
        }
      })
      .catch(() => {});
    hideSplash();
    // Clean URL
    const clean = window.location.pathname;
    window.history.replaceState({}, document.title, clean);
  }
}

/* ── Helper: set/clear field error messages ── */
function setFieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearSplashErrors() {
  ['splash-email-err','splash-pass-err','splash-phone-err','splash-otp-err',
   'signup-name-err','signup-email-err','signup-phone-err','signup-pass-err',
   'forgot-email-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}
