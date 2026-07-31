const Stripe = require("stripe");
const { PRODUCTS } = require("./_catalog");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: "STRIPE_SECRET_KEY non configurata" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const items = Array.isArray(body && body.items) ? body.items : [];

    if (items.length === 0) {
      res.status(400).json({ error: "Nessun articolo ricevuto" });
      return;
    }

    const line_items = [];
    for (const item of items) {
      const catalogEntry = PRODUCTS[item.handle];
      if (!catalogEntry) {
        res.status(400).json({ error: "Prodotto sconosciuto: " + item.handle });
        return;
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: (item.title && String(item.title).slice(0, 250)) || catalogEntry.title
          },
          unit_amount: Math.round(catalogEntry.price * 100)
        },
        quantity: qty
      });
    }

    const origin = req.headers.origin || ("https://" + req.headers.host);

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: {
        allowed_countries: ["IT"]
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "eur"
            },
            display_name: "Spedizione Gratuita",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 }
            }
          }
        }
      ],
      success_url: origin + "/checkout-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/cart.html"
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    res.status(500).json({ error: "Impossibile creare la sessione di pagamento" });
  }
};
