// Catalogo prodotti lato server: unica fonte di verità per i prezzi.
// Il prezzo inviato dal client non viene mai usato per creare la sessione di
// pagamento: viene sempre ricalcolato qui, per evitare manomissioni.
const PRODUCTS = {
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
};

module.exports = { PRODUCTS };
