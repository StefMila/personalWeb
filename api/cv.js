// 3° passo: chi ha ricevuto il link scarica il CV. Il PDF sta in privato/, fuori dalla parte pubblica del sito.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { leggiToken } from "./_firma.js";
import { pagina } from "./_comune.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).setHeader("Allow", "GET").end();
  if (!leggiToken(req.query.t, "cv")) {
    return pagina(res, 403, "Link scaduto", "<p>Questo link per scaricare il CV è scaduto o non è valido.</p><p>Puoi fare una nuova richiesta dal sito.</p>");
  }

  try {
    const pdf = await readFile(path.join(process.cwd(), "privato", "cv.pdf"));
    res.status(200)
      .setHeader("Content-Type", "application/pdf")
      .setHeader("Content-Disposition", 'attachment; filename="CV-Stefania-Milani.pdf"')
      .setHeader("Cache-Control", "private, no-store")
      .setHeader("X-Robots-Tag", "noindex")
      .send(pdf);
  } catch (err) {
    console.error(err);
    return pagina(res, 500, "CV non disponibile", "<p>Il CV non è al momento disponibile. Riprova più tardi.</p>");
  }
}
