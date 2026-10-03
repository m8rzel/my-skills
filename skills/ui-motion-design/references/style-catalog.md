# Style catalog

> Generated from `data/styles.json` by `node scripts/brief.mjs --catalog` — edit the JSON, then regenerate. Pick **one** primary style per product; a secondary style may only flavour marketing accents. `brief.mjs` picks a style from the product type and mood words ("dunkel", "luxus", "verspielt", "minimal", "3d", "warm", "ruhig", "natur", "glas", "bento" …).

| Style | For | Motion | A11y risk | Perf cost |
|---|---|---|---|---|
| [Swiss Minimal](#swiss-minimal) | webapp, website | calm | low | low |
| [Calm Product (Linear-style)](#calm-product) | webapp, website | calm | low | low |
| [Dark Glow (Dev/AI marketing)](#dark-glow) | website | expressive | medium | medium |
| [Bento Grid](#bento) | website, webapp | standard | low | low |
| [Editorial / Magazine](#editorial) | website | calm | low | low |
| [Warm Craft (local & trades)](#warm-craft) | website | calm | low | low |
| [Trust Clean (health, legal, finance)](#trust-clean) | website, webapp | calm | low | low |
| [Soft Premium](#soft-premium) | website, webapp | standard | low | low |
| [Liquid Glass (control layer)](#liquid-glass) | website, webapp | standard | high | medium |
| [Neubrutalism](#neubrutalism) | website | standard | low | low |
| [Kinetic Typography](#kinetic-type) | website | expressive | medium | medium |
| [Immersive 3D / WebGL](#immersive-3d) | website | expressive | high | high |
| [Aurora / Mesh Gradient](#aurora-mesh) | website | standard | medium | medium |
| [Claymorphism / Soft 3D](#claymorphism) | website, webapp | expressive | medium | low |
| [Data-Dense Pro](#data-dense) | webapp | calm | low | low |
| [Organic / Biophilic](#organic) | website | calm | low | low |
| [Luxury Minimal](#luxury-minimal) | website | standard | low | low |
| [Playful Vibrant](#playful-vibrant) | website, webapp | expressive | medium | low |
| [AI-Native](#ai-native) | webapp, website | standard | medium | medium |
| [Retro / Terminal](#retro-terminal) | website | standard | medium | medium |

<a id="swiss-minimal"></a>
## Swiss Minimal

Grid, generous whitespace, one accent, strong type hierarchy, almost no decoration.

- **Use for:** saas, docs, dashboards, consulting, architecture
- **Avoid for:** kids, entertainment, brands that need warmth
- **Recipe:**
  - neutral surfaces, 1 accent
  - hairline borders, no or xs shadows
  - radius 4–8px
  - big type contrast (display vs body)
  - left-aligned, asymmetric grid
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="calm-product"></a>
## Calm Product (Linear-style)

Dense but quiet product UI: dimmed chrome, warm/neutral greys, hairlines, keyboard-first, colour only for meaning.

- **Use for:** productivity, devtool, crm, project management, b2b saas
- **Avoid for:** consumer brands needing personality, first-time non-technical users without onboarding
- **Recipe:**
  - tinted near-neutral surfaces stepping in lightness
  - 1px low-contrast separators
  - Inter/Geist, tabular numbers
  - ⌘K, shortcut hints
  - springs only on layout
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="dark-glow"></a>
## Dark Glow (Dev/AI marketing)

Near-black brand-tinted background, light sources (spotlight, beams, glow borders), bold sans with tight tracking.

- **Use for:** ai, devtool, technical b2b, launch pages
- **Avoid for:** local businesses, health, older audiences, long reading
- **Recipe:**
  - bg = brand hue at 6–12% lightness, never #000
  - radial spotlight + grain
  - gradient/travelling borders on 1 featured card
  - glass only on nav
  - white text ≥ 90% lightness, muted ≥ 70%
- Motion level **expressive** · accessibility risk **medium** · performance cost **medium**

<a id="bento"></a>
## Bento Grid

Feature or dashboard overview as a grid of varied card sizes; one hero tile.

- **Use for:** feature overviews, dashboard home, portfolio highlights, product launches
- **Avoid for:** sequential flows, content with reading order
- **Recipe:**
  - CSS grid with spans, ≤ 9 tiles
  - one 2×2 hero tile
  - consistent radius + gap (concentric)
  - each tile = one idea + micro-visual
- Motion level **standard** · accessibility risk **low** · performance cost **low**

<a id="editorial"></a>
## Editorial / Magazine

Serif display type, strong grid, large imagery, pull quotes, reading comfort first.

- **Use for:** blogs, media, agencies, restaurants, culture, case studies
- **Avoid for:** data-heavy apps
- **Recipe:**
  - serif display + sans body
  - 65ch measure
  - big images with captions
  - drop caps/pull quotes sparingly
  - text-wrap: pretty
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="warm-craft"></a>
## Warm Craft (local & trades)

Honest, warm, photo-led: real people and work, earthy palette, clear contact paths.

- **Use for:** handwerk, trades, bakery, restaurant, local services, farm, winery
- **Avoid for:** tech startups, fintech
- **Recipe:**
  - warm off-white bg (not pure white)
  - earthy accent (terracotta, forest, ochre)
  - real photography, no stock smiles
  - phone + WhatsApp + form above the fold
  - reviews with names
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="trust-clean"></a>
## Trust Clean (health, legal, finance)

Clear, calm, high contrast, conservative; credentials and next steps visible.

- **Use for:** medical, dental, legal, tax, insurance, bank, public sector
- **Avoid for:** entertainment, youth brands
- **Recipe:**
  - blue/teal/green family
  - large readable type (17–18px body)
  - credentials, memberships, team photos
  - appointment CTA everywhere
  - no aggressive motion
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="soft-premium"></a>
## Soft Premium

Light surfaces, soft layered shadows, rounded 12–20px, subtle gradients; polished consumer feel.

- **Use for:** fintech consumer, wellness apps, productivity consumer, booking
- **Avoid for:** dense enterprise data
- **Recipe:**
  - layered hue-tinted shadows
  - radius 12–20, concentric
  - gradients in oklch
  - springs for interactions
- Motion level **standard** · accessibility risk **low** · performance cost **low**

<a id="liquid-glass"></a>
## Liquid Glass (control layer)

Translucent blurred surfaces for floating chrome over rich content (Apple 2025 language).

- **Use for:** media apps, navigation bars, command palettes, overlays on imagery
- **Avoid for:** content layer, long text, low-end devices, glass on glass
- **Recipe:**
  - fill 70–85% + backdrop blur ≤ 16px + saturate
  - 1px low-alpha border + 2-layer shadow
  - prefers-reduced-transparency fallback
  - text contrast ≥ 4.5:1 on worst background
- Motion level **standard** · accessibility risk **high** · performance cost **medium**

<a id="neubrutalism"></a>
## Neubrutalism

Thick black borders, hard offset shadows, flat saturated colours, raw type.

- **Use for:** gen z brands, creative tools, indie products, events
- **Avoid for:** finance, health, enterprise, luxury
- **Recipe:**
  - 2–3px solid ink borders
  - box-shadow: 4px 4px 0 ink
  - flat saturated fills
  - no gradients/blur
  - press = translate(4px,4px) + shadow 0
- Motion level **standard** · accessibility risk **low** · performance cost **low**

<a id="kinetic-type"></a>
## Kinetic Typography

Type is the hero: huge display sizes, variable-font axes, scroll-driven text motion.

- **Use for:** agencies, portfolios, events, music, campaigns
- **Avoid for:** apps, accessibility-critical, long-form reading
- **Recipe:**
  - variable fonts (wght/wdth)
  - split-text reveals with aria-label
  - scroll velocity marquees with pause
  - one animated word per headline
- Motion level **expressive** · accessibility risk **medium** · performance cost **medium**

<a id="immersive-3d"></a>
## Immersive 3D / WebGL

Canvas-first experiences: 3D product, shaders, particles, scroll-driven scenes.

- **Use for:** product launches, agency showcases, games, automotive, hardware
- **Avoid for:** seo-critical content sites, low-end mobile audiences, local businesses
- **Recipe:**
  - DOM keeps all content
  - poster first, crossfade canvas
  - DPR cap, pause off-screen, quality tiers
  - Lenis + GSAP on one clock
- Motion level **expressive** · accessibility risk **high** · performance cost **high**

<a id="aurora-mesh"></a>
## Aurora / Mesh Gradient

Soft animated mesh or aurora gradient backdrop with clean UI on top.

- **Use for:** saas heroes, fintech, ai, auth screens
- **Avoid for:** data apps, behind body text
- **Recipe:**
  - WebGL or CSS radial stack in brand hues
  - grain against banding
  - pause off-screen, still under reduced motion
  - text on solid/scrim, not on raw gradient
- Motion level **standard** · accessibility risk **medium** · performance cost **medium**

<a id="claymorphism"></a>
## Claymorphism / Soft 3D

Puffy rounded shapes, inner + outer soft shadows, pastel, toy-like.

- **Use for:** kids, education, pets, casual games, onboarding illustrations
- **Avoid for:** enterprise, finance, dense data
- **Recipe:**
  - radius 20–32
  - outer soft + inner highlight shadows
  - pastel fills, dark text
  - bouncy springs (rarely)
- Motion level **expressive** · accessibility risk **medium** · performance cost **low**

<a id="data-dense"></a>
## Data-Dense Pro

Maximum information per screen for experts: compact rows, mono numbers, keyboard everything.

- **Use for:** trading, analytics, ops, admin, monitoring
- **Avoid for:** onboarding, consumer, occasional users
- **Recipe:**
  - row height 32–36
  - tabular mono numbers right-aligned
  - sticky headers/columns, column control
  - colour only for status
  - density toggle
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="organic"></a>
## Organic / Biophilic

Natural palette, soft organic shapes, textures, slow calm motion.

- **Use for:** wellness, eco, food, farm, outdoor, spa
- **Avoid for:** tech, finance
- **Recipe:**
  - sage/moss/sand palette
  - organic blob shapes as decoration only
  - paper/grain textures
  - slow fades, no bounce
- Motion level **calm** · accessibility risk **low** · performance cost **low**

<a id="luxury-minimal"></a>
## Luxury Minimal

Restraint as luxury: lots of space, serif display, monochrome + one metal tone, slow reveals.

- **Use for:** luxury, jewelry, fashion, hotel, real estate premium, winery
- **Avoid for:** discount retail, saas
- **Recipe:**
  - ivory/black + gold/bronze accent
  - serif display, spaced caps labels
  - full-bleed photography
  - slow clip/opacity reveals 600–900ms
- Motion level **standard** · accessibility risk **low** · performance cost **low**

<a id="playful-vibrant"></a>
## Playful Vibrant

Bright multi-colour blocks, rounded type, illustrations, bouncy interactions.

- **Use for:** consumer apps, kids, food delivery, social, creator tools
- **Avoid for:** legal, finance, health
- **Recipe:**
  - 3–4 saturated brand colours with dark ink text
  - rounded type (Fredoka/Nunito)
  - spring bouncy on success
  - illustration system
- Motion level **expressive** · accessibility risk **medium** · performance cost **low**

<a id="ai-native"></a>
## AI-Native

Prompt-first UI: chat/composer as hero, streaming, agent step lists, approval cards, subtle 'presence' visuals.

- **Use for:** ai assistants, agents, copilots, generators
- **Avoid for:** using AI chrome where a form is faster
- **Recipe:**
  - composer as primary surface
  - status model submitted/streaming/ready/error
  - step list + tool rows + approvals
  - citations inline
  - orb/aurora only as presence, not decoration everywhere
- Motion level **standard** · accessibility risk **medium** · performance cost **medium**

<a id="retro-terminal"></a>
## Retro / Terminal

Monospace, ASCII, dithering, CRT phosphor accents — developer nostalgia.

- **Use for:** devtools, cli products, security, hacker events
- **Avoid for:** mainstream consumer, accessibility-critical
- **Recipe:**
  - mono type
  - dither/halftone shader or CSS pattern
  - green/amber on near-black, checked for contrast
  - typewriter only once
- Motion level **standard** · accessibility risk **medium** · performance cost **medium**
