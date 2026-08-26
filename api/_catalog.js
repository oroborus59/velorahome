// Catalogo prodotti lato server: unica fonte di verità per i prezzi.
// Il prezzo inviato dal client non viene mai usato per creare la sessione di
// pagamento: viene sempre ricalcolato qui, per evitare manomissioni.
// Un catalogo separato per lingua/valuta (handle diversi in /it/ e /en/).
const PRODUCTS_BY_LOCALE = {
  it: {
    "pannello-flessibile-di-alta-gamma-in-legno-270x110-cm": {
      title: "Pannello Flessibile di Alta Gamma in Legno – 270x110 cm",
      price: 5.00
    },
    "pannello-flessibile-di-alta-gamma-in-legno-270x110-cm-copia": {
      title: "Pannello Flessibile in Legno – 270x110 cm",
      price: 5.00
    },
    "macchina-da-stiro-automatica": {
      title: "Macchina da Stiro Automatica",
      price: 29.90
    },
    "pellicole-decorative-per-vetri-60-x-120-cm": {
      title: "Pellicole Decorative per Vetri - 60 x 120 cm",
      price: 5.99
    },
    "rotolo-adesivo-da-parete-effetto-marmo-120x300-cm-impermeabile-e-resistente-allacqua-spessore-2mm-adesione-forte-e-realistica": {
      title: "Pannelli in Marmo Flessibile 270 × 110 cm",
      price: 5.00
    }
  },
  en: {
    "premium-flexible-wood-panel-270x110-cm": {
      title: "Pannello Flessibile di Alta Gamma in Legno – 270x110 cm",
      price: 4.25
    },
    "flexible-wood-panel-270x110-cm": {
      title: "Pannello Flessibile in Legno – 270x110 cm",
      price: 4.25
    },
    "automatic-ironing-machine": {
      title: "Macchina da Stiro Automatica",
      price: 25.42
    },
    "decorative-window-films-60x120-cm": {
      title: "Pellicole Decorative per Vetri - 60 x 120 cm",
      price: 5.09
    },
    "marble-effect-wall-sticker-roll-120x300-cm-waterproof": {
      title: "Pannelli in Marmo Flessibile 270 × 110 cm",
      price: 4.25
    }
  }
};

module.exports = { PRODUCTS_BY_LOCALE };
