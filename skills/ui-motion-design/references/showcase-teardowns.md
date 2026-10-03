# Showcase teardowns: how the best sites do it

What Stripe, Apple, Linear, Vercel, GitHub and award-winning studios actually build, and the rule to take from each. Researched October 2026.

How to read the tags:
- **[Doc]**: stated by the company or studio.
- **[RE]**: from a reverse-engineering article.
- **[Inf]**: inference.

**Copy the technique, never the look.** Don't reproduce a brand's gradient colours, illustrations, product shots, wordmarks or exact layouts. Build the same mechanism with the client's own brand.

---

## Product and brand sites

### Stripe: ambient gradient, globe, accessible colour

- **Mesh / "lava lamp" gradient [RE]**
  - A tiny custom WebGL wrapper draws a single plane.
  - The **vertex shader displaces the plane with simplex noise** and fades the noise out at the edges.
  - The colours are **read from CSS custom properties** (`--gradient-color-1…4`), so the theme stays in CSS.
  - It has `play()`/`pause()` and pauses when off-screen.
  - Recipe: `signature-effects.md#ambient-mesh-gradient`.
- **Globe [Doc]**
  - Three.js with three spheres: ocean, dot layer, arcs.
  - Dots went from **60k → ~20k** by drawing only the countries that matter.
  - Hexagon dots sit on a Fibonacci spiral.
  - Arcs are Béziers revealed over ~2.5 s.
  - **Antialiasing off** fixed high-DPI problems *and* made it faster.
  - Animation **pauses while the page scrolls**.
  - A static image fallback was prepared.
- **Connect page [Doc]**
  - Animates only `transform` and `opacity`.
  - Most moves are **< 500 ms** on custom curves.
  - Sequences use WAAPI, e.g. `cubic-bezier(.2, 1, .2, 1)`.
  - Device mockups are pure CSS (< 1 KB).
  - `prefers-reduced-motion` is handled in CSS **and** JS.
- **Colour [Doc]**
  - Palettes are built in a perceptual space (CIELAB).
  - Contrast is guaranteed by step distance: **≥ 5 steps apart = 4.5:1**.
  - `scripts/tokens.mjs` works the same way in OKLCH.
- **Take away**
  - Ambient motion = cheap shader + CSS-variable colours + pause off-screen.
  - Cut geometry until only the story remains.
  - Turn antialiasing off at high DPR.
  - Use perceptual palettes.

### Apple product pages: scroll-scrubbed storytelling

- **Image-sequence scrub [RE]**
  - A tall section holds a sticky `<canvas>`.
  - `frame = floor(progress × frameCount)`, drawn with `drawImage` inside rAF.
  - A naive demo with 148 JPGs weighs ~56 MB, so payload is the main constraint.
  - Apple ships **keyframes + diff frames** (8×8 block patches) through a manifest. **Keyframes load first**, so a low-framerate version plays before the diffs arrive.
- **Sticky scrollytelling**
  - Pinned sections with text that changes as you scroll.
  - Huge type-led heroes: one statement, one product shot.
- **Fluid interfaces [Doc, WWDC18]**
  - Respond instantly and track the finger 1:1.
  - Every gesture is interruptible.
  - Springs described by damping and response, starting **critically damped**.
  - Project the end position from release velocity.
- **Modern route [Doc, Chrome]**
  - CSS `animation-timeline: scroll()/view()` runs off the main thread, so it stays smooth where JS scroll handlers jank.
  - Use it first; fall back to rAF + sticky.
- **Take away**
  - Scrub with CSS scroll timelines when you can.
  - For image sequences: preload progressively, cap DPR, budget bytes, and show a **still image under reduced motion**.
  - Let type carry the hero.

### Linear: perceptual dark themes, restraint

- **Redesign [Doc, 2024]**
  - Moved from HSL to **LCH**.
  - Themes are generated from **three inputs (base, accent, contrast)** instead of ~98 hand-set variables. High-contrast themes come for free.
  - Inter Display for headings.
  - Less colour on chrome.
  - Higher text contrast in both modes.
- **Marketing glow [Inf]**
  - Radial or blurred gradients over near-black, thin 1 px borders with a lighter top edge, very little motion.
- **Take away**
  - Generate themes from a handful of perceptual parameters, with contrast as an explicit input.
  - Save colour for meaning.
  - In dark UI, separate surfaces with borders and lightness steps, not shadows.

### Vercel / Geist: grid, glow, guidelines

- **Ship 2025 site [Doc]**
  - The hero is a ray-marched liquid-metal shader.
  - The scroll zoom uses Motion `useTransform` + sticky containers.
  - The header adapts over light and dark sections with **`mix-blend-mode`**, not clip-path.
  - Built with shadcn + Geist tokens.
- **Web Interface Guidelines [Doc]**, the best single checklist (see `review-checklist.md`):
  - honour reduced motion
  - prefer CSS > WAAPI > JS
  - transform/opacity only, never `transition: all`
  - animations cancellable by input
  - `transform-origin` at the physical origin
  - tooltip show-delay 150–300 ms, minimum visible time 300–500 ms
  - hit targets ≥ 24 px (44 px on mobile)
  - autoplay > 5 s needs pause
  - optimistic UI
- **Take away**
  - Use blend modes for adaptive chrome.
  - Use sticky + scroll-linked transforms for "zoom into product" sections.
  - Ship the guidelines as a definition of done.

### GitHub homepage globe: adaptive quality

- **[Doc]**
  - Three.js in five layers.
  - ~12k dots via **InstancedMesh**.
  - Alpha fades with camera distance in the shader.
  - **Adaptive quality:** if it can't hold ~55 fps over 50 frames, it steps down through four tiers (pixel ratio, raycast frequency, geometry).
  - An **inline SVG placeholder crossfades** to the canvas via WAAPI.
- **Take away**
  - Measure fps and degrade by itself.
  - Always render a placeholder first, so the canvas never becomes the LCP element.

### Airbnb (Lottie) · Duolingo (Rive): designer-owned motion

- **Lottie [Doc]**
  - After Effects → JSON → native vector playback.
  - Progress can be **scrubbed by gestures**.
  - Speed control; can be loaded over the network.
  - Engineers stop hand-porting curves.
- **Rive [Doc]**
  - Duolingo drives characters with **state machines**: poses and 20+ visemes per character, blended.
  - Small files; a clean handoff between animator and developer.
  - The Lando Norris site (Awwwards Site of the Year 2025) also uses Rive.
- **Take away**
  - Complex illustrative motion belongs to designers in Rive (interactive, state-driven) or Lottie (linear playback), not hand-coded keyframes.
  - Lazy-load the runtime and pause it off-screen.

### Interaction-design canon

The people behind Vercel, Sonner/Vaul and Family:

- **Rauno Freiberg [Doc]**
  - Physics: interruptible, momentum carries over.
  - Destructive actions commit on release.
  - Respond before the threshold.
  - Spatial consistency: launch from the icon.
  - **Frequency kills novelty.**
  - Fitts's law.
  - "Fidgetability" is a legitimate goal.
- **Emil Kowalski [Doc]**
  - UI animation < 300 ms.
  - Ease-out for enter and exit.
  - Custom curves.
  - No animation on keyboard actions.
  - `scale(0.97)` on press; never scale from 0.
  - Origin-aware popovers.
  - Tooltips: instant once one is open.
  - **Transitions over keyframes for interruptibility.**
  - Vaul's iOS curve `cubic-bezier(0.32, 0.72, 0, 1)`.
  - Pause toast timers when the tab is hidden.
  - Swipe dismisses on distance or velocity.
- **Benji Taylor / Family [Doc]**
  - Simplicity, fluidity, delight.
  - **Dynamic trays**: overlays that change height and keep context.
  - Direction shows where you are.
  - Persistent elements across screens.
  - **Text morphing** for consequential label changes.
  - Unchanged content stays still.
  - Delight goes where usage is rare.

---

## Award-winning studios (Awwwards SOTY / developer awards 2023–2025)

| Site | Studio · award | Signature effect | Documented stack |
|---|---|---|---|
| **Lando Norris** | OFF+BRAND · Site of the Year 2025 | 3D helmet with dynamic light, mask reveals, scroll-driven "cinematics", Rive calendar | Webflow, GSAP, WebGL, Rive, lazy loading |
| **Messenger** (abeto) | Developer Site of the Year 2025 | Tiny-planet browser game: deliver mail, multiplayer | Three.js, WebGL, WebSockets |
| **Igloo Inc** | abeto · Site of the Year + Developer SOTY 2024 | Procedurally grown ice, velocity-coloured particles during morphs, WebGL UI with glitch and text scramble, frost/chromatic transitions | Three.js, three-mesh-bvh, Svelte, GSAP, Vite; Houdini/Blender; custom VDB exporter |
| **Lusion v3** | Lusion · Site of the Year + Developer SOTY 2023 | Reactive cursor, scroll-based 3D scenes | (v3 stack undocumented; their earlier site baked cloth/vertex animation into textures and synced pre-rendered video with real-time WebGL) |
| **Immersive Garden** | Studio of the Year 2024, Agency of the Year 2025 | Bas-relief 3D layer, 3D numerals as navigation | Nuxt, GSAP, Lenis, three.js; KTX compression, channel packing, gltf-transform |
| **Unseen Studio** | Site of the Month Feb 2023 | Shader-blended scene transitions (two render targets), infinite Z-scroll through fog, instanced grass, fluid sim on mouse | Three.js, troika-three-text, KTX2, DRACO, baked light; maintains Taxi.js |
| **Bruno Simon 2025** | Awwwards case study | Drive a physics car through an open world | three.js **WebGPURenderer** (WebGL fallback), TSL shaders, instancing, mobile presets |
| **basement.studio HQ** | studio blog | Explorable 3D office, wireframe loading state | Next.js, three.js, CMS-driven scene, baked lightmaps, KTX, OffscreenCanvas |
| **Trionn** | FWA/CSSDA · Codrops case study 2026 | Exploding hero symbol, 371-frame WebP sequence scrub, headline into glyph particles, audio-reactive fog | GSAP + ScrollTrigger, Lenis on `gsap.ticker`, plain three.js, Web Audio |
| **Locomotive** | Agency of the Year 2023 + 2024 | Smooth scroll + parallax | Locomotive Scroll (now built on Lenis) |

**What the winners have in common** (inferred from the documented cases):

1. **Bake everything you can.**
   - Lighting goes into lightmaps; simulations into textures or buffers.
   - Only the interactive layer runs in real time.
2. **Custom asset pipelines.**
   - KTX2 (ETC1S/UASTC) textures, DRACO/meshopt geometry, gltf-transform, channel packing.
   - Igloo's volumetric data came out smaller than typical site images.
3. **One clock.**
   - Lenis, GSAP and the WebGL render loop all hang off `gsap.ticker`.
4. **Pre-warm the GPU.**
   - Compile shaders and upload textures *before* the section scrolls in.
5. **The DOM stays real.**
   - Text and links exist as semantic HTML.
   - The canvas is a layer on top (image planes are synced to `<img>` rects).
6. **Quality tiers.**
   - Mobile presets drop post-processing, blur, DoF and shadows.
   - Measured fps decides the tier.
7. **Sound design** is a recurring differentiator: Unseen, Trionn, Igloo, Bruno Simon. Always opt-in and mutable.
8. **One idea, executed obsessively.**
   - Each site has one signature mechanic (a helmet, a planet, ice), not ten effects.

---

## What to take for client work

| You're building | Borrow from | Concretely |
|---|---|---|
| SaaS / product marketing site | Stripe, Linear, Vercel | Perceptual palette + dark theme from tokens; one ambient hero (mesh gradient or glow); sticky "zoom into product" section; restrained UI motion with the rules from `motion-principles.md` |
| Product launch / hardware / "Apple-style" | Apple | Type-led hero; scroll-scrubbed sequence or video (keyframes first, poster under reduced motion); pinned feature storytelling |
| Agency / portfolio / brand experience | Awwwards studios | Lenis + GSAP on one clock; split-text reveals; clip-path image reveals; page transitions; one WebGL signature with quality tiers |
| App UI (dashboard, CMS, tool) | Rauno, Emil, Family | No animation on frequent/keyboard actions; origin-aware popovers; springs on layout; sheets on the iOS curve; text morph for consequential buttons |
| Mobile app (Expo) | Apple WWDC, Family | Reanimated springs, gesture-driven sheets with velocity snap, dynamic trays, haptics on commit |

---

## Sources

**Product sites**
- https://stripe.com/blog/globe
- https://stripe.com/blog/connect-front-end-experience
- https://stripe.com/blog/accessible-color-systems
- https://tympanus.net/codrops/2022/09/26/how-to-recreate-stripes-lava-lamp-gradient-with-three-js
- https://css-tricks.com/?p=308477 (Apple-style image sequence)
- https://dev.to/tetra2000/compression-algorithm-for-iphone-13s-product-page-3gde
- https://developer.apple.com/videos/play/wwdc2018/803/
- https://developer.chrome.com/blog/scroll-animation-performance-case-study
- https://linear.app/now/how-we-redesigned-the-linear-ui
- https://linear.app/now/a-design-reset
- https://vercel.com/blog/designing-and-building-the-vercel-ship-conference-platform
- https://vercel.com/design/guidelines
- https://github.blog/engineering/how-we-built-the-github-globe
- https://airbnb.design/introducing-lottie
- https://blog.duolingo.com/world-character-visemes

**Interaction design**
- https://rauno.me/craft/interaction-design
- https://emilkowal.ski/ui
- https://benji.org/family-values

**Award winners**
- https://www.awwwards.com/annual-awards/winners
- https://www.itsoffbrand.com/our-work/lando-norris
- https://www.awwwards.com/igloo-inc-case-study.html
- https://www.awwwards.com/case-study-immersive-gardens-new-website.html
- https://www.awwwards.com/unseen-studio-by-unseen-studio-wins-sotm-february-2023.html
- https://www.awwwards.com/brunos-portfolio-case-study.html
- https://basement.studio/post/new-digital-hq-pt-1
- https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/
