const Stripe = require("stripe");
const { sendPaidOrderToUtmifyFromPaymentIntent } = require("./_utmify");

// I pagamenti Bizum sono confermati in modo asincrono dal cliente nella sua
// app bancaria: non possiamo affidarci al solo callback lato client (l'utente
// potrebbe chiudere la scheda prima che si risolva). Questo webhook è quindi
// la fonte affidabile per segnalare l'ordine a Utmify.
function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on("data", function (chunk) { chunks.push(chunk); });
    req.on("end", function () { resolve(Buffer.concat(chunks)); });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY_ES;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_ES;
  if (!stripeSecretKey || !webhookSecret) {
    console.error("stripe-webhook-es: variabili d'ambiente mancanti");
    res.status(500).end();
    return;
  }

  const stripe = Stripe(stripeSecretKey);
  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe-webhook-es: verifica della firma fallita:", err.message);
    res.status(400).send("Webhook Error: " + err.message);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    try {
      await sendPaidOrderToUtmifyFromPaymentIntent(event.data.object);
    } catch (err) {
      console.error("sendPaidOrderToUtmifyFromPaymentIntent error:", err);
    }
  }

  res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
