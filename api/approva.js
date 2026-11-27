// 2° passo: apri il link dall'email (GET) e vedi il riepilogo; premendo "Approva" (POST)
// a chi ha chiesto arriva il link personale per scaricare il CV.
// L'approvazione richiede il tasto perché alcuni sistemi di posta aprono da soli i link per controllarli:
// con un semplice link approverebbero tutto senza di te.
import { creaToken, leggiToken, GIORNO } from "./_firma.js";
import { inviaEmail, urlSito, esc, pagina } from "./_comune.js";

export default async function handler(req, res) {
  const token = req.method === "POST" ? req.body?.t : req.query.t;
  const r = leggiToken(token, "approva");
  if (!r) return pagina(res, 403, "Link non valido", "<p>Questo link di approvazione è scaduto o non è valido.</p>");

  if (req.method === "GET") {
    return pagina(res, 200, "Approvi l'invio del CV?", `
<dl><dt>Nome</dt><dd>${esc(r.n)}</dd><dt>Email</dt><dd>${esc(r.e)}</dd>
<dt>Azienda</dt><dd>${esc(r.a || "—")}</dd><dt>Motivo</dt><dd>${esc(r.m).replace(/\n/g, "<br>")}</dd></dl>
<form method="post"><input type="hidden" name="t" value="${esc(token)}"><button type="submit">Approva e invia il link</button></form>`);
  }

  if (req.method !== "POST") return res.status(405).setHeader("Allow", "GET, POST").end();

  try {
    const download = creaToken("cv", { e: r.e }, GIORNO);
    const link = `${urlSito()}/api/cv?t=${encodeURIComponent(download)}`;
    await inviaEmail({
      a: r.e,
      oggetto: "Il CV di Stefania Milani",
      html: `<p>Ciao ${esc(r.n)},</p>
<p>grazie per l'interesse! Puoi scaricare il mio CV da questo link personale, valido 24 ore:</p>
<p><a href="${link}">Scarica il CV</a></p>
<p>Un saluto,<br>Stefania Milani</p>`,
    });
    return pagina(res, 200, "Fatto!", `<p>Il link per scaricare il CV è stato inviato a <b>${esc(r.e)}</b>. Vale 24 ore.</p>`);
  } catch (err) {
    console.error(err);
    return pagina(res, 500, "Invio non riuscito", "<p>Non è stato possibile inviare l'email. Riprova più tardi.</p>");
  }
}
