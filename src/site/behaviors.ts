// DOM behaviour for the one-pager. React renders the markup; these functions
// add the motion that has to follow the pointer, the scroll or a card's
// position frame by frame, where re-rendering would be too slow.

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---- Input modality ----
// Focus rings are for the keyboard: after a tap, focus handed back to a card
// should not draw one.
export function initInputModality() {
  const root = document.documentElement;
  const pointer = () => { root.dataset.input = 'pointer'; };
  const keyboard = (e: KeyboardEvent) => { if (e.key === 'Tab') root.dataset.input = 'keyboard'; };
  window.addEventListener('pointerdown', pointer, true);
  window.addEventListener('keydown', keyboard, true);
  return () => {
    window.removeEventListener('pointerdown', pointer, true);
    window.removeEventListener('keydown', keyboard, true);
  };
}

// ---- Studio tiles ----
// The tile leans a little toward the pointer and a faint grainy shade follows
// it; the mark itself stays put. Every value eases toward its target each
// frame, so the tile trails the mouse instead of snapping to it.
export function initTilt(tile: HTMLElement) {
  if (!finePointer() || reduceMotion()) return () => {};
  const TILT = 3;
  const EASE = 0.05;
  const now = { x: 0, y: 0, on: 0 };
  const to = { x: 0, y: 0, on: 0 };
  let raf = 0;

  const frame = () => {
    now.x += (to.x - now.x) * EASE;
    now.y += (to.y - now.y) * EASE;
    now.on += (to.on - now.on) * EASE;
    tile.style.transform = `perspective(800px) rotateX(${(-now.y * TILT).toFixed(2)}deg) rotateY(${(now.x * TILT).toFixed(2)}deg)`;
    tile.style.setProperty('--lx', (50 + now.x * 100).toFixed(1) + '%');
    tile.style.setProperty('--ly', (50 + now.y * 100).toFixed(1) + '%');
    tile.style.setProperty('--lo', (now.on * 0.8).toFixed(3));
    const moving = Math.abs(to.x - now.x) + Math.abs(to.y - now.y) + Math.abs(to.on - now.on) > 0.001;
    raf = moving ? requestAnimationFrame(frame) : 0;
  };
  const aim = (e: PointerEvent) => {
    const r = tile.getBoundingClientRect();
    to.x = (e.clientX - r.left) / r.width - 0.5;
    to.y = (e.clientY - r.top) / r.height - 0.5;
    to.on = 1;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const leave = () => {
    to.x = 0; to.y = 0; to.on = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  tile.addEventListener('pointerenter', aim);
  tile.addEventListener('pointermove', aim);
  tile.addEventListener('pointerleave', leave);
  return () => {
    cancelAnimationFrame(raf);
    tile.removeEventListener('pointerenter', aim);
    tile.removeEventListener('pointermove', aim);
    tile.removeEventListener('pointerleave', leave);
  };
}

// ---- Hero peek ----
// Hovering a name in the intro floats that project's cover next to the
// pointer. One shared card follows with a little lag; moving from one name to
// the next swaps the picture without replaying the entrance.
export function initHeroPeek(links: HTMLElement[]) {
  if (!finePointer() || !links.length) return () => {};
  const peek = document.createElement('div');
  peek.className = 'hero-peek';
  peek.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  peek.appendChild(img);
  document.body.appendChild(peek);

  const OFFSET = 20;
  const FOLLOW = reduceMotion() ? 1 : 0.16;
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, hideTimer = 0;
  let active: HTMLElement | null = null;

  const place = () => {
    const w = peek.offsetWidth, h = peek.offsetHeight;
    let nx = tx + OFFSET, ny = ty + OFFSET;
    if (nx + w > innerWidth - 12) nx = tx - OFFSET - w;
    if (ny + h > innerHeight - 12) ny = ty - OFFSET - h;
    return [nx, ny];
  };
  const tick = () => {
    const [px, py] = place();
    x += (px - x) * FOLLOW;
    y += (py - y) * FOLLOW;
    peek.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    raf = Math.abs(px - x) + Math.abs(py - y) > 0.2 ? requestAnimationFrame(tick) : 0;
  };
  const track = (e: PointerEvent) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const show = (link: HTMLElement, e: PointerEvent) => {
    const src = link.dataset.peek;
    if (!src) return;
    clearTimeout(hideTimer);
    tx = e.clientX;
    ty = e.clientY;
    if (!peek.classList.contains('is-visible')) {
      // Start where the pointer is, so it doesn't fly in from the corner
      peek.style.setProperty('--r', link.dataset.peekR || '1.6');
      [x, y] = place();
      peek.style.translate = `${x}px ${y}px`;
    }
    if (active !== link) {
      active = link;
      peek.style.setProperty('--r', link.dataset.peekR || '1.6');
      if (img.getAttribute('src') !== src) img.src = src;
    }
    peek.classList.add('is-visible');
  };
  const hide = () => {
    hideTimer = window.setTimeout(() => {
      peek.classList.remove('is-visible');
      active = null;
    }, 60);
  };
  const onScroll = () => {
    if (active) { peek.classList.remove('is-visible'); active = null; }
  };

  const handlers = links.map((link) => {
    const enter = (e: PointerEvent) => show(link, e);
    link.addEventListener('pointerenter', enter);
    link.addEventListener('pointermove', track);
    link.addEventListener('pointerleave', hide);
    return () => {
      link.removeEventListener('pointerenter', enter);
      link.removeEventListener('pointermove', track);
      link.removeEventListener('pointerleave', hide);
    };
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    handlers.forEach((off) => off());
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
    peek.remove();
  };
}

// ---- Scroll reveals ----
export function initReveals(root: ParentNode) {
  const items = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return () => {};
  }
  const observer = new IntersectionObserver((entries) => {
    let batch = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Stagger only what arrives together, so late pieces never wait long.
      const el = entry.target as HTMLElement;
      el.style.setProperty('--reveal-delay', Math.min(batch, 6) * 70 + 'ms');
      el.classList.add('is-visible');
      // The services list dims its neighbours on hover once it has settled in
      if (el.classList.contains('how-i-work')) setTimeout(() => el.classList.add('is-settled'), 900);
      observer.unobserve(el);
      batch++;
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  const bottom = window.innerHeight;
  items.forEach((el) => {
    // Anything already on screen or scrolled past shows right away.
    if (el.getBoundingClientRect().top < bottom) {
      el.classList.add('is-visible');
      if (el.classList.contains('how-i-work')) el.classList.add('is-settled');
      return;
    }
    observer.observe(el);
  });
  return () => observer.disconnect();
}

// ---- Card rails ----
// The card nearest the rail's focus is the one in focus; its neighbours sit
// back. On a mouse the rail can be dragged; a drag that ends on a card is not
// a click, and a card peeking in at the side comes into focus first.
type Rail = HTMLElement & { _markCurrent?: () => void };

function railFocus(rail: HTMLElement) {
  const first = rail.querySelector<HTMLElement>('.card');
  const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
  return first ? pad + first.offsetWidth / 2 : rail.clientWidth / 2;
}

export function initRail(rail: Rail, onOpen: (card: HTMLAnchorElement) => void) {
  const cards = Array.from(rail.querySelectorAll<HTMLAnchorElement>('.card'));
  if (!cards.length) return () => {};
  let current: HTMLElement | null = null;
  let frame = 0;

  const markCurrent = () => {
    frame = 0;
    const mid = rail.getBoundingClientRect().left + railFocus(rail);
    let best = cards[0];
    let bestDist = Infinity;
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = card; }
    });
    if (best === current) return;
    current?.classList.remove('is-current');
    best.classList.add('is-current');
    current = best;
  };
  rail._markCurrent = markCurrent;
  markCurrent();
  rail.classList.add('has-current');
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(markCurrent); };
  rail.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', markCurrent);

  // Mouse drag
  let downX = 0, startLeft = 0, dragging = false, pressed = false, lastX = 0, lastT = 0, velocity = 0;
  const down = (e: PointerEvent) => {
    downX = e.clientX;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    pressed = true;
    dragging = false;
    startLeft = rail.scrollLeft;
    lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
  };
  const move = (e: PointerEvent) => {
    if (!pressed) return;
    const dx = e.clientX - downX;
    if (!dragging && Math.abs(dx) > 6) {
      dragging = true;
      rail.classList.add('is-swiping');
      rail.setPointerCapture(e.pointerId);
    }
    if (!dragging) return;
    const t = performance.now();
    velocity = (e.clientX - lastX) / Math.max(1, t - lastT);
    lastX = e.clientX;
    lastT = t;
    rail.scrollLeft = startLeft - dx;
  };
  const up = () => {
    if (!pressed) return;
    pressed = false;
    if (!dragging) return;
    // Throw: carry the hand's last speed to the next card, then snap back on
    const step = (cards[1]?.offsetLeft ?? 0) - cards[0].offsetLeft || rail.clientWidth;
    const idx = Math.round((rail.scrollLeft - velocity * 180) / step);
    const target = cards[Math.max(0, Math.min(cards.length - 1, idx))];
    rail.classList.remove('is-swiping');
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest', inline: rail.classList.contains('is-docs') || innerWidth < 700 ? 'start' : 'center' });
  };
  const click = (e: MouseEvent) => {
    const tapped = (e.target as HTMLElement).closest<HTMLAnchorElement>('.card');
    if (!tapped) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (e.detail !== 0 && (dragging || Math.abs(e.clientX - downX) > 6)) {
      e.preventDefault();
      dragging = false;
      return;
    }
    if (e.detail !== 0 && tapped !== current) {
      e.preventDefault();
      tapped.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest', inline: rail.classList.contains('is-docs') || innerWidth < 700 ? 'start' : 'center' });
      return;
    }
    e.preventDefault();
    onOpen(tapped);
  };
  rail.addEventListener('pointerdown', down);
  rail.addEventListener('pointermove', move);
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', up);
  rail.addEventListener('click', click);
  return () => {
    rail.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', markCurrent);
    rail.removeEventListener('pointerdown', down);
    rail.removeEventListener('pointermove', move);
    rail.removeEventListener('pointerup', up);
    rail.removeEventListener('pointercancel', up);
    rail.removeEventListener('click', click);
    cancelAnimationFrame(frame);
  };
}

// The card a sheet closes into comes to the focus of its rail first, at once.
function centreCard(card: HTMLElement) {
  const rail = card.closest<Rail>('.card-rail');
  if (!rail) return;
  const r = card.getBoundingClientRect();
  const delta = r.left + r.width / 2 - (rail.getBoundingClientRect().left + railFocus(rail));
  if (Math.abs(delta) < 1) return;
  rail.style.scrollBehavior = 'auto';
  rail.scrollLeft += delta;
  rail.style.scrollBehavior = '';
  // The card is hidden under the sheet: let it take its focused size at once.
  card.style.transition = 'none';
  rail._markCurrent?.();
  card.getBoundingClientRect();
  card.style.transition = '';
}

// ---- Sheets ----
type Sheet = HTMLElement & { _opener?: HTMLElement | null };
let openSheet: Sheet | null = null;

function cardClip(card: HTMLElement) {
  const r = card.getBoundingClientRect();
  return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 20px)`;
}

function visibleOpener(article: Sheet) {
  const card = article._opener || document.querySelector<HTMLElement>(`.card[data-controls="${article.id}"]`);
  if (!card) return null;
  const r = card.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.width > 0 ? card : null;
}

export function setSheetOpen(article: Sheet, open: boolean, instant = false) {
  const animate = !instant && !reduceMotion();
  const scroller = article.querySelector<HTMLElement>('.sheet-scroll')!;
  const closer = article.querySelector<HTMLElement>('.sheet-close')!;
  const closing = article.classList.contains('is-closing');
  if (open === (article.classList.contains('is-open') && !closing)) return;
  const card = visibleOpener(article) || article._opener || null;

  closer.setAttribute('aria-expanded', open ? 'true' : 'false');
  card?.setAttribute('aria-expanded', open ? 'true' : 'false');

  if (open) {
    if (openSheet && openSheet !== article) setSheetOpen(openSheet, false, true);
    openSheet = article;
    document.documentElement.classList.add('has-sheet');
    scroller.removeAttribute('inert');
    article.classList.remove('is-closing');
    const from = animate ? visibleOpener(article) : null;
    if (from) {
      article.style.transition = 'none';
      article.style.clipPath = cardClip(from);
      article.classList.add('is-open', 'is-from-card');
      scroller.scrollTop = 0;
      article.getBoundingClientRect();
      article.style.transition = '';
      article.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
      article.classList.remove('is-from-card');
      from.classList.remove('is-returning');
      from.style.visibility = 'hidden';
    } else {
      article.classList.add('is-open');
      scroller.scrollTop = 0;
    }
    // Focus follows the sheet, so Tab and screen readers start inside it.
    article.querySelector<HTMLElement>('.sheet-title')?.focus({ preventScroll: true });
    return;
  }

  scroller.setAttribute('inert', '');
  if (card) centreCard(card);
  const target = animate ? visibleOpener(article) : null;
  const finish = () => {
    article.classList.remove('is-open', 'is-closing', 'is-from-card', 'is-pulling', 'is-armed');
    scroller.style.removeProperty('--pull');
    closer.style.removeProperty('--pull');
    closer.style.removeProperty('--ring');
    article.style.clipPath = '';
    article.style.transition = '';
    if (card) {
      card.style.visibility = '';
      card.classList.remove('is-returning');
      const active = document.activeElement;
      if (!active || active === document.body || article.contains(active)) card.focus({ preventScroll: true });
    }
    if (openSheet === article) {
      openSheet = null;
      document.documentElement.classList.remove('has-sheet');
    }
  };
  if (!target) return finish();

  // The card shows under the closing sheet; its text rises in once the sheet is gone.
  target.classList.add('is-returning');
  target.style.visibility = '';
  article.classList.add('is-closing', 'is-from-card');
  article.style.clipPath = cardClip(target);
  let done = false;
  const end = (e?: TransitionEvent) => {
    if (done || (e && (e.target !== article || e.propertyName !== 'clip-path'))) return;
    done = true;
    article.removeEventListener('transitionend', end);
    // Reopened while closing: keep it open.
    if (article.classList.contains('is-closing')) finish();
  };
  article.addEventListener('transitionend', end);
  setTimeout(end, 900);
}

// ---- Pull to close ----
// Pulling past the end of an open sheet closes it, like a page you let go.
// The ring around the closer fills on the way; letting go short of it brings
// the content back.
export function initPullToClose(article: HTMLElement, close: () => void) {
  const scroller = article.querySelector<HTMLElement>('.sheet-scroll')!;
  const closer = article.querySelector<HTMLElement>('.sheet-close')!;
  let pull = 0;
  let releaseTimer = 0;
  let atEndSince = 0;
  let lastWheel = 0;
  let touchY = 0;
  let touchPulling = false;

  const atEnd = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
  const set = (value: number) => {
    pull = Math.max(0, Math.min(1, value));
    article.classList.toggle('is-pulling', pull > 0);
    article.classList.toggle('is-armed', pull >= 1);
    scroller.style.setProperty('--pull', pull.toFixed(3));
    closer.style.setProperty('--pull', pull.toFixed(3));
    closer.style.setProperty('--ring', pull.toFixed(3));
  };
  const commit = (touch = false) => {
    if (pull >= 1) {
      // A short tick on phones that allow it
      if (touch && navigator.vibrate) navigator.vibrate(8);
      close();
      setTimeout(() => set(0), 700);
    } else set(0);
  };
  const wheel = (e: WheelEvent) => {
    if (!article.classList.contains('is-open') || article.classList.contains('is-closing')) return;
    const now = performance.now();
    // Only a gesture that starts at the end counts, so the momentum that
    // carried you there never closes the sheet.
    const fresh = now - lastWheel > 160;
    lastWheel = now;
    if (!atEnd() || e.deltaY <= 0) { atEndSince = 0; if (pull) set(0); return; }
    if (!atEndSince) atEndSince = now;
    if (!fresh && now - atEndSince < 250 && pull === 0) return;
    set(pull + e.deltaY / 900);
    clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => commit(), 140);
  };
  const touchStart = (e: TouchEvent) => {
    touchY = e.touches[0].clientY;
    touchPulling = atEnd();
  };
  const touchMove = (e: TouchEvent) => {
    if (!touchPulling) { touchPulling = atEnd(); touchY = e.touches[0].clientY; return; }
    const dy = touchY - e.touches[0].clientY;
    if (dy > 0) set(dy / 160);
  };
  const touchEnd = () => {
    if (touchPulling && pull > 0) commit(true);
    touchPulling = false;
  };
  scroller.addEventListener('wheel', wheel, { passive: true });
  scroller.addEventListener('touchstart', touchStart, { passive: true });
  scroller.addEventListener('touchmove', touchMove, { passive: true });
  scroller.addEventListener('touchend', touchEnd);
  return () => {
    clearTimeout(releaseTimer);
    scroller.removeEventListener('wheel', wheel);
    scroller.removeEventListener('touchstart', touchStart);
    scroller.removeEventListener('touchmove', touchMove);
    scroller.removeEventListener('touchend', touchEnd);
  };
}

// ---- Footer ----
// Once the footer fills most of the screen the page turns over to white on
// black; scrolling back up turns it back. Its lines sign in once.
export function initFooter(footer: HTMLElement) {
  if (!('IntersectionObserver' in window)) return () => {};
  const root = document.documentElement;
  const invert = new IntersectionObserver((entries) => {
    const e = entries[0];
    root.classList.toggle('is-inverted', e.isIntersecting && e.intersectionRect.height > innerHeight * 0.55);
  }, { threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] });
  invert.observe(footer);

  footer.classList.add('will-sign');
  const sign = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    sign.disconnect();
    requestAnimationFrame(() => footer.classList.add('is-signed'));
  }, { rootMargin: '0px 0px -30% 0px' });
  sign.observe(footer);
  return () => {
    invert.disconnect();
    sign.disconnect();
    root.classList.remove('is-inverted');
  };
}

// ---- Email ----
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
