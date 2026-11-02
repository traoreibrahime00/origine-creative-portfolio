// The gallery: pieces float in one viewport-wide field at different depths.
// Scrolling the page flies straight through it, so every piece passes once on
// the way down; selecting one pulls it into focus while the rest sinks into
// the blur. With reduced motion it is a plain wall that opens a lightbox.
import { useEffect, useRef, useState } from 'react';
import type { Img, Lang } from './content';
import { reduceMotion } from './behaviors';

type Item = { img: Img; title: string; meta: { fr: string; en: string } };

const PERSPECTIVE = 900;  // px, how fast things shrink with depth
const SPACING = 340;      // px of depth between pieces
const VIEW_DEPTH = 2600;  // px, how far ahead pieces are visible
const FOCAL = 700;        // px, the depth that is sharp
const SPAN = 1.1;         // field size in viewports
const MAX_BLUR = 8;
const SHARP_BAND = 380;
const BLUR_FALLOFF = 160;
const SCROLL_RATE = 1.15; // px of depth per px of page scroll
const FOCAL_SCALE = PERSPECTIVE / (PERSPECTIVE + FOCAL);
const LEAD = VIEW_DEPTH * 0.35;

// Every blur change repaints that piece, so blur moves through a few steps.
const BLUR_STEPS = [0, 1, 2, 3.5, 5.5, 8, 12, 15, 19];
const blurStep = (blur: number) => BLUR_STEPS.reduce((best, s) => (Math.abs(s - blur) < Math.abs(best - blur) ? s : best), 0);
const wrap = (v: number) => v - Math.floor(v + 0.5);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// Deterministic scatter, so the field looks the same on every visit.
const random = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function DepthGallery({ items, lang, hint, closeLabel, prevLabel, nextLabel }: {
  items: Item[]; lang: Lang; hint: string; closeLabel: string; prevLabel: string; nextLabel: string;
}) {
  const [still] = useState(() => typeof window !== 'undefined' && reduceMotion());
  if (still) return <Wall items={items} lang={lang} closeLabel={closeLabel} prevLabel={prevLabel} nextLabel={nextLabel} />;
  return <Field items={items} lang={lang} hint={hint} closeLabel={closeLabel} />;
}

function Field({ items, lang, hint, closeLabel }: { items: Item[]; lang: Lang; hint: string; closeLabel: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const api = useRef<{ focus: (i: number) => void; release: () => void }>();

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const els = Array.from(stage.querySelectorAll<HTMLButtonElement>('.play-item'));
    const TRAVEL = LEAD + items.length * SPACING;

    const pieces = items.map((item, index) => {
      const seed = index * 7.13 + 1;
      return {
        el: els[index],
        img: els[index].querySelector('img')!,
        ratio: item.img.r,
        // R2 low-discrepancy steps spread pieces evenly instead of clumping.
        u: wrap(index * 0.7548777 + random(seed) * 0.12),
        v: wrap(index * 0.5698403 + random(seed + 3) * 0.12),
        d0: LEAD + index * SPACING + random(seed + 5) * 120,
        // Some pieces larger, some smaller, so the field never reads as a grid.
        size: 0.7 + random(seed + 9) * 0.65,
        w: 0, h: 0, hover: 0, blur: -1,
      };
    });

    const view = { w: 0, h: 0, small: false };
    const cam = { x: 0, y: 0, vx: 0, vy: 0, z: 0 };
    let focused = -1;
    let focusAmount = 0;
    let focusTarget = 0;
    let focusScrollY = 0;
    let hovered = -1;
    let raf = 0;
    let last = 0;
    let visible = false;
    let dragging = false;
    let dragMoved = false;
    let lastMotion = performance.now();

    const measure = () => {
      if (stage.clientWidth === view.w && stage.clientHeight === view.h) return;
      view.w = stage.clientWidth;
      view.h = stage.clientHeight;
      view.small = view.w < 720;
      // Long enough to fly past every piece once.
      track.style.height = Math.round(view.h + TRAVEL / SCROLL_RATE) + 'px';
      // Size by area, so wide and tall pieces carry the same weight.
      const base = (Math.min(view.w, view.h) * (view.small ? 0.5 : 0.36)) / FOCAL_SCALE;
      pieces.forEach((p) => {
        p.w = base * p.size * Math.sqrt(p.ratio);
        p.h = (base * p.size) / Math.sqrt(p.ratio);
        p.el.style.width = p.w + 'px';
        p.el.style.height = p.h + 'px';
        p.el.style.marginLeft = -p.w / 2 + 'px';
        p.el.style.marginTop = -p.h / 2 + 'px';
      });
      request();
    };

    const poseOf = (p: typeof pieces[number]) => {
      const d = p.d0 - cam.z;
      const s = PERSPECTIVE / (PERSPECTIVE + Math.max(d, -PERSPECTIVE * 0.9));
      // Close things spread outward, so diving feels like flying through.
      const spread = Math.pow(s / FOCAL_SCALE, 0.6);
      const spanX = view.w * SPAN;
      const spanY = view.h * SPAN;
      const x = wrap(p.u - (cam.x * s) / spanX) * spanX * spread;
      const y = wrap(p.v - (cam.y * s) / spanY) * spanY * spread;
      const opacity = smooth(40, 260, d) * (1 - smooth(VIEW_DEPTH - 700, VIEW_DEPTH - 80, d));
      const blur = Math.min(MAX_BLUR, Math.max(0, Math.abs(d - FOCAL) - SHARP_BAND) / BLUR_FALLOFF);
      return { x, y, s, d, opacity, blur };
    };

    const focusPose = (p: typeof pieces[number]) => {
      // Big and centred; the caption sits small below it.
      const maxW = view.w * (view.small ? 0.9 : 0.84);
      const maxH = view.h * (view.small ? 0.55 : 0.64);
      const w = Math.min(maxW, maxH * p.ratio);
      return { x: 0, y: view.small ? -view.h * 0.08 : -view.h * 0.06, s: w / p.w };
    };

    const render = (dt: number) => {
      let moving = false;
      const top = track.getBoundingClientRect().top;
      cam.z = Math.max(0, -top) * SCROLL_RATE;

      // Drag inertia, then a slow drift so the field never feels frozen.
      if (!dragging) {
        cam.x += cam.vx * dt;
        cam.y += cam.vy * dt;
        const friction = Math.pow(0.0025, dt / 1000);
        cam.vx *= friction;
        cam.vy *= friction;
        if (Math.abs(cam.vx) + Math.abs(cam.vy) > 0.004) moving = true;
        if (focused < 0 && performance.now() - lastMotion > 1500) {
          cam.x += 0.008 * dt;
          moving = true;
        }
      }

      // Exits settle a little faster than entrances.
      const ease = 1 - Math.exp(-dt / (focusTarget ? 115 : 90));
      focusAmount += (focusTarget - focusAmount) * ease;
      if (Math.abs(focusTarget - focusAmount) < 0.001) focusAmount = focusTarget;
      else moving = true;
      if (focusTarget === 0 && focusAmount === 0 && focused >= 0) {
        focused = -1;
      }

      pieces.forEach((p, i) => {
        const pose = poseOf(p);
        let { x, y, s, opacity, blur } = pose;
        let z = Math.round(10000 - pose.d);

        // Hover eases a piece out of the blur and a touch forward.
        const hoverGoal = i === hovered && focused < 0 ? 1 : 0;
        if (p.hover !== hoverGoal) {
          p.hover += (hoverGoal - p.hover) * (1 - Math.exp(-dt / 140));
          if (Math.abs(hoverGoal - p.hover) < 0.01) p.hover = hoverGoal;
          else moving = true;
        }
        blur *= 1 - p.hover;
        s *= 1 + 0.04 * p.hover;
        opacity += (1 - opacity) * p.hover * 0.6 * (opacity > 0.02 ? 1 : 0);

        if (focused >= 0) {
          if (i === focused) {
            const f = focusPose(p);
            x += (f.x - x) * focusAmount;
            y += (f.y - y) * focusAmount;
            s += (f.s - s) * focusAmount;
            opacity += (1 - opacity) * focusAmount;
            blur *= 1 - focusAmount;
            z = 20000;
          } else {
            opacity *= 1 - 0.88 * focusAmount;
            blur += 10 * focusAmount;
          }
        }

        const step = blurStep(blur);
        if (step !== p.blur) {
          p.blur = step;
          p.el.style.filter = step ? `blur(${step}px)` : '';
        }
        const hidden = opacity < 0.01;
        p.el.style.visibility = hidden ? 'hidden' : '';
        if (hidden) return;
        p.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        p.el.style.opacity = opacity.toFixed(3);
        p.el.style.zIndex = String(z);
      });
      return moving;
    };

    const loop = (t: number) => {
      const dt = Math.min(64, last ? t - last : 16);
      last = t;
      const moving = render(dt);
      raf = visible || moving ? requestAnimationFrame(loop) : 0;
      if (!raf) last = 0;
    };
    function request() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) request();
    });
    io.observe(stage);

    const onScroll = () => {
      const top = track.getBoundingClientRect().top;
      hintRef.current?.classList.toggle('is-hidden', -top > 240);
      if (focused >= 0 && Math.abs(scrollY - focusScrollY) > 90) doRelease();
      lastMotion = performance.now();
      request();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();

    const doFocus = (i: number) => {
      const p = pieces[i];
      const full = items[i].img.src;
      if (p.img.getAttribute('src') !== full) {
        const pre = new Image();
        pre.onload = () => { p.img.src = full; };
        pre.src = full;
      }
      focused = i;
      focusTarget = 1;
      focusScrollY = scrollY;
      stage.classList.add('has-focus');
      setFocus(i);
      request();
    };
    const doRelease = () => {
      focusTarget = 0;
      stage.classList.remove('has-focus');
      setFocus(null);
      request();
    };
    api.current = { focus: doFocus, release: doRelease };

    // Pointer: hover, drag to pan, click to focus
    let downX = 0, downY = 0, lastX = 0, lastY = 0, lastT = 0;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.play-close, .play-panel')) return;
      dragging = true;
      dragMoved = false;
      downX = lastX = e.clientX;
      downY = lastY = e.clientY;
      lastT = performance.now();
      cam.vx = cam.vy = 0;
    };
    const move = (e: PointerEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.play-item');
      const next = item ? els.indexOf(item as HTMLButtonElement) : -1;
      if (next !== hovered) { hovered = next; request(); }
      if (!dragging || focused >= 0) return;
      if (!dragMoved && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) {
        dragMoved = true;
        stage.classList.add('is-dragging');
        stage.setPointerCapture(e.pointerId);
      }
      if (!dragMoved) return;
      const t = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const k = 1 / FOCAL_SCALE;
      cam.x -= dx * k;
      cam.y -= dy * k;
      const dtm = Math.max(1, t - lastT);
      cam.vx = (-dx * k) / dtm;
      cam.vy = (-dy * k) / dtm;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = t;
      lastMotion = t;
      request();
    };
    const up = () => {
      dragging = false;
      stage.classList.remove('is-dragging');
    };
    const click = (e: MouseEvent) => {
      if (dragMoved) { dragMoved = false; return; }
      const item = (e.target as HTMLElement).closest<HTMLButtonElement>('.play-item');
      if (item) {
        const i = els.indexOf(item);
        if (i === focused) doRelease();
        else doFocus(i);
        return;
      }
      if (focused >= 0 && !(e.target as HTMLElement).closest('.play-panel')) doRelease();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focused >= 0) doRelease();
    };
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('pointerleave', () => { hovered = -1; request(); });
    stage.addEventListener('click', click);
    window.addEventListener('keydown', key);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', key);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
      stage.removeEventListener('click', click);
    };
  }, [items]);

  const current = focus !== null ? items[focus] : null;
  return (
    <div className="play-track" ref={trackRef}>
      <div className="play-stage" ref={stageRef}>
        <div className="play-field">
          {items.map((item, i) => (
            <button key={i} type="button" className="play-item" aria-label={`${item.title} — ${item.meta[lang]}`}>
              <img src={item.img.small || item.img.src} alt="" draggable={false} decoding="async" loading="lazy" />
              <span className="play-item-label">{item.title}</span>
            </button>
          ))}
        </div>
        <aside className={'play-panel' + (current ? ' is-open' : '')} aria-live="polite">
          {current && (
            <>
              <p>{current.title}</p>
              <p className="play-panel-meta">{current.meta[lang]}</p>
            </>
          )}
        </aside>
        <button type="button" className="play-close" aria-label={closeLabel} onClick={() => api.current?.release()}>
          <span aria-hidden="true" />
        </button>
        <p className="play-hint" ref={hintRef}>{hint}</p>
      </div>
    </div>
  );
}

function Wall({ items, lang, closeLabel, prevLabel, nextLabel }: {
  items: Item[]; lang: Lang; closeLabel: string; prevLabel: string; nextLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const item = items[index];
  return (
    <>
      <div className="play-wall">
        {items.map((it, i) => (
          <figure key={i} className="play-tile reveal" style={{ ['--r' as string]: it.img.r }}>
            <button type="button" className="play-open" aria-haspopup="dialog" onClick={() => open(i)}>
              <span className="play-media"><img src={it.img.small || it.img.src} alt={it.img.alt[lang]} loading="lazy" decoding="async" /></span>
            </button>
            <figcaption className="play-caption">{it.title} — {it.meta[lang]}</figcaption>
          </figure>
        ))}
      </div>
      <dialog className="lightbox" ref={dialog} onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div className="lightbox-inner">
          <div className="lightbox-media" style={{ ['--r' as string]: item.img.r }}>
            <img src={item.img.src} alt={item.img.alt[lang]} />
          </div>
          <div className="lightbox-caption">
            <p>{item.title}</p>
            <p className="play-panel-meta">{item.meta[lang]}</p>
          </div>
          <div className="lightbox-controls">
            <button type="button" onClick={() => setIndex((index + items.length - 1) % items.length)} aria-label={prevLabel}>←</button>
            <button type="button" onClick={() => setIndex((index + 1) % items.length)} aria-label={nextLabel}>→</button>
            <button type="button" onClick={() => dialog.current?.close()} autoFocus>{closeLabel}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
