# Website playbook — marketing sites, landing pages, local business sites

Websites have one job: **move a visitor from "what is this?" to one action** (call, book, buy, sign up, contact). Everything here serves that. For product UIs see `webapp-playbook.md`. Start a new site with `scripts/brief.mjs "<what it is>" --out ./design-system --tokens`.

## 1. The five-second test

A first-time visitor must answer within ~5 s, above the fold, on a phone:

1. **What is it?** (headline names the thing or the outcome — not a slogan)
2. **Is it for me?** (audience/location/use case in headline or subline)
3. **Why trust it?** (proof directly visible: rating, logos, numbers, credentials, real photos)
4. **What do I do next?** (one primary CTA; on local sites: phone/WhatsApp too)

Headline formulas that work: *Outcome for audience* ("Rechnungen in 30 Sekunden — für Kleinunternehmer"), *What + where* ("Schreinerei für Küchen & Möbel in Offenburg"), *Category + differentiator* ("Die Buchhaltung, die sich selbst erledigt"). ≤ 8–10 words; subline adds the how/proof in one sentence.

## 2. Section library (what each block must do)

| Section | Job | Rules | 21st.dev category |
|---|---|---|---|
| **Nav** | orient, offer CTA | ≤ 6 items, CTA right, sticky (glass ok, opaque fallback), phone visible on local sites; mobile: menu sheet + sticky bottom CTA bar | Navigation Menus |
| **Hero** | 5-second test | headline + subline + 1 primary + ≤ 1 secondary CTA + **real** visual (product UI, work photo, team) + proof line; never an auto-carousel; LCP = headline or optimized image | Heroes |
| **Logo cloud / proof strip** | borrowed trust | 5–8 greyscale logos or rating "4,9 ★ aus 180 Google-Bewertungen"; marquee only with pause + `aria-hidden` duplicate | Clients, Marquees |
| **Problem → outcome** | relevance | 3 pains → 3 outcomes, or before/after compare | Features, Comparisons |
| **Features / services** | understanding | bento (one hero tile) for products; cards with "ab"-prices for services; each = benefit headline + 1 line + micro-visual | Features, Grids & Bento |
| **How it works** | lower effort fear | 3 (max 4) numbered steps, verbs, time per step | Steppers, Timelines |
| **Showcase / work** | evidence | real projects, before/after, case studies with numbers (challenge → approach → result) | Galleries, Images |
| **Testimonials** | social proof | name + role/city + photo + specific result; next to the claim they support; no anonymous "Kunde aus Berlin" | Testimonials |
| **Stats** | scale | 3–4 numbers with context ("seit 1998", "1.200 Küchen montiert"), tabular figures, count-up once | Stats & KPIs |
| **Pricing** | decision | 2–4 plans, recommended highlighted, monthly/annual toggle, key differences first, full comparison collapsible, VAT note (Kleinunternehmer: "gem. §19 UStG keine USt.") | Pricing Sections |
| **Team / about** | humanity | real faces, roles, a sentence each; founder note for small businesses | Team Sections |
| **FAQ** | objections | 5–8 real objections (Kosten, Dauer, Kündigung, Datenschutz, Ablauf); `<details>`; FAQPage schema | FAQs |
| **Final CTA** | close | repeat promise + primary CTA + risk reducer ("kostenloses Erstgespräch", "jederzeit kündbar") | Calls to Action |
| **Contact** | conversion | short form (name, contact, message), phone + WhatsApp + email, response time promise, map + hours for local | Forms, Maps |
| **Footer** | completeness | Impressum, Datenschutz, (AGB, Widerruf for shops), contact, hours, sitemap, socials | Footers |

## 3. Page types (see `data/patterns.json` for section orders)

- **SaaS landing:** product UI in hero (HTML mock or crisp screenshot), bento features, pricing, security/DSGVO, final CTA. One signature effect (mesh gradient, glow cards, sticky zoom into product).
- **Local business** (Handwerk, Praxis, Restaurant, Kanzlei): phone/WhatsApp above the fold and as sticky bottom bar on mobile; Google rating + Meisterbrief/credentials strip; services with ab-prices; real project photos; service area + hours; **speed over effects**. Restaurants: menu as HTML (not PDF), allergens, reservation.
- **Agency / portfolio:** work first (big, 3–6 projects), kinetic headline allowed, case studies with numbers, contact big at the end; page transitions + one signature interaction.
- **Product launch:** Apple pattern — hero product visual, pinned scroll story (3–5 moments), specs, sticky buy bar; reduced motion → stacked stills.
- **Event:** date/place/tickets above the fold, agenda tabs, speakers, venue, add-to-calendar.
- **E-commerce:** search + cart in header, USP strip (Versand, Rückgabe, Zahlarten), filters as chips, costs early, guest checkout.
- **Content / blog:** 18 px body, 65ch, reading time, TOC, inline subscribe — no popups.

## 4. Conversion rules

- **One primary action per page**; secondary CTAs are visually subordinate (outline/link).
- **CTA labels = outcome + verb**: "Kostenloses Erstgespräch buchen", "Angebot in 24 h anfordern" — not "Absenden", "Mehr".
- **Risk reducers** next to CTAs: "unverbindlich", "Antwort innerhalb 24 h", "jederzeit kündbar", "14 Tage testen".
- **Forms:** as few fields as possible (name + contact + message; phone optional), labels visible, inline validation on blur, success state that says what happens next.
- **Proof near the claim**: testimonial about speed next to the speed feature.
- **No dark patterns**: no fake countdowns, no pre-ticked newsletter, no confirm-shaming, cookie banner with equally prominent "Ablehnen" (TTDSG/DSGVO, EDPB).
- **Mobile**: sticky bottom CTA bar (call / WhatsApp / book) on local sites; thumb-reachable.

## 5. Visual direction for websites

- Pick **one style** (`references/style-catalog.md`) and **one signature idea** (`signature-effects.md`); everything else calm.
- **Rhythm**: alternate section layouts (text-left/visual-right → full-bleed → centered → grid) and surface tones (background → subtle tint → background) so the page doesn't feel like a stack of identical cards.
- **Section spacing**: 96–160 px desktop, 64–96 px mobile; section headings with an eyebrow label + H2 + one-line intro.
- **Imagery**: real > illustration > stock. Consistent treatment (same crop ratios, colour grade, radius). Hero image ≤ 200 KB AVIF/WebP, `fetchpriority="high"`, explicit dimensions.
- **Type**: display face may carry personality (serif, condensed, variable); body stays neutral and ≥ 16–18 px.
- **Dark sections** as accents (one testimonial band, the final CTA) work better than a fully dark site for non-technical audiences.
- **Trend use** (2025–26, see `product-ui-teardowns.md` + `component-sourcing.md`): shader/mesh heroes, bento, glowing borders, kinetic words, scroll-expanding media, liquid-glass nav — **use one, with fallbacks**.

## 6. SEO & performance essentials

- **Core Web Vitals:** LCP ≤ 2.5 s (hero text or optimized image, never a canvas), INP ≤ 200 ms, CLS ≤ 0.1 (dimensions on media, font `size-adjust`/`next/font`). `audit.mjs` measures CLS/LCP locally.
- **Semantics:** one `h1`, logical `h2/h3`, landmarks, descriptive link text, `lang="de"`.
- **Meta:** unique `<title>` (≤ 60 chars, keyword + brand + city for local), meta description (≤ 155), Open Graph image 1200×630, canonical.
- **Structured data:** `Organization`/`LocalBusiness` (name, address, phone, hours, geo, sameAs), `FAQPage`, `Product`/`Offer`, `BreadcrumbList`, `Review` only for real reviews.
- **Local SEO:** NAP identical everywhere (site, Google Business Profile, directories), city + service in H1/title, a page per core service, embedded map (consent-gated).
- **Assets:** self-hosted fonts (GDPR), `loading="lazy"` below the fold, `srcset/sizes`, AVIF/WebP, no render-blocking third-party scripts.

## 7. German/EU legal UX (not legal advice — verify per project)

- **Impressum** and **Datenschutzerklärung** reachable from every page (footer, ≤ 2 clicks).
- **Consent before** non-essential cookies/trackers, Google Fonts from Google's CDN, Maps/YouTube embeds (use click-to-load placeholders).
- **Cookie banner**: "Alle akzeptieren" and "Ablehnen" equally prominent on the first layer; no pre-ticked boxes; easy to revoke (footer link).
- **Shops:** price incl. VAT and shipping info near the price, Widerrufsbelehrung, button "zahlungspflichtig bestellen".
- **Kleinunternehmer:** note §19 UStG on prices/invoices.
- **Accessibility:** BFSG (since 28.06.2025) requires accessible e-commerce and many consumer services — WCAG 2.1/2.2 AA is the practical target.

## 8. Copy checklist

- Headline passes the 5-second test; subline adds how/proof.
- Benefits before features; numbers over adjectives ("spart 4 h/Woche" > "effizient").
- Customer's words (from reviews/interviews) in headlines.
- Sentence case, short paragraphs (≤ 3 lines), scannable lists.
- German formatting: „Anführungszeichen", 1.234,56 €, 24 h, Datum 3. Oktober 2026.
- No lorem ipsum, no "Willkommen auf unserer Website".

## 9. Website QA

- `audit.mjs <url>` → 0 errors/warnings at 390 and 1440.
- Lighthouse/PageSpeed mobile ≥ 90 performance, 100 accessibility/best practices/SEO as goal.
- Click every CTA on mobile; test the form end-to-end (incl. error + success).
- Reduced motion on: page still complete and attractive.
- Check legal links, cookie banner behaviour, and structured data (Rich Results Test).

Reference implementation: `examples/landing-page.html` (SaaS landing for the same product as `examples/premium-ui.html`).
