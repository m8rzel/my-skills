# Component sourcing — 21st.dev & the shadcn animated ecosystem

Don't hand-build every hero, marquee or pricing table. Source a strong starting point, then **vet and adapt it to the tokens and rules of this skill**. Researched 2026-10-03; tags **[V]** verified on the live site/repo, **[I]** inferred.

## 21st.dev in one minute

- Community registry of 12,000+ React + Tailwind components, templates and shadcn themes; preview live, copy TSX, install with one command. Two actions: **Find** (registry) and **Generate** (21st AI). [V]
- **Read pages as markdown** (great for agents): append `.md` to most URLs, e.g. `https://21st.dev/community/components/s/hero.md`, or send `Accept: text/markdown`. [V]
- URL scheme [V]: component `https://21st.dev/@<author>/components/<slug>` · category `https://21st.dev/community/components/s/<tag>` · library `/@<owner>/library/<slug>`.
- **Install** [V] (needs a free/paid API key from https://21st.dev/mcp, free tier ≈ 2 installs/day):
  ```bash
  npx shadcn@latest add "https://21st.dev/r/<author>/<slug>?api_key=$API_KEY_21ST"
  npx @21st-dev/cli add <author>/<slug>              # alternative CLI
  ```
- **21st MCP** (formerly "Magic MCP") [V]: `npx @21st-dev/cli@latest init --client claude --write` (or manual: `{"mcpServers":{"21st":{"url":"https://21st.dev/api/mcp","headers":{"x-api-key":"…"}}}}`). Tools: `search` (free), `get_inspiration` (re-ranked to your design context), `search_logo` (SVG logos, free), `get_component` (paid retrieval), `generate` (21st AI). Old keys from the Magic console were reset.
- Pricing [V]: Free (browse, inspiration, logo search, 2 copies/day) · Builder ~$6/mo (unlimited installs/MCP code) · + AI plans with credits.
- **Licenses are per component** — several popular items show "License: unknown". Treat unknown as "ask the author before commercial use". [V]

### Categories worth knowing [V, counts approximate]

**Marketing blocks:** Heroes (largest), Calls to Action, Navigation Menus, Texts, Backgrounds, Features, Pricing Sections, Galleries, FAQs, Testimonials, Stats & KPIs, Marquees, Borders, Team Sections, Timelines, Footers, Comparisons, Maps, Shaders, Gradients, ASCII Art.
**UI components:** Buttons, Cards, Forms, Inputs, Icons, Grids & Bento, Badges, Avatars, Toggles, Dropdowns, Spinner Loaders, Dashboards, Dialogs/Modals, Tables, AI Chats, Charts & Data Viz, Sidebars, Search Bars, Empty States, Onboarding, Toasts, Date Pickers, File Uploads, Sign Ins.

`data/products.json` lists the categories worth browsing per product type; `brief.mjs` prints them.

## Libraries behind the best components

| Library | License | Deps | Install | Signature pieces |
|---|---|---|---|---|
| **Magic UI** | MIT [V] | `motion`, `cobe` (globe) | `npx shadcn@latest add @magicui/marquee` | Marquee, Bento Grid, Animated Beam, Border Beam, Shine Border, Magic Card, Number Ticker, Text Animate, Hyper Text, Word Rotate, Aurora Text, Particles, Globe, Dot/Grid Pattern, Retro Grid, Orbiting Circles, Terminal, Safari/iPhone mockups, Shimmer/Rainbow/Pulsating buttons, Dock |
| **Aceternity UI** | **Proprietary** — free for end products, no redistribution/resale [V] | Tailwind + Motion | `npx shadcn@latest add @aceternity/<name>` | Spotlight, Aurora/Background Beams, Wavy/Vortex backgrounds, Hero Parallax, Container Scroll, Macbook Scroll, Sticky Scroll Reveal, Tracing Beam, Timeline, Compare slider, 3D/Glare/Evervault cards, Infinite Moving Cards, Floating Navbar/Dock, Text Generate, Typewriter, Flip Words, Placeholders-and-Vanish input |
| **Motion Primitives** | MIT [V] (beta) | `motion` ^11 | `npx motion-primitives@latest add text-effect` | Text Effect/Morph/Scramble/Shimmer/Loop, Sliding Number, Morphing Dialog, Border Trail, Glow Effect, Tilt, Magnetic, Infinite Slider, Progressive Blur, Image Comparison, Dock |
| **Cult UI** | MIT [V] | `motion`, Base UI | `pnpm dlx shadcn@latest add @cult-ui/<name>` | Texture/Metal/Halo buttons, Dynamic Island, Hero Dithering, Liquid Metal, Fluted Glass, AI prompt inputs |
| **React Bits** | **MIT + Commons Clause** — use commercially, don't resell/redistribute [V] | gsap, motion, three, R3F, ogl | `npx shadcn@latest add @react-bits/BlurText-TS-TW` | Split/Blur/Shiny/Decrypted Text, Count Up, Aurora, Silk, Iridescence, Liquid Ether, Dither, Light Rays, Magic Bento, Spotlight Card, Logo Loop, Pill/Gooey Nav |
| **Kokonut UI** | MIT on 21st items [V] | Tailwind v4 | `bunx --bun shadcn@latest add @kokonutui/<name>` | Background Paths, V0-style AI chat, Particle Button |
| **Animata** | MIT [V] | motion | copy-paste | bento grids, text, cards, graphs |
| **Origin UI → coss.com** | mixed: repo AGPL by default, `apps/origin` + `apps/ui` MIT [V] | Base UI | via coss.com | high-quality form inputs, selects, tables |
| **shadcn/ui blocks** | MIT | Radix/Base UI | `npx shadcn@latest add <block>` | dashboard, sidebar, login, charts blocks |

## Map: section/need → what to look for

| Need | Look for | Prefer |
|---|---|---|
| Hero background | Aurora, mesh/shader, beams, spotlight, dot/grid pattern, background paths | CSS/one-draw-call shader with poster fallback (`examples/signature-effects.html` has a vanilla mesh gradient) |
| Hero with product | Container Scroll, Macbook Scroll, scroll media expansion, Safari/iPhone mockup | real UI in an HTML mock; scroll-scale with CSS `view()` |
| Logos / testimonials | Marquee, Infinite Moving Cards, Testimonials Columns | with pause control + `aria-hidden` duplicates |
| Features | Bento Grid, Magic Card/Spotlight Card, Animated Beam (integrations), Orbiting Circles | bento with one hero tile; glow only on fine pointers |
| Stats | Number Ticker, Sliding Number, Count Up | tabular numbers, final value in DOM/aria |
| Headline motion | Text Animate, Word Rotate, Flip Words, Blur/Split Text, Text Scramble | one animated word; aria-label with full text |
| CTA buttons | Shimmer/Rainbow/Border Beam/Halo button | max one "special" button per page; keep focus ring |
| Navigation | Floating Navbar, Resizable Navbar, Dock, Pill Nav | sticky + opaque fallback; mobile sheet |
| Process / timeline | Timeline, Tracing Beam, Sticky Scroll Reveal, Stepper | real content, not decoration |
| Comparison | Compare slider, Image Comparison | keyboard operable (arrow keys) |
| AI UI | AI Chats, prompt input, streaming text, thought chain, agent dock | add status model, stop, approvals (`ui-patterns.md` §9) |
| App UI | Tables, Sidebars, Forms, Date Pickers, Empty States | shadcn/ui + coss/Origin inputs; motion calm |

## Vetting checklist (before installing anything)

1. **License** — MIT/Apache fine; Aceternity/React Bits restrict redistribution; "unknown" → ask; AGPL → avoid in client code.
2. **Reduced motion** — most libraries **don't handle it** (Magic UI's marquee, number ticker, particles, border beam, shimmer button had no `prefers-reduced-motion` checks [V]). Add `motion-reduce:` variants, `useReducedMotion()`, or `<MotionConfig reducedMotion="user">`.
3. **Contrast** — gradient/shiny/aurora text and text over animated backgrounds: check the **worst frame** with `contrast.mjs`; give gradient text a solid fallback colour.
4. **Keyboard & semantics** — hover-only effects need focus equivalents; split text keeps an `aria-label`; marquee duplicates `aria-hidden`; real `<button>`/`<a>`.
5. **Performance** — canvas/WebGL/particles: pause off-screen, DPR ≤ 1.5–2, fewer particles on mobile, static poster; Spline/three/gsap add hundreds of KB → lazy-load (`next/dynamic`).
6. **SSR/hydration** — `"use client"` islands; random positions (stars, meteors) seeded or mounted after effect to avoid hydration mismatch; keep hero text server-rendered.
7. **Version drift** — Tailwind v3 keyframes in `tailwind.config` vs v4 `@theme`; `motion` v11 vs v12; React 19.
8. **Brand clones** — "v0 chat", "Siri wave", "Apple hello": don't ship others' brand styling unchanged.
9. **Tokens** — replace hard-coded colours/radii with your semantic tokens (`tailwind.tokens.css`), durations/easings with motion tokens.
10. **Audit** — run `audit.mjs` after integrating.

## Trends these registries reveal (2025–2026, inferred from what ranks)

1. **Shaders are mainstream** — dithering/halftone, phosphor/CRT, neural noise, liquid metal; "Shaders", "Gradients", "ASCII Art" are new top-level categories.
2. **Scroll-choreographed heroes** — media that expands, devices that tilt flat, pinned video reveals (4 of the top-10 components).
3. **Liquid glass & metal materials** spreading from Apple's 2025 language into CTAs and navs.
4. **Dark hero + light source** (spotlight, beams, lamp) remains the "premium SaaS" opener.
5. **Light travelling along borders** (border beam, shine border, halo) instead of drop shadows.
6. **Bento + orbit/beam diagrams** to explain integrations.
7. **AI-native marketing** — the hero is a prompt box; voice orbs as "presence".
8. **Kinetic type** — one animated word inside a static headline; blur-in, scramble, rotate.
9. **Motion social proof** — testimonial columns/marquees.
10. **Agent-first distribution** — markdown pages, MCP, llms.txt: components are found by coding agents → vetting matters more than ever.

## Sources
21st.dev (https://21st.dev, /llms.txt, /community/components, /pricing.md, /mcp.md), https://github.com/21st-dev/magic-mcp, https://magicui.design/docs/components, https://ui.aceternity.com/components, https://ui.aceternity.com/licence, https://motion-primitives.com/docs, https://www.cult-ui.com/docs, https://reactbits.dev + https://github.com/DavidHDev/react-bits, https://kokonutui.com/docs, https://animata.design/docs, https://coss.com/origin
