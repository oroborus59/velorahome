const Stripe = require("stripe");
const { sendPaidOrderToUtmify } = require("./_utmify");
const { LOCALE_CONFIG, resolveLocale } = require("./_locales");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sessionId = req.query && req.query.session_id;
  if (!sessionId) {
    res.status(400).json({ error: "session_id mancante" });
    return;
  }

  const locale = resolveLocale(req.query && req.query.locale);
  const config = LOCALE_CONFIG[locale];
  const stripeSecretKey = process.env[config.stripeKeyEnv];
  if (!stripeSecretKey) {
    res.status(500).json({ error: config.stripeKeyEnv + " non configurata" });
    return;
  }

  try {
    const stripe = Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent.latest_charge.balance_transaction"]
    });

    const paid = session.payment_status === "paid";

    if (paid) {
      // Non deve mai bloccare né far fallire la risposta al cliente.
      try {
        await sendPaidOrderToUtmify(session);
      } catch (err) {
        console.error("sendPaidOrderToUtmify error:", err);
      }
    }

    res.status(200).json({
      paid: paid,
      value: paid ? (session.amount_total || 0) / 100 : null,
      currency: paid ? (session.currency || "eur").toUpperCase() : null,
      items: paid && session.line_items
        ? session.line_items.data.map(function (li) {
            return {
              name: li.description,
              quantity: li.quantity,
              amount: (li.amount_total || 0) / 100
            };
          })
        : []
    });
  } catch (err) {
    console.error("verify-session error:", err);
    res.status(404).json({ error: "Sessione non trovata", paid: false });
  }
};
