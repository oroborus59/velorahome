/* Velora Home - carrello locale (localStorage), nessun backend richiesto per il carrello.
   Multi-lingua: ogni pagina imposta window.SITE_LOCALE ("it", "en" o "es") prima di questo script. */
(function (window) {
  "use strict";

  var VALID_LOCALES = { it: true, en: true, es: true };
  var LOCALE = VALID_LOCALES[window.SITE_LOCALE] ? window.SITE_LOCALE : "it";
  var CURRENCY_BY_LOCALE = { it: "EUR", en: "GBP", es: "EUR" };
  var CURRENCY = CURRENCY_BY_LOCALE[LOCALE];

  var CART_KEY = "velora_cart_" + LOCALE;

  var PRODUCTS_BY_LOCALE = {
    it: [
      {
        handle: "pannello-flessibile-di-alta-gamma-in-legno-270x110-cm",
        title: "Pannello Flessibile di Alta Gamma in Legno – 270x110 cm",
        price: 5.00,
        compareAtPrice: null,
        image: "/cdn/shop/files/N-OAK-LIGHT_8335bf77-ad28-457d-937a-796529edc282.webp@v=1767622252&width=352",
        url: "products/pannello-flessibile-di-alta-gamma-in-legno-270x110-cm.html"
      },
      {
        handle: "macchina-da-stiro-automatica",
        title: "Macchina da Stiro Automatica",
        price: 29.90,
        compareAtPrice: 66.90,
        image: "/cdn/shop/files/4.2.webp@v=1768079447&width=352",
        url: "products/macchina-da-stiro-automatica.html"
      },
      {
        handle: "pellicole-decorative-per-vetri-60-x-120-cm",
        title: "Pellicole Decorative per Vetri - 60 x 120 cm",
        price: 5.99,
        compareAtPrice: 24.99,
        image: "/cdn/shop/files/BlueCanglang.webp@v=1782863466&width=352",
        url: "products/pellicole-decorative-per-vetri-60-x-120-cm.html"
      },
      {
        handle: "rotolo-adesivo-da-parete-effetto-marmo-120x300-cm-impermeabile-e-resistente-allacqua-spessore-2mm-adesione-forte-e-realistica",
        title: "Pannelli in Marmo Flessibile 270 × 110 cm",
        price: 5.00,
        compareAtPrice: null,
        image: "/cdn/shop/files/37-ROTOLO-ADESIVO-MARMO-300X120.jpg@v=1779816926&width=352",
        url: "products/rotolo-adesivo-da-parete-effetto-marmo-120x300-cm-impermeabile-e-resistente-allacqua-spessore-2mm-adesione-forte-e-realistica.html"
      }
    ],
    en: [
      {
        handle: "premium-flexible-wood-panel-270x110-cm",
        title: "Premium Flexible Wood Panel – 270x110 cm",
        price: 5.00,
        compareAtPrice: null,
        image: "/cdn/shop/files/N-OAK-LIGHT_8335bf77-ad28-457d-937a-796529edc282.webp@v=1767622252&width=352",
        url: "products/premium-flexible-wood-panel-270x110-cm.html"
      },
      {
        handle: "automatic-ironing-machine",
        title: "Automatic Ironing Machine",
        price: 25.42,
        compareAtPrice: 56.87,
        image: "/cdn/shop/files/4.2.webp@v=1768079447&width=352",
        url: "products/automatic-ironing-machine.html"
      },
      {
        handle: "decorative-window-films-60x120-cm",
        title: "Decorative Window Films - 60 x 120 cm",
        price: 5.09,
        compareAtPrice: 21.24,
        image: "/cdn/shop/files/BlueCanglang.webp@v=1782863466&width=352",
        url: "products/decorative-window-films-60x120-cm.html"
      },
      {
        handle: "marble-effect-wall-sticker-roll-120x300-cm-waterproof",
        title: "Flexible Marble Panels 270 × 110 cm",
        price: 4.25,
        compareAtPrice: null,
        image: "/cdn/shop/files/37-ROTOLO-ADESIVO-MARMO-300X120.jpg@v=1779816926&width=352",
        url: "products/marble-effect-wall-sticker-roll-120x300-cm-waterproof.html"
      }
    ],
    es: [
      {
        handle: "panel-de-madera-flexible-premium-270x110-cm",
        title: "Panel de Madera Flexible Premium – 270x110 cm",
        price: 5.00,
        compareAtPrice: null,
        image: "/cdn/shop/files/N-OAK-LIGHT_8335bf77-ad28-457d-937a-796529edc282.webp@v=1767622252&width=352",
        url: "products/panel-de-madera-flexible-premium-270x110-cm.html"
      },
      {
        handle: "maquina-de-planchar-automatica",
        title: "Máquina de Planchar Automática",
        price: 29.90,
        compareAtPrice: 66.90,
        image: "/cdn/shop/files/4.2.webp@v=1768079447&width=352",
        url: "products/maquina-de-planchar-automatica.html"
      },
      {
        handle: "laminas-decorativas-para-cristales-60x120-cm",
        title: "Láminas Decorativas para Cristales - 60 x 120 cm",
        price: 5.99,
        compareAtPrice: 24.99,
        image: "/cdn/shop/files/BlueCanglang.webp@v=1782863466&width=352",
        url: "products/laminas-decorativas-para-cristales-60x120-cm.html"
      },
      {
        handle: "rollo-adhesivo-efecto-marmol-120x300-cm-impermeable",
        title: "Paneles de Mármol Flexible 270 × 110 cm",
        price: 5.00,
        compareAtPrice: null,
        image: "/cdn/shop/files/37-ROTOLO-ADESIVO-MARMO-300X120.jpg@v=1779816926&width=352",
        url: "products/rollo-adhesivo-efecto-marmol-120x300-cm-impermeable.html"
      }
    ]
  };

  var PRODUCTS = PRODUCTS_BY_LOCALE[LOCALE];

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

  /* Invia un evento al Pixel TikTok (via Utmify), se disponibile. Non blocca mai il resto del sito. */
  function trackTikTok(eventName, params) {
    try {
      if (window.ttq && typeof window.ttq.track === "function") {
        window.ttq.track(eventName, params);
      }
    } catch (e) { /* pixel non disponibile, ignora */ }
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

    trackTikTok("AddToCart", {
      content_id: item.handle || item.id,
      content_type: "product",
      content_name: item.title,
      quantity: item.qty,
      price: item.price,
      value: item.price * item.qty,
      currency: CURRENCY
    });

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
    if (LOCALE === "en") {
      return "£" + amount.toFixed(2);
    }
    return "€" + amount.toFixed(2).replace(".", ",");
  }

  /* Pulsanti +/- di quantità nelle pagine prodotto (stesso meccanismo semplice
     già usato nel carrello, non dipende dai custom element del tema). */
  function stepQuantity(btn, delta) {
    var container = btn.closest(".quantity-selector-wrapper") || btn.parentElement;
    if (!container) return;
    var input = container.querySelector('input[name="quantity"]');
    if (!input) return;
    var minusBtn = container.querySelector('button[name="minus"]');
    var plusBtn = container.querySelector('button[name="plus"]');

    var min = parseInt(input.getAttribute("min"), 10) || 1;
    var current = parseInt(input.value, 10) || min;
    var next = current + delta;
    if (next < min) next = min;
    input.value = next;
    input.dispatchEvent(new Event("change", { bubbles: true }));

    /* Il vecchio componente del tema può aver disabilitato questi pulsanti
       all'avvio (es. "-" quando la quantità è al minimo) e non li riabilita
       mai perché non "vede" i cambi di valore fatti qui: lo gestiamo da soli. */
    if (minusBtn) minusBtn.disabled = next <= min;
    if (plusBtn) plusBtn.disabled = false;
  }

  /* Chiamata dal pulsante "Acquista ora" / "Aggiungi al carrello" nelle pagine prodotto */
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

  var TRACKING_PARAMS_KEY = "velora_tracking_params";

  /* Cattura i parametri di tracciamento (UTM/TikTok) dall'URL di atterraggio e li
     salva in localStorage, cosicché sopravvivano alla navigazione interna fino al
     checkout. Il tema genera link interni con "utm_source=organic" come segnaposto:
     lo ignoriamo per non sovrascrivere l'attribuzione reale di un click pubblicitario. */
  function captureTrackingParams() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utmSource = params.get("utm_source");
      if (!utmSource || utmSource === "organic") return;

      var tracking = {
        src: params.get("src") || null,
        sck: params.get("sck") || null,
        utm_source: utmSource,
        utm_campaign: params.get("utm_campaign") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_content: params.get("utm_content") || null,
        utm_term: params.get("utm_term") || null
      };
      window.localStorage.setItem(TRACKING_PARAMS_KEY, JSON.stringify(tracking));
    } catch (e) { /* localStorage non disponibile, ignora */ }
  }

  function getTrackingParams() {
    try {
      var raw = window.localStorage.getItem(TRACKING_PARAMS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /* Avvia il checkout Stripe (redirect ospitato) per una lista di articoli.
     items: [{ handle, title, qty }] — il prezzo viene sempre ricalcolato dal server,
     in base alla valuta/lingua corrente. */
  function startStripeCheckout(items) {
    if (!items || items.length === 0) return;

    trackTikTok("InitiateCheckout", {
      contents: items.map(function (i) {
        return { content_id: i.handle, content_type: "product", content_name: i.title, quantity: i.qty };
      }),
      currency: CURRENCY
    });

    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items, locale: LOCALE, trackingParams: getTrackingParams() })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.url) {
          window.location.href = data.url;
        } else {
          window.alert(LOCALE === "en" ? "Unable to start payment. Please try again." : "Non è stato possibile avviare il pagamento. Riprova.");
        }
      })
      .catch(function () {
        window.alert(LOCALE === "en" ? "Unable to start payment. Please try again." : "Non è stato possibile avviare il pagamento. Riprova.");
      });
  }

  /* Chiamata dal pulsante "Acquista ora": acquisto diretto di un solo prodotto via Stripe,
     senza passare dal carrello. */
  function buyNowStripe(btn) {
    var form = btn.closest("form");
    var qtyInput = form ? form.querySelector('input[name="quantity"]') : null;
    var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    var checkedRadio = document.querySelector('.variant-picker__form input[type="radio"]:checked');
    var variantTitle = checkedRadio ? checkedRadio.value : null;

    var baseId = btn.getAttribute("data-product-id");
    var title = btn.getAttribute("data-product-title") + (variantTitle ? " - " + variantTitle : "");

    startStripeCheckout([{ handle: baseId, title: title, qty: qty }]);
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

  /* Cambio immagine al click su una variante (colore/modello) nella pagina prodotto.
     Usa i dati già presenti nel JSON-LD della pagina (hasVariant), niente rete. */
  function getVariantImageMap() {
    var map = {};
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        if (data && data.hasVariant) {
          for (var j = 0; j < data.hasVariant.length; j++) {
            var v = data.hasVariant[j];
            var m = v["@id"] && v["@id"].match(/variant=(\d+)/);
            if (m && v.image) map[m[1]] = v.image;
          }
        }
      } catch (e) { /* ignora JSON non valido */ }
    }
    return map;
  }

  function toLocalImagePath(absoluteUrl, prefix) {
    var afterCdn = absoluteUrl.split("/cdn/")[1];
    if (!afterCdn) return null;
    return prefix + "cdn/" + afterCdn.replace("?", "@");
  }

  function swapVariantImages(variantId) {
    var map = getVariantImageMap();
    var targetAbsolute = map[variantId];
    if (!targetAbsolute) return;

    var variantFilenames = [];
    for (var id in map) {
      var afterCdn = map[id].split("/cdn/")[1];
      if (afterCdn) variantFilenames.push(afterCdn.split("?")[0]);
    }

    var images = document.querySelectorAll('media-gallery img.product-media__image, .sticky-add-to-cart__image-img');
    images.forEach(function (img) {
      var src = img.getAttribute("src") || "";
      var cdnIdx = src.indexOf("cdn/");
      var prefix = cdnIdx >= 0 ? src.substring(0, cdnIdx) : "";

      var isVariantShot = img.classList.contains("sticky-add-to-cart__image-img");
      if (!isVariantShot) {
        for (var k = 0; k < variantFilenames.length; k++) {
          if (src.indexOf(variantFilenames[k]) !== -1) { isVariantShot = true; break; }
        }
      }
      if (!isVariantShot) return;

      var newPath = toLocalImagePath(targetAbsolute, prefix);
      if (newPath) {
        img.setAttribute("src", newPath);
        img.removeAttribute("srcset");
      }
    });
  }

  function initVariantImageSwap() {
    var form = document.querySelector(".variant-picker__form");
    if (!form) return;
    form.addEventListener("change", function (e) {
      var target = e.target;
      if (target && target.type === "radio" && target.hasAttribute("data-variant-id")) {
        swapVariantImages(target.getAttribute("data-variant-id"));
      }
    });
  }

  /* Pagina prodotto: invia ViewContent una sola volta al caricamento */
  function initViewContentTracking() {
    var btn = document.querySelector(".acquista-ora-button[data-product-id]");
    if (!btn) return;
    var price = parseFloat(btn.getAttribute("data-product-price"));
    trackTikTok("ViewContent", {
      content_id: btn.getAttribute("data-product-id"),
      content_type: "product",
      content_name: btn.getAttribute("data-product-title"),
      quantity: 1,
      price: price,
      value: price,
      currency: CURRENCY
    });
  }

  /* Chiude il menu a tendina del selettore di lingua quando si clicca fuori */
  function initLocaleSwitcherDropdown() {
    document.addEventListener("click", function (e) {
      var openDropdowns = document.querySelectorAll("details.locale-switcher-dropdown[open]");
      for (var i = 0; i < openDropdowns.length; i++) {
        if (!openDropdowns[i].contains(e.target)) {
          openDropdowns[i].removeAttribute("open");
        }
      }
    });
  }

  function initPageTracking() {
    captureTrackingParams();
    initVariantImageSwap();
    initViewContentTracking();
    initLocaleSwitcherDropdown();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageTracking);
  } else {
    initPageTracking();
  }

  window.VeloraCart = {
    KEY: CART_KEY,
    LOCALE: LOCALE,
    CURRENCY: CURRENCY,
    PRODUCTS: PRODUCTS,
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    cartCount: cartCount,
    formatPrice: formatPrice,
    addFromProductPage: addFromProductPage,
    handleSearchSubmit: handleSearchSubmit,
    trackTikTok: trackTikTok,
    getTrackingParams: getTrackingParams,
    startStripeCheckout: startStripeCheckout,
    buyNowStripe: buyNowStripe,
    stepQuantity: stepQuantity
  };
})(window);
