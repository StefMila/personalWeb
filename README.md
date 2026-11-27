# Sito personale

Sito statico (cartella `public/`) più tre piccole funzioni su Vercel (cartella `api/`) per la **richiesta del CV con approvazione**.

## Come funziona la richiesta del CV

1. Chi visita compila il modulo "Richiedi il CV" → `api/richiesta.js` ti manda un'email con i dati e un link.
2. Apri il link → `api/approva.js` mostra il riepilogo; premi **Approva** e a chi ha chiesto arriva un link personale.
3. Quel link → `api/cv.js` consegna il PDF. Vale **24 ore**; il link di approvazione vale **7 giorni**.

I link sono firmati con `CV_SEGRETO`: non si possono inventare né modificare. Il PDF sta in `privato/`, fuori dalla parte pubblica: `/cv.pdf` non esiste.

```
public/      il sito (index.html, css, js, immagini)
api/         le funzioni (i file che iniziano con _ sono codice condiviso, non indirizzi pubblici)
privato/     cv.pdf  ← mettilo qui tu, NON va in git
test/        npm test prova tutto il percorso senza spedire email
```

## Configurazione (una volta sola)

### 1. Il CV
Copia il tuo CV in `privato/cv.pdf`. È escluso da git (`.gitignore`) così non finisce per sbaglio su GitHub.

### 2. Gmail: password per le app
1. Attiva la verifica in due passaggi sul tuo account Google.
2. Vai su <https://myaccount.google.com/apppasswords>, crea una password (nome: "sito") e copiala: 16 lettere.
   È diversa dalla tua password di Gmail e serve solo al sito; puoi revocarla quando vuoi.

### 3. Cloudflare Turnstile (anti-spam, gratuito)
1. Su <https://dash.cloudflare.com> → **Turnstile** → **Add widget**.
2. Hostname: l'indirizzo del sito su Vercel (es. `tuosito.vercel.app`).
3. Copia la **Site Key** in `public/index.html`, al posto di `1x00000000000000000000AA` (è pubblica, va bene che stia nella pagina).
4. Tieni da parte la **Secret Key** per il passo 4 (questa invece è segreta).

> `1x00000000000000000000AA` è la chiave di prova di Cloudflare che fa sempre passare la verifica: va bene in locale, **non** in produzione.

### 4. Variabili segrete su Vercel
Vercel → progetto → **Settings → Environment Variables** (ambiente *Production*):

| Nome | Valore |
|---|---|
| `CV_SEGRETO` | una stringa casuale lunga: generala con `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `GMAIL_UTENTE` | il tuo indirizzo Gmail |
| `GMAIL_PASSWORD_APP` | la password per le app del passo 2 |
| `TURNSTILE_SEGRETO` | la Secret Key del passo 3 |
| `SITO_URL` | l'indirizzo del sito, es. `https://tuosito.vercel.app` (senza `/` finale) |
| `EMAIL_DESTINATARIA` | *(facoltativo)* dove ricevere le richieste, se diverso da `GMAIL_UTENTE` |

Non scriverle mai nel codice. Se cambi `CV_SEGRETO`, tutti i link già inviati smettono di funzionare (utile se vuoi "revocarli").

## Provare in locale

```bash
npm install
npm test          # prova richiesta → approvazione → download, senza spedire email
```

Per provare il sito vero con le funzioni: crea un file `.env` nella cartella principale (escluso da git) con

```
CV_SEGRETO=una-stringa-lunga-almeno-32-caratteri-per-le-prove
EMAIL_PROVA=1
TURNSTILE_SEGRETO=1x0000000000000000000000000000000AA
SITO_URL=http://localhost:3000
EMAIL_DESTINATARIA=tu@esempio.it
```

e avvia `npm run dev` (serve la [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`). Con `EMAIL_PROVA=1`
le email non partono: vengono stampate nel terminale, con i link da aprire nel browser.

## Pubblicare

Il CV non è in git, quindi pubblica **da terminale**, che carica anche `privato/cv.pdf`:

```bash
vercel --prod
```

Se invece colleghi Vercel a un repository GitHub (pubblicazione automatica a ogni push), il PDF non ci sarebbe.
In quel caso usa un repository **privato** e togli la riga `privato/*.pdf` da `.gitignore`.

## Se qualcosa non va

- **Il modulo dice "Qualcosa è andato storto"**: guarda i log in Vercel → progetto → **Logs**. Di solito manca una variabile (il messaggio dice quale) o la password per le app è sbagliata.
- **"Verifica anti-spam non superata"**: la Site Key in `index.html` e la Secret Key su Vercel devono essere dello stesso widget, e l'hostname del widget deve essere quello del sito.
- **Non arrivano email**: controlla lo spam; verifica `GMAIL_UTENTE` e `GMAIL_PASSWORD_APP`.
