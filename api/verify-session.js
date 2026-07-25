const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: "STRIPE_SECRET_KEY non configurata" });
    return;
  }

  const sessionId = req.query && req.query.session_id;
  if (!sessionId) {
    res.status(400).json({ error: "session_id mancante" });
    return;
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"]
    });

    const paid = session.payment_status === "paid";

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
