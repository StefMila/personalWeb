// Invia la richiesta del CV senza ricaricare la pagina e mostra l'esito sotto il modulo.
// Senza JavaScript il modulo funziona lo stesso: il server rimanda alla pagina con ?cv=inviato o ?cv=errore.
(function () {
  const form = document.querySelector(".richiesta-cv form");
  if (!form) return;
  const esito = form.querySelector(".esito");
  const bottone = form.querySelector("button[type=submit]");

  function mostra(testo, errore) {
    esito.textContent = testo;
    esito.classList.toggle("errore", errore);
  }

  // ritorno dal server senza JavaScript
  const stato = new URLSearchParams(location.search).get("cv");
  if (stato) {
    form.closest("details").open = true;
    mostra(stato === "inviato" ? "Richiesta inviata! Riceverai il CV via email appena approvata." : "Invio non riuscito. Controlla i campi e riprova.", stato !== "inviato");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    bottone.disabled = true;
    mostra("Invio in corso…", false);
    try {
      const r = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams(new FormData(form)),
      });
      const dati = await r.json();
      mostra(dati.messaggio, !r.ok);
      if (r.ok) form.reset();
    } catch {
      mostra("Invio non riuscito. Controlla la connessione e riprova.", true);
    } finally {
      bottone.disabled = false;
      window.turnstile?.reset(); // ogni verifica anti-spam vale una sola volta
    }
  });
})();
