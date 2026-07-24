/* Velora Home - carrello locale (localStorage), nessun backend richiesto */
(function (window) {
  "use strict";

  var CART_KEY = "velora_cart";

  var PRODUCTS = [
    {
      handle: "pannello-flessibile-di-alta-gamma-in-legno-270x110-cm",
      title: "Pannello Flessibile di Alta Gamma in Legno – 270x110 cm",
      price: 5.00,
      compareAtPrice: null,
      image: "cdn/shop/files/N-OAK-LIGHT_8335bf77-ad28-457d-937a-796529edc282.png@v=1767622252&width=352",
      url: "products/pannello-flessibile-di-alta-gamma-in-legno-270x110-cm.html"
    },
    {
      handle: "pannello-flessibile-di-alta-gamma-in-legno-270x110-cm-copia",
      title: "Pannello Flessibile in Legno – 270x110 cm",
      price: 5.00,
      compareAtPrice: null,
      image: "cdn/shop/files/NI_1.png@v=1767622252&width=352",
      url: "products/pannello-flessibile-di-alta-gamma-in-legno-270x110-cm-copia.html"
    },
    {
      handle: "macchina-da-stiro-automatica",
      title: "Macchina da Stiro Automatica",
      price: 29.90,
      compareAtPrice: 66.90,
      image: "cdn/shop/files/4.2.webp@v=1768079447&width=352",
      url: "products/macchina-da-stiro-automatica.html"
    },
    {
      handle: "pellicole-decorative-per-vetri-60-x-120-cm",
      title: "Pellicole Decorative per Vetri - 60 x 120 cm",
      price: 5.99,
      compareAtPrice: 24.99,
      image: "cdn/shop/files/BlueCanglang.webp@v=1782863466&width=352",
      url: "products/pellicole-decorative-per-vetri-60-x-120-cm.html"
    },
    {
      handle: "rotolo-adesivo-da-parete-effetto-marmo-120x300-cm-impermeabile-e-resistente-allacqua-spessore-2mm-adesione-forte-e-realistica",
      title: "Pannelli in Marmo Flessibile 270 × 110 cm",
      price: 5.00,
      compareAtPrice: null,
      image: "cdn/shop/files/37-ROTOLO-ADESIVO-MARMO-300X120.jpg@v=1779816926&width=352",
      url: "products/rotolo-adesivo-da-parete-effetto-marmo-120x300-cm-impermeabile-e-resistente-allacqua-spessore-2mm-adesione-forte-e-realistica.html"
    }
  ];

  function getCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage non disponibile: il carrello non verrà ricordato */
    }
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === item.id) {
        existing = cart[i];
        break;
      }
    }
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    return cart;
  }

  function setQty(id, qty) {
    var cart = getCart();
    if (qty <= 0) {
      cart = cart.filter(function (i) { return i.id !== id; });
    } else {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
          cart[i].qty = qty;
          break;
        }
      }
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id) {
    return setQty(id, 0);
  }

  function cartCount() {
    var cart = getCart();
    var total = 0;
    for (var i = 0; i < cart.length; i++) total += cart[i].qty;
    return total;
  }

  function formatPrice(amount) {
    return "€" + amount.toFixed(2).replace(".", ",");
  }

  /* Chiamata dal pulsante "Acquista ora" nelle pagine prodotto */
  function addFromProductPage(btn) {
    var form = btn.closest("form");
    var qtyInput = form ? form.querySelector('input[name="quantity"]') : null;
    var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    var checkedRadio = document.querySelector('.variant-picker__form input[type="radio"]:checked');
    var variantTitle = checkedRadio ? checkedRadio.value : null;

    var baseId = btn.getAttribute("data-product-id");
    var id = variantTitle ? (baseId + "::" + variantTitle) : baseId;
    var title = btn.getAttribute("data-product-title") + (variantTitle ? " - " + variantTitle : "");

    addToCart({
      id: id,
      handle: baseId,
      title: title,
      price: parseFloat(btn.getAttribute("data-product-price")),
      image: btn.getAttribute("data-product-image"),
      url: btn.getAttribute("data-product-url"),
      qty: qty
    });

    window.location.href = btn.getAttribute("data-cart-url") || "../cart.html";
  }

  /* Chiamata dal form di ricerca dell'header: cerca nel catalogo locale (5 prodotti) */
  function handleSearchSubmit(event, formEl) {
    if (event && event.preventDefault) event.preventDefault();
    var input = formEl.querySelector('input[name="q"]');
    var q = (input && input.value || "").trim().toLowerCase();
    if (!q) return false;

    var rootPrefix = formEl.getAttribute("data-root-prefix") || "";
    var match = null;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].title.toLowerCase().indexOf(q) !== -1) {
        match = PRODUCTS[i];
        break;
      }
    }
    if (match) {
      window.location.href = rootPrefix + match.url;
    } else {
      window.alert('Nessun prodotto trovato per "' + input.value + '".');
    }
    return false;
  }

  window.VeloraCart = {
    KEY: CART_KEY,
    PRODUCTS: PRODUCTS,
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    cartCount: cartCount,
    formatPrice: formatPrice,
    addFromProductPage: addFromProductPage,
    handleSearchSubmit: handleSearchSubmit
  };
})(window);
