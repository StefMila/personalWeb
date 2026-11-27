// Funzioni condivise: invio email, indirizzo del sito, pagine di risposta.
import nodemailer from "nodemailer";

/** Indirizzo pubblico del sito, usato nei link delle email.
 *  Viene dalle impostazioni e mai dalla richiesta, così nessuno può far puntare i link altrove. */
export function urlSito() {
  if (process.env.SITO_URL) return process.env.SITO_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  throw new Error("SITO_URL mancante");
}

export function emailProprietaria() {
  return process.env.EMAIL_DESTINATARIA || process.env.GMAIL_UTENTE;
}

/** Evita che il testo scritto dai visitatori venga interpretato come HTML. */
export function esc(testo) {
  return String(testo ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

let trasporto;
/** Invia un'email dal tuo Gmail. Con EMAIL_PROVA=1 la stampa nel terminale invece di spedirla. */
export async function inviaEmail({ a, oggetto, html, rispondiA }) {
  if (process.env.EMAIL_PROVA === "1") {
    console.log(`\n[EMAIL DI PROVA] a: ${a} | oggetto: ${oggetto}${rispondiA ? ` | rispondi a: ${rispondiA}` : ""}\n${html}\n`);
    return;
  }
  trasporto ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_UTENTE, pass: process.env.GMAIL_PASSWORD_APP },
  });
  await trasporto.sendMail({
    from: `"Sito di Stefania Milani" <${process.env.GMAIL_UTENTE}>`,
    to: a, subject: oggetto, html, replyTo: rispondiA,
  });
}

/** Pagina HTML semplice, con lo stesso aspetto del sito. */
export function pagina(res, stato, titolo, corpo) {
  res.status(stato)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .setHeader("Cache-Control", "no-store")
    .setHeader("X-Robots-Tag", "noindex")
    .send(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#f2f2f0;font:16px/1.5 Arial,sans-serif}
main{max-width:560px;padding:40px 20px}h1{font:700 40px/1.1 "Space Grotesk",Arial,sans-serif;margin:0 0 24px}
dl{color:#a3a3a3}dt{font:12px "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;margin-top:12px}dd{margin:0;color:#f2f2f0}
button,a.pillola{display:inline-block;margin-top:24px;padding:10px 22px;border:1px solid currentColor;border-radius:40px;background:none;color:inherit;font:inherit;cursor:pointer;text-decoration:none}
button:hover,a.pillola:hover{background:#c8102e;border-color:#c8102e}
</style></head><body><main><h1>${esc(titolo)}</h1>${corpo}</main></body></html>`);
}
