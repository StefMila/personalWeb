// Chi sono: i pallini sul filo rosso aprono "La mia storia" ed evidenziano il paragrafo collegato.
(function () {
  const filo = document.querySelector(".filo");
  const storia = document.getElementById("storia");
  if (!filo || !storia) return;

  const DURATA = 3000; // ms di evidenziazione
  const riduciMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;

  // data-nodi può contenere più nodi separati da spazi (es. "amministrazione pubblico")
  function paragrafoDi(nodo) {
    return Array.from(storia.querySelectorAll("p[data-nodi]"))
      .find(p => p.dataset.nodi.split(/\s+/).includes(nodo));
  }

  function spegniTutto() {
    document.querySelectorAll("#storia p.acceso, .filo button.acceso")
      .forEach(el => el.classList.remove("acceso"));
  }

  filo.addEventListener("click", e => {
    const bottone = e.target.closest("button[data-nodo]");
    if (!bottone) return;

    const paragrafo = paragrafoDi(bottone.dataset.nodo);
    if (!paragrafo) return;

    storia.open = true;
    clearTimeout(timer);
    spegniTutto();

    paragrafo.classList.add("acceso");
    bottone.classList.add("acceso");
    paragrafo.scrollIntoView({ behavior: riduciMovimento ? "auto" : "smooth", block: "center" });

    timer = setTimeout(spegniTutto, DURATA);
  });

  // Animazione di comparsa: il disegno si scopre quando la sezione entra nello schermo
  if (!riduciMovimento && "IntersectionObserver" in window) {
    filo.classList.add("animato");
    const osservatore = new IntersectionObserver(voci => {
      if (voci.some(v => v.isIntersecting)) {
        filo.classList.add("visibile");
        osservatore.disconnect();
      }
    }, { threshold: 0.3 });
    osservatore.observe(filo);
  }
})();
