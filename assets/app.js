/* ==========================================================================
Valantiq — the pages' scripted behaviours, numbered by part below.
Without them the drawings hold their finished state, the content is all
still there and the header stays on paper; nothing else depends on it.
The numbers are only names: 4, 6, 8, 10 and 18 are retired, and part 2 sits
inside part 1's wrapper. Each part's own comment says what it does.
========================================================================== */
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function scrollP(el) { var r = el.getBoundingClientRect(), vh = window.innerHeight; return clamp((vh * .8 - (r.top + r.height / 2)) / (vh * .5)); }
function lineMid(el) {
var r = document.createRange(), q;
r.selectNodeContents(el); q = r.getClientRects()[0] || el.getBoundingClientRect();
return q.top + q.height / 2;
}
(function () {
var m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
if (m && m.addEventListener) m.addEventListener('change', function () { window.location.reload(); });
})();
function byKeyboard() { try { return document.documentElement.matches(':has(:focus-visible)'); } catch (e) { return false; } }   // the last thing the reader did was a key: a scroll the code makes is then instant
var EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)', EASE_IN_OUT = 'cubic-bezier(.77, 0, .175, 1)';   // the same two curves as --ease and --ease-in-out in styles.css
function gridLines(g, ps, vertical, a, b) {
var at = ps.slice(), i, l;                                                  // one through each dot (none between them: Marko, 16 Oct 2026)
while (g.childNodes.length > at.length) g.removeChild(g.lastChild);
while (g.childNodes.length < at.length) g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
for (i = 0; i < at.length; i++) {
l = g.childNodes[i];
l.setAttribute(vertical ? 'x1' : 'y1', a.toFixed(1)); l.setAttribute(vertical ? 'x2' : 'y2', b.toFixed(1));
l.setAttribute(vertical ? 'y1' : 'x1', at[i].toFixed(1)); l.setAttribute(vertical ? 'y2' : 'x2', at[i].toFixed(1));
}
}
function gridGroup(svg) { var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'list__grid'); svg.insertBefore(g, svg.firstChild); return g; }
function keepClear(anchor, sheet) {
if (!anchor || !sheet || !window.matchMedia('(max-width: 900px)').matches) return;
window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
if (document.documentElement.classList.contains('pk-lock')) return;   // a picker is up: the page behind is held still
var head = (document.querySelector('[data-header]') || {}).offsetHeight || 60, a = anchor.getBoundingClientRect(), st = sheet.getBoundingClientRect().top;
if (!(st > head + 40) || (a.top >= head + 8 && a.bottom <= st - 12)) return;
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.scrollBy({ top: (a.top + a.bottom) / 2 - (head + st) / 2, behavior: still || byKeyboard() ? 'instant' : 'smooth' });
}); });
}
function curve(p) {
var n = p.length, d, i, f = function (v) { return (Math.round(v * 10) / 10); };
if (!n) return 'M0 0';
d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
if (n < 3) return n > 1 ? d + ' L' + f(p[1][0]) + ' ' + f(p[1][1]) : d;
for (i = 1; i < n - 1; i++) d += ' Q' + f(p[i][0]) + ' ' + f(p[i][1]) + ' ' + f((p[i][0] + p[i + 1][0]) / 2) + ' ' + f((p[i][1] + p[i + 1][1]) / 2);
return d + ' L' + f(p[n - 1][0]) + ' ' + f(p[n - 1][1]);
}
function passed(track) { return track.getBoundingClientRect().bottom < -24; }
function unpin(frame, track, change) {
var root = document.documentElement, was = root.style.overflowAnchor, before = track.offsetHeight, y0 = window.scrollY, d;
root.style.overflowAnchor = 'none';
frame.classList.remove('is-pinned'); track.style.height = ''; frame.style.top = ''; frame.style.minHeight = '';
if (change) change();
d = before - track.offsetHeight;
if (d > 0) window.scrollTo({ top: Math.max(0, y0 - d), behavior: 'instant' });
root.style.overflowAnchor = was;
}
function pinBlock(frame, track, runVh, want) {
frame.classList.remove('is-pinned'); track.style.height = ''; frame.style.top = ''; frame.style.minHeight = '';
if (want === false) return null;
var vh = window.innerHeight, fh = frame.offsetHeight, top, run;
if (fh + 16 > vh) return null;
top = Math.max(16, Math.min(76, (vh - fh) / 2)); run = Math.round(vh * runVh);
frame.style.minHeight = fh + 'px'; frame.style.top = top + 'px'; frame.classList.add('is-pinned'); track.style.height = (fh + run) + 'px';
return { top: top, run: run };
}
function leaveSheet(sh, done, instant) {
if (instant || !sh.animate || !window.matchMedia('(max-width: 900px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !sh.offsetHeight) { done(); return null; }
var cs = getComputedStyle(sh);
var from = { height: sh.getBoundingClientRect().height + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, borderTopWidth: cs.borderTopWidth, opacity: 1 };
var to = { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', borderTopWidth: '0px', opacity: 0 };
sh.style.overflow = 'hidden';
var a = sh.animate([from, to], { duration: 200, easing: EASE_OUT, fill: 'forwards' });
a.onfinish = function () { a.onfinish = null; done(); a.cancel(); sh.style.overflow = ''; };   // put away first, then let go of the held frame: nothing flashes back
return a;
}
function stopLeaving(a, sh) {          // pressed again while it folds away: it opens again from where it has got to, not from the top
if (!a || a.playState !== 'running') return;
a.onfinish = function () { a.onfinish = null; a.cancel(); sh.style.overflow = ''; };
a.reverse();
}
function wireBox(d) {
var trig = d.querySelector('.ways__trig'), box = d.querySelector('.ways__box'); d.classList.add('is-js'); d._trig = trig;
function set(on) {
if (on) {
[].forEach.call(document.querySelectorAll('.ways__d.is-open'), function (o) { if (o !== d) { o.classList.remove('is-open'); o._trig.setAttribute('aria-expanded', 'false'); } });
var tr = trig.getBoundingClientRect(), dr = d.getBoundingClientRect(), w = box.offsetWidth, left = Math.max(16, Math.min(tr.left, window.innerWidth - 16 - w));
box.style.left = (left - dr.left) + 'px';
var head = (document.querySelector('[data-header]') || {}).offsetHeight || 68, h = box.scrollHeight, below = window.innerHeight - tr.bottom - 28, above = tr.top - 28 - head, up = h > below && (h <= above || above > below), room = Math.max(160, up ? above : below);
box.style.maxHeight = h > room ? Math.floor(room - 12) + 'px' : '';
box.style.transition = 'none'; d.classList.toggle('is-up', up); void box.offsetHeight; box.style.transition = '';   // the direction is set before the box opens, so it starts from the trigger's side
}
d.classList.toggle('is-open', on); trig.setAttribute('aria-expanded', on);
}
trig.addEventListener('click', function () {
set(!d.classList.contains('is-open'));
});
document.addEventListener('click', function (e) { if (d.classList.contains('is-open') && !d.contains(e.target)) set(false); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('is-open')) { set(false); trig.focus(); } });
}
function lightChain(c, p, held) {
var steps = c._steps || (c._steps = c.querySelectorAll('.chain__step')), n = steps.length, now = -1, i, lit;   // looked up once, then kept
var v = p.toFixed(3), els = c._pe || (c._pe = c.querySelectorAll('.chain__draw, .chain__scan'));   // set on the two that read it, not on the chain
for (i = 0; i < els.length; i++) els[i].style.setProperty('--p', v);
for (i = 0; i < n; i++) {   // c._at: where each step really sits on a phone's line (part 24)
lit = p + 1e-4 >= (c._at ? c._at[i] : i / n) || !!(held && held[i]);
if (!lit && steps[i].classList.contains('is-lit')) { var od = steps[i].querySelector('.ways__d.is-open'); if (od) { od.classList.remove('is-open'); if (od._trig) od._trig.setAttribute('aria-expanded', 'false'); } }   // a step the scroll runs back past takes its open note with it
steps[i].classList.toggle('is-lit', lit); if (lit) now = i;
}
for (i = 0; i < n; i++) steps[i].classList.toggle('is-now', i === now);
}
(function () {
'use strict';
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
Array.prototype.forEach.call(document.querySelectorAll('.flow__svg'), function (svg) {
var F = JSON.parse(svg.getAttribute('data-flow'));
var paths = svg.querySelectorAll('.flow__wave');
var w = F.w, h = F.h, xn = F.node[0] * w, yn = F.node[1] * h;
var grow = 1, outGrow = 1, fit = 1;
function wave(k, t) {
var p = F.waves[k], spread = p[0] * h * fit, amp = p[1] * h * fit, lam = p[2] * w, phase = (F.out ? -1 : 1) * p[3] * t;
var pts = [], x, u;
function at(x) {
u = x / xn;
var y = yn + spread * Math.pow(1 - u, 1.15) + amp * Math.pow(1 - u, 0.9) * Math.sin(2 * Math.PI * x / lam - phase);
return x.toFixed(1) + ' ' + y.toFixed(1);
}
var from = F.mirror ? Math.floor(xn * (1 - grow) / 6) * 6 : 0, to = F.mirror ? xn : xn * grow;
for (x = from; x < Math.floor(to); x += 6) pts.push(at(x));
pts.push(at(to));
return 'M' + pts.join(' L');
}
function outPath(g) {
var d = 'M' + xn.toFixed(1) + ' ' + yn.toFixed(1), end = xn + (w - xn) * g;
for (var X = Math.floor(xn) + 6; X < end; X += 6) d += ' L' + X + ' ' + (yn - F.rise * h * Math.pow((X - xn) / (w - xn), 1.3)).toFixed(1);
return d + ' L' + end.toFixed(1) + ' ' + (yn - F.rise * h * Math.pow((end - xn) / (w - xn), 1.3)).toFixed(1);
}
var fig = svg.parentNode, node = fig.querySelector('.flow__node'), horizon = svg.querySelector('.flow__horizon');
var outLine = svg.querySelector('.flow__out');
function logoMark() {
var all = document.querySelectorAll('.site-header .mark'), i;
for (i = 0; i < all.length; i++) if (all[i].getBoundingClientRect().width) return all[i];
return null;
}
var lastT = 0;
function draw(t) {
lastT = t;
if (horizon) { if (F.mirror) horizon.setAttribute('x1', xn * (1 - grow)); else horizon.setAttribute('x2', xn + (w - xn) * outGrow); }
if (!F.mirror) node.style.opacity = Math.max(0, Math.min(1, (grow - .85) / .15));     // the home node appears as the waves reach it
if (outLine && outGrow !== drawnOut) { outLine.setAttribute('d', outPath(outGrow)); drawnOut = outGrow; }
for (var k = 0; k < paths.length; k++) paths[k].setAttribute('d', wave(k, t));
}
var drawnOut = -1;
function aim() {
var f = fig.getBoundingClientRect();
if (!f.width) return;
if (F.mirror) {
var a = logoMark(), l = a && a.getBoundingClientRect();
if (!a) return;
F.node = [Math.max(.2, Math.min(.97, (f.right - (l.left + l.width / 2)) / f.width)), .5];
}
xn = F.node[0] * w; yn = F.node[1] * h;
var up = 0, down = 0;
for (var k = 0; k < F.waves.length; k++) {
up = Math.max(up, Math.max(0, -F.waves[k][0]) + F.waves[k][1]);
down = Math.max(down, Math.max(0, F.waves[k][0]) + F.waves[k][1]);
}
fit = Math.min(1, 0.97 * yn / (up * h || 1), 0.97 * (h - yn) / (down * h || 1));
node.style.left = (F.mirror ? 1 - F.node[0] : F.node[0]) * 100 + '%';
node.style.top = F.node[1] * 100 + '%';
horizon.setAttribute('x1', F.mirror ? 0 : xn); horizon.setAttribute('x2', F.mirror ? xn : w);
horizon.setAttribute('y1', yn); horizon.setAttribute('y2', yn);
drawnOut = -1;
draw(lastT);
}
window.addEventListener('resize', aim);
window.addEventListener('load', aim);
if ('ResizeObserver' in window) new ResizeObserver(aim).observe(fig);   // also as a page is shown (the preview switches pages)
window.setTimeout(aim, 1300);                // once the words' rise has settled
if (document.fonts && document.fonts.ready) document.fonts.ready.then(aim);
aim();
if (still) return;
var on = true, t0 = null, running = false;
function start() { if (!running) { running = true; window.requestAnimationFrame(frame); } }   // the loop sleeps while the figure is off screen and wakes when it returns
if ('IntersectionObserver' in window) {
new IntersectionObserver(function (entries) { on = entries[0].isIntersecting; if (on) start(); }).observe(svg);
}
grow = 0; outGrow = F.mirror ? 1 : 0;
function frame(now) {
if (t0 === null) t0 = now;
var g = Math.max(0, Math.min(1, ((now - t0) / 1000 - 0.5) / 2.2)); g = 1 - Math.pow(1 - g, 3);
if (F.mirror) grow = g; else { grow = Math.min(1, g / .7); outGrow = Math.max(0, Math.min(1, (g - .7) / .3)); }
if (on) { draw((now - t0) / 1000); window.requestAnimationFrame(frame); } else running = false;
}
start();
});
var chains = document.querySelectorAll('.chain:not(.chain--ways):not(.market .chain):not(.fits-section .chain)');   // the ways' and the home market's chains are played by part 19
if (chains.length && !still) {
var walking = false;
var walk = function () {
walking = false;
var vh = window.innerHeight;
Array.prototype.forEach.call(chains, function (c) {
var r = c.getBoundingClientRect();
if (!r.height) return;
var p = Math.max(0, Math.min(1, (vh * 0.8 - (r.top + r.height / 2)) / (vh * 0.5)));
p = c._hi = Math.max(p, c._hi || 0);
lightChain(c, p);
});
};
Array.prototype.forEach.call(chains, function (c) { c.classList.add('is-live'); });
window.addEventListener('scroll', function () {
if (!walking) { walking = true; window.requestAnimationFrame(walk); }
}, { passive: true });
window.addEventListener('resize', walk);
walk();
}
var FOLD = 280, EASE = EASE_IN_OUT;
window.__valantiqFolding = false;
var foldQueue = null, foldRow = null;                         // a press that came while a fold was still moving; the row that started it
function closedHeight(d) {
var s = d.querySelector(':scope > summary'), cs = getComputedStyle(d);
return s.getBoundingClientRect().height + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
}
function inner(d) { return Array.prototype.filter.call(d.children, function (c) { return c.tagName !== 'SUMMARY'; }); }
function fold(d, from, to, done) {
var opening = to > from;
d.style.overflow = 'hidden';
var a = d.animate({ height: [from + 'px', to + 'px'] }, { duration: FOLD, easing: EASE });
inner(d).forEach(function (c) {
c.animate(opening ? [{ opacity: 0 }, { opacity: 0, offset: .15 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: .55 }, { opacity: 0 }],
{ duration: FOLD, easing: EASE });
});
a.onfinish = a.oncancel = function () { d.style.overflow = ''; if (done) done(); };
return a;
}
function topEdge() {
var h = document.querySelector('[data-header]');
var r = h && !h.classList.contains('is-hidden') ? h.getBoundingClientRect().bottom : 0;
return Math.max(0, r);
}
document.addEventListener('click', function (e) {
var moving = e.target.closest && e.target.closest('details > summary');
if (moving && !still && moving.parentElement.__folding) { e.preventDefault(); if (moving.parentElement !== foldRow) foldQueue = moving; return; }   // the same row twice is a double tap, not a wish to shut it again
var sum = e.target.closest && e.target.closest('details[name] > summary');
if (!sum || still || !sum.parentElement.animate) return;
e.preventDefault();
var d = sum.parentElement, name = d.getAttribute('name');
if (d.__folding) return;
var group = Array.prototype.slice.call(document.querySelectorAll('details[name="' + name + '"]'));
var other = group.filter(function (o) { return o !== d && o.open; })[0];
group.forEach(function (o) { o.removeAttribute('name'); o.__folding = true; });
foldRow = d;
var root = document.documentElement, anchor = root.style.overflowAnchor;
root.style.overflowAnchor = 'none';
window.__valantiqFolding = true;
var left = 0, hold = false, top0 = sum.getBoundingClientRect().top, edge = topEdge();
function end() {
if (--left > 0) return;
group.forEach(function (o) { o.setAttribute('name', name); o.__folding = false; });
root.style.overflowAnchor = anchor;
window.requestAnimationFrame(function () {
window.__valantiqFolding = false;
if (foldQueue) { var q = foldQueue; foldQueue = null; q.click(); }
});
}
if (d.open) {
left = 1;
d.setAttribute('data-closing', '');   // its text elsewhere (the routes' panel) goes at once
fold(d, d.getBoundingClientRect().height, closedHeight(d), function () { d.open = false; d.removeAttribute('data-closing'); end(); });
return;
}
if (other) {
var r = other.getBoundingClientRect(), shut = closedHeight(other), shrink = r.height - shut;
var above = !!(other.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING);
if (above && r.bottom <= edge) {
other.open = false;
window.scrollBy({ top: -shrink, behavior: 'instant' });
top0 = sum.getBoundingClientRect().top;
} else {
hold = above && top0 - shrink < edge + 8;
left++;
other.setAttribute('data-closing', '');
fold(other, r.height, shut, function () { other.open = false; other.removeAttribute('data-closing'); end(); });
}
}
var from = d.getBoundingClientRect().height;
d.open = true;
left++;
fold(d, from, d.getBoundingClientRect().height, end);
if (hold) (function keep() {
var dy = sum.getBoundingClientRect().top - top0;
if (Math.abs(dy) > .5) window.scrollBy({ top: dy, behavior: 'instant' });
if (d.__folding) window.requestAnimationFrame(keep);
})();
}, true);
document.addEventListener('toggle', function (e) {
var d = e.target;
if (!d || d.tagName !== 'DETAILS' || !d.open || !d.getAttribute('name') || d.__folding) return;
Array.prototype.forEach.call(document.querySelectorAll('details[name="' + d.getAttribute('name') + '"]'), function (o) {
if (o !== d && o.open) o.open = false;
});
}, true);
var headers = document.querySelectorAll('[data-header]');
if (!headers.length) return;
var sections = document.querySelectorAll('[data-ground]');
var totops = document.querySelectorAll('.totop');   // the back-to-top button (laptop only: its CSS hides it elsewhere)
var ticking = false, lastY = window.scrollY;
function reveal() {
var y = window.scrollY, h = headers[0].offsetHeight || 68;
if (window.__valantiqFolding) { lastY = y; return; }   // an expandable folding isn't the reader scrolling
var menu = document.querySelector('.nav-toggle__panel:popover-open');
var focus = Array.prototype.some.call(headers, function (x) { return x.contains(document.activeElement); });
var picking = document.documentElement.classList.contains('pk-lock');   // a phone's picker stands under the header (its blur starts at the header's foot): the header stays, or the strip it leaves would show the page unblurred (Marko's wife, iPhone 14, 18 Oct 2026)
var hide = y > h * 2 && y > lastY + 2 && !menu && !focus && !picking;
var show = y <= h * 2 || y < lastY - 2 || menu || focus || picking;
Array.prototype.forEach.call(headers, function (x) {
if (hide) x.classList.add('is-hidden');
else if (show) x.classList.remove('is-hidden');
});
lastY = y;
}
Array.prototype.forEach.call(document.querySelectorAll('.totop__btn'), function (b) {
b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'instant' }); });   // at once: a glide would rewind every scroll-played block on the way
});
function ground() {
ticking = false;
reveal();
var y = headers[0].offsetHeight || 68;
var night = false;
Array.prototype.forEach.call(sections, function (sec) {
var r = sec.getBoundingClientRect();
if (r.height && r.top <= y && r.bottom > y) night = sec.getAttribute('data-ground') === 'night';
});
var moved = window.scrollY > 2;
Array.prototype.forEach.call(headers, function (h) { h.classList.toggle('night', night); h.classList.toggle('is-scrolled', moved); });
if (totops.length) {
var by = window.innerHeight - 50, tg = 'paper';
Array.prototype.forEach.call(sections, function (sec) {
var r = sec.getBoundingClientRect();
if (r.height && r.top <= by && r.bottom > by) tg = sec.getAttribute('data-ground') === 'night' ? 'night' : sec.classList.contains('stone') ? 'stone' : 'paper';
});
Array.prototype.forEach.call(totops, function (t) {
t.classList.toggle('is-on', window.scrollY > window.innerHeight);
var b = t.querySelector('.totop__btn'); b.classList.remove('night', 'stone', 'paper'); b.classList.add(tg);
});
}
var mid = window.innerHeight / 2, dark = false, found = false;
Array.prototype.forEach.call(sections, function (sec) {
var r = sec.getBoundingClientRect();
if (r.height && r.top <= mid && r.bottom > mid) { dark = sec.getAttribute('data-ground') === 'night'; found = true; }
});
if (found && dark !== indicatorDark) {
indicatorDark = dark;
var root = document.documentElement;
root.style.colorScheme = dark ? 'dark' : 'light';
root.style.backgroundColor = dark ? '#071a2f' : '';
}
}
var indicatorDark = false;
window.addEventListener('scroll', function () {
if (!ticking) { ticking = true; window.requestAnimationFrame(ground); }
}, { passive: true });
window.addEventListener('resize', ground);
Array.prototype.forEach.call(headers, function (x) {
x.addEventListener('focusin', function () { x.classList.remove('is-hidden'); });
});
ground();
})();
(function () {
var seen = [];
Array.prototype.forEach.call(document.querySelectorAll('.sen'), function (s) {
if (seen.indexOf(s.parentNode) < 0 && !s.parentNode.classList.contains('sense')) seen.push(s.parentNode);   // .sense is always set in units
});
if (!seen.length) return;
function rows(e) { return Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); }
function fit(p) {
if (!p.getClientRects().length) return;   // on a page that is not showing (the single-file preview)
p.classList.remove('is-stacked', 'is-split');
var flow = rows(p);
if (p.querySelectorAll('.sen').length > 1) {
p.classList.add('is-stacked');
if (rows(p) > flow + 1) p.classList.remove('is-stacked');
}
if (p.querySelector('.cl')) {
var base = rows(p), ok = true;
p.classList.add('is-split');
Array.prototype.forEach.call(p.querySelectorAll('.cl'), function (c) {
if (c.nextElementSibling && c.nextElementSibling.classList.contains('cl') && rows(c) > 1 && !c.classList.contains('cl--clause')) ok = false;   // a clause may take two balanced rows
});
if (!ok || rows(p) > base + 1) p.classList.remove('is-split');
}
}
function all() { seen.forEach(fit); }
var t = 0;
window.addEventListener('resize', function () { window.cancelAnimationFrame(t); t = window.requestAnimationFrame(all); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
all();
})();
Array.prototype.forEach.call(document.querySelectorAll('.pickone'), function (root) {
var group = root, last = null, leaving = null;   // last: the one chosen now; a second press on it clears it; leaving: the sheet folding away
var sheetEl = root.querySelector('.dp__answers'), close = root.querySelector('.dp__close');
function away(on, instant) {        // the sheet folds away, then the choice is cleared
last = null;
leaving = leaveSheet(sheetEl, function () { leaving = null; on.checked = false; }, instant);
}
function clear(instant) { var on = root.querySelector('.dp__in:checked'); if (on && !leaving) away(on, instant === true || !!(close && close.hasAttribute('data-instant'))); }
group.addEventListener('click', function (e) {
var t = e.target;
if (!t.classList || !t.classList.contains('dp__in')) return;
if (leaving) { stopLeaving(leaving, sheetEl); leaving = null; }   // a press while it folds away keeps it
if (t === last) away(t, false); else last = t;
});
group.addEventListener('keydown', function (e) { if (e.key === 'Escape') clear(true); });
if (close) { close.hidden = false; close.addEventListener('click', function () { clear(false); }); }
});
(function () {
var plate = document.querySelector('.name__plate');
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!plate || still) return;
var END = 6.4;
function ease(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
function lin(u) { return u < 0 ? 0 : u > 1 ? 1 : u; }
function setDraw(el, len, p) { el.style.strokeDasharray = len; el.style.strokeDashoffset = len * (1 - p); }
function shown(svg) { return getComputedStyle(svg).display !== 'none'; }
function build(svg) {   // measured once, when its layout is first on screen (a hidden svg has no lengths)
function list(sel) {
return Array.prototype.map.call(svg.querySelectorAll(sel), function (el) {
return { el: el, t: +el.getAttribute('data-t'), d: +el.getAttribute('data-d'), len: el.getTotalLength ? el.getTotalLength() : 0 };
});
}
var pen = svg.querySelector('.np'), halo = svg.querySelector('.nph');
var sk = list('.ns'), wv = list('.nw');
var legs = [], last = null;
function pt(o, p) { return o.el.getPointAtLength(o.len * p); }
var w0 = wv[0];
function go(t0, t1, from, to) { legs.push({ t0: t0, t1: t1, from: from, to: to }); }
if (w0) { var e = pt(w0, 1); legs.push({ t0: w0.t, t1: w0.t + w0.d, path: w0 }); last = { x: e.x, y: e.y, t: w0.t + w0.d }; }
sk.forEach(function (o) {
var a = pt(o, 0), z = pt(o, 1);
if (last) go(last.t, o.t, last, a);
legs.push({ t0: o.t, t1: o.t + o.d, path: o });
last = { x: z.x, y: z.y, t: o.t + o.d };
});
var nx = +pen.getAttribute('data-x'), ny = +pen.getAttribute('data-y');
go(last.t, 5.9, last, { x: nx, y: ny });
return {
svg: svg, pen: pen, halo: halo, sk: sk, wv: wv, legs: legs,
hor: list('.nh')[0], mk: list('.nm'),
letters: Array.prototype.slice.call(svg.querySelectorAll('.nl')), nx: nx, ny: ny, done: false
};
}
function frame(r, now) {
r.done = false;
setDraw(r.hor.el, r.hor.len, ease((now - r.hor.t) / r.hor.d));
r.wv.forEach(function (o) {
setDraw(o.el, o.len, ease((now - o.t) / o.d));
o.el.style.opacity = now < o.t ? 0 : 1 - ease((now - 4.9) / .7);
});
r.sk.forEach(function (o) {
var p = lin((now - o.t) / o.d);
setDraw(o.el, o.len, p);
o.el.style.opacity = p <= 0 ? 0 : 1 - ease((now - 4.9) / .7);
});
var wordIn = ease((now - 4.9) / .8);
r.letters.forEach(function (el, k) {
el.style.opacity = wordIn;
if (k >= 6) el.style.fill = now < 5.6 ? 'var(--signal)' : 'color-mix(in srgb, var(--signal) ' + Math.round(100 * (1 - ease((now - 5.6) / .8))) + '%, var(--fg))';
});
r.mk.forEach(function (o) { var p = ease((now - o.t) / o.d); setDraw(o.el, o.len, p); o.el.style.opacity = p > 0 ? 1 : 0; });
var x = r.nx, y = r.ny, on = false;
r.legs.forEach(function (g) {
if (now < g.t0 || on && now > g.t1) return;
if (now >= g.t0 && now <= g.t1) {
var u = (now - g.t0) / (g.t1 - g.t0);
if (g.path) { var q = g.path.el.getPointAtLength(g.path.len * (g.path === r.wv[0] ? ease(u) : lin(u))); x = q.x; y = q.y; }
else { var v = ease(u); x = g.from.x + (g.to.x - g.from.x) * v; y = g.from.y + (g.to.y - g.from.y) * v; }
on = true;
}
});
if (!on && now > 5.9) { x = r.nx; y = r.ny; }
else if (!on && now < r.legs[0].t0) { x = +r.pen.getAttribute('data-sx') - 40; y = +r.pen.getAttribute('data-sy'); }
r.pen.setAttribute('cx', x); r.pen.setAttribute('cy', y);
r.halo.setAttribute('cx', x); r.halo.setAttribute('cy', y);
r.halo.style.opacity = now < .3 || now > 5.9 ? 0 : 1;
}
function finish(r) {   // the finished lockup, exactly as the markup draws it
if (r.done) return;
[r.hor.el, r.halo].concat(r.sk.map(function (o) { return o.el; }), r.wv.map(function (o) { return o.el; }),
r.mk.map(function (o) { return o.el; }), r.letters).forEach(function (el) { el.removeAttribute('style'); });
r.pen.setAttribute('cx', r.nx); r.pen.setAttribute('cy', r.ny);
r.halo.setAttribute('cx', r.nx); r.halo.setAttribute('cy', r.ny);
r.done = true;
}
var rigs = [], cur = null, busy = false, settled = false, hi = 0;    // settled: written once and passed, it stays written (Maja, 13 Oct 2026)
var track = plate.closest('.name__track'), pin = track && track.querySelector('.name__pin'), pinned = false, run = 0;
function layout() {
if (!pin) return;
var vh = window.innerHeight, edge = 76, svg = null;
pin.classList.remove('is-pinned'); pin.style.top = ''; track.style.height = ''; plate.style.maxWidth = '';
Array.prototype.forEach.call(plate.querySelectorAll('svg'), function (v) { if (shown(v)) svg = v; });
var ph = pin.offsetHeight, avail = vh - edge - 16;
if (ph > avail && svg) {
var vb = svg.viewBox.baseVal, ph2 = plate.offsetHeight - (ph - avail);
if (ph2 >= 160) { plate.style.maxWidth = Math.floor(ph2 * vb.width / vb.height) + 'px'; ph = pin.offsetHeight; }
}
pinned = ph <= avail + 1 && !settled;
if (!pinned) { if (!settled) plate.style.maxWidth = ''; return; }
run = Math.round(vh * 1.3);
pin.style.top = Math.max(edge, (vh - ph) / 2) + 'px'; pin.classList.add('is-pinned'); track.style.height = (ph + run) + 'px';
}
Array.prototype.forEach.call(plate.querySelectorAll('svg'), function (svg) { rigs.push({ svg: svg, r: null }); });
function target() {
if (settled) return 1;
if (pinned) {
if (passed(track)) { settled = true; pinned = false; unpin(pin, track); return 1; }
return lin(((parseFloat(pin.style.top) || 0) - track.getBoundingClientRect().top) / run);
}
var b = plate.getBoundingClientRect(), vh = window.innerHeight;
var from = vh * .98, to = vh * .32 - b.height / 2;
hi = Math.max(hi, lin((from - b.top) / (from - to)));
return hi;
}
function paint(p) {
rigs.forEach(function (g) {
if (!shown(g.svg)) return;
if (!g.r) g.r = build(g.svg);
if (p >= .999) finish(g.r); else frame(g.r, p * END);
});
}
function step() {   // glide toward the scroll's place, a little behind it
busy = false;
var t = target();
cur = cur === null ? t : cur + (t - cur) * .22;
if (Math.abs(t - cur) < .002) cur = t;
paint(cur);
if (cur !== t) { busy = true; requestAnimationFrame(step); }
}
function wake() { if (!busy) { busy = true; requestAnimationFrame(step); } }
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', function () { layout(); cur = null; wake(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); wake(); });
layout(); cur = null; step();
})();
Array.prototype.forEach.call(document.querySelectorAll('.checks.has-sc'), function (box) {
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) return;
var wide = window.matchMedia('(min-width: 901px)');
var sc = box.querySelector('.sc'), pin = sc.querySelector('.sc__pin'), stage = sc.querySelector('.sc__stage'), svg = sc.querySelector('.sc__svg');
var head = box.querySelector('.checks__head'), wrapEl = head.parentNode, foot = sc.querySelector('.sc__foot');
var NS = 'http://www.w3.org/2000/svg', N = 170, FW = 1200, FH = 300;
var conn = svg.querySelector('.sc__conn'), gp = svg.querySelector('.sc__pts');
var strands = [].slice.call(svg.querySelectorAll('.sc__wave')).reverse();      // the base wave, then the two that weave about it
var wave = strands[0];
var links = [].slice.call(svg.querySelectorAll('.sc__link')), nds = [].slice.call(svg.querySelectorAll('.sc__nd'));
var heads = [].slice.call(stage.querySelectorAll('.sc__h')), ans = foot.querySelector('.sc__ans');
var rows = [].slice.call(box.querySelectorAll('.qs .q'));
function sm(a, b, x) { return clamp((x - a) / (b - a)); }
function eio(u) { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
var seed = 11;
function R() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
var n = heads.length, XK = heads.map(function (_, k) { return FW * (k + .5) / n; });
function spaceOut() {
var u = FW / stage.offsetWidth, w = heads.map(function (h) { return h.offsetWidth * u; }), x = [], k, f;
for (f = 0; f < 3; f++) {                       // if the names cannot fit at this size, they are set a little smaller
x = [w[0] / 2];
for (k = 1; k < n; k++) {
x[k] = x[k - 1] + 60;
if (k > 1) x[k] = Math.max(x[k], x[k - 2] + (w[k - 2] + w[k]) / 2 + 20);
}
var need = x[n - 1] + w[n - 1] / 2;
if (need <= FW) break;
var cur = parseFloat(stage.style.getPropertyValue('--lf')) || 1;
stage.style.setProperty('--lf', (cur === 1 ? 14 / 17 : cur * FW / need * .98).toFixed(3));    // too wide at 17px: all the names take one smaller size, 14px, and only if that is still too wide go smaller
w = heads.map(function (h) { return h.offsetWidth * u; });
}
var x0 = w[0] / 2, span = x[n - 1] - x0, avail = FW - w[n - 1] / 2 - x0;
XK = x.map(function (v) { return span > 0 ? x0 + (v - x0) * Math.max(1, avail / span) : v; });
}
function between(x) {
var i = 0, a, b, ix;
if (x < XK[0]) { a = XK[0] - (XK[1] - XK[0]); b = XK[0]; ix = 0; }
else if (x >= XK[n - 1]) { a = XK[n - 1]; b = a + (XK[n - 1] - XK[n - 2]); ix = n; }
else { while (i < n - 1 && x >= XK[i + 1]) i++; a = XK[i]; b = XK[i + 1]; ix = i + 1; }
return [a, b, ix];
}
function WY(x) { return 150 + 14 * Math.sin(x / 95); }
var UP = 80, DOWN = 220;                          // where an above name's foot and a below name's head stand
function above(k) { return k % 2 === 0; }
var fix = 1;                                      // the figure's drawing is stretched to its box: this keeps a node round
var pts = [], circ = [];
for (var i = 0; i < N; i++) {
var tx = FW * i / (N - 1), c = document.createElementNS(NS, 'circle'), r = 1.4 + R() * 1.6;
pts.push({ x: 10 + R() * 1180, y: 10 + R() * 280, tx: tx, ty: WY(tx), d: R(), r: r });
c.setAttribute('class', 'sc__pt'); c.setAttribute('r', r); gp.appendChild(c); circ.push(c);
}
for (i = 0; i < heads.length * 3; i++) R();       // (keeps the strands' swells below as they were)
var STR = [[1, 40, .9, 0], [2, 26, 1.37, 1.3], [3, 15, 2.11, 2.6]];      // half-waves between nodes, reach, pace, phase
var SW = STR.map(function (st) { var o = []; for (var j = 0; j <= n; j++) o.push({ m: .6 + R() * .65, f: .7 + R() * .8, ph: R() * 6.28 }); return o; });
function strand(k, t, braid) {
var pp = [], x, bt, sg, e, st = STR[k];
for (x = 0; x <= FW; x += 5) {
bt = between(x); sg = SW[k][bt[2]];
e = Math.sin(st[0] * Math.PI * (x - bt[0]) / (bt[1] - bt[0])) * st[1] * sg.m * (.55 + .45 * Math.sin(st[2] * sg.f * t + st[3] + sg.ph));
pp.push([x, WY(x) + braid * e]);
}
return curve(pp);
}
strands.forEach(function (w, k) { w.setAttribute('d', strand(k, 0, 0)); });
function place() { nds.forEach(function (nd, k) { nd.setAttribute('transform', 'translate(' + XK[k] + ' ' + WY(XK[k]).toFixed(1) + ') scale(1 ' + fix.toFixed(3) + ')'); }); }
place();
var sel = -1, ready = false, seen = true, now = 0;
function render() {
heads.forEach(function (h, i) { h.classList.toggle('sel', i === sel); });
nds.forEach(function (nd, i) { nd.classList.toggle('sel', i === sel); });
if (sel < 0) { ans.classList.remove('on'); return; }
ans.innerHTML = answer(sel);
ans.classList.add('on');
}
function answer(k) {
var r = rows[k];
return '<div class="sc__cols"><p>' + r.querySelector('.q__a').innerHTML +
'</p><p class="sc__more">' + r.querySelector('.q__more p').innerHTML + '</p></div>';
}
function pick(k) {
if (!ready) return;
sel = (sel === k) ? -1 : k;
render();
}
heads.forEach(function (h, i) { h.addEventListener('click', function () { pick(i); }); });
nds.forEach(function (nd, i) { nd.addEventListener('click', function () { pick(i); }); });
box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sel >= 0) { sel = -1; render(); } });
function paint(p) {
var cd = 'M';
pts.forEach(function (q, i) {
var e = eio(sm(.04 + .4 * q.d, .5 + .36 * q.d, p)), x = q.x + (q.tx - q.x) * e, y = q.y + (q.ty - q.y) * e;
circ[i].setAttribute('cx', x.toFixed(1)); circ[i].setAttribute('cy', y.toFixed(1)); circ[i].style.opacity = 1 - sm(.74, .9, p);
cd += (i ? ' L' : ' ') + x.toFixed(1) + ' ' + y.toFixed(1);
});
conn.setAttribute('d', cd); conn.style.opacity = (.35 + .65 * sm(.2, .7, p)) * (1 - sm(.78, .92, p));
var u = eio(sm(.62, .95, p)), L = wave.getTotalLength(), xh = FW * u;
strands.forEach(function (w) { w.style.strokeDasharray = u < 1 ? L : 'none'; w.style.strokeDashoffset = u < 1 ? L * (1 - u) : 0; });
heads.forEach(function (h, k) {
var fx = XK[k], e = eio(sm(fx - 90, fx + 70, xh)), fy = (above(k) ? UP : DOWN) + (above(k) ? -1 : 1) * (1 - e) * 16;
h.style.left = (fx / 12) + '%'; h.style.top = (fy / FH * 100) + '%'; h.style.transform = 'translate(-50%,' + (above(k) ? '-100%' : '0') + ')'; h.style.opacity = e;
var lk = links[k], wy = WY(fx);
lk.setAttribute('d', above(k) ? 'M' + fx + ' ' + (UP + 6) + ' V' + (wy - 9) : 'M' + fx + ' ' + (wy + 9) + ' V' + (DOWN - 6));
var l = lk.getTotalLength(); lk.style.strokeDasharray = l; lk.style.strokeDashoffset = l * (1 - e);
});
nds.forEach(function (nd, k) { nd.classList.toggle('lit', xh >= XK[k] && p > .62); nd.style.opacity = sm(.55, .66, p); });
var done = p >= .9;
if (done !== ready) { ready = done; sc.classList.toggle('is-ready', done); heads.forEach(function (h) { h.tabIndex = done ? 0 : -1; }); if (!done && sel >= 0) { sel = -1; render(); } }
braid = sm(.88, 1, p);
if (braid < 1 || !weaving) drawStrands();
}
var braid = 0, weaving = false;
function drawStrands() { strands.forEach(function (w, k) { w.setAttribute('d', strand(k, now, braid)); }); }
var ticking = false;
function startTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }   // sleeps while off screen or on a phone; woken by the observer and the width query
function tick(ms) {
now = ms / 1000;
weaving = braid >= 1;
if (weaving && seen && wide.matches) drawStrands();
if (seen && wide.matches) requestAnimationFrame(tick); else ticking = false;
}
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) startTick(); }).observe(stage);
startTick();
var run = 0, cur = null, busy = false, settled = false, held = 0;   // settled: played once and passed, it stays as it ended, with whatever was opened (Maja, 13 Oct 2026)
function measure() {
var keep = ans.innerHTML, on = ans.classList.contains('on'), tall = 0;
foot.style.height = ''; ans.classList.add('measure');
rows.forEach(function (_, k) { ans.innerHTML = answer(k); tall = Math.max(tall, ans.offsetHeight); });
ans.classList.remove('measure'); ans.innerHTML = keep; ans.classList.toggle('on', on);
foot.style.height = tall + 'px';
return tall;
}
var headRoom = 0;
function layout() {
var on = wide.matches;
box.classList.toggle('is-sc', on);
if (on && head.parentNode !== pin) pin.insertBefore(head, stage);
if (!on && head.parentNode === pin) wrapEl.insertBefore(head, sc);
if (!on) { pin.style.top = ''; stage.style.height = ''; return; }
var vh = window.innerHeight, hh = head.offsetHeight, g = parseFloat(getComputedStyle(stage).marginTop) || 24, kx = sc.offsetWidth / FW;
var fh = measure() + (parseFloat(getComputedStyle(foot).marginTop) || 0);
var h = Math.max(vh < 800 ? 150 : 220, Math.min(FH * kx, vh - 76 - hh - g - fh - 16)), total = hh + g + h + fh;   // the figure gives up height on a laptop screen, down to 150px (the answers read at the body size, so they take more room)
var top = Math.min(Math.max(76, (vh - total) / 2), vh - 16 - total);
stage.style.height = h + 'px'; stage.style.setProperty('--sw', sc.offsetWidth); stage.style.removeProperty('--lf'); pin.style.top = top + 'px';
spaceOut();
fix = kx / (h / FH); place();
held = total; run = settled ? 0 : Math.round(vh * 1.3); sc.style.height = (total + run) + 'px';
}
var replayDown = box.id === 'your-data';
function target() {
if (settled && replayDown && sc.getBoundingClientRect().top > window.innerHeight) { settled = false; layout(); cur = null; }
if (settled) return 1;
if (passed(sc)) {
settled = true; cur = 1;
var root = document.documentElement, was = root.style.overflowAnchor, before = sc.offsetHeight;
root.style.overflowAnchor = 'none'; run = 0; sc.style.height = held + 'px';
if (before > sc.offsetHeight) window.scrollBy({ top: sc.offsetHeight - before, behavior: 'instant' });
root.style.overflowAnchor = was;
return 1;
}
var r = sc.getBoundingClientRect(), top = parseFloat(pin.style.top) || 0;
return clamp((top - r.top) / run);
}
function step() {
busy = false;
if (!wide.matches) return;
var t = target();
cur = cur === null ? t : cur + (t - cur) * .18;
if (Math.abs(t - cur) < .002) cur = t;
paint(cur);
if (cur !== t) { busy = true; requestAnimationFrame(step); }
}
function wake() { if (!busy) { busy = true; requestAnimationFrame(step); } }
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', function () { layout(); cur = null; wake(); });
if (wide.addEventListener) wide.addEventListener('change', function () { layout(); cur = null; wake(); startTick(); });
heads.forEach(function (h) { h.tabIndex = -1; });
layout(); step();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); wake(); });
});
var WAVE_LISTS = [];
Array.prototype.forEach.call(document.querySelectorAll('.checks.has-sc'), function (box) {
var qs = box.querySelector('.qs');
if (qs) WAVE_LISTS.push({ qs: qs, rows: [].slice.call(box.querySelectorAll('.qs .q')), name: '.q__q', open: function (r) { return r.open; }, watch: function (r, f) { r.addEventListener('toggle', f); } });
});
Array.prototype.forEach.call(document.querySelectorAll('.pay'), function (box) {
var row = box.querySelector('.pay__row');
if (row) WAVE_LISTS.push({ qs: row, rows: [].slice.call(row.querySelectorAll('.pay__c')), name: '.pay__tt', open: function (r) { return r.classList.contains('is-open'); }, watch: function (r, f) { if ('MutationObserver' in window) new MutationObserver(f).observe(r, { attributes: true, attributeFilter: ['class'] }); } });
});
WAVE_LISTS.forEach(function (WL) {
var qs = WL.qs, rows = WL.rows;
if (!qs || !rows.length) return;
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var wide = window.matchMedia('(min-width: 901px)');
var NS = 'http://www.w3.org/2000/svg', GW = 44, CX = 26, EDGE = 37;       // the wave stays in its gutter: the words start at 44; its middle is where the picker's nodes stand (13px nearer the margin, Marko 15 Oct 2026)
var svg = document.createElementNS(NS, 'svg');
svg.setAttribute('class', 'qs__wave'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
var paths = [0, 1, 2].map(function (k) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'qs__strand qs__strand--' + k); svg.appendChild(p); return p; });
var nodes = rows.map(function () {
var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'qs__node');
['ring', 'dot'].forEach(function (cls) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'qs__' + cls); c.setAttribute('r', cls === 'ring' ? 6.5 : 2.6); g.appendChild(c); });
svg.appendChild(g); return g;
});
var grid = gridGroup(svg);
qs.insertBefore(svg, qs.firstChild);
var ys = [], H = 0, now = 0, seen = !('IntersectionObserver' in window), reveal = still ? 1 : 0, hi = 0;   // the wave is drawn by the scroll: its front stays at four fifths of the way down the screen, so it is drawn where the reader is looking, never below it (Marko, 16 Oct 2026); once drawn it stays, and keeps weaving
function X(y) { return CX; }                       // the axis is one straight line down the page (Marko, 16 Oct 2026): no wander
var STR = [[1, 11, .9, 0], [2, 7, 1.37, 1.3], [3, 4.5, 2.11, 2.6]], seed = 5;
function R() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
var SW = STR.map(function () { var o = []; for (var j = 0; j <= rows.length; j++) o.push({ m: .6 + R() * .65, f: .7 + R() * .8, ph: R() * 6.28 }); return o; });
function swell(k, y) {                             // nothing at a node, a swell between two
var m = ys.length, i = 0, a, b, ix;
if (y < ys[0]) { a = ys[0] - (ys[1] - ys[0]); b = ys[0]; ix = 0; }
else if (y >= ys[m - 1]) { a = ys[m - 1]; b = a + (ys[m - 1] - ys[m - 2]); ix = m; }
else { while (i < m - 1 && y >= ys[i + 1]) i++; a = ys[i]; b = ys[i + 1]; ix = i + 1; }
var sg = SW[k][ix];
return Math.sin(STR[k][0] * Math.PI * (y - a) / (b - a)) * STR[k][1] * sg.m * (still ? .8 : .55 + .45 * Math.sin(STR[k][2] * sg.f * now + STR[k][3] + sg.ph));
}
function draw() {
var m = ys.length, y0 = ys[0], y1 = ys[m - 1];   // the three strands start together at the first dot and end together at the last (Marko, 16 Oct 2026): the line is not open at either end, and does not run on past them
var lim = reveal >= 1 ? y1 : y0 + (y1 - y0) * reveal;
paths.forEach(function (p, k) {
var pp = [], y;
for (y = y0; y < lim; y += 4) pp.push([Math.min(EDGE, X(y) + swell(k, y)), y]);
if (reveal >= 1) pp.push([Math.min(EDGE, X(y1) + swell(k, y1)), y1]);
p.setAttribute('d', curve(pp));
});
}
function layout() {
var on = !wide.matches;
svg.style.display = on ? 'block' : 'none';
qs.classList.toggle('is-wave', on);
if (!on) return;
var top = qs.getBoundingClientRect().top;
H = Math.ceil(qs.offsetHeight);
svg.setAttribute('viewBox', '0 0 ' + GW + ' ' + H); svg.setAttribute('height', H); svg.setAttribute('width', GW);
ys = rows.map(function (r) { return lineMid(r.querySelector(WL.name)) - top; });
gridLines(grid, ys, true, CX - 26, CX + 26);                             // the faint lines reach 26px each side of the axis, so they begin at the text's left edge
nodes.forEach(function (g, k) { g.setAttribute('transform', 'translate(' + X(ys[k]).toFixed(1) + ' ' + ys[k].toFixed(1) + ')'); g.classList.toggle('is-open', WL.open(rows[k])); });
draw();
}
var ticking = false;
function startTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }   // runs only on a phone, while the rows are on screen
function tick(ms) {
now = ms / 1000;
if (!still && ys.length > 1 && reveal < 1) {
hi = Math.max(hi, scrollP(qs));
reveal = Math.abs(hi - reveal) < .002 ? hi : reveal + (hi - reveal) * .16;           // eased, so a flick of the thumb is not a jump
}
if (!wide.matches && seen && !still) { draw(); requestAnimationFrame(tick); } else ticking = false;
}
if (!still) { if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) startTick(); }).observe(qs); startTick(); }
rows.forEach(function (r) { WL.watch(r, function () { window.requestAnimationFrame(layout); }); });
if ('ResizeObserver' in window) new ResizeObserver(layout).observe(qs);
window.addEventListener('resize', layout);
if (wide.addEventListener) wide.addEventListener('change', function () { layout(); if (!still) startTick(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
layout();
});
Array.prototype.forEach.call(document.querySelectorAll('.hero .flow--lead'), function (fig) {
var hero = fig.closest('.hero'), title = hero && hero.querySelector('.hero__title'), actions = hero && hero.querySelector('.hero__actions');
if (!title || !actions) return;
function measure() {
var range = document.createRange(), rows = {}, widest = 0, k;
range.selectNodeContents(title);
Array.prototype.forEach.call(range.getClientRects(), function (r) {
if (!r.width) return;
k = Math.round(r.top / 4);                        // the pieces of one row share a top, to within a few pixels
rows[k] = (rows[k] || 0) + r.width;
});
for (k in rows) widest = Math.max(widest, rows[k]);
if (widest) actions.style.setProperty('--title-row', Math.ceil(widest) + 'px');
}
window.addEventListener('resize', measure);
if ('ResizeObserver' in window) new ResizeObserver(measure).observe(title);   // also as a page is shown (the preview switches pages)
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
measure();
});
(function () {
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var items = [].concat.apply([], [].slice.call(document.querySelectorAll('.hero .proof')).map(function (p) { return [].slice.call(p.querySelectorAll('li')).map(function (li, i) { return { li: li, i: i }; }); })), queued = false;   // every hero's strip (the home page's, the investor page's; the one-file preview holds both)
if (!items.length || still) return;
function eio(u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
var phone = window.matchMedia('(max-width: 900px)');
function paint() {
queued = false;
var t = (window.pageYOffset || 0) / (window.innerHeight * .3), peek = phone.matches ? .3 : 0;   // they follow the scroll both ways: back at the top they are as they were when the page opened (Marko, 16 Oct 2026, for this strip alone; every other figure that the scroll draws stays drawn, Maja, 13 Oct 2026)
items.forEach(function (it) {
var p = eio(clamp(t * 1.3 - it.i * .28));
it.li.style.opacity = (peek + (1 - peek) * p).toFixed(3);
it.li.style.filter = peek && p < 1 ? 'blur(' + ((1 - p) * 5).toFixed(1) + 'px)' : '';
it.li.style.transform = 'translateY(' + ((1 - p) * (peek ? 8 : 56)).toFixed(1) + 'px)';
});
}
function wake() { if (!queued) { queued = true; window.requestAnimationFrame(paint); } }
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', wake);
paint();
})();
Array.prototype.forEach.call(document.querySelectorAll('.pickone--std .dp__pick, .pickone--case .dp__pick'), function (pick) {
var track = pick.querySelector('.pick__track'), nodes = [].slice.call(pick.querySelectorAll('.pick__node'));
if (!track || !nodes.length) return;
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
svg.setAttribute('class', 'pick__strands'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
var paths = [0, 1, 2].map(function (k) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'pick__strand pick__strand--' + k); svg.appendChild(p); return p; });
var grid = gridGroup(svg);
track.insertBefore(svg, track.firstChild);
var STR = [[1, 22, .9, 0], [2, 14, 1.37, 1.3], [3, 9, 2.11, 2.6]], seed = 7;
function R() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
var SW = STR.map(function () { var o = []; for (var j = 0; j <= nodes.length; j++) o.push({ m: .6 + R() * .65, f: .7 + R() * .8, ph: R() * 6.28 }); return o; });
var pos = [], L = 0, C = 0, vertical = false, cap = 1, reveal = still ? 1 : 0, now = 0, seen = false, began = null, W = 0, H = 0, hiR = 0;
var std = !!pick.closest('.pickone--std'), labels = [].slice.call(pick.querySelectorAll('.dp__b')), radios = [].slice.call(pick.querySelectorAll('.dp__in'));
var desk = window.matchMedia('(min-width: 901px)');
var one = pick.closest('.pickone'), frame = pick.closest('.walk__frame'), wtrack = frame && frame.parentNode, mk = null, walking = false, run = 0, ftop = 0, cur = null, lastC = -1, settled = false;
if (frame) { mk = document.createElement('span'); mk.className = 'pick__mk'; track.appendChild(mk); }
function pinning() {
if (!frame) return;
var want = !still && desk.matches && !!pick.clientWidth && !settled, pin;
lastC = -1; labels.forEach(function (l) { l.classList.remove('is-past', 'is-cur'); }); one.classList.toggle('is-walk', want);   // the reserved band is measured with the walk on
pin = pinBlock(frame, wtrack, 2.4, want);
if (want && !pin) one.classList.remove('is-walk');
walking = !!pin; if (pin) { ftop = pin.top; run = pin.run; cur = null; }
}
function walk() {                                  // the scroll's progress along the line, eased, drawn as the marker and the strands' reach
var r = wtrack.getBoundingClientRect(), g = clamp((ftop - r.top) / run), t, i, f, x, c;
cur = cur === null ? g : cur + (g - cur) * .18; if (Math.abs(g - cur) < .002) cur = g;
t = clamp((cur - .05) / .9) * (nodes.length - 1); i = Math.min(nodes.length - 2, Math.floor(t)); f = t - i;
x = pos[i] + (pos[i + 1] - pos[i]) * f * f * (3 - 2 * f);
mk.style.left = x.toFixed(1) + 'px'; reveal = t >= nodes.length - 1 ? 1 : clamp(x / L);
c = Math.round(t);
if (c !== lastC) {
lastC = c; labels.forEach(function (l, k) { l.classList.toggle('is-past', k < c); l.classList.toggle('is-cur', k === c); });
radios.forEach(function (r, k) { if (k > c && r.checked) { r.checked = false; r.dispatchEvent(new Event('change', { bubbles: true })); } });   // a name the marker has gone back past is gone, and its answer with it (Marko, 18 Oct 2026)
}
}
function space() {
var set = labels.concat(radios, nodes);
if (!desk.matches) { set.forEach(function (e) { e.style.left = ''; }); labels.forEach(function (l) { l.style.marginLeft = ''; }); pick.style.removeProperty('--lf'); return; }
pick.style.removeProperty('--lf');
var Wd = pick.clientWidth, n = labels.length, f, w, x0 = 6, d = (Wd - 2 * x0) / (n - 1), ok, centres, rows;
var up = labels.filter(function (l) { return l.classList.contains('dp__b--up'); }), down = labels.filter(function (l) { return !l.classList.contains('dp__b--up'); });
rows = down.length ? [up, down] : [up];
for (f = 0; f < 16; f++) {
ok = true; centres = [];
rows.forEach(function (row) {
var tot = row.reduce(function (a, l) { return a + l.offsetWidth; }, 0), g = row.length > 1 ? (Wd - tot) / (row.length - 1) : 0, x = 0;
if (row.length > 1 && g < 12) ok = false;
row.forEach(function (l) { centres.push([l, x + l.offsetWidth / 2]); x += l.offsetWidth + g; });
});
if (ok) break;
pick.style.setProperty('--lf', (pick.style.getPropertyValue('--lf') ? parseFloat(pick.style.getPropertyValue('--lf')) * .98 : .98).toFixed(3));   // two per cent smaller at a time, only as far as it takes
}
centres.forEach(function (c) { c[0].style.left = c[1].toFixed(1) + 'px'; c[0].style.marginLeft = ''; });
radios.forEach(function (r, j) { r.style.left = (x0 + d * j).toFixed(1) + 'px'; });
nodes.forEach(function (nd, j) { nd.style.left = (x0 + d * j).toFixed(1) + 'px'; });
}
function eo(u) { return 1 - Math.pow(1 - clamp(u), 3); }
function swell(k, y) {                             // nothing at a node, a swell between two
var m = pos.length, i = 0, a, b, ix;
if (y < pos[0]) { a = pos[0] - (pos[1] - pos[0]); b = pos[0]; ix = 0; }
else if (y >= pos[m - 1]) { a = pos[m - 1]; b = a + (pos[m - 1] - pos[m - 2]); ix = m; }
else { while (i < m - 1 && y >= pos[i + 1]) i++; a = pos[i]; b = pos[i + 1]; ix = i + 1; }
var sg = SW[k][ix];
return Math.sin(STR[k][0] * Math.PI * (y - a) / (b - a)) * STR[k][1] * cap * sg.m * (still ? .8 : .55 + .45 * Math.sin(STR[k][2] * sg.f * now + STR[k][3] + sg.ph));
}
function draw() {
if (!L || pos.length < 2) return;
var m = pos.length, y0 = pos[0], y1 = pos[m - 1];   // the strands start together at the first dot and end together at the last (Marko, 16 Oct 2026)
paths.forEach(function (p, k) {
var pp = [], lim = reveal >= 1 ? y1 : Math.min(y1, L * reveal), y;
for (y = y0; y <= lim; y += 4) pp.push(vertical ? [C + swell(k, y), y] : [y, C + swell(k, y)]);
if (reveal >= 1) pp.push(vertical ? [C + swell(k, y1), y1] : [y1, C + swell(k, y1)]);
p.setAttribute('d', curve(pp));
});
}
function layout() {
pinning(); space();
var tr = track.getBoundingClientRect();
if (!tr.width || !tr.height) return;
vertical = tr.height > tr.width;
L = vertical ? tr.height : tr.width; C = (vertical ? tr.width : tr.height) / 2; W = tr.width; H = tr.height;
if (!desk.matches) labels.forEach(function (l, k) { if (nodes[k]) nodes[k].style.top = (lineMid(l.querySelector('.dp__t') || l) - tr.top) + 'px'; });   // on a phone each node stands on its name's first line
else nodes.forEach(function (nd) { nd.style.top = ''; });
pos = nodes.map(function (nd) { var r = nd.getBoundingClientRect(); return vertical ? r.top + r.height / 2 - tr.top : r.left + r.width / 2 - tr.left; });
cap = Math.min(1, Math.max(.2, (C - 5) / (STR[0][1] * 1.25)));
gridLines(grid, pos, vertical, vertical ? C - 26 : C - 20, vertical ? C + 26 : C + 20);   // down a phone the lines reach 26px each side of the axis, so they begin at the text's left edge
track.style.setProperty('--ax0', pos[0].toFixed(1) + 'px'); track.style.setProperty('--ax1', Math.max(0, L - pos[pos.length - 1]).toFixed(1) + 'px');   // the axis runs from the first dot to the last, as the wave does
svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
draw();
if (walking && !settled) wake();
}
var running = false;
function wake() { if (!running && !still) { running = true; window.requestAnimationFrame(tick); } }   // asleep while it is off screen and nothing is pending
function tick(ms) {
now = ms / 1000;
if (seen && began === null) began = now;
if (walking && pos.length > 1) {
if (!std && !settled && passed(wtrack)) {       // the seven questions (std) play again when the reader comes back; the P&L stays drawn once played (Marko, 18 Oct 2026)
settled = true; walking = false; reveal = 1;
unpin(frame, wtrack, function () { one.classList.remove('is-walk'); labels.forEach(function (l) { l.classList.remove('is-past', 'is-cur'); }); });
layout();
} else if (seen) { walk(); draw(); }
}
else {
if (vertical && !still && L && reveal < 1) {                      // down a phone the strands are drawn by the scroll: the front stays four fifths of the way down the screen
hiR = Math.max(hiR, scrollP(track));
reveal = Math.abs(hiR - reveal) < .002 ? hiR : reveal + (hiR - reveal) * .16;
} else if (began !== null && reveal < 1) reveal = eo((now - began) / 1.8);
if (seen) draw();
}
if (seen || (walking && !settled)) window.requestAnimationFrame(tick); else running = false;   // on screen, or the frozen walk not yet played and passed
}
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) wake(); }, { threshold: .35 }).observe(pick); else seen = true;
wake();
if ('ResizeObserver' in window) new ResizeObserver(layout).observe(pick);
window.addEventListener('resize', layout);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
layout();
});
Array.prototype.forEach.call(document.querySelectorAll('.ways, .market, .fits-section'), function (root) {   // the home page's market section freezes the same way (Marko, 8 Oct 2026)
var c = root.querySelector('.chain'), frame = root.querySelector('.ways__frame, .market__frame'), wtrack = frame && frame.parentNode;
if (!c) return;
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, desk = window.matchMedia('(min-width: 901px)');
Array.prototype.forEach.call(root.querySelectorAll('.ways__d'), function (d) { wireBox(d); });                // the box
if (still) return;
c.classList.add('is-live');
var steps = [].slice.call(c.querySelectorAll('.chain__step')), n = steps.length, held = [], walking = false, ftop = 0, run = 1, cur = null, seen = true, busy = false, settled = false, hi = 0, arrived = false;
var replay = root.matches('.market, .fits-section');   // on a laptop these two, which guide the reader through steps, play again when the reader comes back; the ways stay drawn once played (Marko, 18 Oct 2026)
function pinning() {
var pin = pinBlock(frame, wtrack, 1.7, desk.matches && !!c.offsetWidth && !settled);
walking = !!pin; if (pin) { ftop = pin.top; run = pin.run; cur = null; }
}
function progress() { return clamp((ftop - wtrack.getBoundingClientRect().top) / run); }
function update() {
var p, vh = window.innerHeight, r;
if (walking) { var g = progress(); cur = cur === null ? g : cur + (g - cur) * .16; if (Math.abs(g - cur) < .002) cur = g; p = clamp((cur - .05) / .85); }
else { r = c.getBoundingClientRect(); p = clamp((vh * .8 - (r.top + r.height / 2)) / (vh * .5)); }
if (!replay && !settled && walking && frame && passed(wtrack)) { settled = true; walking = false; unpin(frame, wtrack); }
if (settled) p = 1; else if (!walking) p = hi = Math.max(hi, p);
lightChain(c, p, held);
if (!arrived && !settled) {
if (c.getBoundingClientRect().top < vh * .85) arrived = true;
else steps.forEach(function (s) { s.classList.remove('is-lit', 'is-now'); });
}
}
function wake() {
if (!seen || busy) return;
busy = true;
window.requestAnimationFrame(function () { busy = false; update(); if (walking && cur !== null && Math.abs(progress() - cur) > .002) wake(); });
}
c.addEventListener('focusin', function (e) {                                       // focus brings a way in: by the scroll where frozen, else by holding it lit
var s = e.target.closest && e.target.closest('.chain__step'), i = steps.indexOf(s);
if (i < 0 || s.classList.contains('is-lit')) return;
if (walking) window.scrollTo(0, window.scrollY + wtrack.getBoundingClientRect().top - ftop + run * (.05 + .85 * (i / n) + .03));
else { held[i] = true; update(); }
});
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', function () { pinning(); wake(); });
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) wake(); }).observe(root);   // no work while it is off the screen
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { pinning(); wake(); });
pinning(); update();
});
Array.prototype.forEach.call(document.querySelectorAll('.rtab'), function (root) {
var list = root.querySelector('.rtab__list'), svg = list.querySelector('svg'), rows = [].slice.call(list.querySelectorAll('.rtab__row')), all = root.querySelector('.rtab__all');
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var phone = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
rows.forEach(function (r, k) { r.style.setProperty('--k', k); });
if (!still) root.classList.add('is-hinting');   // a laptop's table arrives closed too, with the same dip (Marko, 18 Oct 2026: the first row no longer opens by itself)
function stopHint() { root.classList.remove('is-hinting'); }
if (still) { root.classList.add('is-still'); }
root.classList.add('is-live');
var track = root.closest('.routes__track') || root.parentElement.parentElement, frame = track.querySelector('.routes__frame'), desk = window.matchMedia('(min-width: 901px)'), pin = null, released = false;
function setPin() { if (released || !frame) return; pin = pinBlock(frame, track, 1.3, desk.matches && !still); }
function release() {
if (!pin || released) return;
var s = clamp((pin.top - track.getBoundingClientRect().top) / pin.run) * pin.run;
released = true; pin = null;
frame.classList.remove('is-pinned'); track.style.height = ''; frame.style.top = ''; frame.style.minHeight = '';
window.scrollBy({ top: -s, behavior: 'instant' });
}
var nodes = rows.map(function (r) { return r.querySelector('.rtab__node'); }), NS = 'http://www.w3.org/2000/svg';
var paths = [0, 1, 2].map(function (k) { var p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'pick__strand pick__strand--' + k); svg.appendChild(p); return p; });
var grid = gridGroup(svg);
var STR = [[1, 22, .9, 0], [2, 14, 1.37, 1.3], [3, 9, 2.11, 2.6]], seed = 23;
function R() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
var SW = STR.map(function () { var o = []; for (var j = 0; j <= rows.length; j++) o.push({ m: .6 + R() * .65, f: .7 + R() * .8, ph: R() * 6.28 }); return o; });
var pos = [], L = 1, C = 20, cap = 1, now = 0, seen = true, reveal = still ? 1 : 0, open = rows.map(function () { return false; });
function swell(k, y) {
var m = pos.length, i = 0, a, b, ix;
if (y < pos[0]) { a = pos[0] - (pos[1] - pos[0]); b = pos[0]; ix = 0; }
else if (y >= pos[m - 1]) { a = pos[m - 1]; b = a + (pos[m - 1] - pos[m - 2]); ix = m; }
else { while (i < m - 1 && y >= pos[i + 1]) i++; a = pos[i]; b = pos[i + 1]; ix = i + 1; }
var sg = SW[k][ix];
return Math.sin(STR[k][0] * Math.PI * (y - a) / (b - a)) * STR[k][1] * cap * sg.m * (still ? .8 : .55 + .45 * Math.sin(STR[k][2] * sg.f * now + STR[k][3] + sg.ph));
}
function draw() {
if (pos.length < 2) return;
var y0 = pos[0], y1 = pos[pos.length - 1], lim = reveal >= 1 ? y1 : Math.min(y1, L * reveal);   // from the first dot to the last, the three strands together at both, as the other lists' (Marko, 16 Oct 2026)
paths.forEach(function (p, k) {
var pp = [], y;
for (y = y0; y <= lim; y += 4) pp.push([C + swell(k, y), y]);
if (reveal >= 1) pp.push([C + swell(k, y1), y1]);
p.setAttribute('d', curve(pp));
});
}
function layout() {
if (!list.offsetWidth) return;
var G = parseFloat(getComputedStyle(list).paddingLeft) || 44, H = list.offsetHeight, tr = list.getBoundingClientRect();
svg.setAttribute('width', G); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + G + ' ' + H);
pos = rows.map(function (r) { var l = r.querySelector('.rtab__lab'), h = r.querySelector('.rtab__rt'); return l.getBoundingClientRect().top - tr.top + (parseFloat(getComputedStyle(h).lineHeight) || 30) / 2; });
nodes.forEach(function (n, k) { n.style.top = (pos[k] - (rows[k].getBoundingClientRect().top - tr.top)) + 'px'; });
C = G / 2; cap = (20 - 5) / (STR[0][1] * 1.25); L = pos[pos.length - 1] + 60;   // the swell is the same size as the other lists' (their track is 40px wide), whatever the gutter is and however far apart the rows are: the waves stay behind the content (Marko, 16 Oct 2026)
gridLines(grid, pos, true, C - 26, C + 26);
}
function follow(ms) { var t0 = performance.now(); (function f(t) { layout(); if (t - t0 < ms) window.requestAnimationFrame(f); })(t0); }
function render(user) {
if (user) stopHint();
if (user) root.classList.add('has-opened');   // "Expand all" appears once the reader has opened or closed a row themselves (Maja, 13 Oct 2026)
rows.forEach(function (row, k) {
var on = open[k]; row.classList.toggle('is-open', on); [].forEach.call(row.querySelectorAll('.rtab__cell'), function (c) { c.classList.toggle('is-open', on); });
[].forEach.call(row.querySelectorAll('.rtab__w, .rtab__rt'), function (b) { b.setAttribute('aria-expanded', on); });
});
var every = open.every(Boolean); all.setAttribute('aria-pressed', every); all.classList.toggle('is-on', every);
if (user && open.some(Boolean)) release();
if (!still) follow(700); else layout();
}
function pick(k) {
var h = rows[k].querySelector('.rtab__rt'), y0 = h.getBoundingClientRect().top;
var only = open[k] && open.every(function (v, j) { return j === k || !v; }); open = open.map(function (v, j) { return only ? false : j === k; }); render(true);
var d = h.getBoundingClientRect().top - y0;
if (d) window.scrollBy({ top: d, behavior: 'instant' });
}
rows.forEach(function (row, k) {
[].forEach.call(row.querySelectorAll('.rtab__w, .rtab__rt'), function (b) { b.addEventListener('click', function () { pick(k); }); });
row.querySelector('.rtab__cells').addEventListener('click', function (e) { if (!e.target.closest('button') && !String(window.getSelection())) pick(k); });   // anywhere in the row's cells, its words or its full text
});
all.addEventListener('click', function () {
var every = open.every(Boolean), y0 = all.getBoundingClientRect().top;
open = open.map(function () { return !every; }); render(true);
if (every) { var d = all.getBoundingClientRect().top - y0; if (d) window.scrollBy({ top: d, behavior: 'instant' }); }
});
root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open.some(Boolean)) { open = open.map(function () { return false; }); render(true); } });
var hiPx = 0;
function update() {
if (pin && !released && passed(track)) release();   // played and passed: the rows stay in (Maja, 13 Oct 2026)
var r = list.getBoundingClientRect(), px = still || released ? 1e6 : window.innerHeight * .8 - r.top;
if (pin && !released) px = clamp((pin.top - track.getBoundingClientRect().top) / pin.run / .85) * (L + 10);   // frozen: the scroll through the block brings the rows in
else if (!released) px = hiPx = Math.max(hiPx, px);                                                          // not frozen: once a row has arrived it stays
reveal = clamp(px / (L || 1));
rows.forEach(function (row, k) { var on = px >= pos[k] - 10; if (on !== row.classList.contains('is-on')) row.classList.toggle('is-on', on); if (!on && open[k]) { open[k] = false; render(); } });   // a row the scroll runs back past takes its texts with it
if (!root.classList.contains('has-arrived') && rows[0].classList.contains('is-on')) root.classList.add('has-arrived');   // the column heads follow the first row in
if (!phone && !released && pin && reveal >= 1) release();   // the frozen table is put away once it is all in; every row stays closed until the reader opens it
}
var ticking = false;
function startTick() { if (!ticking) { ticking = true; window.requestAnimationFrame(tick); } }   // sleeps while the table is off screen
function tick(ms) { now = ms / 1000; if (seen && list.offsetWidth && pos.length) { update(); draw(); } if (seen) window.requestAnimationFrame(tick); else ticking = false; }
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) startTick(); }).observe(root);
window.addEventListener('resize', function () { layout(); setPin(); });
if ('ResizeObserver' in window) new ResizeObserver(layout).observe(list);
root.addEventListener('focusin', function (e) { var row = e.target.closest && e.target.closest('.rtab__row'); if (row && !row.classList.contains('is-on')) release(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); setPin(); });
layout(); setPin();
if (still) { rows.forEach(function (row) { row.classList.add('is-on'); }); draw(); } else startTick();
});
Array.prototype.forEach.call(document.querySelectorAll('.pay'), function (root) {
var track = root.querySelector('.pay__track'), frame = root.querySelector('.pay__frame'), fig = root.querySelector('.pay__fig'), cv = fig && fig.querySelector('canvas'), cs = [].slice.call(root.querySelectorAll('.pay__c'));
if (!cv) return;
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, desk = window.matchMedia('(min-width: 901px)'), g = cv.getContext('2d');
var NS = 6, COLS = 9, NL = 18, N = cs.length, cx = [], W = 0, H = 0, pin = null, cur = null, seen = true, settled = false, hi = 0, held = [], ink = '#071a2f', sig = '#4da3c7', teal = '#2d7184', grey = '#566272';
var seed = 9; function R() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
var LN = [], i0; for (i0 = 0; i0 < NL; i0++) LN.push({ j: Math.floor(i0 * NS / NL), y0: .22 + .56 * R(), f1: .6 + R(), f2: .5 + R(), p0: R() * 6.28, p1: R() * 6.28, amp: .7 + R() * .5 });
var PRIM = []; LN.forEach(function (q) { if (!PRIM[q.j]) PRIM[q.j] = q; });                 // the line each of the six strands keeps; the others gather onto it and fade
function eo(u) { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
function sm(a, b, x) { return clamp((x - a) / (b - a)); }
function wv(x, k, j, t) {                                                              // wave k, strand j: the three breathe a third of a cycle apart, so one is always swelling while another settles, and the strands stay close
var ph = t * .7 - k * 2.094, A = 1 + .4 * Math.sin(ph), sp = 2.2 + 2.8 * (.5 + .5 * Math.sin(ph + 3.14));
return H * .45 + [H * .20, H * .13, H * .08][k] * A * Math.sin(x / W * Math.PI * [3, 4.4, 6.2][k] + [0, 1.3, 2.6][k] + t * .18) * (1 - .35 * x / W) + (j - (NS - 1) / 2) * sp;
}
function yl(l, x, b, t) {                                                              // a line: irregular, and always inside the figure (b = 0), or one strand of one of the three waves (b = 1)
var irr = H * l.y0 + (Math.sin(x * .011 * l.f1 + l.p0 + t * .4) * H * .09 + Math.sin(x * .027 * l.f2 + l.p1) * H * .05) * l.amp;
var wy = wv(x, l.j % 3, l.j, t); return irr + (wy - irr) * b;
}
function u(p) { return clamp((p - .05) / .9); }                                       // how far the front has travelled, 0 to 1
function front(p) { return (W + 140) * u(p) - 70; }                                   // where the irregular lines have become the waves, moving left to right
function cxk(k) { return cx[k] !== undefined ? cx[k] : k / N * W; }                    // where claim k's title stands along the figure (the titles are as wide as they are, spread across it)
function thr(i) { return .05 + .9 * clamp((cxk(i) + 10 + 70) / (W + 140)); }       // the progress at which the front passes claim i's column
if (!still) root.classList.add('is-live');
function layout() {
var r = fig.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; W = r.width; H = r.height; if (!W) return;
cx = cs.map(function (c, k) { var t = c.querySelector('.pay__t'), tr = t && t.getBoundingClientRect(); return desk.matches && tr && tr.width ? tr.left - r.left : k / N * W; });
cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
var cs0 = getComputedStyle(root); ink = cs0.color || ink; sig = (cs0.getPropertyValue('--signal') || sig).trim() || sig; teal = (cs0.getPropertyValue('--accent') || teal).trim() || teal;
}
function paint(p, t) {
if (!W) return;
var xf = still ? W + 70 : front(p), uu = still ? 1 : eo(u(p)), x, y, i, c, l, primary;
function B(x) { return eo(1 - sm(xf - 70, xf + 70, x)); }                          // 1 behind the front, 0 ahead of it
g.clearRect(0, 0, W, H); g.lineJoin = 'round';
for (i = 0; i < NL; i++) {                                                           // eighteen lines wander; behind the front six of them are the waves, the rest have joined them
l = LN[i]; primary = l === PRIM[l.j]; var k = l.j % 3;
g.globalAlpha = primary ? .8 : (1 - uu) * .5; g.strokeStyle = primary ? (k === 0 ? ink : k === 1 ? sig : teal) : grey; g.lineWidth = primary ? 1.3 : 1;   // three waves, three colours: ink, the light blue, the teal
g.beginPath(); for (x = 0; x <= W; x += 6) { y = yl(l, x, B(x), t); if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
}
g.fillStyle = ink;                                                                   // a point where each of the six waves crosses each of nine columns, once the front has passed
for (i = 0; i < NS; i++) for (c = 0; c < COLS; c++) { x = W * c / (COLS - 1); g.globalAlpha = .6 * B(x); if (g.globalAlpha > .01) { g.beginPath(); g.arc(x, yl(PRIM[i], x, 1, t), 1.7, 0, 6.3); g.fill(); } }
g.globalAlpha = 1;
cs.forEach(function (el, k) { var on = still || held[k] || xf >= cxk(k) + 10; if (on !== el.classList.contains('on')) el.classList.toggle('on', on); if (!on && el.classList.contains('is-open')) open(-1); });   // each claim arrives as the front passes its column, and goes with it, its sentence too, when the scroll runs back (Marko, 18 Oct 2026)
var at = -1; cs.forEach(function (el, k) { if (el.classList.contains('on') && xf < (k + 1 < N ? cxk(k + 1) : W)) at = k; });   // the claim whose column the front is in: bright while it stands there, a tier quieter after
cs.forEach(function (el, k) { var cur = !still && k === at; if (cur !== el.classList.contains('is-cur')) el.classList.toggle('is-cur', cur); });
}
function open(k) { cs.forEach(function (c, i) { var on = i === k; c.classList.toggle('is-open', on); c.querySelector('.pay__t').setAttribute('aria-expanded', on); }); }
cs.forEach(function (c, i) { c.querySelector('.pay__t').addEventListener('click', function () { open(c.classList.contains('is-open') ? -1 : i); }); });
root.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(-1); });
function pinning() {                                                                   // the claims' band is held at the height of its longest claim open, so opening one moves nothing
var longest = 0, was = cs.map(function (c) { return c.classList.contains('is-open'); }), row = root.querySelector('.pay__row');
cs.forEach(function (c, i) { if (c.querySelector('.pay__p').textContent.length > cs[longest].querySelector('.pay__p').textContent.length) longest = i; });
root.classList.add('is-measure'); row.style.minHeight = ''; cs.forEach(function (c, i) { c.classList.toggle('is-open', i === longest); });
if (desk.matches && !still) {                 // each sentence opens in the band under the figure, in its title's column, so the tallest is found by opening each in turn
var tall = 0;
frame.style.removeProperty('--pay-band');
cs.forEach(function (c, i) {
cs.forEach(function (d, k) { d.classList.toggle('is-open', k === i); });
var inner = c.querySelector('.pay__more > div'), p = c.querySelector('.pay__p');
tall = Math.max(tall, inner.scrollHeight + (parseFloat(getComputedStyle(p).marginTop) || 0));
});
frame.style.setProperty('--pay-band', Math.ceil(tall) + 'px');   // the band under the figure, held at the tallest sentence in its own column
} else if (desk.matches && !still) row.style.minHeight = row.offsetHeight + 'px';
cs.forEach(function (c, i) { c.classList.toggle('is-open', was[i]); });
pin = pinBlock(frame, track, 1.8, desk.matches && !still && !settled);
void frame.offsetHeight; root.classList.remove('is-measure'); cur = settled ? 1 : null;
}
function prog() {
if (settled) return 1;
if (pin) {
if (passed(track)) { settled = true; pin = null; unpin(frame, track); return 1; }   // played and passed: the claims stay in (Maja, 13 Oct 2026)
var gg = clamp((pin.top - track.getBoundingClientRect().top) / pin.run); return clamp((gg - .04) / .88);
}
var r = frame.getBoundingClientRect(); return hi = Math.max(hi, clamp((window.innerHeight * .85 - r.top) / (window.innerHeight * .65)));
}
root.addEventListener('focusin', function (e) {                                       // a claim the node has not reached is brought in by focusing it
var c = e.target.closest && e.target.closest('.pay__c'), i = cs.indexOf(c);
if (i < 0 || still || c.classList.contains('on')) return;
if (pin) window.scrollTo(0, window.scrollY + track.getBoundingClientRect().top - pin.top + pin.run * (.04 + .88 * (thr(i) + .02)));
else { held[i] = true; c.classList.add('on'); }
});
var ticking = false;
function startTick() { if (!ticking) { ticking = true; window.requestAnimationFrame(tick); } }   // the canvas repaints only while its section is on screen
function tick(ms) {
if (seen && W) { var t = prog(); cur = cur === null ? t : cur + (t - cur) * .14; if (Math.abs(t - cur) < .001) cur = t; paint(cur, ms / 1000); }
if (seen) window.requestAnimationFrame(tick); else ticking = false;
}
function relayout() { pinning(); layout(); if (still) paint(1, 0); }
window.addEventListener('resize', relayout);
if ('ResizeObserver' in window) new ResizeObserver(function () { layout(); if (still) paint(1, 0); }).observe(fig);
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) startTick(); }).observe(root);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
relayout();
if (still) paint(1, 0); else startTick();
});
Array.prototype.forEach.call(document.querySelectorAll('.sheet'), function (sh) {
var host = sh.parentElement, body = sh.querySelector('.sheet__body'), close = sh.querySelector('.dp__close'), narrow = window.matchMedia('(max-width: 900px)');
var kind = host.classList.contains('qs') ? 'rows' : 'claims';
sh._items = function () { return [].slice.call(host.querySelectorAll(kind === 'rows' ? 'details.q' : '.pay__c')); };
sh._isOn = function (el) { return kind === 'rows' ? el.open : el.classList.contains('is-open'); };
sh._open = function (el) {
if (kind === 'rows') el.open = true; else el.querySelector('.pay__t').click();
};
function opened() { return sh._items().filter(sh._isOn)[0]; }
function htmlFor(o) {          // one answer, as the sheet shows it: its name, then its text
var name = kind === 'rows' ? o.querySelector('.q__q').innerHTML : o.querySelector('.pay__tt').innerHTML;
return '<div class="dp__a"><p class="dp__name">' + name + '</p>' + (kind === 'rows'
? '<div>' + o.querySelector('.q__a').innerHTML + '</div><div>' + o.querySelector('.q__more p').innerHTML + '</div>'
: '<div>' + o.querySelector('.pay__more > div').innerHTML + '</div>') + '</div>';
}
function holdHeight() {
if (sh._tall && sh._tallW === body.clientWidth) { body.style.height = sh._tall + 'px'; return; }
var probe = document.createElement('div'), tall = 0;
probe.className = 'sheet__body'; probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;height:auto;max-height:none;overflow:visible;width:' + body.clientWidth + 'px';
sh.appendChild(probe);
sh._items().forEach(function (o) { probe.innerHTML = htmlFor(o); tall = Math.max(tall, probe.scrollHeight); });
sh.removeChild(probe);
body.style.height = 'auto';
var chrome = sh.offsetHeight - body.offsetHeight, limit = sh.classList.contains('is-picking') && parseFloat(sh.style.maxHeight) ? parseFloat(sh.style.maxHeight) : window.innerHeight * .74, room = Math.floor(limit - chrome - 2);
sh._tall = Math.max(120, Math.min(tall, room)); sh._tallW = body.clientWidth;
body.style.height = sh._tall + 'px';
}
sh._hold = function () { sh._tall = 0; holdHeight(); };           // the picker (part 25) measures again at its own width, once it is up
var leaving = null;
function fill() { place(false); }
function place(final) {
var o = narrow.matches && opened(), html = '';
host.classList.toggle('is-sheet', narrow.matches);
if (o) html = htmlFor(o);
if (!html && !final && sh.classList.contains('is-on')) {        // the answer is going: the sheet folds away first, its text still in it
if (!leaving) leaving = leaveSheet(sh, function () { leaving = null; place(true); }, sh._instant);
return;
}
if (leaving) { stopLeaving(leaving, sh); leaving = null; }       // another answer was chosen while it folded: it stays
var changed = html !== sh._html;
if (changed) { body.innerHTML = html; sh._html = html; }
sh.classList.toggle('is-on', !!html);
if (html) holdHeight();
if (sh._sync) sh._sync();
if (html && changed) keepClear(kind === 'rows' ? o.querySelector('summary') : o.querySelector('.pay__t'), sh);
}
function shut() {
var o = opened();
if (!o) return;
if (kind === 'rows') o.open = false; else o.querySelector('.pay__t').click();
}
close.hidden = false;
function quiet() { sh._instant = true; setTimeout(function () { sh._instant = false; }, 100); }   // the closing is seen a moment later (a toggle, a class change), so the flag stays up that long
close.addEventListener('click', function () { if (close.hasAttribute('data-instant')) quiet(); shut(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sh.classList.contains('is-on')) { quiet(); shut(); } });
if (kind === 'rows') host.addEventListener('toggle', fill, true);
else Array.prototype.forEach.call(host.querySelectorAll('.pay__c'), function (c) { new MutationObserver(fill).observe(c, { attributes: true, attributeFilter: ['class'] }); });
if (narrow.addEventListener) narrow.addEventListener('change', fill);
var w23 = window.innerWidth;
window.addEventListener('resize', function () { if (window.innerWidth === w23) return; w23 = window.innerWidth; sh._tall = 0; if (sh.classList.contains('is-on')) holdHeight(); });   // width only: the height moves with a phone's bars
fill();
});
Array.prototype.forEach.call(document.querySelectorAll('.chain'), function (c) {
var narrow = window.matchMedia('(max-width: 900px)'), fig = c.querySelector('.chain__fig--v'), steps = [].slice.call(c.querySelectorAll('.chain__step'));
if (!fig) return;
var svgs = fig.querySelectorAll('svg'), NS = 'http://www.w3.org/2000/svg', key = '';
function path(d, cls) { var e = document.createElementNS(NS, 'path'); e.setAttribute('d', d); if (cls) e.setAttribute('class', cls); return e; }
function line(y) { var e = document.createElementNS(NS, 'line'); e.setAttribute('x1', 0); e.setAttribute('y1', y.toFixed(1)); e.setAttribute('x2', 120); e.setAttribute('y2', y.toFixed(1)); return e; }
function fit() {
var nodes = c.querySelectorAll('.chain__node');
if (!narrow.matches || !c.offsetHeight) {
c._at = null; Array.prototype.forEach.call(nodes, function (nd) { nd.style.top = ''; }); return;
}
var cr = c.getBoundingClientRect(), H = c.offsetHeight, ys = steps.map(function (s) { return (s.getBoundingClientRect().top - cr.top) / H * 1000; });
var k2 = ys.map(function (y) { return y.toFixed(1); }).join();
steps.forEach(function (s, k) { nodes[k].style.top = (ys[k] * H / 1000 + 8) + 'px'; });
c._at = ys.map(function (y) { return y / 1000; });
if (k2 === key) return;
key = k2;
var n = ys.length, last = ys[n - 1], g = svgs[0].querySelector('.chain__grid'), hz = svgs[0].querySelector('.chain__horizon'), draw = svgs[1];
while (g.firstChild) g.removeChild(g.firstChild);
ys.forEach(function (y) { g.appendChild(line(y)); });                      // one through each step and one at the end, none between
g.appendChild(line(1000));
hz.setAttribute('y1', ys[0].toFixed(1));
while (draw.firstChild) draw.removeChild(draw.firstChild);
[[1, 44], [2, 28], [3, 17]].forEach(function (w, k) {
var m = w[0], amp = w[1], sign = m % 2 ? -1 : 1, pp = [], a, j = 0, ph, x;
for (a = ys[0]; a <= last + .01; a += 4) {
while (j < n - 2 && a > ys[j + 1]) j++;
ph = j + (a - ys[j]) / (ys[j + 1] - ys[j]);                                   // the step's own phase, so every wave crosses the line at every node
x = 60 + sign * amp * Math.pow(Math.max(0, 1 - (a - ys[0]) / (last - ys[0])), 1.1) * Math.sin(m * Math.PI * ph);
pp.push([x, a]);
}
pp.push([60, last]);
draw.appendChild(path(curve(pp), 'chain__wave chain__wave--' + k));
});
draw.appendChild(path('M60 ' + last.toFixed(1) + ' L60 1000', 'chain__out'));   // the waves meet at the last step and go on as one line along the axis
}
if (window.ResizeObserver) new ResizeObserver(fit).observe(c.querySelector('.chain__steps'));
if (narrow.addEventListener) narrow.addEventListener('change', fit);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
fit();
});
(function () {
var narrow = window.matchMedia('(max-width: 900px)'), still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, root = document.documentElement, NS = 'http://www.w3.org/2000/svg';
var ROWMAX = 56, ROWMIN = 40, up = null;               // ROWMAX/ROWMIN: the distance between two names
function headBottom() { var h = document.querySelector('[data-header]'), r = h && h.getBoundingClientRect(); return r && r.bottom > 0 ? Math.round(r.bottom) : 0; }
var inert = 0, sb = null;
function instantOn() { if (sb === null) { sb = root.style.scrollBehavior; root.style.scrollBehavior = 'auto'; } }
function instantOff() { if (sb !== null) { root.style.scrollBehavior = sb; sb = null; } }
function stopInertia() { if (inert) { window.cancelAnimationFrame(inert); inert = 0; instantOff(); } }
function inertia(v) {
stopInertia();
v = Math.max(-4, Math.min(4, v));
if (still || Math.abs(v) < .05) { instantOff(); return; }
instantOn();
var last = performance.now(), at = window.scrollY;
(function step(now) {
if (Math.abs(window.scrollY - at) > 2) { inert = 0; instantOff(); return; }
var dt = Math.min(now - last, 40); last = now;
window.scrollTo(0, at + v * dt); at = window.scrollY;
v *= Math.exp(-dt / 325);
if (Math.abs(v) > .03) inert = window.requestAnimationFrame(step); else { inert = 0; instantOff(); }
})(last);
}
['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (t) { document.addEventListener(t, stopInertia, { passive: true }); });
var shield = null;
function shieldOn() {
if (shield) return;
shield = document.createElement('div');
shield.setAttribute('aria-hidden', 'true');
shield.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:90;background:transparent;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none';
document.body.appendChild(shield);
var s = window.getSelection && window.getSelection(); if (s && s.removeAllRanges) s.removeAllRanges();
}
function shieldOff() { if (shield) { document.body.removeChild(shield); shield = null; } }
['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (t) { document.addEventListener(t, shieldOff, { passive: true }); });   // however the touch ends
window.addEventListener('blur', shieldOff);
function tallest(one, its, rows) {
var probe = document.createElement('div'), body = document.createElement('div'), h = 0;
probe.className = 'dp__answers sheet is-picking is-probe'; body.className = 'sheet__body'; probe.appendChild(body);
probe.style.cssText = 'display:block;position:fixed;left:0;right:0;top:0;bottom:auto;height:auto;min-height:0;max-height:none;overflow:visible;visibility:hidden;pointer-events:none;opacity:1;transform:none';
document.body.appendChild(probe);
function used() {            // to the foot of the last line of text, not to the margin after it
var els = probe.querySelectorAll('.dp__a > *'), last = els[els.length - 1], r = probe.getBoundingClientRect();
return last ? last.getBoundingClientRect().bottom - r.top + parseFloat(getComputedStyle(probe).paddingBottom) : 0;
}
function measure(html) { body.style.height = 'auto'; body.innerHTML = '<div class="dp__a"><p class="dp__name"></p>' + html + '</div>'; h = Math.max(h, used()); }
if (one) {
[].forEach.call(one.querySelectorAll('.dp__a'), function (a) {   // the selectors' answers stand straight in the box (the sheets' text stands in a body that is 8px wider each side)
var c = a.cloneNode(true); body.innerHTML = ''; probe.appendChild(c); h = Math.max(h, used()); probe.removeChild(c);
});
} else if (rows) {
its.forEach(function (d) { var q = d.querySelector('.q__a'), m = d.querySelector('.q__more p'); if (q && m) measure('<div>' + q.innerHTML + '</div><div>' + m.innerHTML + '</div>'); });
} else {
its.forEach(function (c) { var d = c.querySelector('.pay__more > div'); if (d) measure('<div>' + d.innerHTML + '</div>'); });
}
document.body.removeChild(probe);
return Math.ceil(h);
}
Array.prototype.forEach.call(document.querySelectorAll('.dp__answers'), function (sh) {
var close = sh.querySelector('.dp__close'), sec = sh.closest('section');
if (!sec || sh.classList.contains('is-probe')) return;
var one = !sh.classList.contains('sheet') && sh.closest('.pickone');
function items() { return one ? [].slice.call(one.querySelectorAll('.dp__in')) : (sh._items ? sh._items() : []); }
function isOn(el) { return one ? el.checked : sh._isOn(el); }
function at() { var all = items(), i; for (i = 0; i < all.length; i++) if (isOn(all[i])) return i; return -1; }
function act(t) { if (one) t.click(); else sh._open(t); }
function nameOf(el) {
var n = one ? one.querySelector('label[for="' + el.id + '"]') : el.matches('details') ? el.querySelector('.q__q') : el.querySelector('.pay__tt');
return n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
}
function nameEl(el) { return one ? one.querySelector('label[for="' + el.id + '"]') : el.matches('details') ? el.querySelector('.q__q') : el.querySelector('.pay__tt'); }   // the element that holds a name on the page
function anchorOf(el) { return one ? one.querySelector('label[for="' + el.id + '"]') : el.matches('details') ? el.querySelector('summary') : el.querySelector('.pay__t'); }
var pk = document.createElement('div'), btns = [], svg = document.createElementNS(NS, 'svg'), paths = [], isUp = false, passing = false, leaving = false, drag = null, wheelAcc = 0, wheelOver = 0, ro = null;
var row = ROWMAX, vis = 0, target = 0, raf = 0, H = 0, cx = 27, availH = 0, pkro = null;
var BLUR = 8;                                                        // the blur of everything that is not the open name or its two neighbours: the same as the page's behind (styles.css .pk)
var OVER = 96;                                                       // how far the box reaches below the screen's foot (styles.css .is-picking)
var G = 0, Gw = 0, realY = [], docY = [], pkTopG = 0, follow = false, anchorL = 0, yOff = 0, shift0 = 0, cutBase = 0, entering = false, listEl = one || sh.parentElement;   // listEl: the page's own list, put out of sight while the picker stands in its place    // where the page's own rows stand (on screen, the page being held), the place the open name keeps in the picker, and how far the names have still to slide to it
var isDetails = !one && !!items().length && items()[0].matches && items()[0].matches('details'), rowsK = isDetails || (!one && !!sec.querySelector('.qs__wave')), pseed = rowsK ? 5 : 7, qsLeft0 = 0, qsTop0 = 0, nodeX = [];   // rowsK: a list the page draws its rows' wave down (the data types and the claims), isDetails: its rows are details
var PSTR = rowsK ? [[1, 11, .9, 0], [2, 7, 1.37, 1.3], [3, 4.5, 2.11, 2.6]] : [[1, 22, .9, 0], [2, 14, 1.37, 1.3], [3, 9, 2.11, 2.6]];
function PR() { pseed = (pseed * 16807) % 2147483647; return pseed / 2147483647; }
var WS = PSTR.map(function () { var o = [], j; for (j = 0; j <= items().length; j++) o.push({ m: .6 + PR() * .65, f: .7 + PR() * .8, ph: PR() * 6.28 }); return o; });
pk.className = 'pk' + (!one && !rowsK ? ' pk--plain' : ''); pk.setAttribute('role', 'listbox');   // a list the page draws no wave for gets none here either pk.setAttribute('aria-label', sh.getAttribute('data-noun') || (sec.querySelector('h2') || {}).textContent || '');
svg.setAttribute('class', 'pk__w'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
[0, 1, 2].forEach(function (s) { var pth = document.createElementNS(NS, 'path'); pth.setAttribute('class', (rowsK ? 'qs__strand qs__strand--' : 'pick__strand pick__strand--') + s); svg.appendChild(pth); paths.push(pth); });
var layer = document.createElement('div'); layer.className = 'pk__l'; pk.appendChild(layer);   // the names and the wave, cut off where the page's own list begins
layer.appendChild(svg);
var pgrid = gridGroup(svg);                                              // the page's own faint lines, in the picker too
items().forEach(function (el, i) {
var b = document.createElement('button');
b.type = 'button'; b.className = 'pk__i'; b.setAttribute('role', 'option');
b.innerHTML = '<span class="pk__n" aria-hidden="true"></span><span class="pk__t"></span><i class="sc__pl" aria-hidden="true"></i>';
b.querySelector('.pk__t').textContent = nameOf(el);
b.addEventListener('click', function (e) { if (e.detail === 0) tapName(i); });   // Enter or Space on a focused name (a touch is handled by the drag logic)
layer.appendChild(b); btns.push(b);
});
sec.appendChild(pk);
function go(k) { var all = items(); if (k < 0 || k >= all.length || k === at()) return false; act(all[k]); return true; }
function tapName(k, touch) {
if (k !== at()) { go(k); return; }
closeNow();
if (!touch) return;
var swallow = function (e) { e.stopPropagation(); e.preventDefault(); };
document.addEventListener('click', swallow, true);
setTimeout(function () { document.removeEventListener('click', swallow, true); }, 500);
}                                                                    // a tap on the open name closes it, as the cross does (Marko, 16 Oct 2026); on another it opens that one
function refY(v) {
var n = realY.length, f = Math.floor(v);
if (v <= 0) return realY[0] + v * row;
if (v >= n - 1) return realY[n - 1] + (v - (n - 1)) * row;
return realY[f] + (realY[f + 1] - realY[f]) * (v - f);
}
function paint(ts) {
var n = btns.length, i, d, ad, s, y, pts, c = cx, t = still ? 0 : ts / 1000, pos = [], ref = refY(vis), rel;
for (i = 0; i < n; i++) {
rel = realY[i] - ref; ad = Math.abs(rel) / row;
y = anchorL + rel + yOff; pos.push(y);                           // the open name keeps the place it had on the page, the rest at the page's own distances from it
btns[i].style.transform = 'translateY(' + y.toFixed(1) + 'px)';
btns[i].style.opacity = ad <= 1.6 ? '1' : ad >= 2.6 ? '0' : (1 - (ad - 1.6)).toFixed(3);
btns[i].style.filter = ad <= 1 ? 'none' : 'blur(' + (BLUR * Math.min(1, (ad - 1) / .6)).toFixed(2) + 'px)';
btns[i].style.pointerEvents = ad < 1.6 ? 'auto' : 'none';
}
if (!pk.classList.contains('pk--plain')) gridLines(pgrid, pos, true, (rowsK ? qsLeft0 + 26 : cx) - 26, (rowsK ? qsLeft0 + 26 : cx) + 26);
var wy = [], wi;
if (pos.length > 1) {                                              // as on the page: the strands start together at the first dot and end together at the last
var w0 = pos[0], w1 = pos[pos.length - 1];
wy.push(w0); for (wi = Math.ceil((w0 + 1) / 4) * 4; wi < w1; wi += 4) wy.push(wi); wy.push(w1);
}
var m = pos.length, base = anchorL + yOff - ref, capP = rowsK ? 1 : Math.max(.2, Math.min(1, (20 - 5) / (PSTR[0][1] * 1.25))), q, ix, aa, bb, sg, sw, x;
for (s = 0; s < 3; s++) {
pts = [];
for (var yi = 0; yi < wy.length; yi++) {
y = wy[yi];                                                        // the line runs from the first name's dot to the last's, where the three strands meet
if (y < pos[0]) { aa = pos[0] - (pos[1] - pos[0]); bb = pos[0]; ix = 0; }
else if (y >= pos[m - 1]) { aa = pos[m - 1]; bb = aa + (pos[m - 1] - pos[m - 2]); ix = m; }
else { q = 0; while (q < m - 1 && y >= pos[q + 1]) q++; aa = pos[q]; bb = pos[q + 1]; ix = q + 1; }
sg = WS[s][ix];
sw = Math.sin(PSTR[s][0] * Math.PI * (y - aa) / (bb - aa)) * PSTR[s][1] * capP * sg.m * (still ? .8 : .55 + .45 * Math.sin(PSTR[s][2] * sg.f * t + PSTR[s][3] + sg.ph));
if (rowsK) x = Math.min(qsLeft0 + 37, qsLeft0 + 26 + sw);   // the data types' line stands on the axis, as on the page
else x = c + sw;
pts.push([x, y]);
}
paths[s].setAttribute('d', curve(pts));
}
}
var kbSnap = false;                                                    // a key moved the names: they go straight there, with no glide
function frame(ts) {
raf = 0;
if (!isUp) return;
var k = at();
if (!drag) target = k < 0 ? 0 : k;
var diff = target - vis;
vis = still || kbSnap || Math.abs(diff) < .002 ? target : vis + diff * .22;
kbSnap = false;
yOff = still || Math.abs(yOff) < .3 ? 0 : yOff * .78;               // the names slide from where the page has them to where they keep (nothing, when the row is clear of the box)
if (follow && !still && !leaving && !(drag && (drag.hand || drag.moved)) && docY.length > 1) {   // not while a finger is dragging: a page that is scrolled by the code under a moving finger shakes (Marko, 19 Oct 2026); it follows as the finger lifts, over the easing of the names
var nn = docY.length, dref = vis <= 0 ? docY[0] + vis * row : vis >= nn - 1 ? docY[nn - 1] + (vis - (nn - 1)) * row : docY[Math.floor(vis)] + (docY[Math.floor(vis) + 1] - docY[Math.floor(vis)]) * (vis - Math.floor(vis));
var sT = dref - (pkTopG + anchorL + yOff);
if (Math.abs(sT - window.scrollY) > .4) { instantOn(); window.scrollTo(0, Math.abs(sT - window.scrollY) < 1.5 ? sT : window.scrollY + (sT - window.scrollY) * .3); instantOff(); }   // it eases to its place, a third of the way each frame, so a lifted finger does not jump it
cutBase = docY[0] - window.scrollY - row * .5 - pkTopG; applyCut();
}
paint(ts);
raf = window.requestAnimationFrame(frame);                         // the wave breathes while it is up
}
function kick() { if (!raf && isUp) raf = window.requestAnimationFrame(frame); }
function applyCut() {
var cut = cutBase - shift0;                                          // with the names moved up or down from the page's places (when the page could not ease far enough) the line moves with them
pk.style.setProperty('--pk-cut', (cut > 0 ? cut : -40).toFixed(1) + 'px');   // the names and the wave fade in below this line, over 40px, and do not start on a line
pk.style.setProperty('--pk-fade', Math.max(8, row / 2 - (parseFloat(pk.style.getPropertyValue('--pk-lh')) || 21) / 2 - 3).toFixed(1) + 'px');   // the fade ends above the first name's letters: a first name is whole (Marko's wife, 19 Oct 2026)
}
function geometry() {
var all = items(), n0, rg, q, nodeEl, chev, w = window.innerWidth, ys = [], i, d;
realY = all.map(function (el) { var nm = nameEl(el); return nm ? lineMid(nm) : (function () { var r = (anchorOf(el) || el).getBoundingClientRect(); return r.top + r.height / 2; })(); });
for (i = 1; i < realY.length; i++) { d = realY[i] - realY[i - 1]; if (d > 8) ys.push(d); }
ys.sort(function (x, y) { return x - y; });
row = ys.length ? Math.max(ROWMIN, Math.min(72, ys[Math.floor(ys.length / 2)])) : ROWMAX;   // the page's own row distance
n0 = nameEl(all[0]);
if (n0) {
rg = document.createRange(); rg.selectNodeContents(n0); q = rg.getClientRects()[0] || n0.getBoundingClientRect();
var cs0 = getComputedStyle(n0), lh = parseFloat(cs0.lineHeight) || parseFloat(cs0.fontSize) * 1.3;
pk.style.setProperty('--pk-lh', lh.toFixed(1) + 'px');                      // a line of the names, to stand the first line of each on the page's own line
pk.style.setProperty('--pk-tx', q.left.toFixed(1) + 'px');
pk.style.setProperty('--pk-tw', Math.max(80, n0.getBoundingClientRect().right - q.left).toFixed(1) + 'px');
}
chev = (one ? one.querySelector('label[for="' + all[0].id + '"]') : all[0]).querySelector('.sc__pl, .q__t');
if (chev) {
q = chev.getBoundingClientRect();
pk.style.setProperty('--pk-pr', Math.max(8, w - q.right).toFixed(1) + 'px');                        // the chevron's own place from the screen's edge
pk.style.setProperty('--pk-cm', Math.max(0, (q.width - 10) / 2).toFixed(1) + 'px');                // the picker's chevron is a 10px square like the page's; the page's, turned a quarter, is wider than that, so it starts this far in from the page's chevron's left edge to keep the same middle
if (n0) pk.style.setProperty('--pk-tw', Math.max(80, q.left - 12 - parseFloat(pk.style.getPropertyValue('--pk-tx'))).toFixed(1) + 'px');
}
var dots = one ? [].slice.call(one.querySelectorAll('.pick__node')) : [].slice.call(sec.querySelectorAll('svg.qs__wave .qs__ring'));
nodeX = all.map(function (el, k) { var r = dots[k] && dots[k].getBoundingClientRect(); return r && r.width ? r.left + r.width / 2 : 0; });
if (dots[0]) {
q = dots[0].getBoundingClientRect();
if (q.width) { cx = q.left + q.width / 2; pk.style.setProperty('--pk-nd', Math.max(10, q.width).toFixed(1) + 'px'); }
} else {
q = btns[0].querySelector('.pk__n').getBoundingClientRect(); if (q.width) cx = q.left + q.width / 2;
}
var wv = rowsK && sec.querySelector('svg.qs__wave');
if (wv) { q = wv.getBoundingClientRect(); qsLeft0 = q.left; qsTop0 = q.top; }
btns.forEach(function (b, k) {                                     // each dot where the page's own stands (the data types' line wanders a little)
var n = b.querySelector('.pk__n'), nd = parseFloat(pk.style.getPropertyValue('--pk-nd')) || 14;
if (n) n.style.left = nodeX[k] ? (nodeX[k] - nd / 2).toFixed(1) + 'px' : '';
});
pkTopG = pk.getBoundingClientRect().top; docY = realY.map(function (y) { return y + window.scrollY; });
cutBase = realY[0] - row * .5 - pk.getBoundingClientRect().top;       // where the page's own list begins, in the picker's frame: the names and the wave end there, under the section's headline
applyCut();
pk.style.setProperty('--pk-cx', cx.toFixed(1) + 'px');
pk.style.setProperty('--row', row.toFixed(1) + 'px');
}
function layout() {
var top = headBottom();
if (!availH || !G || Gw !== window.innerWidth) {
if (one) {                                                       // the selectors' answers share one cell, as tall as the tallest: the box itself, left to its own height, says how tall that is
sh.classList.remove('is-tight'); sh.style.height = 'auto'; sh.style.maxHeight = 'none'; sh.style.minHeight = '0';
G = Math.ceil(sh.scrollHeight);
} else G = tallest(one, items(), isDetails);
G -= OVER;                                                       // the box is padded by OVER below the screen's foot, which is not text
Gw = window.innerWidth; availH = window.innerHeight;
}
var avail = availH - top;
var lower = Math.min(Math.max(G + 4, 120), avail - 3 * ROWMIN - 24), pkH = avail - lower;   // this selector's own tallest text, and room for the cross and a line or two at the least
root.style.setProperty('--pk-top', top + 'px');
sh.style.height = sh.style.maxHeight = (lower + OVER) + 'px'; sh.style.minHeight = '';
if (sh._hold) sh._hold();                                          // the sheet's own text is held to this height, not to the old one
var tight = sh.scrollHeight > sh.clientHeight + 1;                   // a text that does not fit scrolls, and then the cross stays inside the box
sh.classList.toggle('is-tight', tight); sh.style.touchAction = tight ? 'pan-y' : 'none';
pk.style.top = top + 'px'; pk.style.bottom = lower + 'px'; pk.style.height = ''; H = pkH;
geometry();
svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + pkH); svg.setAttribute('width', window.innerWidth); svg.setAttribute('height', pkH);
}
function raise() {
isUp = true; up = sh; shift0 = 0; follow = false;
sh.classList.add('is-picking'); root.classList.add('pk-lock');
availH = 0;
pk.classList.add('is-up'); pk.style.visibility = 'hidden';         // sized and measured, not yet seen
layout();
var k0 = at(), top0 = pk.getBoundingClientRect().top, loc = realY[k0 < 0 ? 0 : k0] - top0, need = loc - H / 2;
var hd = sec.querySelector('.checks__head, .routes__head') || sec.querySelector('.hl, h2');
if (hd) {                                                          // the header comes back over the top when the page eases up and goes when it eases down: count it as always there
var hh = (document.querySelector('.site-header') || { offsetHeight: 0 }).offsetHeight, T = Math.max(top0, hh), rowY = realY[k0 < 0 ? 0 : k0];
need = Math.max(rowY - (top0 + H - row * 1.6), Math.min(rowY - (T + row * .9), hd.getBoundingClientRect().top - (T + 14)));
}
if (!still && !byKeyboard() && (hd || loc < row * .9 || loc > H - row * 1.6) && Math.abs(need) > 2) {
entering = true;
window.scrollBy({ top: need, behavior: 'smooth' });
(function settle(prev, quiet, n) {
window.requestAnimationFrame(function () {
var y = window.scrollY;
quiet = Math.abs(y - prev) < .5 ? quiet + 1 : 0;
if (quiet >= 4 || n > 60) { entering = false; start(); } else settle(y, quiet, n + 1);
});
})(window.scrollY, 0, 0);
} else start();
function start() {
if (!isUp) return;
pk.style.visibility = ''; listEl.classList.add('pk-hide');
layout();                                                        // the page's places again, as it stands now
var k = at(); vis = target = k < 0 ? 0 : k; follow = true;
var a0 = realY[vis] - pk.getBoundingClientRect().top;            // the open name's own place, in the picker's frame
anchorL = Math.max(row * .9, Math.min(H - row * 1.6, a0));   // the name after the open one stands on show above the box (Marko, 19 Oct 2026), so the open one is never lower than that; yOff = a0 - anchorL; shift0 = a0 - anchorL;   // kept where it is when it is clear of the top and the box; if the page could not ease far enough the names slide it in
applyCut();
if (window.ResizeObserver && !ro) { ro = new ResizeObserver(function () { if (isUp && !entering) { layout(); kick(); } }); ro.observe(sh); }
if (window.ResizeObserver && !pkro) {                            // the names' part follows the stylesheet (top and bottom edges); the wave is redrawn to its height
pkro = new ResizeObserver(function () {
var h = pk.clientHeight;
if (!isUp || !h || Math.abs(h - H) < .5) return;
H = h; svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + h); svg.setAttribute('height', h); kick();
});
pkro.observe(pk);
}
kick();
}
}
function lower() {
if (!isUp) return;
isUp = false; follow = false;
pk.classList.remove('is-up'); listEl.classList.remove('pk-hide'); sh.classList.remove('is-picking', 'is-tight'); sh.style.height = sh.style.minHeight = sh.style.maxHeight = sh.style.touchAction = '';
if (up === sh) { up = null; root.classList.remove('pk-lock'); }
}
function sync() {
var k = at(), n = items().length;
if (leaving) return;                                                // fading away: nothing brings it back until it has gone
if (!narrow.matches || k < 0) { lower(); return; }
if (!isUp) raise();
btns.forEach(function (b, i) { b.setAttribute('aria-selected', i === k ? 'true' : 'false'); b.tabIndex = i === k ? 0 : -1; });
kick();
}
sh._sync = sync;
window.addEventListener('resize', function () { if (isUp && window.innerWidth !== Gw) { layout(); kick(); } });   // a change of width only: the bars of a phone's browser change the height
if (narrow.addEventListener) narrow.addEventListener('change', sync);
if (one) { one.addEventListener('change', sync); one.addEventListener('click', function () { setTimeout(sync, 0); }); }
function later() {                                                  // after the toggle and the fill have run, and again once an expandable's fold has settled
window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
sync();
var w = 0;
(function folded() { if (window.__valantiqFolding && w++ < 60) window.requestAnimationFrame(folded); else if (w) window.requestAnimationFrame(sync); })();
}); });
}
if (close) close.addEventListener('click', later);
function align(keepLock) {
var k = at(), el = items()[k], nm = el && nameEl(el), pt = btns[k] && btns[k].querySelector('.pk__t');
if (!keepLock) root.classList.remove('pk-lock');
if (!nm || !pt) return;
var dd = lineMid(nm) - lineMid(pt);                                // the open name's line on the page against its line in the picker
if (Math.abs(dd) > .5) {
window.__valantiqFolding = true;
window.scrollBy({ top: dd, behavior: 'instant' });
setTimeout(function () { window.__valantiqFolding = false; }, 150);
}
}
function placePage() { align(false); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isUp) { placePage(); later(); } });
function closeNow() {
if (!isUp) return;
placePage();
isUp = false; up = null;
pk.classList.remove('is-up'); listEl.classList.remove('pk-hide'); sh.classList.remove('is-picking');
passing = true; close.setAttribute('data-instant', '');
close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));   // an event: .click() does not nest
close.removeAttribute('data-instant'); passing = false;
later();
}
function closeSoft() {
if (!isUp) return;
isUp = false; up = null; leaving = true;
if (!(drag && drag.hand)) root.classList.remove('pk-lock');        // while the finger is still moving the page the lock stays (the page is moved by this code only) and goes when it lifts
align(true);                                                       // the page is set so that the open name's own line is where the picker has it: the name does not move as the picker goes
listEl.classList.remove('pk-hide');                                // the page's own list is back in the same places
sh.style.visibility = 'hidden';                                    // the sheet's own close finishes from an event a moment later: unseen meanwhile, so it never shows for a frame in the page
pk.classList.remove('is-up');
pk.style.position = pk.style.left = pk.style.right = pk.style.width = pk.style.margin = '';
passing = true; close.setAttribute('data-instant', '');
close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
close.removeAttribute('data-instant'); passing = false;
sh.classList.remove('is-picking', 'is-tight'); sh.style.height = sh.style.minHeight = sh.style.maxHeight = sh.style.touchAction = '';
leaving = false; later();
setTimeout(function () { sh.style.visibility = ''; }, 400);
}
sh.addEventListener('click', function (e) {
if (!isUp || passing || !e.target.closest || !e.target.closest('.dp__close')) return;
e.stopPropagation(); e.preventDefault(); closeNow();
}, true);
function run(dir, n) { var i = 0; (function f() { if (i++ < n && isUp && go(at() + dir)) setTimeout(f, 80); })(); }
function down(e) {
if (!isUp || up !== sh || !e.isPrimary || e.target.closest('.dp__close, input, a')) return;
if (!pk.contains(e.target) && !sh.contains(e.target)) return;
drag = { id: e.pointerId, y: e.clientY, base: 0, moved: false, over: 0, pts: [{ y: e.clientY, t: e.timeStamp }], tap: e.target.closest && e.target.closest('.pk__i') };
}
function move(e) {
var d = drag;
if (!d || e.pointerId !== d.id) return;
var dy = d.y - e.clientY;                                          // a finger moving up is the next name
if (!d.moved) {
if (Math.abs(dy) < 8) return;
d.moved = true;
try { (e.target.closest && e.target.closest('.pk') || sh).setPointerCapture(e.pointerId); } catch (err) { /* a pointer that has gone */ }
}
d.pts.push({ y: e.clientY, t: e.timeStamp });
while (d.pts.length > 2 && d.pts[d.pts.length - 1].t - d.pts[0].t > 100) d.pts.shift();
if (d.hand) return;                                                // the picker has let go: while this finger is down the page is not moved by this code (it is by a flick, when it lifts)
var off = dy - d.base, k = at(), n = items().length;
while (off > row / 2 && k < n - 1) { if (!go(k + 1)) break; k++; d.base += row; off = dy - d.base; }
while (off < -row / 2 && k > 0) { if (!go(k - 1)) break; k--; d.base -= row; off = dy - d.base; }
var end = (k >= n - 1 && off > 0) || (k <= 0 && off < 0);
d.over = end ? Math.abs(off) : 0;
if (d.over > row * 1.4) { d.hand = true; shieldOn(); closeSoft(); return; }    // pulled far enough past the first or last name: it closes by itself, in either direction, and the same touch goes on to move the page
target = k + (end ? 0 : off) / row; vis = target;                  // under the finger, with no easing; past the first or last name the names stay where they are
kick();
}
function end_(e, cancelled) {
var d = drag;
if (!d || e.pointerId !== d.id) return;
drag = null;
if (!d.moved) { if (d.tap && !cancelled) tapName(btns.indexOf(d.tap), true); kick(); return; }   // a tap on a name
kick();                                                            // it eases back onto the row
if (d.hand) { shieldOff(); root.classList.remove('pk-lock'); if (cancelled) return; }
if (cancelled) return;
var n = d.pts.length, v = n > 1 && e.timeStamp - d.pts[n - 1].t < 80 && d.pts[n - 1].t > d.pts[0].t ? (d.pts[0].y - d.pts[n - 1].y) / (d.pts[n - 1].t - d.pts[0].t) : 0;   // px per ms, up positive
if (d.hand) { inertia(v); return; }   // let go after the hand-over: the page carries on with the speed of the swipe
var dir = v > 0 ? 1 : -1, pot = Math.abs(v) * 170 / row, avail = dir > 0 ? items().length - 1 - at() : at();
if (Math.abs(v) > .6 && pot > avail + .6) {                       // a strong swipe that would run past the end: the names run out, then the page takes it on
if (avail) run(dir, avail);
setTimeout(function () { if (!isUp) return; closeSoft(); inertia(v * Math.max(.35, Math.min(1, (pot - avail) / pot))); }, avail * 80 + 30);
return;
}
var more = Math.min(3, Math.floor(pot));                           // a flick carries on a name or two
if (more) run(dir, more);
}
pk.addEventListener('pointerdown', down, { passive: true }); sh.addEventListener('pointerdown', down, { passive: true });
document.addEventListener('pointermove', move, { passive: true });
document.addEventListener('pointerup', function (e) { end_(e, false); }, { passive: true });
document.addEventListener('pointercancel', function (e) { end_(e, true); }, { passive: true });
function hold(e) { if (((isUp && up === sh) || (drag && drag.hand)) && e.cancelable && !(isUp && sh.contains(e.target) && sh.scrollHeight > sh.clientHeight + 1)) e.preventDefault(); }
pk.addEventListener('touchmove', hold, { passive: false }); sh.addEventListener('touchmove', hold, { passive: false });
var hdr = document.querySelector('[data-header]');
if (hdr) hdr.addEventListener('touchmove', hold, { passive: false });   // the strip of the header above the names is held too, now that the page is held by its touches and not by its overflow
function wheel(e) {
if (!isUp || up !== sh) return;
if (sh.contains(e.target) && sh.scrollHeight > sh.clientHeight + 1) return;
e.preventDefault();
wheelAcc += e.deltaY;
var k = at(), n = items().length;
while (wheelAcc > 40) { wheelAcc -= 40; if (k >= n - 1) { wheelOver += 40; } else { go(k + 1); k++; wheelOver = 0; } }
while (wheelAcc < -40) { wheelAcc += 40; if (k <= 0) { wheelOver += 40; } else { go(k - 1); k--; wheelOver = 0; } }
if (wheelOver >= 160) { wheelOver = 0; wheelAcc = 0; closeSoft(); }
}
pk.addEventListener('wheel', wheel, { passive: false }); sh.addEventListener('wheel', wheel, { passive: false });
document.addEventListener('keydown', function (e) {
if (!isUp || up !== sh) return;
var k = at(), n = items().length;
if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'].indexOf(e.key) >= 0) kbSnap = true;
if (e.key === 'ArrowDown' || e.key === 'PageDown') { if (k < n - 1) { e.preventDefault(); go(k + 1); } }
else if (e.key === 'ArrowUp' || e.key === 'PageUp') { if (k > 0) { e.preventDefault(); go(k - 1); } }
else if (e.key === 'Home') { e.preventDefault(); go(0); } else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
});
sync();
});
})();
if ('IntersectionObserver' in window) {
var narrow26 = window.matchMedia('(max-width: 900px)');
Array.prototype.forEach.call(document.querySelectorAll('.dp__answers'), function (sh) {
var sec = sh.closest('section'), cross = sh.querySelector('.dp__close');
if (!sec || !cross) return;
new IntersectionObserver(function (es) {
if (es[0].isIntersecting || !narrow26.matches) return;
var on = sh.classList.contains('sheet') ? sh.classList.contains('is-on') : !!sec.querySelector('.dp__in:checked');
if (on) { cross.setAttribute('data-instant', ''); cross.click(); cross.removeAttribute('data-instant'); }   // the reader is moving on: no fold to fight the scroll
}, { rootMargin: '-30% 0px -30% 0px' }).observe(sec);
});
}
Array.prototype.forEach.call(document.querySelectorAll('.pickone'), function (one) {
var sheet = one.querySelector('.dp__answers');
if (!sheet) return;
one.addEventListener('change', function (e) {
var r = e.target;
if (!r.classList || !r.classList.contains('dp__in') || !r.checked) return;
keepClear(r.nextElementSibling, sheet);
});
});
