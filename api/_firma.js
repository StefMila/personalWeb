// Link firmati: i dati stanno nel link stesso, protetti da una firma HMAC.
// Chi non conosce CV_SEGRETO non può crearne né modificarne uno.
// (I file che iniziano con "_" in api/ non diventano funzioni pubbliche.)
import { createHmac, timingSafeEqual } from "node:crypto";

function segreto() {
  const s = process.env.CV_SEGRETO;
  if (!s || s.length < 32) throw new Error("CV_SEGRETO mancante o troppo corto (minimo 32 caratteri)");
  return s;
}

function firma(testo) {
  return createHmac("sha256", segreto()).update(testo).digest("base64url");
}

/** Crea un token di tipo `tipo` con i `dati`, valido per `durataMs` millisecondi. */
export function creaToken(tipo, dati, durataMs) {
  const contenuto = Buffer.from(JSON.stringify({ ...dati, tipo, scade: Date.now() + durataMs })).toString("base64url");
  return `${contenuto}.${firma(contenuto)}`;
}

/** Restituisce i dati se il token è integro, del tipo giusto e non scaduto; altrimenti null. */
export function leggiToken(token, tipo) {
  if (typeof token !== "string") return null;
  const [contenuto, f] = token.split(".");
  if (!contenuto || !f) return null;

  const attesa = Buffer.from(firma(contenuto));
  const ricevuta = Buffer.from(f);
  if (attesa.length !== ricevuta.length || !timingSafeEqual(attesa, ricevuta)) return null;

  let dati;
  try { dati = JSON.parse(Buffer.from(contenuto, "base64url").toString("utf8")); } catch { return null; }
  if (dati.tipo !== tipo || typeof dati.scade !== "number" || dati.scade < Date.now()) return null;
  return dati;
}

export const GIORNO = 24 * 60 * 60 * 1000;
