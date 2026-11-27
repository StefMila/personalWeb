// Cambia il tema della pagina quando una sezione passa a metà dello schermo.
// rootMargin -50% sopra e sotto riduce la zona osservata a una linea al centro dello schermo.
const sezioni = document.querySelectorAll("section[data-theme]");

const osservatore = new IntersectionObserver(voci => {
  for (const voce of voci) {
    if (voce.isIntersecting) {
      document.documentElement.dataset.theme = voce.target.dataset.theme;
    }
  }
}, { rootMargin: "-50% 0px -50% 0px" });

sezioni.forEach(s => osservatore.observe(s));
