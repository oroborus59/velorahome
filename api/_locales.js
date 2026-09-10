// Configurazione condivisa per lingua/gateway di pagamento. Unica fonte di
// verità usata sia da create-checkout-session.js che da verify-session.js,
// per evitare che le due funzioni finiscano per divergere.
const LOCALE_CONFIG = {
  it: {
    currency: "eur",
    allowedCountries: ["IT"],
    shippingLabel: "Spedizione Gratuita",
    cartPath: "/it/cart.html",
    successPath: "/it/checkout-success.html",
    stripeKeyEnv: "STRIPE_SECRET_KEY"
  },
  en: {
    currency: "gbp",
    allowedCountries: ["GB"],
    shippingLabel: "Free Shipping",
    cartPath: "/en/cart.html",
    successPath: "/en/checkout-success.html",
    stripeKeyEnv: "STRIPE_SECRET_KEY"
  },
  es: {
    currency: "eur",
    allowedCountries: ["ES"],
    shippingLabel: "Envío Gratis",
    cartPath: "/es/cart.html",
    successPath: "/es/checkout-success.html",
    // Idioma spagnolo: gateway Stripe dedicato, account separato da IT/EN.
    stripeKeyEnv: "STRIPE_SECRET_KEY_ES"
  }
};

function resolveLocale(value) {
  return LOCALE_CONFIG[value] ? value : "it";
}

module.exports = { LOCALE_CONFIG, resolveLocale };
