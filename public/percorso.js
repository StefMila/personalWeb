// Linea rossa della timeline: si allunga man mano che la lista delle esperienze
// supera il punto al 60% dell'altezza dello schermo.
const percorso = document.querySelector(".timeline");

if (percorso) {
  let inAttesa = false;

  function aggiorna() {
    inAttesa = false;
    const soglia = innerHeight * 0.6;
    const box = percorso.getBoundingClientRect();
    const fill = Math.min(1, Math.max(0, (soglia - box.top) / box.height));
    percorso.style.setProperty("--fill", fill.toFixed(3));
    percorso.classList.toggle("in-corso", fill < 1); // pallino finale grigio finché la linea non arriva
  }

  // al massimo un calcolo per fotogramma, anche se lo scroll manda molti eventi
  function richiedi() {
    if (!inAttesa) { inAttesa = true; requestAnimationFrame(aggiorna); }
  }

  addEventListener("scroll", richiedi, { passive: true });
  addEventListener("resize", richiedi);
  aggiorna();
}
