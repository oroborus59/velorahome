// Invia i dati di un ordine pagato alla Utmify, per l'attribuzione delle vendite
// alle campagne pubblicitarie (TikTok Ads, ecc.). Non deve mai bloccare né rompere
// la risposta al cliente: eventuali errori vengono solo loggati.

const { PRODUCTS_BY_LOCALE } = require("./_catalog");

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatUtmifyDate(unixSeconds) {
  const d = new Date(unixSeconds * 1000);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + " " +
    pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
}

function buildProducts(session, itemHandles) {
  const lineItems = (session.line_items && session.line_items.data) || [];
  return lineItems.map(function (li, i) {
    const unitAmount = (li.price && typeof li.price.unit_amount === "number")
      ? li.price.unit_amount
      : Math.round((li.amount_total || 0) / (li.quantity || 1));
    return {
      id: itemHandles[i] || (li.price && li.price.id) || li.description || ("item-" + i),
      name: li.description || "Product",
      planId: null,
      planName: null,
      quantity: li.quantity || 1,
      priceInCents: unitAmount
    };
  });
}

function buildPayload(session) {
  const metadata = session.metadata || {};
  let itemHandles = [];
  try { itemHandles = JSON.parse(metadata.item_handles || "[]"); } catch (e) { /* ignora */ }

  const customerDetails = session.customer_details || {};
  const shippingDetails = session.shipping_details || {};
  const customerName = customerDetails.name || shippingDetails.name || "N/A";
  const customerCountry =
    (customerDetails.address && customerDetails.address.country) ||
    (shippingDetails.address && shippingDetails.address.country) ||
    null;

  let fee = 0;
  const balanceTransaction =
    session.payment_intent &&
    session.payment_intent.latest_charge &&
    session.payment_intent.latest_charge.balance_transaction;
  if (balanceTransaction && typeof balanceTransaction.fee === "number") {
    fee = balanceTransaction.fee;
  }

  const totalPriceInCents = session.amount_total || 0;

  return {
    orderId: session.id,
    platform: "VeloraHome",
    paymentMethod: "credit_card",
    status: "paid",
    createdAt: formatUtmifyDate(session.created),
    approvedDate: formatUtmifyDate(session.created),
    refundedAt: null,
    customer: {
      name: customerName,
      email: customerDetails.email || "",
      phone: customerDetails.phone || null,
      document: null,
      country: customerCountry
    },
    products: buildProducts(session, itemHandles),
    trackingParameters: {
      src: metadata.src || null,
      sck: metadata.sck || null,
      utm_source: metadata.utm_source || null,
      utm_campaign: metadata.utm_campaign || null,
      utm_medium: metadata.utm_medium || null,
      utm_content: metadata.utm_content || null,
      utm_term: metadata.utm_term || null
    },
    commission: {
      totalPriceInCents: totalPriceInCents,
      gatewayFeeInCents: fee,
      userCommissionInCents: Math.max(0, totalPriceInCents - fee),
      currency: (session.currency || "eur").toUpperCase()
    }
  };
}

async function postPayloadToUtmify(payload) {
  const apiToken = process.env.UTMIFY_API_TOKEN;
  if (!apiToken) {
    console.warn("UTMIFY_API_TOKEN non configurata: invio a Utmify saltato");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () { controller.abort(); }, 8000);

  try {
    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": apiToken },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Utmify ha risposto con errore:", response.status, text);
    }
  } catch (err) {
    console.error("Invio a Utmify fallito:", err);
  } finally {
    clearTimeout(timeout);
  }
}

async function sendPaidOrderToUtmify(session) {
  await postPayloadToUtmify(buildPayload(session));
}

// Come buildProducts, ma a partire dai metadata di un PaymentIntent (checkout
// Bizum) invece che dai line_items di una Checkout Session: il catalogo server-side
// resta l'unica fonte di verità per titolo e prezzo.
function buildProductsFromMetadata(metadata) {
  let orderItems = [];
  try { orderItems = JSON.parse(metadata.item_handles || "[]"); } catch (e) { /* ignora */ }

  const PRODUCTS = PRODUCTS_BY_LOCALE.es;
  return orderItems.map(function (oi) {
    const catalogEntry = PRODUCTS[oi.handle];
    return {
      id: oi.handle,
      name: catalogEntry ? catalogEntry.title : oi.handle,
      planId: null,
      planName: null,
      quantity: oi.qty,
      priceInCents: catalogEntry ? Math.round(catalogEntry.price * 100) : 0
    };
  });
}

function buildPayloadFromPaymentIntent(intent) {
  const metadata = intent.metadata || {};
  const totalPriceInCents = intent.amount || 0;

  return {
    orderId: intent.id,
    platform: "VeloraHome",
    // NOTA: valore provvisorio in attesa di conferma da parte dell'utente su
    // quale enum Utmify si aspetti per un pagamento Bizum (non è una carta).
    paymentMethod: "pix",
    status: "paid",
    createdAt: formatUtmifyDate(intent.created),
    approvedDate: formatUtmifyDate(intent.created),
    refundedAt: null,
    customer: {
      name: metadata.customer_name || (intent.shipping && intent.shipping.name) || "N/A",
      email: "",
      phone: metadata.customer_phone || (intent.shipping && intent.shipping.phone) || null,
      document: null,
      country: "ES"
    },
    products: buildProductsFromMetadata(metadata),
    trackingParameters: {
      src: metadata.src || null,
      sck: metadata.sck || null,
      utm_source: metadata.utm_source || null,
      utm_campaign: metadata.utm_campaign || null,
      utm_medium: metadata.utm_medium || null,
      utm_content: metadata.utm_content || null,
      utm_term: metadata.utm_term || null
    },
    commission: {
      totalPriceInCents: totalPriceInCents,
      // Bizum non espone la fee del gateway su questo oggetto: il valore esatto
      // resta comunque visibile nella dashboard Stripe.
      gatewayFeeInCents: 0,
      userCommissionInCents: totalPriceInCents,
      currency: (intent.currency || "eur").toUpperCase()
    }
  };
}

async function sendPaidOrderToUtmifyFromPaymentIntent(intent) {
  await postPayloadToUtmify(buildPayloadFromPaymentIntent(intent));
}

module.exports = {
  sendPaidOrderToUtmify,
  sendPaidOrderToUtmifyFromPaymentIntent,
  buildPayload,
  buildPayloadFromPaymentIntent
};
