const Stripe = require("stripe");
const { PRODUCTS_BY_LOCALE } = require("./_catalog");

const LOCALE_CONFIG = {
  it: {
    currency: "eur",
    allowedCountries: ["IT"],
    shippingLabel: "Spedizione Gratuita",
    cartPath: "/it/cart.html",
    successPath: "/it/checkout-success.html"
  },
  en: {
    currency: "gbp",
    allowedCountries: ["GB"],
    shippingLabel: "Free Shipping",
    cartPath: "/en/cart.html",
    successPath: "/en/checkout-success.html"
  }
};

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
    const locale = (body && body.locale === "en") ? "en" : "it";
    const config = LOCALE_CONFIG[locale];
    const PRODUCTS = PRODUCTS_BY_LOCALE[locale];
    const trackingParams = (body && body.trackingParams) || {};

    if (items.length === 0) {
      res.status(400).json({ error: "Nessun articolo ricevuto" });
      return;
    }

    const line_items = [];
    const itemHandles = [];
    for (const item of items) {
      const catalogEntry = PRODUCTS[item.handle];
      if (!catalogEntry) {
        res.status(400).json({ error: "Prodotto sconosciuto: " + item.handle });
        return;
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
      line_items.push({
        price_data: {
          currency: config.currency,
          product_data: {
            name: (item.title && String(item.title).slice(0, 250)) || catalogEntry.title
          },
          unit_amount: Math.round(catalogEntry.price * 100)
        },
        quantity: qty
      });
      itemHandles.push(item.handle);
    }

    const origin = req.headers.origin || ("https://" + req.headers.host);

    // Metadata values must be strings for Stripe; keep it flat so verify-session
    // can rebuild the Utmify tracking payload after the customer pays.
    const metadata = {
      locale: locale,
      item_handles: JSON.stringify(itemHandles),
      utm_source: trackingParams.utm_source || "",
      utm_campaign: trackingParams.utm_campaign || "",
      utm_medium: trackingParams.utm_medium || "",
      utm_content: trackingParams.utm_content || "",
      utm_term: trackingParams.utm_term || "",
      src: trackingParams.src || "",
      sck: trackingParams.sck || ""
    };

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: metadata,
      shipping_address_collection: {
        allowed_countries: config.allowedCountries
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: config.currency
            },
            display_name: config.shippingLabel,
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 }
            }
          }
        }
      ],
      success_url: origin + config.successPath + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + config.cartPath
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    res.status(500).json({ error: "Impossibile creare la sessione di pagamento" });
  }
};
