// Prova tutto il percorso senza spedire email né contattare Cloudflare:  npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, rm, access } from "node:fs/promises";

process.env.CV_SEGRETO = "segreto-di-prova-lungo-almeno-trentadue-caratteri";
process.env.EMAIL_PROVA = "1";
process.env.TURNSTILE_SEGRETO = "prova";
process.env.SITO_URL = "https://esempio.test";
process.env.EMAIL_DESTINATARIA = "stefania@esempio.test";

const { default: richiesta } = await import("../api/richiesta.js");
const { default: approva } = await import("../api/approva.js");
const { default: cv } = await import("../api/cv.js");
const { creaToken, leggiToken } = await import("../api/_firma.js");

// --- finti req/res con la stessa interfaccia delle funzioni Vercel ---
function finta(method, { body, query = {}, headers = {} } = {}) {
  return { method, body, query, headers };
}
function rispostaFinta() {
  const r = { stato: 200, intestazioni: {}, corpo: undefined };
  r.status = s => (r.stato = s, r);
  r.setHeader = (k, v) => (r.intestazioni[k.toLowerCase()] = v, r);
  r.json = o => (r.corpo = o, r);
  r.send = c => (r.corpo = c, r);
  r.end = () => r;
  r.redirect = (s, url) => (r.stato = s, r.intestazioni.location = url, r);
  return r;
}

// cattura le "email" stampate in modalità prova
let email = [];
const logOriginale = console.log;
const fetchOriginale = globalThis.fetch;
let turnstileOk = true;
let cvEsisteva = true;

before(async () => {
  console.log = (...a) => { const t = a.join(" "); if (t.includes("[EMAIL DI PROVA]")) email.push(t); else logOriginale(...a); };
  globalThis.fetch = async () => ({ json: async () => ({ success: turnstileOk }) });
  try { await access("privato/cv.pdf"); } catch {
    cvEsisteva = false;
    await mkdir("privato", { recursive: true });
    await writeFile("privato/cv.pdf", "%PDF-finto");
  }
});
after(async () => {
  console.log = logOriginale;
  globalThis.fetch = fetchOriginale;
  if (!cvEsisteva) await rm("privato/cv.pdf");
});

const linkDa = (testo, percorso) => new URL(testo.match(new RegExp(`https://esempio\\.test${percorso}\\?t=[^"\\s]+`))[0]).searchParams.get("t");
const modulo = extra => ({ nome: "Mario Rossi", email: "mario@azienda.test", azienda: "Azienda <b>Srl</b>", motivo: "Posizione aperta", "cf-turnstile-response": "x", ...extra });
const JSON_H = { accept: "application/json" };

test("percorso completo: richiesta → approvazione → download", async () => {
  email = [];
  const r1 = rispostaFinta();
  await richiesta(finta("POST", { body: modulo(), headers: JSON_H }), r1);
  assert.equal(r1.stato, 200);
  assert.equal(r1.corpo.esito, "inviato");
  assert.equal(email.length, 1);
  assert.match(email[0], /a: stefania@esempio\.test/);
  assert.match(email[0], /Azienda &lt;b&gt;Srl&lt;\/b&gt;/, "il testo dei visitatori deve essere reso innocuo");

  // GET sull'approvazione: mostra solo il riepilogo, non invia niente
  const tApprova = linkDa(email[0], "/api/approva");
  const r2 = rispostaFinta();
  await approva(finta("GET", { query: { t: tApprova } }), r2);
  assert.equal(r2.stato, 200);
  assert.match(r2.corpo, /Approva e invia il link/);
  assert.equal(email.length, 1, "aprire il link non deve approvare");

  // POST: approvato, parte l'email al richiedente
  const r3 = rispostaFinta();
  await approva(finta("POST", { body: { t: tApprova } }), r3);
  assert.equal(r3.stato, 200);
  assert.equal(email.length, 2);
  assert.match(email[1], /a: mario@azienda\.test/);

  // download
  const r4 = rispostaFinta();
  await cv(finta("GET", { query: { t: linkDa(email[1], "/api/cv") } }), r4);
  assert.equal(r4.stato, 200);
  assert.equal(r4.intestazioni["content-type"], "application/pdf");
  assert.match(String(r4.corpo), /^%PDF/);
});

test("link manomessi, scaduti o del tipo sbagliato vengono rifiutati", async () => {
  const buono = creaToken("cv", { e: "a@b.test" }, 60_000);
  const [contenuto, firma] = buono.split(".");
  const altro = Buffer.from(JSON.stringify({ e: "intruso@b.test", tipo: "cv", scade: Date.now() + 1e9 })).toString("base64url");

  assert.ok(leggiToken(buono, "cv"));
  assert.equal(leggiToken(`${altro}.${firma}`, "cv"), null, "contenuto cambiato");
  assert.equal(leggiToken(`${contenuto}.x${firma.slice(1)}`, "cv"), null, "firma cambiata");
  assert.equal(leggiToken(creaToken("cv", {}, -1), "cv"), null, "scaduto");
  assert.equal(leggiToken(creaToken("approva", {}, 60_000), "cv"), null, "tipo sbagliato: un link di approvazione non scarica il CV");
  assert.equal(leggiToken(undefined, "cv"), null);

  const r = rispostaFinta();
  await cv(finta("GET", { query: { t: `${altro}.${firma}` } }), r);
  assert.equal(r.stato, 403);
});

test("il modulo rifiuta dati mancanti, bot e verifica anti-spam fallita", async () => {
  email = [];
  const vuoto = rispostaFinta();
  await richiesta(finta("POST", { body: modulo({ email: "non-una-email" }), headers: JSON_H }), vuoto);
  assert.equal(vuoto.stato, 400);

  const bot = rispostaFinta();
  await richiesta(finta("POST", { body: modulo({ sito_web: "http://spam" }), headers: JSON_H }), bot);
  assert.equal(bot.corpo.esito, "inviato", "al bot sembra andata bene...");
  assert.equal(email.length, 0, "...ma nessuna email parte");

  turnstileOk = false;
  const robot = rispostaFinta();
  await richiesta(finta("POST", { body: modulo(), headers: JSON_H }), robot);
  turnstileOk = true;
  assert.equal(robot.stato, 400);
  assert.equal(email.length, 0);

  const get = rispostaFinta();
  await richiesta(finta("GET"), get);
  assert.equal(get.stato, 405);
});

test("senza JavaScript il modulo torna alla pagina", async () => {
  const r = rispostaFinta();
  await richiesta(finta("POST", { body: modulo() }), r);
  assert.equal(r.stato, 303);
  assert.equal(r.intestazioni.location, "/?cv=inviato#cvEcontatti");
});
