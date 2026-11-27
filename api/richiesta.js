// 1° passo: un visitatore chiede il CV. Ti arriva un'email con i suoi dati e il link per approvare.
import { creaToken, GIORNO } from "./_firma.js";
import { inviaEmail, emailProprietaria, urlSito, esc } from "./_comune.js";

const EMAIL_VALIDA = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const LIMITI = { nome: 100, email: 200, azienda: 150, motivo: 1000 };

async function verificaTurnstile(token, ip) {
  const segreto = process.env.TURNSTILE_SEGRETO;
  if (!segreto) throw new Error("TURNSTILE_SEGRETO mancante");
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: segreto, response: token ?? "", ...(ip ? { remoteip: ip } : {}) }),
  });
  return (await r.json()).success === true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).setHeader("Allow", "POST").json({ errore: "Metodo non consentito" });

  // dal sito il modulo è inviato con fetch e vuole JSON; senza JavaScript torna alla pagina
  const vuoleJson = (req.headers.accept || "").includes("application/json");
  const rispondi = (stato, esito, messaggio) => vuoleJson
    ? res.status(stato).json({ esito, messaggio })
    : res.redirect(303, `/?cv=${esito}#cvEcontatti`);

  const b = req.body || {};

  // campo trappola: invisibile alle persone, i bot lo compilano. Fingiamo che sia andata bene.
  if (b.sito_web) return rispondi(200, "inviato", "Richiesta inviata.");

  const dati = {};
  for (const [campo, max] of Object.entries(LIMITI)) dati[campo] = String(b[campo] ?? "").trim().slice(0, max);
  if (!dati.nome || !EMAIL_VALIDA.test(dati.email) || !dati.motivo) {
    return rispondi(400, "errore", "Compila nome, un'email valida e il motivo della richiesta.");
  }

  try {
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (!(await verificaTurnstile(b["cf-turnstile-response"], ip))) {
      return rispondi(400, "errore", "Verifica anti-spam non superata. Riprova.");
    }

    const token = creaToken("approva", { n: dati.nome, e: dati.email, a: dati.azienda, m: dati.motivo }, 7 * GIORNO);
    const link = `${urlSito()}/api/approva?t=${encodeURIComponent(token)}`;

    await inviaEmail({
      a: emailProprietaria(),
      rispondiA: dati.email,
      oggetto: `Richiesta CV da ${dati.nome}${dati.azienda ? ` (${dati.azienda})` : ""}`,
      html: `<p>Hai ricevuto una richiesta per il tuo CV.</p>
<p><b>Nome:</b> ${esc(dati.nome)}<br><b>Email:</b> ${esc(dati.email)}<br><b>Azienda:</b> ${esc(dati.azienda || "—")}</p>
<p><b>Motivo:</b><br>${esc(dati.motivo).replace(/\n/g, "<br>")}</p>
<p><a href="${link}">Apri la pagina per approvare</a> (il link vale 7 giorni).</p>
<p>Se non vuoi inviarlo, ignora questa email.</p>`,
    });
    return rispondi(200, "inviato", "Richiesta inviata! Riceverai il CV via email appena approvata.");
  } catch (err) {
    console.error(err);
    return rispondi(500, "errore", "Qualcosa è andato storto. Riprova più tardi.");
  }
}
