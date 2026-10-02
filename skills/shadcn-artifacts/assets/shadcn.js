/* shadcn-artifacts · Verhalten zu shadcn.css. Vanilla, keine Abhängigkeiten.
 * Event-Delegation am document: Markup, das später eingefügt wird, funktioniert ohne Neuinitialisierung.
 * Zustandsbehaftete Bausteine (Calendar, Chart, Data Table …) initialisiert shadcn.init(scope).
 * Abschnitte: "@core" und "@tail" immer, "@component <name> | <wörter>" nur bei Bedarf (build.mjs). */

// @core
(() => {
  "use strict";
  const doc = document;
  const root = doc.documentElement;
  const $ = (s, el = doc) => el.querySelector(s);
  const $$ = (s, el = doc) => [...el.querySelectorAll(s)];
  const byId = (id) => (id ? doc.getElementById(id) : null);
  const lang = () => root.lang || navigator.language || "de";
  const de = () => lang().toLowerCase().startsWith("de");
  const t = (deText, enText) => (de() ? deText : enText);
  const inits = [];
  const shadcn = (window.shadcn = window.shadcn || {});

  // Icons, die das Skript selbst erzeugt (Lucide, ISC). Statische Icons fügt build.mjs direkt als SVG ein.
  const ICONS = {
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "circle-alert": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "loader-circle": '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  };
  const icon = (name, cls = "icon") =>
    `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  shadcn.icon = icon;
  // Fallback ohne Build: <i data-icon="name"> aus dem kleinen Satz oben ersetzen
  inits.push((scope) => {
    $$("i[data-icon]", scope).forEach((i) => {
      if (!ICONS[i.dataset.icon]) return;
      i.outerHTML = icon(i.dataset.icon, ["icon", ...i.classList].join(" "));
    });
  });

  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* Speicher gesperrt */ } },
  };

  // Schwebende Ebene an einem Anker ausrichten (Rechteck oder Element), mit Flip und Rand von 8px
  const place = (el, anchor, { side = "bottom", align = "start", offset = 4 } = {}) => {
    const a = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor;
    const vw = root.clientWidth, vh = innerHeight, m = 8;
    el.style.left = "0px";
    el.style.top = "0px";
    // Layoutgröße ohne Transform – die Einblend-Animation skaliert sonst die Messung
    const w = el.offsetWidth, h = el.offsetHeight;
    let s = side;
    if (s === "bottom" && a.bottom + offset + h > vh - m && a.top - offset - h > m) s = "top";
    else if (s === "top" && a.top - offset - h < m && a.bottom + offset + h < vh - m) s = "bottom";
    else if (s === "right" && a.right + offset + w > vw - m && a.left - offset - w > m) s = "left";
    else if (s === "left" && a.left - offset - w < m) s = "right";
    let x, y;
    if (s === "bottom" || s === "top") {
      y = s === "bottom" ? a.bottom + offset : a.top - offset - h;
      x = align === "start" ? a.left : align === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
    } else {
      x = s === "right" ? a.right + offset : a.left - offset - w;
      y = align === "start" ? a.top : align === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
    }
    el.style.left = `${Math.round(Math.min(Math.max(m, x), vw - w - m))}px`;
    el.style.top = `${Math.round(Math.min(Math.max(m, y), vh - h - m))}px`;
    el.dataset.placed = s;
  };
  shadcn.place = place;
  const pointRect = (x, y) => ({ left: x, right: x, top: y, bottom: y, width: 0, height: 0 });
// @end

// @component popover | popover menu menubar nav-menu dropdown context-menu hovercard combobox date-picker popovertarget select-trigger
  // Popover-API: Öffnen/Schließen/Light-Dismiss macht der Browser, hier nur Position, aria-expanded, Fokus
  const anchors = new WeakMap();
  const placeOpts = new WeakMap();
  let lastInvoker = null;
  doc.addEventListener("click", (e) => { lastInvoker = e.target.closest?.("[popovertarget]") || lastInvoker; }, true);
  const optsOf = (el) => ({ side: el.dataset.side || "bottom", align: el.dataset.align || "start", offset: +(el.dataset.offset || 4), ...(placeOpts.get(el) || {}) });
  doc.addEventListener("beforetoggle", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || !el.hasAttribute("popover") || el.classList.contains("tooltip")) return;
    if (e.newState === "open") {
      if (!el._manual) {
        placeOpts.delete(el);
        const inv = lastInvoker?.getAttribute("popovertarget") === el.id ? lastInvoker : doc.querySelector(`[popovertarget="${CSS.escape(el.id)}"]`);
        if (inv) anchors.set(el, inv);
      }
      el.style.visibility = "hidden";
    }
  }, true);
  doc.addEventListener("toggle", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || !el.hasAttribute("popover") || el.classList.contains("tooltip")) return;
    const anchor = anchors.get(el);
    const inv = anchor instanceof Element ? anchor : null;
    if (e.newState === "open") {
      if (anchor) place(el, anchor, optsOf(el));
      el.style.visibility = "";
      inv?.setAttribute("aria-expanded", "true");
      if (!el.contains(doc.activeElement)) {
        const target = $(".command-input", el) || (el.classList.contains("menu") ? $(".menu-item:not(:disabled)", el) : null) || $("[autofocus]", el);
        target?.focus({ preventScroll: true });
      }
    } else {
      inv?.setAttribute("aria-expanded", "false");
      el._manual = false;
      placeOpts.delete(el);
    }
  }, true);
  shadcn.openPopover = (el, anchor, opts) => {
    el._manual = true;
    anchors.set(el, anchor);
    if (!el.matches(":popover-open")) el.showPopover();
    if (opts) placeOpts.set(el, opts);
    place(el, anchor, optsOf(el));
    el.style.visibility = "";
  };
  let raf = 0;
  const reposition = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => $$(":popover-open").forEach((el) => {
      const a = anchors.get(el);
      if (a instanceof Element) place(el, a, optsOf(el));
    }));
  };
  addEventListener("resize", reposition);
  addEventListener("scroll", reposition, true);

  // Menüs: Pfeiltasten, Checkbox-/Radio-Items, Schließen nach Auswahl
  const menuItems = (menu) => $$(".menu-item:not(:disabled):not([aria-disabled='true'])", menu).filter((i) => i.offsetParent !== null);
  doc.addEventListener("keydown", (e) => {
    const menu = e.target.closest?.(".menu");
    if (!menu) return;
    const items = menuItems(menu);
    const i = items.indexOf(doc.activeElement);
    const go = (n) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && menu.dataset.menubar) {
      const triggers = $$(".menubar-trigger", byId(menu.dataset.menubar) || doc);
      const cur = triggers.findIndex((tr) => tr.getAttribute("popovertarget") === menu.id);
      const next = triggers[(cur + (e.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length];
      if (next) { e.preventDefault(); next.click(); }
    }
  });
  doc.addEventListener("click", (e) => {
    const item = e.target.closest?.(".menu-item");
    if (!item || item.disabled) return;
    const role = item.getAttribute("role");
    if (role === "menuitemcheckbox") item.setAttribute("aria-checked", item.getAttribute("aria-checked") === "true" ? "false" : "true");
    if (role === "menuitemradio") {
      const group = item.closest("[role='group']") || item.closest(".menu");
      $$("[role='menuitemradio']", group).forEach((r) => r.setAttribute("aria-checked", String(r === item)));
    }
    if (role === "menuitemcheckbox" || item.hasAttribute("data-keep-open")) return;
    item.closest("[popover]")?.hidePopover?.();
  });
  inits.push((scope) => {
    $$(".menu", scope).forEach((m) => m.setAttribute("role", m.getAttribute("role") || "menu"));
    $$(".menu-item:not([role])", scope).forEach((m) => m.setAttribute("role", "menuitem"));
    $$("[popovertarget]", scope).forEach((b) => { if (!b.hasAttribute("aria-expanded")) b.setAttribute("aria-expanded", "false"); const t = byId(b.getAttribute("popovertarget")); if (t?.classList.contains("menu") && t.getAttribute("role") !== "listbox") b.setAttribute("aria-haspopup", "menu"); });
    $$(".menubar", scope).forEach((bar) => { bar.id ||= `menubar-${Math.random().toString(36).slice(2, 7)}`; $$(".menubar-trigger", bar).forEach((tr) => { const m = byId(tr.getAttribute("popovertarget")); if (m) m.dataset.menubar = bar.id; }); });
  });

  // Menubar und Navigation Menu: bei offenem Nachbarn per Hover wechseln
  doc.addEventListener("pointerover", (e) => {
    const tr = e.target.closest?.(".menubar-trigger, .nav-trigger");
    if (!tr || e.pointerType === "touch") return;
    const bar = tr.closest(".menubar, .nav-menu");
    const target = byId(tr.getAttribute("popovertarget"));
    const open = $$(".menubar-trigger, .nav-trigger", bar).some((o) => o !== tr && byId(o.getAttribute("popovertarget"))?.matches(":popover-open"));
    if (open && target && !target.matches(":popover-open")) tr.click();
  });

  // Context Menu: Rechtsklick (bzw. langer Druck) auf [data-context-menu="menu-id"].
  // Auf macOS und bei Touch kommt "contextmenu" schon beim Drücken; das folgende pointerup würde das
  // Menü per Light-Dismiss sofort schließen. Deshalb bei gedrückter Taste erst nach dem Loslassen öffnen.
  let pressed = false;
  doc.addEventListener("pointerdown", () => { pressed = true; }, true);
  doc.addEventListener("pointerup", () => { pressed = false; }, true);
  doc.addEventListener("pointercancel", () => { pressed = false; }, true);
  doc.addEventListener("contextmenu", (e) => {
    const area = e.target.closest?.("[data-context-menu]");
    const menu = area && byId(area.dataset.contextMenu);
    if (!menu) return;
    e.preventDefault();
    const rect = pointRect(e.clientX, e.clientY);
    const open = () => {
      if (menu.matches(":popover-open")) menu.hidePopover();
      shadcn.openPopover(menu, rect, { side: "bottom", align: "start", offset: 2 });
      $(".menu-item", menu)?.focus({ preventScroll: true });
    };
    if (pressed) doc.addEventListener("pointerup", () => setTimeout(open, 0), { once: true, capture: true });
    else open();
  });

  // Hover Card: [data-hovercard="card-id"], Karte mit popover="manual"
  let hcOpen, hcClose;
  const hcShow = (tr) => { clearTimeout(hcClose); clearTimeout(hcOpen); hcOpen = setTimeout(() => { const c = byId(tr.dataset.hovercard); if (c && !c.matches(":popover-open")) shadcn.openPopover(c, tr, { side: c.dataset.side || "bottom", align: c.dataset.align || "center" }); }, 300); };
  const hcHide = (card) => { clearTimeout(hcOpen); hcClose = setTimeout(() => card?.matches(":popover-open") && card.hidePopover(), 200); };
  doc.addEventListener("pointerover", (e) => {
    const tr = e.target.closest?.("[data-hovercard]");
    if (tr && e.pointerType !== "touch") return hcShow(tr);
    if (e.target.closest?.(".hovercard")) clearTimeout(hcClose);
  });
  doc.addEventListener("pointerout", (e) => {
    const tr = e.target.closest?.("[data-hovercard]");
    const card = e.target.closest?.(".hovercard");
    if (tr && !tr.contains(e.relatedTarget)) hcHide(byId(tr.dataset.hovercard));
    if (card && !card.contains(e.relatedTarget)) hcHide(card);
  });
  doc.addEventListener("focusin", (e) => { const tr = e.target.closest?.("[data-hovercard]"); if (tr) hcShow(tr); });
  doc.addEventListener("focusout", (e) => { const tr = e.target.closest?.("[data-hovercard]"); if (tr) hcHide(byId(tr.dataset.hovercard)); });
// @end

// @component tooltip | tooltip data-tooltip sidebar
  // Tooltip: [data-tooltip="Text"], optional data-tooltip-side="top|right|bottom|left"
  let tip, tipTimer, tipWarm = 0, tipFor = null;
  const tipEl = () => {
    if (!tip) { tip = doc.createElement("div"); tip.className = "tooltip"; tip.setAttribute("popover", "manual"); tip.setAttribute("role", "tooltip"); tip.id = "shadcn-tooltip"; doc.body.append(tip); }
    return tip;
  };
  const tipShow = (el) => {
    if (el.dataset.tooltipWhen === "collapsed" && !el.closest(".sidebar-layout[data-collapsed]")) return;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      const t = tipEl();
      t.textContent = el.dataset.tooltip;
      if (!t.matches(":popover-open")) t.showPopover();
      place(t, el, { side: el.dataset.tooltipSide || "top", align: "center", offset: 6 });
      el.setAttribute("aria-describedby", t.id);
      tipFor = el;
    }, Date.now() - tipWarm < 400 ? 0 : 500);
  };
  const tipHide = () => { clearTimeout(tipTimer); if (tip?.matches(":popover-open")) { tip.hidePopover(); tipWarm = Date.now(); } tipFor?.removeAttribute("aria-describedby"); tipFor = null; };
  doc.addEventListener("pointerover", (e) => { const el = e.target.closest?.("[data-tooltip]"); if (el && e.pointerType !== "touch" && el !== tipFor) tipShow(el); });
  doc.addEventListener("pointerout", (e) => { const el = e.target.closest?.("[data-tooltip]"); if (el && !el.contains(e.relatedTarget)) tipHide(); });
  doc.addEventListener("focusin", (e) => { const el = e.target.closest?.("[data-tooltip]"); if (el && el.matches(":focus-visible")) tipShow(el); });
  doc.addEventListener("focusout", tipHide);
  doc.addEventListener("pointerdown", tipHide, true);
  doc.addEventListener("keydown", (e) => { if (e.key === "Escape") tipHide(); });
// @end

// @component overlay | dialog sheet drawer alertdialog data-open data-close
  // Dialog, Alert Dialog, Sheet, Drawer: <dialog> + [data-open="id"] / [data-close]
  doc.addEventListener("click", (e) => {
    const opener = e.target.closest?.("[data-open]");
    if (opener) {
      const d = byId(opener.dataset.open);
      if (d instanceof HTMLDialogElement && !d.open) { d.showModal(); $(".command-input", d)?.focus(); }
      return;
    }
    const closer = e.target.closest?.("[data-close]");
    if (closer) { closer.closest("dialog")?.close(closer.dataset.close || ""); return; }
    // Klick auf den Hintergrund schließt, außer beim Alert Dialog
    const d = e.target;
    if (d instanceof HTMLDialogElement && d.open && d.getAttribute("role") !== "alertdialog") {
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    }
  });
  doc.addEventListener("cancel", (e) => { if (e.target.getAttribute?.("role") === "alertdialog" && e.target.dataset.dismissible === "false") e.preventDefault(); }, true);
  // Tastenkürzel: <dialog data-hotkey="k"> öffnet mit ⌘K / Strg+K
  doc.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
    const d = $$("dialog[data-hotkey]").find((x) => x.dataset.hotkey.toLowerCase() === e.key.toLowerCase());
    if (!d) return;
    e.preventDefault();
    if (d.open) d.close(); else { d.showModal(); $(".command-input", d)?.focus(); }
  });
// @end

// @component tabs | tabs
  // Tabs: .tabs-trigger[data-value] ↔ .tabs-content[data-value], automatische Aktivierung per Pfeiltasten
  const selectTab = (tabs, value, focus) => {
    $$(":scope > .tabs-list > .tabs-trigger, :scope > * > .tabs-list > .tabs-trigger", tabs).forEach((tr) => {
      const on = tr.dataset.value === value;
      tr.setAttribute("aria-selected", String(on));
      tr.tabIndex = on ? 0 : -1;
      if (on && focus) tr.focus();
    });
    $$(":scope > .tabs-content", tabs).forEach((c) => { c.hidden = c.dataset.value !== value; });
    tabs.dispatchEvent(new CustomEvent("tabs:change", { detail: { value }, bubbles: true }));
  };
  inits.push((scope) => $$(".tabs", scope).forEach((tabs) => {
    if (tabs._init) return; tabs._init = true;
    const uid = Math.random().toString(36).slice(2, 7);
    const triggers = $$(":scope > .tabs-list > .tabs-trigger, :scope > * > .tabs-list > .tabs-trigger", tabs);
    $(".tabs-list", tabs)?.setAttribute("role", "tablist");
    triggers.forEach((tr) => {
      const c = $(`:scope > .tabs-content[data-value="${tr.dataset.value}"]`, tabs);
      tr.setAttribute("role", "tab"); tr.type = "button";
      tr.id ||= `tab-${uid}-${tr.dataset.value}`;
      if (c) { c.id ||= `panel-${uid}-${tr.dataset.value}`; c.setAttribute("role", "tabpanel"); c.setAttribute("aria-labelledby", tr.id); c.tabIndex = 0; tr.setAttribute("aria-controls", c.id); }
    });
    const initial = triggers.find((tr) => tr.getAttribute("aria-selected") === "true") || triggers[0];
    if (initial) selectTab(tabs, initial.dataset.value);
  }));
  doc.addEventListener("click", (e) => { const tr = e.target.closest?.(".tabs-trigger"); if (tr && !tr.disabled) selectTab(tr.closest(".tabs"), tr.dataset.value); });
  doc.addEventListener("keydown", (e) => {
    const tr = e.target.closest?.(".tabs-trigger");
    if (!tr) return;
    const list = $$(".tabs-trigger:not(:disabled)", tr.parentElement);
    const i = list.indexOf(tr);
    const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    selectTab(tr.closest(".tabs"), list[(map[e.key] + list.length) % list.length].dataset.value, true);
  });
// @end

// @component toggle | toggle toggle-group
  // Toggle und Toggle Group (data-type="single" | "multiple")
  doc.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".toggle");
    if (!btn || btn.disabled) return;
    const group = btn.closest(".toggle-group");
    const pressed = btn.getAttribute("aria-pressed") === "true";
    if (group?.dataset.type === "single") $$(".toggle", group).forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", String(!pressed));
    (group || btn).dispatchEvent(new CustomEvent("toggle:change", { bubbles: true, detail: { value: btn.dataset.value, pressed: !pressed } }));
  });
  inits.push((scope) => $$(".toggle:not([aria-pressed])", scope).forEach((b) => b.setAttribute("aria-pressed", "false")));
// @end

// @component command | command combobox
  // Command: Textfilter, Pfeiltasten, Enter; Auswahl feuert "command:select" am .command
  const cmdItems = (cmd) => $$(".command-item:not([aria-disabled='true'])", cmd).filter((i) => !i.hidden);
  const cmdActivate = (cmd, item, scroll = true) => {
    $$(".command-item[data-active]", cmd).forEach((i) => i.removeAttribute("data-active"));
    if (!item) return;
    item.setAttribute("data-active", "");
    if (scroll) item.scrollIntoView({ block: "nearest" });
  };
  const cmdFilter = (cmd) => {
    const q = ($(".command-input", cmd)?.value || "").trim().toLowerCase();
    $$(".command-item", cmd).forEach((i) => {
      const hay = `${i.dataset.value || ""} ${i.textContent} ${i.dataset.keywords || ""}`.toLowerCase();
      i.hidden = !!q && !hay.includes(q);
    });
    $$(".command-group", cmd).forEach((g) => { g.hidden = !$$(".command-item", g).some((i) => !i.hidden); });
    $$(".command-separator", cmd).forEach((s) => { s.hidden = !!q; });
    const empty = $(".command-empty", cmd);
    const visible = cmdItems(cmd);
    if (empty) empty.hidden = visible.length > 0;
    cmdActivate(cmd, visible[0], false);
  };
  const cmdSelect = (cmd, item) => {
    if (!item) return;
    cmd.dispatchEvent(new CustomEvent("command:select", { bubbles: true, detail: { value: item.dataset.value ?? item.textContent.trim(), item } }));
    if (item.dataset.toast) shadcn.toast?.(item.dataset.toast);
    if (cmd.closest(".combobox")) return;
    cmd.closest("dialog")?.close();
    cmd.closest("[popover]")?.hidePopover();
  };
  doc.addEventListener("input", (e) => { if (e.target.matches?.(".command-input")) cmdFilter(e.target.closest(".command")); });
  doc.addEventListener("keydown", (e) => {
    const cmd = e.target.closest?.(".command");
    if (!cmd || !e.target.matches(".command-input")) return;
    const items = cmdItems(cmd);
    const i = items.findIndex((x) => x.hasAttribute("data-active"));
    if (e.key === "ArrowDown") { e.preventDefault(); cmdActivate(cmd, items[Math.min(i + 1, items.length - 1)]); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cmdActivate(cmd, items[Math.max(i - 1, 0)]); }
    else if (e.key === "Home") { e.preventDefault(); cmdActivate(cmd, items[0]); }
    else if (e.key === "End") { e.preventDefault(); cmdActivate(cmd, items[items.length - 1]); }
    else if (e.key === "Enter") { e.preventDefault(); cmdSelect(cmd, items[i]); }
  });
  doc.addEventListener("pointermove", (e) => {
    const item = e.target.closest?.(".command-item");
    if (item && !item.hasAttribute("data-active") && item.getAttribute("aria-disabled") !== "true") cmdActivate(item.closest(".command"), item, false);
  });
  doc.addEventListener("click", (e) => { const item = e.target.closest?.(".command-item"); if (item) cmdSelect(item.closest(".command"), item); });
  inits.push((scope) => $$(".command", scope).forEach((cmd) => {
    $(".command-list", cmd)?.setAttribute("role", "listbox");
    $$(".command-item", cmd).forEach((i) => { i.setAttribute("role", "option"); if (i.tagName === "BUTTON") i.type = "button"; i.tabIndex = -1; });
    cmdFilter(cmd);
  }));

  // Combobox = Popover + Command; Wert landet im Trigger-Label und in einem optionalen <input type="hidden">
  doc.addEventListener("command:select", (e) => {
    const box = e.target.closest(".combobox");
    if (!box) return;
    const { value, item } = e.detail;
    const trigger = $(".combobox-trigger", box);
    const label = (shadcn.ensureLabel || ((x) => $("span", x)))(trigger);
    const same = item.getAttribute("aria-selected") === "true";
    $$(".command-item", box).forEach((i) => i.setAttribute("aria-selected", "false"));
    if (!same) item.setAttribute("aria-selected", "true");
    label.textContent = same ? label.dataset.placeholder || "" : item.dataset.label || item.textContent.trim();
    trigger.toggleAttribute("data-empty", same);
    const hidden = $("input[type='hidden']", box);
    if (hidden) hidden.value = same ? "" : value;
    box.dataset.value = same ? "" : value;
    box.dispatchEvent(new CustomEvent("combobox:change", { bubbles: true, detail: { value: same ? null : value } }));
    item.closest("[popover]")?.hidePopover();
    trigger.focus();
  });
  doc.addEventListener("toggle", (e) => {
    const pop = e.target;
    if (e.newState !== "open" || !pop.closest?.(".combobox")) return;
    const input = $(".command-input", pop);
    if (input) { input.value = ""; cmdFilter(pop.querySelector(".command") || pop); }
    const sel = $(".command-item[aria-selected='true']", pop);
    if (sel) cmdActivate(sel.closest(".command"), sel);
  }, true);
  const ensureLabel = (tr) => {
    let span = $(":scope > span", tr);
    if (!span) {
      span = doc.createElement("span");
      [...tr.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()).forEach((n) => span.append(n));
      tr.prepend(span);
    }
    return span;
  };
  shadcn.ensureLabel = ensureLabel;
  inits.push((scope) => $$(".combobox-trigger", scope).forEach((tr) => {
    const span = ensureLabel(tr);
    if (span && !span.dataset.placeholder) span.dataset.placeholder = span.textContent.trim();
    tr.setAttribute("role", "combobox");
  }));
// @end

// @component calendar | calendar date-picker
  // Calendar: data-mode="single|range", data-value="2026-10-02" bzw. "2026-10-02,2026-10-09", data-months="2"
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const renderCalendar = (el) => {
    const st = el._cal;
    const today = new Date();
    const fmtMonth = new Intl.DateTimeFormat(lang(), { month: "long", year: "numeric" });
    const fmtDay = new Intl.DateTimeFormat(lang(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const fmtWd = new Intl.DateTimeFormat(lang(), { weekday: "short" });
    const wds = Array.from({ length: 7 }, (_, i) => fmtWd.format(new Date(2024, 0, 7 + st.weekStart + i)).replace(".", "").slice(0, 2));
    const [s0, s1] = st.sel;
    let html = '<div class="calendar-months">';
    for (let k = 0; k < st.months; k++) {
      const month = new Date(st.view.getFullYear(), st.view.getMonth() + k, 1);
      const start = new Date(month);
      start.setDate(1 - ((month.getDay() - st.weekStart + 7) % 7));
      html += `<div class="calendar-month"><div class="calendar-header"><div class="calendar-caption" aria-live="polite">${fmtMonth.format(month)}</div><div class="calendar-nav">`;
      html += k === 0 ? `<button type="button" class="button" data-variant="ghost" data-size="icon-sm" data-cal="-1" aria-label="${t("Vorheriger Monat", "Previous month")}">${icon("chevron-left")}</button>` : "<span></span>";
      html += k === st.months - 1 ? `<button type="button" class="button" data-variant="ghost" data-size="icon-sm" data-cal="1" aria-label="${t("Nächster Monat", "Next month")}">${icon("chevron-right")}</button>` : "";
      html += `</div></div><div class="calendar-grid" role="grid">${wds.map((w) => `<div class="calendar-weekday" role="columnheader">${w}</div>`).join("")}`;
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const outside = d.getMonth() !== month.getMonth();
        if (outside && st.months > 1) { html += "<span></span>"; continue; }
        const selected = sameDay(d, s0) || sameDay(d, s1);
        const mid = st.mode === "range" && s0 && s1 && d > s0 && d < s1;
        const attrs = [
          outside && "data-outside", sameDay(d, today) && "data-today", mid && "data-range-middle",
          st.mode === "range" && sameDay(d, s0) && "data-range-start", st.mode === "range" && sameDay(d, s1 || s0) && s0 && "data-range-end",
          st.min && d < st.min && "disabled", st.max && d > st.max && "disabled",
        ].filter(Boolean).join(" ");
        html += `<button type="button" class="calendar-day" data-date="${toISO(d)}" aria-label="${fmtDay.format(d)}" aria-selected="${selected}" tabindex="-1" ${attrs}>${d.getDate()}</button>`;
      }
      html += "</div></div>";
    }
    el.innerHTML = `${html}</div>`;
    const focusDay = $$(".calendar-day:not([data-outside])", el).find((b) => b.getAttribute("aria-selected") === "true") || $(".calendar-day[data-today]:not([data-outside])", el) || $(".calendar-day:not([data-outside])", el);
    if (focusDay) focusDay.tabIndex = 0;
  };
  const calendarSet = (el, date) => {
    const st = el._cal;
    if (st.mode === "range") st.sel = st.sel.length !== 1 ? [date] : date < st.sel[0] ? [date, st.sel[0]] : [st.sel[0], date];
    else st.sel = sameDay(st.sel[0], date) && el.dataset.required !== "true" ? [] : [date];
    el.dataset.value = st.sel.map(toISO).join(",");
    renderCalendar(el);
    el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: st.sel.map(toISO), dates: [...st.sel], complete: st.mode !== "range" || st.sel.length === 2 } }));
  };
  const initCalendar = (el) => {
    if (el._cal) return;
    const sel = (el.dataset.value || "").split(",").filter(Boolean).map(parseISO);
    const view = el.dataset.month ? parseISO(el.dataset.month) : new Date(sel[0] || Date.now());
    view.setDate(1);
    el._cal = {
      sel, view, mode: el.dataset.mode || "single", months: +(el.dataset.months || 1), weekStart: +(el.dataset.weekStart ?? (de() ? 1 : 0)),
      min: el.dataset.min ? parseISO(el.dataset.min) : null, max: el.dataset.max ? parseISO(el.dataset.max) : null,
    };
    el.setAttribute("role", "application");
    renderCalendar(el);
  };
  shadcn.calendar = { init: initCalendar, set: (el, iso) => calendarSet(el, parseISO(iso)) };
  inits.push((scope) => $$(".calendar", scope).forEach(initCalendar));
  doc.addEventListener("click", (e) => {
    const el = e.target.closest?.(".calendar");
    if (!el?._cal) return;
    const nav = e.target.closest("[data-cal]");
    if (nav) { el._cal.view.setMonth(el._cal.view.getMonth() + +nav.dataset.cal); renderCalendar(el); $(`[data-cal="${nav.dataset.cal}"]`, el)?.focus(); return; }
    const day = e.target.closest(".calendar-day");
    if (!day) return;
    const d = parseISO(day.dataset.date);
    if (day.hasAttribute("data-outside")) el._cal.view = new Date(d.getFullYear(), d.getMonth(), 1);
    calendarSet(el, d);
    $(`.calendar-day[data-date="${day.dataset.date}"]:not([data-outside])`, el)?.focus();
  });
  doc.addEventListener("keydown", (e) => {
    const day = e.target.closest?.(".calendar-day");
    if (!day) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const el = day.closest(".calendar");
    const d = parseISO(day.dataset.date);
    d.setDate(d.getDate() + step);
    const iso = toISO(d);
    let next = $(`.calendar-day[data-date="${iso}"]:not([data-outside])`, el);
    if (!next) { el._cal.view = new Date(d.getFullYear(), d.getMonth(), 1); renderCalendar(el); next = $(`.calendar-day[data-date="${iso}"]:not([data-outside])`, el); }
    if (next) { $$(".calendar-day", el).forEach((b) => (b.tabIndex = -1)); next.tabIndex = 0; next.focus(); }
  });
  // Date Picker: Trigger-Label folgt der Auswahl, Popover schließt, sobald die Auswahl vollständig ist
  doc.addEventListener("change", (e) => {
    const picker = e.target.closest?.(".date-picker");
    if (!picker || !e.target.classList.contains("calendar") || !e.detail) return;
    const label = $(".date-picker-trigger span", picker);
    const trigger = $(".date-picker-trigger", picker);
    const fmt = new Intl.DateTimeFormat(lang(), picker.dataset.format === "short" ? { dateStyle: "medium" } : { day: "numeric", month: "long", year: "numeric" });
    const { dates, complete } = e.detail;
    if (label) {
      label.dataset.placeholder ||= label.textContent;
      label.textContent = dates.length ? dates.map((d) => fmt.format(d)).join(" – ") : label.dataset.placeholder;
    }
    trigger?.toggleAttribute("data-empty", !dates.length);
    const hidden = $("input[type='hidden']", picker);
    if (hidden) hidden.value = e.detail.value.join(",");
    if (complete && dates.length) e.target.closest("[popover]")?.hidePopover();
  });
// @end

// @component form | slider otp copy data-copy
  // Slider: Füllstand als --fill, optionale Ausgabe über data-output="id"
  const sliderFill = (s) => {
    const min = +s.min || 0, max = +(s.max || 100);
    s.style.setProperty("--fill", `${max > min ? ((s.value - min) / (max - min)) * 100 : 0}%`);
    if (s.dataset.output) { const o = byId(s.dataset.output); if (o) o.textContent = `${s.dataset.prefix || ""}${(+s.value).toLocaleString(lang())}${s.dataset.suffix || ""}`; }
  };
  doc.addEventListener("input", (e) => { if (e.target.matches?.(".slider")) sliderFill(e.target); });
  inits.push((scope) => $$(".slider", scope).forEach(sliderFill));

  // Input OTP: springt weiter, Rücktaste zurück, Einfügen verteilt die Zeichen
  const otpSlots = (otp) => $$(".otp-slot", otp);
  doc.addEventListener("input", (e) => {
    const slot = e.target.closest?.(".otp-slot");
    if (!slot) return;
    const otp = slot.closest(".otp");
    const pattern = new RegExp(otp.dataset.pattern || "[0-9]", "u");
    const chars = [...slot.value].filter((c) => pattern.test(c));
    const slots = otpSlots(otp);
    let i = slots.indexOf(slot);
    slot.value = "";
    chars.forEach((c) => { if (slots[i]) { slots[i].value = c; i++; } });
    (slots[Math.min(i, slots.length - 1)] || slot).focus();
    const code = slots.map((s) => s.value).join("");
    otp.dataset.value = code;
    if (code.length === slots.length) otp.dispatchEvent(new CustomEvent("otp:complete", { bubbles: true, detail: { value: code } }));
  });
  doc.addEventListener("keydown", (e) => {
    const slot = e.target.closest?.(".otp-slot");
    if (!slot) return;
    const slots = otpSlots(slot.closest(".otp"));
    const i = slots.indexOf(slot);
    if (e.key === "Backspace" && !slot.value && i > 0) { e.preventDefault(); slots[i - 1].value = ""; slots[i - 1].focus(); }
    else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); slots[i - 1].focus(); }
    else if (e.key === "ArrowRight" && i < slots.length - 1) { e.preventDefault(); slots[i + 1].focus(); }
  });
  doc.addEventListener("focusin", (e) => { if (e.target.matches?.(".otp-slot")) e.target.select(); });
  inits.push((scope) => $$(".otp-slot", scope).forEach((s, i) => {
    s.maxLength = 1; s.autocomplete = i === 0 ? "one-time-code" : "off";
    if (!s.inputMode) s.inputMode = "numeric";
    if (!s.getAttribute("aria-label")) s.setAttribute("aria-label", t(`Ziffer ${i + 1}`, `Digit ${i + 1}`));
  }));
  doc.addEventListener("paste", (e) => {
    const slot = e.target.closest?.(".otp-slot");
    if (!slot) return;
    e.preventDefault();
    slot.value = e.clipboardData.getData("text");
    slot.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // Kopieren: [data-copy="Text"] oder [data-copy-target="id"]; im Artifact-Frame mit Fallback auf Markieren
  doc.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-copy], [data-copy-target]");
    if (!btn) return;
    const src = btn.dataset.copyTarget ? byId(btn.dataset.copyTarget) : null;
    const text = btn.dataset.copy ?? (src?.value ?? src?.textContent ?? "");
    const done = () => { shadcn.toast?.(btn.dataset.copyMessage || t("In die Zwischenablage kopiert", "Copied to clipboard"), { type: "success" }); btn.dataset.copied = ""; setTimeout(() => delete btn.dataset.copied, 1500); };
    // Zwischenablage gesperrt (z. B. im Artifact-Frame): Text markieren und sagen, wie es weitergeht
    const fallback = () => {
      if (src?.select) src.select();
      else if (src) { const r = doc.createRange(); r.selectNodeContents(src); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      shadcn.toast?.(t("Kopieren nicht erlaubt", "Copy not allowed"), { type: "warning", description: src ? t("Text ist markiert – mit ⌘C bzw. Strg+C kopieren.", "Text is selected – press ⌘C / Ctrl+C.") : text });
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch { fallback(); }
  });
// @end

// @component table | data-table
  // Data Table: Filter, Sortierung, Zeilenauswahl, Spalten ein/aus, Seiten – alles im Browser
  const cellValue = (row, i) => { const c = row.cells[i]; return c ? c.dataset.value ?? c.textContent.trim() : ""; };
  const initTable = (el) => {
    if (el._table) return;
    const table = $("table", el);
    const tbody = table?.tBodies[0];
    if (!tbody) return;
    const emptyRow = $(".data-table-empty", tbody);
    const rows = [...tbody.rows].filter((r) => r !== emptyRow);
    const st = (el._table = { rows, q: "", col: -1, dir: 1, page: 0, size: +el.dataset.pageSize || Infinity, filterCol: null });
    const collator = new Intl.Collator(lang(), { numeric: true, sensitivity: "base" });
    const render = () => {
      let list = rows.filter((r) => {
        if (!st.q) return true;
        const hay = st.filterCol != null ? cellValue(r, st.filterCol) : r.textContent;
        return hay.toLowerCase().includes(st.q);
      });
      if (st.col >= 0) {
        list = [...list].sort((a, b) => {
          const x = cellValue(a, st.col), y = cellValue(b, st.col);
          const nx = parseFloat(x), ny = parseFloat(y);
          const r = !isNaN(nx) && !isNaN(ny) && /^-?[\d.]+$/.test(x) && /^-?[\d.]+$/.test(y) ? nx - ny : collator.compare(x, y);
          return r * st.dir;
        });
        tbody.append(...list, ...rows.filter((r) => !list.includes(r)));
        if (emptyRow) tbody.append(emptyRow);
      }
      const pages = Math.max(1, Math.ceil(list.length / st.size));
      st.page = Math.min(st.page, pages - 1);
      const from = st.page * st.size, to = from + st.size;
      rows.forEach((r) => (r.hidden = true));
      list.forEach((r, i) => (r.hidden = i < from || i >= to));
      if (emptyRow) emptyRow.hidden = list.length > 0;
      st.visible = list;
      const prev = $("[data-table-prev]", el), next = $("[data-table-next]", el);
      if (prev) prev.disabled = st.page === 0;
      if (next) next.disabled = st.page >= pages - 1;
      const pageInfo = $("[data-table-page]", el);
      if (pageInfo) pageInfo.textContent = t(`Seite ${st.page + 1} von ${pages}`, `Page ${st.page + 1} of ${pages}`);
      sync();
    };
    const sync = () => {
      const boxes = rows.map((r) => $("[data-table-select]", r)).filter(Boolean);
      const n = boxes.filter((b) => b.checked).length;
      rows.forEach((r) => { const b = $("[data-table-select]", r); r.dataset.state = b?.checked ? "selected" : ""; });
      const all = $("[data-table-select-all]", el);
      const vis = st.visible.map((r) => $("[data-table-select]", r)).filter(Boolean);
      if (all) { all.checked = vis.length > 0 && vis.every((b) => b.checked); all.indeterminate = !all.checked && vis.some((b) => b.checked); }
      const info = $("[data-table-selected]", el);
      if (info) info.textContent = (info.dataset.template || t("{n} von {total} Zeile(n) ausgewählt.", "{n} of {total} row(s) selected.")).replace("{n}", n).replace("{total}", st.visible.length);
    };
    st.render = render;
    $$("th", table).forEach((th) => { if ($(".sort-button", th)) th.setAttribute("aria-sort", "none"); });
    render();
  };
  inits.push((scope) => $$(".data-table", scope).forEach(initTable));
  doc.addEventListener("input", (e) => {
    const f = e.target.closest?.("[data-table-filter]");
    const el = f?.closest(".data-table");
    if (!el?._table) return;
    el._table.q = f.value.trim().toLowerCase();
    el._table.filterCol = f.dataset.tableFilter === "" ? null : +f.dataset.tableFilter;
    el._table.page = 0;
    el._table.render();
  });
  doc.addEventListener("click", (e) => {
    const el = e.target.closest?.(".data-table");
    if (!el?._table) return;
    const st = el._table;
    const sort = e.target.closest(".sort-button");
    if (sort) {
      const th = sort.closest("th");
      const i = th.cellIndex;
      st.dir = st.col === i ? -st.dir : 1;
      st.col = i;
      $$("th[aria-sort]", el).forEach((h) => h.setAttribute("aria-sort", h === th ? (st.dir > 0 ? "ascending" : "descending") : "none"));
      return st.render();
    }
    if (e.target.closest("[data-table-prev]")) { st.page--; return st.render(); }
    if (e.target.closest("[data-table-next]")) { st.page++; return st.render(); }
    const col = e.target.closest("[data-table-column]");
    if (col) {
      const i = +col.dataset.tableColumn;
      const show = col.getAttribute("aria-checked") === "true";
      $$("tr", $("table", el)).forEach((r) => { if (r.cells[i]) r.cells[i].hidden = !show; });
    }
  });
  doc.addEventListener("change", (e) => {
    const el = e.target.closest?.(".data-table");
    if (!el?._table) return;
    if (e.target.matches("[data-table-select-all]")) el._table.visible.forEach((r) => { const b = $("[data-table-select]", r); if (b) b.checked = e.target.checked; });
    if (e.target.matches("[data-table-select], [data-table-select-all]")) el._table.render();
  });
// @end

// @component carousel | carousel
  // Carousel: Scroll-Snap; [data-carousel-prev]/[data-carousel-next]; leere .carousel-dots werden befüllt
  const carouselUpdate = (c) => {
    const vp = $(".carousel-viewport", c);
    if (!vp) return;
    const max = vp.scrollWidth - vp.clientWidth - 2;
    const prev = $("[data-carousel-prev]", c), next = $("[data-carousel-next]", c);
    if (prev) prev.disabled = vp.scrollLeft <= 2;
    if (next) next.disabled = vp.scrollLeft >= max;
    const items = $$(".carousel-item", vp);
    const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : vp.clientWidth;
    const idx = Math.round(vp.scrollLeft / (step || 1));
    $$(".carousel-dot", c).forEach((d, i) => d.setAttribute("aria-current", String(i === Math.min(idx, items.length - 1))));
  };
  inits.push((scope) => $$(".carousel", scope).forEach((c) => {
    if (c._init) return; c._init = true;
    const vp = $(".carousel-viewport", c);
    if (!vp) return;
    c.setAttribute("role", "region"); c.setAttribute("aria-roledescription", "carousel");
    vp.tabIndex = 0;
    const dots = $(".carousel-dots", c);
    const items = $$(".carousel-item", vp);
    items.forEach((it, i) => { it.setAttribute("role", "group"); it.setAttribute("aria-roledescription", "slide"); it.setAttribute("aria-label", `${i + 1} / ${items.length}`); });
    if (dots && !dots.children.length) dots.innerHTML = items.map((_, i) => `<button type="button" class="carousel-dot" data-carousel-to="${i}" aria-label="${t("Folie", "Slide")} ${i + 1}"></button>`).join("");
    let raf2 = 0;
    vp.addEventListener("scroll", () => { cancelAnimationFrame(raf2); raf2 = requestAnimationFrame(() => carouselUpdate(c)); }, { passive: true });
    vp.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); vp.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * vp.clientWidth }); } });
    carouselUpdate(c);
  }));
  doc.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-carousel-prev], [data-carousel-next], [data-carousel-to]");
    const c = b?.closest(".carousel");
    const vp = c && $(".carousel-viewport", c);
    if (!vp) return;
    if (b.dataset.carouselTo != null) { const it = $$(".carousel-item", vp)[+b.dataset.carouselTo]; vp.scrollTo({ left: it.offsetLeft - vp.offsetLeft }); return; }
    vp.scrollBy({ left: (b.hasAttribute("data-carousel-next") ? 1 : -1) * vp.clientWidth });
  });
// @end

// @component resizable | resizable
  // Resizable: Griff zwischen zwei Panels per Zeiger oder Pfeiltasten ziehen; Größe als --size (flex-grow)
  const resizePanels = (handle, deltaPx) => {
    const box = handle.parentElement;
    const vertical = box.dataset.direction === "vertical";
    const a = handle.previousElementSibling, b = handle.nextElementSibling;
    if (!a || !b) return;
    const dim = vertical ? "offsetHeight" : "offsetWidth";
    const ga = parseFloat(getComputedStyle(a).flexGrow) || 1, gb = parseFloat(getComputedStyle(b).flexGrow) || 1;
    const pa = handle._start?.pa ?? a[dim], pb = handle._start?.pb ?? b[dim];
    const total = pa + pb, grow = (handle._start?.ga ?? ga) + (handle._start?.gb ?? gb);
    const min = +(box.dataset.min || 48);
    const na = Math.min(Math.max(min, pa + deltaPx), total - min);
    a.style.setProperty("--size", ((grow * na) / total).toFixed(4));
    b.style.setProperty("--size", ((grow * (total - na)) / total).toFixed(4));
    handle.setAttribute("aria-valuenow", Math.round((na / total) * 100));
  };
  inits.push((scope) => $$(".resizable-handle", scope).forEach((h) => {
    h.setAttribute("role", "separator"); h.tabIndex = 0;
    h.setAttribute("aria-orientation", h.parentElement.dataset.direction === "vertical" ? "horizontal" : "vertical");
  }));
  doc.addEventListener("pointerdown", (e) => {
    const h = e.target.closest?.(".resizable-handle");
    if (!h) return;
    e.preventDefault();
    h.setPointerCapture(e.pointerId);
    const vertical = h.parentElement.dataset.direction === "vertical";
    const a = h.previousElementSibling, b = h.nextElementSibling;
    h._start = { x: vertical ? e.clientY : e.clientX, pa: vertical ? a.offsetHeight : a.offsetWidth, pb: vertical ? b.offsetHeight : b.offsetWidth, ga: parseFloat(getComputedStyle(a).flexGrow) || 1, gb: parseFloat(getComputedStyle(b).flexGrow) || 1 };
    const move = (ev) => resizePanels(h, (vertical ? ev.clientY : ev.clientX) - h._start.x);
    const up = () => { h.removeEventListener("pointermove", move); h.removeEventListener("pointerup", up); h._start = null; };
    h.addEventListener("pointermove", move);
    h.addEventListener("pointerup", up);
  });
  doc.addEventListener("keydown", (e) => {
    const h = e.target.closest?.(".resizable-handle");
    if (!h) return;
    const vertical = h.parentElement.dataset.direction === "vertical";
    const dir = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!dir || (vertical ? e.key.startsWith("ArrowL") || e.key.startsWith("ArrowR") : e.key.startsWith("ArrowU") || e.key.startsWith("ArrowD"))) return;
    e.preventDefault();
    resizePanels(h, dir * 24);
  });
// @end

// @component sidebar | sidebar
  // Sidebar: [data-sidebar-toggle] klappt ein (breit) bzw. öffnet als Overlay (schmal); ⌘B / Strg+B
  const sidebarToggle = (layout) => {
    if (!layout) return;
    if (layout.clientWidth <= 768) layout.toggleAttribute("data-mobile-open");
    else layout.toggleAttribute("data-collapsed");
    layout.dispatchEvent(new CustomEvent("sidebar:toggle", { bubbles: true, detail: { collapsed: layout.hasAttribute("data-collapsed") } }));
  };
  inits.push((scope) => $$(".sidebar-menu-button", scope).forEach((b) => {
    if (b.dataset.tooltip) return;
    const label = $("span", b)?.textContent.trim();
    if (label) { b.dataset.tooltip = label; b.dataset.tooltipSide = "right"; b.dataset.tooltipWhen = "collapsed"; }
  }));
  doc.addEventListener("click", (e) => {
    const tg = e.target.closest?.("[data-sidebar-toggle]");
    if (tg) return sidebarToggle(tg.dataset.sidebarToggle ? byId(tg.dataset.sidebarToggle) : tg.closest(".sidebar-layout") || $(".sidebar-layout"));
    const layout = e.target.closest?.(".sidebar-layout[data-mobile-open]");
    if (layout && !e.target.closest(".sidebar")) layout.removeAttribute("data-mobile-open");
    else if (layout && e.target.closest(".sidebar-menu-button, .sidebar-menu-sub a")) layout.removeAttribute("data-mobile-open");
  });
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".sidebar-layout[data-mobile-open]").forEach((l) => l.removeAttribute("data-mobile-open"));
    const typing = e.target.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b" && !typing && $(".sidebar-layout")) { e.preventDefault(); sidebarToggle($(".sidebar-layout")); }
  });
// @end

// @component chart | chart
  // Chart: SVG aus JSON (<script type="application/json"> im .chart oder data-chart).
  // type: "bar" | "line" | "area" | "donut"; labels[]; series[{ name, data[], color? }]; height; stacked; format (Intl); legend
  const niceStep = (range, count) => {
    const raw = range / count || 1;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  };
  const monotonePath = (pts) => {
    if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : "";
    const n = pts.length, dx = [], dy = [], m = [], tg = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; m[i] = dy[i] / dx[i]; }
    tg[0] = m[0]; tg[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) tg[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += `C${pts[i][0] + h},${pts[i][1] + h * tg[i]} ${pts[i + 1][0] - h},${pts[i + 1][1] - h * tg[i + 1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const renderChart = (el) => {
    const cfg = el._chart;
    const W = Math.max(240, Math.round(el.clientWidth || 600));
    const H = cfg.height || 240;
    const fmt = new Intl.NumberFormat(lang(), cfg.format || {});
    const series = cfg.series.map((s, i) => ({ ...s, color: s.color || `var(--chart-${(i % 5) + 1})` }));
    const labels = cfg.labels || [];
    let svg = "";
    let tipData = [];
    if (cfg.type === "donut" || cfg.type === "pie") {
      const s = series[0];
      const total = s.data.reduce((a, b) => a + b, 0) || 1;
      const R = Math.min(H, W) / 2 - 4, r = cfg.type === "pie" ? 0 : R * 0.62, cx = W / 2, cy = H / 2;
      let a0 = -Math.PI / 2;
      s.data.forEach((v, i) => {
        const a1 = a0 + (v / total) * Math.PI * 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const p = (rad, ang) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`;
        const color = (cfg.colors && cfg.colors[i]) || `var(--chart-${(i % 5) + 1})`;
        const d = r ? `M${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1 - 0.0001)}L${p(r, a1 - 0.0001)}A${r},${r} 0 ${large} 0 ${p(r, a0)}Z` : `M${cx},${cy}L${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1 - 0.0001)}Z`;
        svg += `<path d="${d}" style="fill:${color};stroke:var(--background);stroke-width:2" data-i="${i}"/>`;
        tipData.push({ label: labels[i], rows: [{ name: labels[i], value: v, color }] });
        a0 = a1;
      });
      if (r) svg += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="chart-center-value" style="fill:var(--foreground)">${esc(cfg.centerValue ?? fmt.format(total))}</text><text x="${cx}" y="${cy + 20}" text-anchor="middle" class="chart-center-label" style="fill:var(--muted-foreground)">${esc(cfg.centerLabel ?? "")}</text>`;
      el._chartState = { type: "donut", tipData, fmt };
    } else {
      const stacked = !!cfg.stacked;
      const n = labels.length;
      const values = series.flatMap((s) => s.data).filter(Number.isFinite);
      let maxVal = Math.max(0, ...values), minVal = Math.min(0, ...values);
      if (stacked) {
        // Balken stapeln positive und negative Werte getrennt, Linien/Flächen laufend
        maxVal = 0; minVal = 0;
        labels.forEach((_, i) => {
          let run = 0, pos = 0, neg = 0;
          series.forEach((s) => { const v = s.data[i]; if (!Number.isFinite(v)) return; run += v; if (v > 0) pos += v; else neg += v; });
          maxVal = Math.max(maxVal, cfg.type === "bar" ? pos : run);
          minVal = Math.min(minVal, cfg.type === "bar" ? neg : run);
        });
      }
      const step = niceStep(maxVal - minVal, 4);
      const bottom = Math.floor(minVal / step) * step;
      let top = Math.ceil(maxVal / step) * step;
      if (top <= bottom) top = bottom + step;
      const ticks = [];
      for (let v = bottom; v <= top + step / 2; v += step) ticks.push(+v.toFixed(10));
      const stepDigits = Math.min(4, (String(+step.toFixed(10)).split(".")[1] || "").length);
      const axisFmt = new Intl.NumberFormat(lang(), { ...(cfg.format || {}), notation: top >= 10000 ? "compact" : "standard", minimumFractionDigits: 0, maximumFractionDigits: top >= 10000 ? 1 : stepDigits });
      const showY = cfg.yAxis !== false;
      const padL = showY ? Math.max(...ticks.map((v) => axisFmt.format(v).length)) * 7 + 12 : 4;
      const padR = 8, padT = 8, padB = 24;
      const iw = W - padL - padR, ih = H - padT - padB;
      const y = (v) => padT + ih - ((v - bottom) / (top - bottom)) * ih;
      const band = iw / n;
      const x = (i) => padL + band * i + band / 2;
      ticks.forEach((v) => {
        svg += `<line class="chart-grid" x1="${padL}" x2="${W - padR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" style="stroke:var(--border)"/>`;
        if (showY) svg += `<text class="chart-axis" x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" style="fill:var(--muted-foreground)">${axisFmt.format(v)}</text>`;
      });
      const every = Math.max(1, Math.ceil((Math.max(...labels.map((l) => String(l).length)) * 7 + 12) / band));
      labels.forEach((l, i) => { if (i % every === 0) svg += `<text class="chart-axis" x="${x(i)}" y="${H - 6}" text-anchor="middle" style="fill:var(--muted-foreground)">${esc(l)}</text>`; });
      svg += `<rect class="chart-cursor" x="0" y="${padT}" width="0" height="${ih}" style="fill:var(--muted)" opacity="0"/>`;
      if (cfg.type === "bar") {
        const groupW = band * 0.8, gap = 4;
        const bw = stacked ? groupW : (groupW - gap * (series.length - 1)) / series.length;
        const accPos = labels.map(() => 0), accNeg = labels.map(() => 0);
        series.forEach((s, si) => s.data.forEach((v, i) => {
          if (!Number.isFinite(v) || i >= n) return;
          const x0 = stacked ? x(i) - groupW / 2 : x(i) - groupW / 2 + si * (bw + gap);
          const base = stacked ? (v < 0 ? accNeg[i] : accPos[i]) : 0;
          const neg = v < 0;
          const y1 = Math.min(y(base + v), y(base)), y0 = Math.max(y(base + v), y(base));
          const capOuter = !stacked || si === series.length - 1, capInner = !stacked || si === 0;
          const rTop = neg ? (capInner ? 4 : 0) : capOuter ? 4 : 0, rBot = neg ? (capOuter ? 4 : 0) : capInner ? 4 : 0;
          const h = Math.max(0, y0 - y1), w = Math.max(1, bw);
          const rt = Math.min(rTop, h / 2, w / 2), rb = Math.min(rBot, h / 2, w / 2);
          svg += `<path d="M${x0},${y1 + rt}a${rt},${rt} 0 0 1 ${rt},${-rt}h${w - 2 * rt}a${rt},${rt} 0 0 1 ${rt},${rt}v${h - rt - rb}a${rb},${rb} 0 0 1 ${-rb},${rb}h${-(w - 2 * rb)}a${rb},${rb} 0 0 1 ${-rb},${-rb}Z" style="fill:${s.color}"/>`;
          if (stacked) { if (v < 0) accNeg[i] += v; else accPos[i] += v; }
        }));
      } else {
        const acc = labels.map(() => 0);
        series.forEach((s, si) => {
          const base = labels.map((_, i) => (stacked ? acc[i] : 0));
          const pts = labels.map((_, i) => (Number.isFinite(s.data[i]) ? [x(i), y(base[i] + s.data[i])] : null));
          if (stacked) s.data.forEach((v, i) => { if (Number.isFinite(v)) acc[i] += v; });
          const line = monotonePath(pts.filter(Boolean));
          if (cfg.type === "area" && pts.some(Boolean)) {
            const gid = `g${Math.random().toString(36).slice(2, 7)}`;
            const basePts = stacked ? labels.map((_, i) => [x(i), y(base[i])]).reverse() : null;
            const drawn = pts.filter(Boolean);
            const close = basePts ? `L${basePts[0][0]},${basePts[0][1]}${monotonePath(basePts).slice(1).replace(/^[\d.,-]+/, "")}Z` : `L${drawn[drawn.length - 1][0]},${y(0)}L${drawn[0][0]},${y(0)}Z`;
            svg += `<defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" style="stop-color:${s.color};stop-opacity:0.6"/><stop offset="95%" style="stop-color:${s.color};stop-opacity:0.08"/></linearGradient></defs>`;
            svg += `<path d="${line}${close}" style="fill:url(#${gid})"/>`;
          }
          svg += `<path d="${line}" style="fill:none;stroke:${s.color};stroke-width:2"/>`;
          if (cfg.dots) pts.filter(Boolean).forEach(([px, py]) => (svg += `<circle cx="${px}" cy="${py}" r="3" style="fill:${s.color}"/>`));
          svg += `<g class="chart-hover" data-s="${si}"></g>`;
          s._pts = pts;
        });
      }
      tipData = labels.map((l, i) => ({ label: l, rows: series.filter((s) => Number.isFinite(s.data[i])).map((s) => ({ name: s.name, value: s.data[i], color: s.color })) }));
      el._chartState = { type: cfg.type, tipData, fmt, x, band, padL, padR, W, series, y };
    }
    let target = $(":scope > svg", el);
    if (!target) { target = doc.createElementNS("http://www.w3.org/2000/svg", "svg"); el.prepend(target); }
    target.setAttribute("viewBox", `0 0 ${W} ${H}`);
    target.setAttribute("role", "img");
    target.setAttribute("aria-label", cfg.title || series.map((s) => s.name).join(", "));
    target.innerHTML = svg;
    let legend = $(":scope > .chart-legend", el);
    if (cfg.legend !== false && !legend) { legend = doc.createElement("div"); legend.className = "chart-legend"; el.append(legend); }
    if (legend) {
      const items = cfg.type === "donut" || cfg.type === "pie" ? labels.map((l, i) => [l, (cfg.colors && cfg.colors[i]) || `var(--chart-${(i % 5) + 1})`]) : series.map((s) => [s.name, s.color]);
      legend.innerHTML = items.map(([n, c]) => `<span class="chart-legend-item"><span class="chart-swatch" style="background:${c}"></span>${esc(n)}</span>`).join("");
    }
  };
  const chartTip = (el, e) => {
    const st = el._chartState;
    if (!st) return;
    const svg = $(":scope > svg", el);
    const box = svg.getBoundingClientRect();
    const scale = box.width / st.W || 1;
    let tip = $(":scope > .chart-tooltip", el);
    if (!tip) { tip = doc.createElement("div"); tip.className = "chart-tooltip"; el.append(tip); }
    let data, idx;
    if (st.type === "donut") {
      const p = e.target.closest?.("path[data-i]");
      if (!p) { tip.style.opacity = "0"; return; }
      idx = +p.dataset.i; data = st.tipData[idx];
    } else {
      const px = (e.clientX - box.left) / scale;
      idx = Math.floor((px - st.padL) / st.band);
      if (idx < 0 || idx >= st.tipData.length) { tip.style.opacity = "0"; $(".chart-cursor", svg)?.setAttribute("opacity", "0"); return; }
      data = st.tipData[idx];
      const cur = $(".chart-cursor", svg);
      if (st.type === "bar") { cur.setAttribute("x", st.x(idx) - st.band / 2); cur.setAttribute("width", st.band); cur.setAttribute("opacity", "0.6"); }
      else {
        cur.setAttribute("x", st.x(idx) - 0.5); cur.setAttribute("width", 1); cur.setAttribute("opacity", "1");
        cur.setAttribute("style", "fill:var(--border)");
        $$(".chart-hover", svg).forEach((g) => { const s = st.series[+g.dataset.s]; if (!s._pts?.[idx]) { g.innerHTML = ""; return; } const [cx, cy] = s._pts[idx]; g.innerHTML = `<circle cx="${cx}" cy="${cy}" r="4" style="fill:${s.color};stroke:var(--background);stroke-width:2"/>`; });
      }
    }
    tip.innerHTML = `${st.type === "donut" ? "" : `<div class="chart-tooltip-label">${esc(data.label)}</div>`}${data.rows.map((r) => `<div class="chart-tooltip-row"><span class="chart-swatch" style="background:${r.color}"></span><span>${esc(r.name)}</span><span>${st.fmt.format(r.value)}</span></div>`).join("")}`;
    tip.style.opacity = "1";
    const er = el.getBoundingClientRect();
    let left = e.clientX - er.left + 12, top = e.clientY - er.top + 12;
    if (left + tip.offsetWidth > er.width) left = e.clientX - er.left - tip.offsetWidth - 12;
    tip.style.left = `${Math.max(0, left)}px`;
    tip.style.top = `${Math.max(0, Math.min(top, er.height - tip.offsetHeight))}px`;
  };
  const initChart = (el) => {
    if (el._chart) return;
    const src = $(':scope > script[type="application/json"]', el)?.textContent || el.dataset.chart;
    if (!src) return;
    try { el._chart = JSON.parse(src); } catch (err) { console.error("[shadcn] Chart-JSON ungültig", err); return; }
    const safeRender = () => { try { renderChart(el); } catch (err) { console.error("[shadcn] Chart konnte nicht gezeichnet werden", el, err); } };
    safeRender();
    let w = el.clientWidth;
    new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 1) { w = el.clientWidth; safeRender(); } }).observe(el);
    el.addEventListener("pointermove", (e) => chartTip(el, e));
    el.addEventListener("pointerleave", () => { const tip = $(":scope > .chart-tooltip", el); if (tip) tip.style.opacity = "0"; $(".chart-cursor", el)?.setAttribute("opacity", "0"); $$(".chart-hover", el).forEach((g) => (g.innerHTML = "")); });
  };
  shadcn.chart = { init: initChart, update: (el, cfg) => { el._chart = { ...el._chart, ...cfg }; renderChart(el); } };
  inits.push((scope) => $$(".chart", scope).forEach(initChart));
// @end

// @component toast | toast data-toast data-copy
  // Sonner-artige Toasts: shadcn.toast("Titel", { description, type, action: { label, onClick }, duration })
  const toaster = () => {
    let el = $(".toaster");
    if (!el) { el = doc.createElement("section"); el.className = "toaster"; el.setAttribute("aria-live", "polite"); el.setAttribute("aria-label", t("Benachrichtigungen", "Notifications")); doc.body.append(el); }
    return el;
  };
  const typeIcon = { success: "circle-check", error: "circle-alert", warning: "triangle-alert", info: "info", loading: "loader-circle" };
  const toast = (title, opts = {}) => {
    const box = toaster();
    const el = doc.createElement("div");
    el.className = "toast";
    el.setAttribute("role", opts.type === "error" ? "alert" : "status");
    if (opts.type) el.dataset.type = opts.type;
    el.innerHTML = `${opts.type ? icon(typeIcon[opts.type], opts.type === "loading" ? "icon spinner" : "icon") : ""}<div class="toast-body"><div class="toast-title"></div>${opts.description ? '<div class="toast-description"></div>' : ""}</div>${opts.action ? '<button type="button" class="button" data-size="sm"></button>' : ""}<button type="button" class="toast-close" aria-label="${t("Schließen", "Close")}">${icon("x")}</button>`;
    $(".toast-title", el).textContent = title;
    if (opts.description) $(".toast-description", el).textContent = opts.description;
    if (opts.action) { const b = $(".button", el); b.textContent = opts.action.label; b.onclick = () => { opts.action.onClick?.(); dismiss(); }; }
    let timer;
    const dismiss = () => { clearTimeout(timer); el.dataset.leaving = ""; setTimeout(() => el.remove(), 200); };
    const arm = () => { const d = opts.duration ?? (opts.type === "loading" ? Infinity : 4000); if (d !== Infinity) timer = setTimeout(dismiss, d); };
    $(".toast-close", el).onclick = dismiss;
    el.addEventListener("pointerenter", () => clearTimeout(timer));
    el.addEventListener("pointerleave", arm);
    box.append(el);
    while (box.children.length > (opts.max || 3)) box.firstElementChild.remove();
    arm();
    return { dismiss, el };
  };
  ["success", "error", "warning", "info", "loading"].forEach((k) => (toast[k] = (title, o = {}) => toast(title, { ...o, type: k })));
  toast.promise = (p, { loading, success, error }) => {
    const l = toast.loading(loading);
    return p.then((v) => { l.dismiss(); toast.success(typeof success === "function" ? success(v) : success); return v; }, (err) => { l.dismiss(); toast.error(typeof error === "function" ? error(err) : error); throw err; });
  };
  shadcn.toast = toast;
  if (!("toast" in window)) window.toast = toast;
  // Deklarativ: <button data-toast="Titel" data-toast-description="…" data-toast-type="success">
  doc.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-toast]");
    if (!b || b.closest(".command")) return;
    toast(b.dataset.toast, { description: b.dataset.toastDescription, type: b.dataset.toastType });
  });
// @end

// @component select | select-trigger select-item
  // Select mit Liste: Trigger .select-trigger[popovertarget] + div.menu[popover][role=listbox] mit .menu-item.select-item[data-value]
  doc.addEventListener("beforetoggle", (e) => {
    const list = e.target;
    if (e.newState !== "open" || !list.classList?.contains("menu") || list.getAttribute("role") !== "listbox") return;
    const trigger = doc.querySelector(`[popovertarget="${CSS.escape(list.id)}"]`);
    if (trigger) list.style.minWidth = `${trigger.offsetWidth}px`;
  }, true);
  doc.addEventListener("toggle", (e) => {
    const list = e.target;
    if (e.newState === "open" && list.getAttribute?.("role") === "listbox") $(".select-item[aria-selected='true']", list)?.focus({ preventScroll: true });
  }, true);
  doc.addEventListener("click", (e) => {
    const item = e.target.closest?.(".select-item");
    if (!item || item.disabled) return;
    const list = item.closest("[role='listbox']");
    const trigger = doc.querySelector(`[popovertarget="${CSS.escape(list.id)}"]`);
    $$(".select-item", list).forEach((i) => i.setAttribute("aria-selected", String(i === item)));
    const value = item.dataset.value ?? item.textContent.trim();
    if (trigger) {
      const label = $(":scope > span", trigger) || trigger;
      label.textContent = item.dataset.label || item.textContent.trim();
      trigger.removeAttribute("data-empty");
      // Verstecktes Feld direkt vor oder hinter dem Trigger – nie ein fremdes im selben Container
      const hidden = [trigger.previousElementSibling, trigger.nextElementSibling].find((n) => n?.matches?.("input[type='hidden']"));
      if (hidden) hidden.value = value;
      trigger.dataset.value = value;
      trigger.dispatchEvent(new CustomEvent("select:change", { bubbles: true, detail: { value } }));
    }
  });
  inits.push((scope) => $$(".select-trigger", scope).forEach((tr) => {
    if (!$(":scope > span", tr)) { const span = doc.createElement("span"); [...tr.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()).forEach((n) => span.append(n)); tr.prepend(span); }
    tr.setAttribute("aria-haspopup", "listbox");
    const list = byId(tr.getAttribute("popovertarget"));
    $$(".select-item", list || scope).forEach((i) => { i.setAttribute("role", "option"); if (!i.hasAttribute("aria-selected")) i.setAttribute("aria-selected", "false"); });
  }));
// @end

// @component theme | data-theme-toggle data-set-theme data-set-accent setTheme setAccent data-theme-select data-accent-select
  // Theme: [data-theme-toggle] wechselt hell/dunkel, [data-set-theme="light|dark|system"], [data-set-accent="blue|…|"]
  const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const syncTheme = () => {
    const cur = root.dataset.theme || "system", acc = root.dataset.accent || "";
    $$("[data-set-theme]").forEach((b) => b.setAttribute(b.getAttribute("role")?.startsWith("menuitem") ? "aria-checked" : "aria-pressed", String(b.dataset.setTheme === cur)));
    $$("[data-set-accent]").forEach((b) => b.setAttribute(b.getAttribute("role")?.startsWith("menuitem") ? "aria-checked" : "aria-pressed", String(b.dataset.setAccent === acc)));
    $$("[data-theme-toggle]").forEach((b) => b.setAttribute("aria-pressed", String((root.dataset.theme || (dark() ? "dark" : "light")) === "dark")));
    $$("select[data-theme-select]").forEach((s) => (s.value = cur));
    $$("select[data-accent-select]").forEach((s) => (s.value = acc));
  };
  shadcn.setTheme = (v) => { if (!v || v === "system") delete root.dataset.theme; else root.dataset.theme = v; store.set("shadcn-theme", v === "system" ? null : v); syncTheme(); };
  shadcn.setAccent = (v) => { if (!v) delete root.dataset.accent; else root.dataset.accent = v; store.set("shadcn-accent", v || null); syncTheme(); };
  doc.addEventListener("click", (e) => {
    const tg = e.target.closest?.("[data-theme-toggle]");
    if (tg) return shadcn.setTheme((root.dataset.theme || (dark() ? "dark" : "light")) === "dark" ? "light" : "dark");
    const st = e.target.closest?.("[data-set-theme]");
    if (st) return shadcn.setTheme(st.dataset.setTheme);
    const sa = e.target.closest?.("[data-set-accent]");
    if (sa) shadcn.setAccent(sa.dataset.setAccent);
  });
  doc.addEventListener("change", (e) => {
    if (e.target.matches?.("select[data-theme-select]")) shadcn.setTheme(e.target.value);
    if (e.target.matches?.("select[data-accent-select]")) shadcn.setAccent(e.target.value);
  });
  inits.push(() => {
    const th = store.get("shadcn-theme"), ac = store.get("shadcn-accent");
    if (th && !root.dataset.theme) root.dataset.theme = th;
    if (ac && !root.dataset.accent) root.dataset.accent = ac;
    syncTheme();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", syncTheme);
// @end

// @tail
  shadcn.init = (scope = doc) => inits.forEach((fn) => { try { fn(scope); } catch (err) { console.error("[shadcn]", err); } });
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", () => shadcn.init());
  else shadcn.init();
})();
// @end
