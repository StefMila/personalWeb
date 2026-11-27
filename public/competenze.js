// ===== Competenze come rete neurale =====
//
// TUTTI I DATI STANNO QUI SOTTO: per aggiungere, togliere o cambiare una competenza
// modifica solo GRUPPI e COLLEGAMENTI.
//   - livello: da 0 a 6. Se non c'è, scrivi la competenza senza "livello":
//     il nodo avrà la grandezza standard (e sarà vuoto, non pieno).
//   - nota: facoltativa.
//   - bandiera: codice del paese (it, de, gb, es...) per le lingue.
//   - icona: classe del logo Devicon (elenco su https://devicon.dev). "colored" = colori originali;
//     senza "colored" il logo prende il colore del testo (utile per i loghi neri, su sfondo scuro).
//   - lato: dove sta il gruppo nella rete, "sinistra" o "destra".
//
// ATTENZIONE: in index.html c'è una copia dell'elenco per chi non ha JavaScript.
// Se cambi i dati qui, aggiorna anche quella (vedi il commento in index.html).

const GRUPPI = [
  {
    nome: "Informatica", lato: "sinistra",
    competenze: [
      { nome: "HTML", livello: 2, nota: "2 progetti", icona: "devicon-html5-plain colored" },
      { nome: "CSS", livello: 2, nota: "2 progetti", icona: "devicon-css3-plain colored" },
      { nome: "JavaScript", livello: 3, nota: "2 progetti", icona: "devicon-javascript-plain colored" },
      { nome: "Python", livello: 2, nota: "Laboratori universitari di ML e AI", icona: "devicon-python-plain colored" },
      { nome: "Java", livello: 4, nota: "1 esame universitario", icona: "devicon-java-plain colored" },
      { nome: "C++", livello: 4, nota: "2 esami universitari", icona: "devicon-cplusplus-plain colored" },
      { nome: "SQL", livello: 3, nota: "1 esame universitario", icona: "devicon-mysql-plain" },
      { nome: "GitHub", livello: 4, icona: "devicon-github-original" },
      { nome: "C", icona: "devicon-c-plain colored" },
      { nome: "Bash", icona: "devicon-bash-plain" },
      { nome: "Linux", icona: "devicon-linux-plain" },
      { nome: "Windows", icona: "devicon-windows8-original colored" },
    ],
  },
  {
    nome: "Lingue", lato: "sinistra",
    competenze: [
      { nome: "Italiano", livello: 6, nota: "L1", bandiera: "it" },
      { nome: "Tedesco", livello: 5, nota: "L2", bandiera: "de" },
      { nome: "Inglese", livello: 4, nota: "B2", bandiera: "gb" },
      { nome: "Spagnolo", livello: 4, nota: "B2", bandiera: "es" },
    ],
  },
  {
    nome: "Business", lato: "destra",
    competenze: [
      { nome: "Spedizioni internazionali" },
      { nome: "Pratiche doganali" },
      { nome: "Origine delle merci" },
      { nome: "Intrastat" },
      { nome: "Contabilità" },
      { nome: "Offerte e ordini" },
    ],
  },
  {
    nome: "Soft skills", lato: "destra",
    competenze: [
      { nome: "Comunicazione" },
      { nome: "Precisione" },
      { nome: "Metodo" },
      { nome: "Curiosità" },
      { nome: "Flessibilità" },
      { nome: "Insegnamento" },
      { nome: "Collaborazione" },
      { nome: "Determinazione" },
      { nome: "Leadership" },
    ],
  },
  {
    nome: "Danza", lato: "destra",
    competenze: [
      { nome: "Didattica" },
      { nome: "Coaching" },
      { nome: "Gestione del gruppo" },
      { nome: "Progettazione dei corsi" },
      { nome: "Correzione e feedback" },
      { nome: "Presenza scenica" },
      { nome: "Improvvisazione" },
      { nome: "Lavoro in compagnia" },
      { nome: "Social Media Manager" },
    ],
  },
  {
    nome: "Fotografia", lato: "sinistra",
    competenze: [
      { nome: "Adobe Photoshop" },
      { nome: "Adobe Lightroom" },
      { nome: "Adobe Illustrator" },
    ],
  },
];

// Collegamenti tra competenze di gruppi diversi (ipotesi: modificale liberamente).
// Usa i nomi esatti scritti sopra.
const COLLEGAMENTI = [
  ["Tedesco", "Spedizioni internazionali"],
  ["Inglese", "Pratiche doganali"],
  ["Comunicazione", "Insegnamento"],
  ["SQL", "Contabilità"],
  ["Metodo", "C++"],
  ["Curiosità", "Python"],
];

const LIVELLO_MASSIMO = 6;


// ===== Elenco a gruppi (telefono e lettori di schermo) =====

// Restituisce l'HTML dell'elenco: lo stesso che c'è in index.html per chi non ha JavaScript.
function htmlElenco() {
  return GRUPPI.map(gruppo => `
    <div class="gruppo-elenco">
      <h3>${gruppo.nome}</h3>
      <ul>${gruppo.competenze.map(htmlVoce).join("")}
      </ul>
    </div>`).join("");
}

// Logo o bandiera davanti al nome (decorativi: alt="" e aria-hidden, il nome basta).
function htmlSimbolo(c) {
  if (c.bandiera) return `<img class="bandiera" src="https://flagcdn.com/24x18/${c.bandiera}.png" alt="" width="24" height="18">`;
  if (c.icona) return `<i class="icona ${c.icona}" aria-hidden="true"></i>`;
  return "";
}

function htmlVoce(c) {
  const simbolo = htmlSimbolo(c);
  const livello = c.livello === undefined ? "" :
    `<meter min="0" max="${LIVELLO_MASSIMO}" value="${c.livello}" aria-hidden="true"></meter><span class="livello">Livello ${c.livello} su ${LIVELLO_MASSIMO}</span>`;
  const nota = c.nota ? `<span class="nota">${c.nota}</span>` : "";
  return `
        <li><span class="nome">${simbolo}${c.nome}</span>${livello}${nota}</li>`;
}


// ===== Disegno della rete =====
// Le posizioni sono in un riquadro immaginario largo 1000 unità; l'altezza dipende
// da quante competenze ci sono nella colonna più lunga.
// Il CSS adatta il riquadro alla larghezza dello schermo mantenendo le proporzioni.

const LARGHEZZA = 1000;
const X_GRUPPO = { sinistra: 390, destra: 610 };     // strato intermedio
const X_COMPETENZA = { sinistra: 230, destra: 770 }; // strati esterni
const PASSO = 32;   // distanza verticale tra due competenze
const STACCO = 28;  // spazio in più tra un gruppo e l'altro
const MARGINE = 40; // spazio sopra e sotto le colonne (per le etichette dei gruppi)

// Altezza di una colonna: tutte le sue competenze più gli stacchi tra i gruppi.
function altezzaColonna(lato) {
  const gruppi = GRUPPI.filter(g => g.lato === lato);
  const quante = gruppi.reduce((somma, g) => somma + g.competenze.length, 0);
  return quante * PASSO + (gruppi.length - 1) * STACCO;
}

const ALTEZZA = Math.max(altezzaColonna("sinistra"), altezzaColonna("destra")) + 2 * MARGINE;
const CENTRO = { x: LARGHEZZA / 2, y: ALTEZZA / 2 };

// Diametro del nodo (in unità del riquadro): cresce con il livello.
// Senza livello: grandezza standard, sempre uguale.
function diametro(livello) {
  if (livello === undefined) return 14;
  return 10 + livello * 2.5; // da 10 (livello 0) a 25 (livello 6)
}

// Calcola la posizione di ogni nodo. Restituisce l'elenco dei nodi.
function calcolaPosizioni() {
  const nodi = [{ chiave: "centro", tipo: "centro", nome: "Stefania", x: CENTRO.x, y: CENTRO.y, d: 84 }];

  for (const lato of ["sinistra", "destra"]) {
    const gruppi = GRUPPI.filter(g => g.lato === lato);
    let y = (ALTEZZA - altezzaColonna(lato)) / 2 + PASSO / 2; // la colonna è centrata in verticale

    for (const gruppo of gruppi) {
      const yInizio = y;
      for (const c of gruppo.competenze) {
        nodi.push({ chiave: "c:" + c.nome, tipo: "competenza", nome: c.nome, gruppo: gruppo.nome, lato, dati: c,
                    x: X_COMPETENZA[lato], y, d: diametro(c.livello) });
        y += PASSO;
      }
      // il nodo del gruppo sta all'altezza media delle sue competenze
      const yGruppo = (yInizio + y - PASSO) / 2;
      nodi.push({ chiave: "g:" + gruppo.nome, tipo: "gruppo", nome: gruppo.nome, lato, dati: gruppo,
                  x: X_GRUPPO[lato], y: yGruppo, d: 22 });
      y += STACCO;
    }
  }
  return nodi;
}

// Elenco dei fili: centro → gruppi, gruppo → competenze, più i collegamenti tra gruppi.
function calcolaFili(nodi) {
  const trova = chiave => nodi.find(n => n.chiave === chiave);
  const fili = [];
  for (const gruppo of GRUPPI) {
    fili.push({ da: "centro", a: "g:" + gruppo.nome });
    for (const c of gruppo.competenze) fili.push({ da: "g:" + gruppo.nome, a: "c:" + c.nome });
  }
  for (const [primo, secondo] of COLLEGAMENTI) {
    if (!trova("c:" + primo) || !trova("c:" + secondo)) {
      console.warn(`Competenze: collegamento ignorato, nome non trovato: "${primo}" - "${secondo}"`);
      continue;
    }
    fili.push({ da: "c:" + primo, a: "c:" + secondo, trasversale: true });
  }
  return fili;
}

// Percorso curvo tra due punti: parte e arriva in orizzontale, come le sinapsi disegnate a mano.
function curva(p, q) {
  const metà = (p.x + q.x) / 2;
  return `M ${p.x} ${p.y} C ${metà} ${p.y}, ${metà} ${q.y}, ${q.x} ${q.y}`;
}

const SVG = "http://www.w3.org/2000/svg";

function creaRete(sezione) {
  const nodi = calcolaPosizioni();
  const fili = calcolaFili(nodi);
  const perChiave = new Map(nodi.map(n => [n.chiave, n]));

  // contenitore: legenda, rete, scheda dei dettagli
  const legenda = document.createElement("p");
  legenda.className = "rete-legenda tenue";
  legenda.textContent = `Nodo pieno: più è grande, più alto è il livello (da 0 a ${LIVELLO_MASSIMO}). Nodo vuoto: livello non indicato. Passa sopra un nodo o clicca per i dettagli.`;

  const rete = document.createElement("div");
  rete.className = "rete";
  rete.style.aspectRatio = `${LARGHEZZA} / ${ALTEZZA}`; // stesse proporzioni del riquadro dei calcoli
  rete.setAttribute("role", "group");
  rete.setAttribute("aria-label", "Rete delle competenze");

  const scheda = document.createElement("div");
  scheda.className = "rete-scheda";
  scheda.setAttribute("aria-live", "polite"); // i lettori di schermo leggono i dettagli quando cambiano
  scheda.innerHTML = `<p class="tenue">Clicca un nodo per vedere nome, livello e nota.</p>`;

  // 1. i fili, disegnati in SVG (decorativi: per i lettori di schermo c'è l'elenco)
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${LARGHEZZA} ${ALTEZZA}`);
  svg.setAttribute("aria-hidden", "true");
  for (const filo of fili) {
    const d = curva(perChiave.get(filo.da), perChiave.get(filo.a));
    // ogni filo ha due tracciati: la linea di base e l'impulso che scorre quando si accende
    filo.base = document.createElementNS(SVG, "path");
    filo.base.setAttribute("d", d);
    filo.base.setAttribute("class", filo.trasversale ? "filo-base trasversale" : "filo-base");
    filo.impulso = document.createElementNS(SVG, "path");
    filo.impulso.setAttribute("d", d);
    filo.impulso.setAttribute("class", "impulso");
    filo.impulso.setAttribute("pathLength", "100"); // così la lunghezza dell'impulso è uguale su ogni filo
    svg.append(filo.base, filo.impulso);
  }
  rete.append(svg);

  // 2. i nodi, come veri bottoni: si raggiungono con Tab e si attivano con Invio
  for (const nodo of nodi) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `nodo ${nodo.tipo}` + (nodo.lato ? ` lato-${nodo.lato}` : "") +
                  (nodo.tipo === "competenza" && nodo.dati.livello === undefined ? " senza-livello" : "");
    b.style.left = (nodo.x / LARGHEZZA * 100) + "%";
    b.style.top = (nodo.y / ALTEZZA * 100) + "%";
    b.style.setProperty("--d", nodo.d); // il CSS trasforma il diametro in larghezza
    b.setAttribute("aria-pressed", "false");

    // etichetta: logo o bandiera (solo per le competenze) + nome
    const etichetta = document.createElement("span");
    etichetta.innerHTML = nodo.tipo === "competenza" ? htmlSimbolo(nodo.dati) : "";
    etichetta.append(nodo.nome);
    b.append(etichetta);

    nodo.el = b;
    nodo.fili = fili.filter(f => f.da === nodo.chiave || f.a === nodo.chiave);
    rete.append(b);
  }

  // 3. interazione
  let scelto = null; // il nodo cliccato resta acceso finché non se ne sceglie un altro

  function accendi(nodo) {
    rete.querySelectorAll(".acceso, .attivo, .vicino").forEach(el => el.classList.remove("acceso", "attivo", "vicino", "indietro"));
    rete.classList.toggle("in-uso", Boolean(nodo));
    if (!nodo) return;
    nodo.el.classList.add("attivo");
    for (const filo of nodo.fili) {
      filo.base.classList.add("acceso");
      filo.impulso.classList.add("acceso");
      // l'impulso parte sempre dal nodo acceso e va verso l'altro capo del filo
      if (filo.a === nodo.chiave) filo.impulso.classList.add("indietro");
      const altro = perChiave.get(filo.da === nodo.chiave ? filo.a : filo.da);
      altro.el.classList.add("vicino");
    }
  }

  function mostraScheda(nodo) {
    let righe;
    if (nodo.tipo === "centro") {
      const totale = GRUPPI.reduce((s, g) => s + g.competenze.length, 0);
      righe = `<p class="tenue">${GRUPPI.length} gruppi · ${totale} competenze</p>`;
    } else if (nodo.tipo === "gruppo") {
      righe = `<p class="tenue">Gruppo · ${nodo.dati.competenze.length} competenze</p>`;
    } else {
      const c = nodo.dati;
      const livello = c.livello === undefined ? "Livello non indicato" :
        `<meter min="0" max="${LIVELLO_MASSIMO}" value="${c.livello}" aria-hidden="true"></meter> Livello ${c.livello} su ${LIVELLO_MASSIMO}`;
      righe = `<p class="etichetta">${nodo.gruppo}</p><p class="rete-livello">${livello}</p>` +
              (c.nota ? `<p class="tenue">${c.nota}</p>` : "");
    }
    scheda.innerHTML = `<h3>${nodo.nome}</h3>${righe}`;
  }

  for (const nodo of nodi) {
    nodo.el.addEventListener("pointerenter", () => accendi(nodo));
    nodo.el.addEventListener("focus", () => accendi(nodo));
    // uscendo dal nodo torna acceso quello cliccato (se c'è)
    nodo.el.addEventListener("pointerleave", () => accendi(scelto));
    nodo.el.addEventListener("blur", () => accendi(scelto));
    nodo.el.addEventListener("click", () => {
      if (scelto) scelto.el.setAttribute("aria-pressed", "false");
      scelto = nodo;
      nodo.el.setAttribute("aria-pressed", "true");
      accendi(nodo);
      mostraScheda(nodo);
    });
  }

  sezione.querySelector(".competenze-elenco").before(legenda, rete, scheda);
  sezione.classList.add("con-rete"); // da qui il CSS mostra la rete su schermo largo
}


// ===== Avvio =====
const sezioneCompetenze = document.querySelector("#competenze");
if (sezioneCompetenze) {
  // l'elenco viene rigenerato dai dati, così è sempre allineato alla rete
  sezioneCompetenze.querySelector(".competenze-elenco").innerHTML = htmlElenco();
  creaRete(sezioneCompetenze);
}
