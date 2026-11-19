const crypto = require("crypto");
const Stripe = require("stripe");
const { sendPaidOrderToUtmify } = require("./_utmify");
const { LOCALE_CONFIG, resolveLocale } = require("./_locales");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Dados do comprador já criptografados (SHA-256), no formato do ttq.identify do
// TikTok. O e-mail/telefone em texto puro nunca é enviado ao navegador.
function buildTikTokIdentity(session) {
  const details = session.customer_details || {};
  const identity = {};

  const email = details.email && String(details.email).trim().toLowerCase();
  if (email) identity.email = sha256(email);

  const phone = details.phone && String(details.phone).replace(/[^\d+]/g, "");
  if (phone) identity.phone_number = sha256(phone);

  identity.external_id = sha256(session.id);
  return identity;
}

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

    // Handles dos produtos, na mesma ordem dos line_items (gravados em
    // create-checkout-session): usados como content_id no evento do TikTok.
    let orderHandles = [];
    try {
      orderHandles = JSON.parse((session.metadata && session.metadata.item_handles) || "[]");
    } catch (e) { /* ignora */ }

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
      identity: paid ? buildTikTokIdentity(session) : null,
      items: paid && session.line_items
        ? session.line_items.data.map(function (li, i) {
            return {
              id: orderHandles[i] || null,
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
