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
    // TEMPORANEO: l'idioma spagnolo usa lo stesso account Stripe di IT/EN
    // (checkout ospitato) finché l'account dedicato "es" non è pronto/sostituito.
    // Il checkout proprio (Bizum-only) resta pronto e inutilizzato in
    // es/checkout.html + api/create-bizum-payment-intent.js — per passare
    // all'account dedicato, rimettere qui "STRIPE_SECRET_KEY_ES".
    stripeKeyEnv: "STRIPE_SECRET_KEY"
  },
  pt: {
    currency: "eur",
    allowedCountries: ["PT"],
    shippingLabel: "Envio Grátis",
    cartPath: "/pt/cart.html",
    successPath: "/pt/checkout-success.html",
    // Idioma portoghese (Portogallo): gateway Stripe dedicato, account separato
    // dagli altri. La chiave non è ancora configurata: finché STRIPE_SECRET_KEY_PT
    // non esiste su Vercel, create-checkout-session.js risponde con un 500
    // gestito (stesso comportamento già usato per gli altri gateway mancanti).
    stripeKeyEnv: "STRIPE_SECRET_KEY_PT"
  }
};

function resolveLocale(value) {
  return LOCALE_CONFIG[value] ? value : "it";
}

module.exports = { LOCALE_CONFIG, resolveLocale };
