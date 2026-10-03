# Copywriting for interfaces (German first)

Good design with weak copy still converts badly. This file collects formulas, word lists and microcopy that fit the tone of German SMB and SaaS products. Rules for page structure are in `website-playbook.md`; error-message mechanics in `ui-patterns.md` §1.

## 1. Voice

- **Du or Sie?** Pick one per product and keep it everywhere: emails, errors and legal text included.
  - **Du**: SaaS, apps, consumer products, agencies, events, younger audiences.
  - **Sie**: legal, tax, medical, finance, B2B enterprise, older audiences, most Handwerk sites (or the neutral "wir" form: "Wir melden uns innerhalb von 24 Stunden").
- **Concrete beats clever.** Use numbers, nouns the customer uses, and the real result.
- **Active voice, short sentences.** One idea per sentence. 3 lines per paragraph at most.
- **Sentence case** for headings and buttons ("Rechnung erstellen", not "Rechnung Erstellen").
- **No filler:**
  - "innovativ", "ganzheitlich", "maßgeschneidert", "Lösungen"
  - "Willkommen auf unserer Website"
  - "Wir sind ein junges, dynamisches Team"
- **Formatting:**
  - „deutsche Anführungszeichen"
  - 1.234,56 €
  - 24 h, 5 Min., 3. Oktober 2026
  - en dash for ranges: 9–17 Uhr
  - `&nbsp;` between number and unit

## 2. Headlines

| Formula | Example |
|---|---|
| Outcome + audience | „Rechnungen in 30 Sekunden — für Kleinunternehmer" |
| What + where (local) | „Schreinerei für Küchen und Einbaumöbel in Offenburg" |
| Category + difference | „Die Buchhaltung, die sich selbst erledigt" |
| Pain → relief | „Nie wieder Rechnungen hinterhertelefonieren" |
| Statement + proof | „Frag einfach. Es bleibt in deiner Stube." + „0 Byte in die Cloud" |
| Question the customer already asks | „Was kostet eine neue Küche wirklich?" |

- Keep it to 8–10 words. The subline adds the *how* and one piece of proof.
- **Test:** cover the logo. Is it still clear what the page sells and to whom? If not, rewrite.
- Section headings are mini-promises ("Weniger Papierkram. Mehr bezahlte Rechnungen."), not labels ("Unsere Features").

## 3. Calls to action

- Pattern: **verb + outcome**, optionally plus a risk reducer next to the button.

| Context | Primary CTA | Risk reducer |
|---|---|---|
| SaaS trial | „14 Tage kostenlos testen" | „Keine Kreditkarte nötig" |
| Local trade | „Angebot anfragen" / „Jetzt anrufen" | „Antwort innerhalb von 24 h" |
| Consulting / Kanzlei | „Erstgespräch vereinbaren" | „kostenlos und unverbindlich" |
| Product launch | „Auf die Warteliste" / „Vorbestellen" | „Kein Liefertermin versprochen, wir schreiben einmal" |
| Event | „Ticket sichern" | „Bis 14 Tage vorher erstattbar" |
| Newsletter | „Jeden Freitag lesen" | „Abmelden mit einem Klick" |

- **Avoid:** „Absenden", „Mehr", „Hier klicken", „Jetzt starten!" without an object.
- **Secondary CTA** lowers commitment: „So funktioniert's", „Beispiele ansehen", „Preise ansehen".

## 4. Proof that reads as true

- Testimonials need a **name, role or city, and a specific result**: „Früher zwei Stunden pro Woche, jetzt zehn Minuten." — Lena B., Grafikdesignerin, Offenburg.
- **Numbers with context:** "seit 1998", "1.200 Küchen montiert", "4,9 ★ aus 180 Google-Bewertungen".
- **Never invent reviews, logos or numbers.** On concept pages, label sample data "(Beispiel)".

## 5. Microcopy library

**Buttons and states**

| Situation | Copy |
|---|---|
| Save | „Speichern" → „Gespeichert ✓" (inline, 2 s) |
| Saving (> 300 ms) | „Wird gespeichert…" |
| Delete (reversible) | Toast „Rechnung gelöscht" + „Rückgängig" |
| Delete (irreversible) | Dialog „RE-2026-0142 endgültig löschen?" · „Endgültig löschen" / „Behalten" |
| Opens a dialog or next step | „Umbenennen…", „Exportieren…" |
| Copy | „Kopieren" → „Kopiert" |
| Loading list | Skeleton, no text. After 10 s: „Dauert länger als üblich…" + cancel |

**Empty states** (say why it's empty, then the next step):
- First use: „Noch keine Rechnungen. Erstelle deine erste in 30 Sekunden." + [Rechnung erstellen]
- Filters: „Keine Treffer für ‚Krumm' mit Status ‚bezahlt'." + [Filter zurücksetzen]
- Done: „Alles erledigt. Keine offenen Aufgaben." (no button needed)

**Errors** (what happened + how to fix it; no blame, no "Oops"):
- Field empty: „Gib deine E-Mail-Adresse ein."
- Format: „Gib eine IBAN im Format DE + 20 Ziffern ein."
- Server: „Die Rechnung konnte nicht gespeichert werden. Deine Eingaben sind noch da." + [Erneut versuchen]
- Offline: „Keine Verbindung. Änderungen werden gespeichert, sobald du wieder online bist."
- Permission: „Nur Admins können Mitglieder einladen. Frag Lisa (Admin) oder wechsle den Workspace."

**Confirmations and success:**
- „Anfrage gesendet. Wir melden uns bis morgen, 12 Uhr." This says what happens next and when.
- „Du stehst auf der Liste. Wir schreiben dir einmal, sobald Stube bestellbar ist."

**Forms:**
- Label above the field: „E-Mail oder Telefon"
- Hint: one sentence, no full stop: „Wir rufen nur zurück, wenn du das möchtest"
- Optional marker: „Firma (optional)"
- Consent: „Mit dem Absenden stimmst du der Verarbeitung gemäß unserer Datenschutzerklärung zu." Link to the policy; no pre-ticked boxes.

**AI interfaces:**
- Progress: „Lese 24 Rechnungen…" → „Gleiche Zahlungen ab…" (specific, not „Verarbeite…")
- Approval: „Freigabe nötig: 2 E-Mails senden" · Folge: „Wird sofort versendet"
- Caveat next to the input: „Beträge vor dem Versand prüfen."
- Blocked: „Das kann ich nicht beantworten, weil … Versuch: ‚…'"

## 6. Local business specifics

- Name the city and service area in the H1, title and meta description: „Elektriker in Offenburg, Kehl und Lahr".
- Prices: „ab 490 €" is better than „Preis auf Anfrage". If prices really vary, explain why and give a range.
- Show the Meisterbetrieb, Innung, insurance and warranty as facts, not adjectives.
- Opening hours and phone number as text, never only in an image.
- Answer emergencies: „Notdienst: Mo–So, 0–24 Uhr, {Telefon}", only if it's true.

## 7. Legal and trust copy (DE)

**Footer:** Impressum · Datenschutz · (AGB · Widerruf for shops) · Cookie-Einstellungen

**Cookie banner, first layer:**
- „Wir verwenden Cookies für Statistik und eingebettete Karten. Du entscheidest."
- Buttons: [Alle akzeptieren] [Ablehnen] [Einstellungen], with equal visual weight.

**Pricing notes:**
- Kleinunternehmer: „Gemäß §19 UStG wird keine Umsatzsteuer berechnet."
- Shop: „inkl. MwSt., zzgl. Versand", next to the price.

**Checkout button:** „Zahlungspflichtig bestellen"

Not legal advice. Have legal texts checked per project.

## 8. Copy QA

- [ ] Five-second test passed: what, for whom, why trust it, next step.
- [ ] One voice (du or Sie) throughout.
- [ ] Every button is verb + object, and every CTA has a risk reducer nearby.
- [ ] No placeholder ([…]) or lorem ipsum left. `compose.mjs` reports how many remain.
- [ ] Numbers formatted in German, units with `&nbsp;`.
- [ ] Every error says how to fix it, and every empty state offers a next step.
- [ ] Sample data on concept pages is marked „(Beispiel)".
