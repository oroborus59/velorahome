const Stripe = require("stripe");
const { PRODUCTS_BY_LOCALE } = require("./_catalog");

// Bizum solo permite importes en este rango (ver documentación de Stripe).
const MIN_AMOUNT_CENTS = 50;
const MAX_AMOUNT_CENTS = 500000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const items = Array.isArray(body && body.items) ? body.items : [];
    const address = (body && body.address) || {};
    const trackingParams = (body && body.trackingParams) || {};

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY_ES;
    if (!stripeSecretKey) {
      res.status(500).json({ error: "STRIPE_SECRET_KEY_ES no configurada" });
      return;
    }

    if (items.length === 0) {
      res.status(400).json({ error: "No se recibió ningún artículo" });
      return;
    }

    const PRODUCTS = PRODUCTS_BY_LOCALE.es;
    const orderItems = [];
    let amount = 0;
    for (const item of items) {
      const catalogEntry = PRODUCTS[item.handle];
      if (!catalogEntry) {
        res.status(400).json({ error: "Producto desconocido: " + item.handle });
        return;
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
      amount += Math.round(catalogEntry.price * 100) * qty;
      orderItems.push({ handle: item.handle, qty: qty });
    }

    if (amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
      res.status(400).json({ error: "Importe fuera del rango permitido para Bizum" });
      return;
    }

    const name = String(address.name || "").trim().slice(0, 200);
    const phone = String(address.phone || "").trim().slice(0, 20);
    const line1 = String(address.line1 || "").trim().slice(0, 200);
    const line2 = String(address.line2 || "").trim().slice(0, 200);
    const city = String(address.city || "").trim().slice(0, 100);
    const postalCode = String(address.postalCode || "").trim().slice(0, 20);

    if (!name || !phone || !line1 || !city || !postalCode) {
      res.status(400).json({ error: "Faltan datos de envío obligatorios" });
      return;
    }

    const stripe = Stripe(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      allowed_payment_method_types: ["bizum"],
      shipping: {
        name: name,
        phone: phone,
        address: {
          line1: line1,
          line2: line2 || undefined,
          city: city,
          postal_code: postalCode,
          country: "ES"
        }
      },
      metadata: {
        locale: "es",
        item_handles: JSON.stringify(orderItems),
        customer_name: name,
        customer_phone: phone,
        shipping_line1: line1,
        shipping_line2: line2,
        shipping_city: city,
        shipping_postal_code: postalCode,
        utm_source: trackingParams.utm_source || "",
        utm_campaign: trackingParams.utm_campaign || "",
        utm_medium: trackingParams.utm_medium || "",
        utm_content: trackingParams.utm_content || "",
        utm_term: trackingParams.utm_term || "",
        src: trackingParams.src || "",
        sck: trackingParams.sck || ""
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_ES || ""
    });
  } catch (err) {
    console.error("create-bizum-payment-intent error:", err);
    res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
};
