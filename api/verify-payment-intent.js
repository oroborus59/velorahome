const Stripe = require("stripe");
const { PRODUCTS_BY_LOCALE } = require("./_catalog");

// Verifica el estado de un PaymentIntent de Bizum (checkout propio del idioma
// español). Misma forma de respuesta que verify-session.js para poder
// reutilizar checkout-success.html sin cambios en su lógica de renderizado.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const paymentIntentId = req.query && req.query.payment_intent;
  if (!paymentIntentId) {
    res.status(400).json({ error: "payment_intent no encontrado" });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY_ES;
  if (!stripeSecretKey) {
    res.status(500).json({ error: "STRIPE_SECRET_KEY_ES no configurada" });
    return;
  }

  try {
    const stripe = Stripe(stripeSecretKey);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paid = intent.status === "succeeded";

    let items = [];
    if (paid) {
      let orderItems = [];
      try {
        orderItems = JSON.parse((intent.metadata && intent.metadata.item_handles) || "[]");
      } catch (e) { /* ignora */ }

      const PRODUCTS = PRODUCTS_BY_LOCALE.es;
      items = orderItems.map(function (oi) {
        const catalogEntry = PRODUCTS[oi.handle];
        return {
          name: catalogEntry ? catalogEntry.title : oi.handle,
          quantity: oi.qty,
          amount: catalogEntry ? catalogEntry.price * oi.qty : 0
        };
      });
    }

    res.status(200).json({
      paid: paid,
      value: paid ? (intent.amount || 0) / 100 : null,
      currency: paid ? (intent.currency || "eur").toUpperCase() : null,
      items: items
    });
  } catch (err) {
    console.error("verify-payment-intent error:", err);
    res.status(404).json({ error: "Pago no encontrado", paid: false });
  }
};
