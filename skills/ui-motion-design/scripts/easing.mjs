#!/usr/bin/env node
// Motion tooling: springs → CSS linear(), preset tokens, and an interactive playground.
//
//   node easing.mjs spring --duration 0.4 --bounce 0.2        # Motion-style visualDuration + bounce
//   node easing.mjs spring --stiffness 300 --damping 30 [--mass 1] [--velocity 0]
//   node easing.mjs spring --response 0.5 --damping-fraction 0.8   # SwiftUI-style
//   node easing.mjs presets [--format css|json|ts]
//   node easing.mjs playground [--out motion-playground.html]

import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  springToLinear, fromVisualDuration, fromResponse, SPRINGS, EASINGS, DURATIONS, springFn, cubicBezier, settleTime,
} from './lib/spring.mjs';

const [cmd = 'help', ...rest] = process.argv.slice(2);
const { values: a } = parseArgs({
  args: rest,
  options: {
    duration: { type: 'string' }, bounce: { type: 'string', default: '0' },
    stiffness: { type: 'string' }, damping: { type: 'string' }, mass: { type: 'string', default: '1' },
    velocity: { type: 'string', default: '0' },
    response: { type: 'string' }, 'damping-fraction': { type: 'string', default: '1' },
    tolerance: { type: 'string', default: '0.0015' },
    format: { type: 'string', default: 'css' },
    out: { type: 'string', default: 'motion-playground.html' },
  },
});

const fx = (n, d = 1) => Number(n.toFixed(d));

function describe(name, p) {
  const lin = springToLinear(p, { tolerance: Number(a.tolerance) });
  const zeta = p.damping / (2 * Math.sqrt(p.stiffness * (p.mass || 1)));
  return { name, ...p, zeta, ...lin };
}

if (cmd === 'spring') {
  let p;
  if (a.duration) p = fromVisualDuration(Number(a.duration), Number(a.bounce));
  else if (a.response) p = fromResponse(Number(a.response), Number(a['damping-fraction']));
  else if (a.stiffness && a.damping) p = { stiffness: Number(a.stiffness), damping: Number(a.damping), mass: Number(a.mass) };
  else { console.error('Give --duration [--bounce] or --stiffness --damping [--mass] or --response [--damping-fraction]'); process.exit(1); }
  p.velocity = Number(a.velocity);
  const d = describe('custom', p);
  console.log(`stiffness ${fx(d.stiffness)}  damping ${fx(d.damping)}  mass ${d.mass}  dampingRatio ${fx(d.zeta, 3)}`);
  console.log(`settles after ${d.duration}ms  overshoot ${fx(d.overshoot * 100)}%  (${d.points} stops)\n`);
  console.log('CSS');
  console.log(`  transition: transform ${d.duration}ms ${d.easing};\n`);
  console.log('Motion (motion/react)');
  console.log(`  transition={{ type: "spring", stiffness: ${fx(d.stiffness)}, damping: ${fx(d.damping)}, mass: ${d.mass} }}`);
  if (a.duration) console.log(`  // equivalent: { type: "spring", visualDuration: ${a.duration}, bounce: ${a.bounce} }`);
  console.log('\nReanimated (Expo)');
  console.log(`  withSpring(target, { stiffness: ${fx(d.stiffness)}, damping: ${fx(d.damping)}, mass: ${d.mass} })`);
  console.log('\nGSAP (CustomEase plugin)');
  console.log(`  CustomEase.create("spring", "${d.svgPath}");`);
  console.log(`  gsap.to(el, { x: 100, duration: ${fx(d.duration / 1000, 3)}, ease: "spring" });`);
  process.exit(0);
}

if (cmd === 'presets') {
  const springs = Object.entries(SPRINGS).map(([k, v]) => describe(k, v));
  if (a.format === 'json' || a.format === 'ts') {
    const data = {
      duration: Object.fromEntries(Object.entries(DURATIONS).map(([k, [ms]]) => [k, ms])),
      easing: Object.fromEntries(Object.entries(EASINGS).map(([k, [x1, y1, x2, y2]]) => [k, [x1, y1, x2, y2]])),
      spring: Object.fromEntries(springs.map((s) => [s.name, { stiffness: fx(s.stiffness), damping: fx(s.damping), mass: 1 }])),
      springCss: Object.fromEntries(springs.map((s) => [s.name, { easing: s.easing, duration: s.duration }])),
    };
    console.log(a.format === 'ts' ? `export const motion = ${JSON.stringify(data, null, 2)} as const;` : JSON.stringify(data, null, 2));
  } else {
    console.log(':root {');
    for (const [k, [ms, use]] of Object.entries(DURATIONS)) console.log(`  --duration-${k}: ${ms}ms; /* ${use} */`);
    for (const [k, [x1, y1, x2, y2, use]] of Object.entries(EASINGS)) console.log(`  --ease-${k}: cubic-bezier(${x1}, ${y1}, ${x2}, ${y2}); /* ${use} */`);
    for (const s of springs) {
      console.log(`  --spring-${s.name}: ${s.easing};`);
      console.log(`  --spring-${s.name}-duration: ${s.duration}ms; /* ${SPRINGS[s.name].use} */`);
    }
    console.log('}');
  }
  process.exit(0);
}

if (cmd === 'playground') {
  const curves = [
    ...Object.entries(EASINGS).map(([k, [x1, y1, x2, y2, use]]) => {
      const f = cubicBezier(x1, y1, x2, y2);
      return { id: `ease-${k}`, label: `ease-${k}`, css: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`, duration: 400, use, samples: Array.from({ length: 101 }, (_, i) => f(i / 100)) };
    }),
    ...Object.entries(SPRINGS).map(([k, v]) => {
      const lin = springToLinear(v); const f = springFn(v); const T = settleTime(v);
      return { id: `spring-${k}`, label: `spring-${k}`, css: lin.easing, duration: lin.duration, use: v.use, stiffness: fx(v.stiffness), damping: fx(v.damping), samples: Array.from({ length: 101 }, (_, i) => f((i / 100) * T)) };
    }),
  ];
  writeFileSync(a.out, playground(curves));
  console.log(`Wrote ${a.out}`);
  process.exit(0);
}

console.log(`Usage:
  node easing.mjs spring --duration 0.4 --bounce 0.2
  node easing.mjs spring --stiffness 300 --damping 30 [--mass 1] [--velocity 0]
  node easing.mjs spring --response 0.5 --damping-fraction 0.8
  node easing.mjs presets [--format css|json|ts]
  node easing.mjs playground [--out motion-playground.html]`);

function playground(curves) {
  const data = JSON.stringify(curves);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Motion Playground</title>
<style>
:root{--bg:#fff;--fg:#0b0b0f;--muted:#f2f2f5;--mf:#62626e;--border:#e4e4ea;--accent:#4f46e5;--card:#fff;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0d0d12;--fg:#f4f4f6;--muted:#1d1d25;--mf:#a0a0ad;--border:#2a2a35;--accent:#8b85ff;--card:#14141b}}
:root[data-theme=dark]{--bg:#0d0d12;--fg:#f4f4f6;--muted:#1d1d25;--mf:#a0a0ad;--border:#2a2a35;--accent:#8b85ff;--card:#14141b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,system-ui,sans-serif}
.page{max-width:1120px;margin:0 auto;padding:40px 16px 80px}
h1{font-size:32px;letter-spacing:-.02em;margin:0 0 4px}p{color:var(--mf);margin:0}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:24px 0}
button,select{font:inherit;border:1px solid var(--border);background:var(--card);color:var(--fg);border-radius:8px;padding:8px 14px;cursor:pointer}
button.primary{background:var(--accent);color:var(--bg);border-color:transparent}
button:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:16px}
.card{border:1px solid var(--border);background:var(--card);border-radius:14px;padding:16px;display:grid;gap:12px}
.head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.head b{font-family:ui-monospace,monospace;font-size:13px}.head small{color:var(--mf);font-family:ui-monospace,monospace}
.use{font-size:13px;color:var(--mf);min-height:2.6em}
svg{width:100%;height:120px;background:var(--muted);border-radius:10px}
.stage{position:relative;height:72px;background:var(--muted);border-radius:10px;overflow:hidden}
.obj{position:absolute;left:12px;top:16px;width:40px;height:40px;border-radius:10px;background:var(--accent)}
.stage[data-demo=scale] .obj{left:calc(50% - 20px);transform:scale(.4);opacity:.3}
.stage[data-demo=scale].on .obj{transform:scale(1);opacity:1}
.stage[data-demo=move].on .obj{transform:translateX(calc(var(--w) - 64px))}
.stage[data-demo=sheet] .obj{left:0;width:100%;height:100%;top:0;border-radius:10px 10px 0 0;transform:translateY(100%)}
.stage[data-demo=sheet].on .obj{transform:translateY(30%)}
.copy{font-size:12px;justify-self:start}
@media (prefers-reduced-motion:reduce){.rm{display:block!important}}
.rm{display:none;padding:12px 14px;border-radius:10px;background:var(--muted);margin-bottom:16px}
</style></head><body><div class="page">
<h1>Motion Playground</h1><p>Easing tokens and springs from ui-motion-design. Click a card to replay it; copy the CSS value.</p>
<div class="rm">Your system asks for reduced motion — demos still play here so you can judge them; ship them with the reduced-motion fallback.</div>
<div class="bar"><button class="primary" id="all">Alle abspielen</button>
<label>Demo <select id="demo"><option value="move">Bewegung</option><option value="scale">Scale + Fade</option><option value="sheet">Sheet</option></select></label>
<label>Tempo <select id="speed"><option value="1">1×</option><option value="0.25">0.25× (Zeitlupe)</option><option value="0.5">0.5×</option></select></label>
<button id="theme">Theme</button></div>
<div class="grid" id="grid"></div></div>
<script>
const curves=${data};
const grid=document.getElementById('grid');
const path=(s)=>{const min=Math.min(0,...s),max=Math.max(1,...s),pad=.1;const y=v=>110-((v-min)/(max-min))*(100-20)-10;return s.map((v,i)=>(i?'L':'M')+(i*3+5).toFixed(1)+' '+y(v).toFixed(1)).join(' ')+'|'+y(0)+'|'+y(1)};
for(const c of curves){const el=document.createElement('div');el.className='card';const [d,y0,y1]=path(c.samples).split('|');
el.innerHTML='<div class="head"><b>'+c.label+'</b><small>'+c.duration+'ms'+(c.stiffness?' · k'+c.stiffness+' c'+c.damping:'')+'</small></div>'+
'<div class="use">'+c.use+'</div>'+
'<svg viewBox="0 0 310 120" preserveAspectRatio="none" aria-hidden="true"><line x1="5" x2="305" y1="'+y1+'" y2="'+y1+'" stroke="currentColor" stroke-opacity=".2" stroke-dasharray="4 4"/><line x1="5" x2="305" y1="'+y0+'" y2="'+y0+'" stroke="currentColor" stroke-opacity=".2"/><path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>'+
'<div class="stage" data-demo="move"><div class="obj"></div></div><button class="copy">CSS kopieren</button>';
const stage=el.querySelector('.stage'),obj=el.querySelector('.obj');
const play=()=>{const k=+document.getElementById('speed').value;stage.style.setProperty('--w',stage.clientWidth+'px');obj.style.transition='none';stage.classList.remove('on');obj.offsetWidth;
obj.style.transition='transform '+(c.duration/k)+'ms '+c.css+', opacity '+(c.duration/k)+'ms '+c.css;stage.classList.add('on')};
stage.onclick=play;el.querySelector('.copy').onclick=async(e)=>{e.stopPropagation();try{await navigator.clipboard.writeText(c.duration+'ms '+c.css);e.target.textContent='Kopiert'}catch{e.target.textContent='Kopieren nicht erlaubt'}setTimeout(()=>e.target.textContent='CSS kopieren',1200)};
el._play=play;grid.append(el)}
document.getElementById('all').onclick=()=>grid.querySelectorAll('.card').forEach(c=>c._play());
document.getElementById('demo').onchange=e=>grid.querySelectorAll('.stage').forEach(s=>{s.dataset.demo=e.target.value;s.classList.remove('on')});
document.getElementById('theme').onclick=()=>{const r=document.documentElement;const d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'light':'dark'};
</script></body></html>`;
}
