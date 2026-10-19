/* ==========================================================================
Valantiq — event tracking
Pushes named events to Google Tag Manager's dataLayer, and only while a
visitor has accepted analytics (src/site.js sets window.__valantiqAnalytics
after Accept and never before). Before that, and after Decline, every call
returns without doing anything: nothing is stored, queued or sent later.
Item names are read from the page itself, so editing the copy never breaks
the tracking. No email address, no free text and nothing a visitor types is
ever sent. The events and their parameters are listed in docs/measurement-plan.md.
========================================================================== */
(function () {
'use strict';
var PAGE = document.querySelector('.notfound') ? 'not_found'
: location.pathname === '/' ? 'owners'
: location.pathname.indexOf('/for-investment-managers') === 0 ? 'buyers'
: location.pathname.indexOf('/about') === 0 ? 'about'
: location.pathname.indexOf('/privacy') === 0 ? 'privacy' : 'other';
var COMPONENT = {
'your-data': 'data_type', reads: 'data_type', checks: 'question', standard: 'question', 'the-case': 'case_point',
safeguards: 'safeguard', pay: 'pay_point', routes: 'route_row', ways: 'way'
};
function on() { return window.__valantiqAnalytics === true; }
function clean(s) {   // collapsed whitespace, no email address, at most 100 characters (GA4's limit for a parameter value)
return String(s || '').replace(/\S+@\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
}
var KEYS = ['component', 'item', 'position', 'detail', 'cta_location', 'cta_label', 'intent', 'percent_scrolled', 'section_id',
'link_label', 'link_location', 'link_domain'];
function send(name, params) {
if (!on()) return;
var d = { event: name, page_type: PAGE };
for (var i = 0; i < KEYS.length; i++) { d[KEYS[i]] = undefined; }
for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) d[k] = params[k]; }
(window.dataLayer = window.dataLayer || []).push(d);
}
function indexOf(el, selector, scope) {
var all = (scope || document).querySelectorAll(selector);
return Array.prototype.indexOf.call(all, el) + 1;
}
var recent = {};
function opened(component, item, position, detail) {
if (!item) return;
var key = component + '|' + item + '|' + (detail || '');
var now = Date.now();
if (recent[key] && now - recent[key] < 1500) return;      // one real choice can be reported by two handlers
recent[key] = now;
var p = { component: component, item: clean(item), position: position };
if (detail) p.detail = clean(detail);
send('content_open', p);
}
function openedIfHeld(stillOpen, component, item, position, detail) {
setTimeout(function () { if (stillOpen()) opened(component, item, position, detail); }, 1000);
}
function sectionId(el) { var s = el.closest && el.closest('section[id]'); return s ? s.id : ''; }
function comp(el, fallback) { return COMPONENT[sectionId(el)] || fallback; }
document.addEventListener('click', function (e) {
if (!on() || !e.isTrusted || !e.target.closest) return;
var t = e.target, el;
el = t.closest('a[href^="mailto:"]');
if (el) {
var href = el.getAttribute('href') || '', label = clean(el.textContent);
var subject = (/[?&]subject=([^&]*)/.exec(href) || [])[1];
subject = subject ? decodeURIComponent(subject).toLowerCase() : '';
var intent = subject.indexOf('brief') >= 0 ? 'brief' : subject.indexOf('scout') >= 0 ? 'scouting' : subject.indexOf('partner') >= 0 ? 'partnership'
: /hold/i.test(label) ? 'hold' : /need|looking/i.test(label) ? 'need' : 'email';
var where = el.closest('#nav-menu') ? 'mobile_menu' : el.closest('.site-header') ? 'header' : el.closest('.hero') ? 'hero'
: el.closest('#ways') ? 'ways' : el.closest('#start') ? 'close' : el.closest('.site-footer') ? 'footer'
: el.closest('.doc') ? 'privacy' : 'page';
send('email_click', { cta_location: where, cta_label: label, intent: intent });
return;
}
el = t.closest('a[href]');
if (el) {
var h = el.getAttribute('href') || '', txt = clean(el.textContent);
if (/^https?:\/\//.test(h) && el.hostname !== location.hostname) {
send('outbound_click', { link_domain: el.hostname, link_label: /linkedin\.com\/company\//.test(h) ? 'linkedin_company'
: /linkedin\.com\/in\//.test(h) ? 'linkedin_founder' : txt });
return;
}
var loc = el.closest('#nav-menu') ? 'mobile_menu' : el.closest('.nav') ? 'header_nav' : el.closest('.site-header') ? 'header_logo'
: el.closest('.site-footer') ? 'footer' : el.closest('.hero') ? 'hero' : '';
if (loc) { send('link_click', { link_label: txt || 'home', link_location: loc }); return; }
}
el = t.closest('.sc__h, .sc__nd');
if (el) {
var k = el.getAttribute('data-k'), box = el.closest('.sc') || el.closest('section'), head = box && box.querySelector('.sc__h[data-k="' + k + '"]');
if (head && head.classList.contains('sel')) opened(comp(el, 'data_type'), head.textContent, (+k || 0) + 1);
return;
}
el = t.closest('.pay__t');
if (el) {
if (el.getAttribute('aria-expanded') === 'true') {
opened(comp(el, 'pay_point'), el.textContent, indexOf(el, '.pay__t', el.closest('section')));
}
return;
}
el = t.closest('.rtab__rt, .rtab__w');
if (el) {
if (el.getAttribute('aria-expanded') === 'true') {
var row = el.closest('.rtab__row'), rt = row && row.querySelector('.rtab__rt'), cell = el.closest('.rtab__cell');
opened('route_row', rt ? rt.textContent : el.textContent, indexOf(row, '.rtab__row'), cell ? cell.getAttribute('data-route') : '');
}
return;
}
el = t.closest('.rtab__all');
if (el) { opened('route_all', el.getAttribute('aria-pressed') === 'true' ? 'expand_all' : 'collapse_all', 0); return; }
el = t.closest('.ways__trig');
if (el) { if (el.getAttribute('aria-expanded') === 'true') opened('brief_checklist', el.textContent, 0); return; }
});   // bubbling, so the page's own handlers have already set what is open
document.addEventListener('change', function (e) {
var r = e.target;
if (!on() || !r.matches || !r.matches('input.dp__in') || !r.checked) return;
var lab = document.querySelector('label[for="' + r.id + '"] .dp__t'), pos = indexOf(r, 'input.dp__in[name="' + r.name + '"]');
var component = comp(r, 'question');
if (e.isTrusted) { opened(component, lab && lab.textContent, pos); return; }
openedIfHeld(function () { return r.checked; }, component, lab && lab.textContent, pos);
}, true);
document.addEventListener('toggle', function (e) {
var d = e.target;
if (!on() || !d.matches) return;
if (d.matches('details.q')) {
var q = d.querySelector('.q__q');
openedIfHeld(function () { return d.open; }, comp(d, 'data_type'), q && q.textContent, indexOf(d, 'details.q', d.parentNode));
} else if (d.id === 'nav-menu' && e.newState === 'open') {
send('menu_open', {});
}
}, true);
var DEPTHS = [25, 50, 75, 90, 100], doneDepth = {}, started = false, ticking = false;
function depth() {
var h = document.documentElement.scrollHeight;
return h ? Math.min(100, Math.round((window.pageYOffset + window.innerHeight) / h * 100)) : 0;
}
function onScroll() {
if (ticking) return;
ticking = true;
requestAnimationFrame(function () {
ticking = false;
if (!on()) return;
var now = depth();
DEPTHS.forEach(function (d) {
if (doneDepth[d] || now < d) return;
doneDepth[d] = true;
if (started) send('scroll_depth', { percent_scrolled: d });   // depths reached before Accept are marked done, never sent
});
started = true;
});
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', onScroll);
var seen = {};
if ('IntersectionObserver' in window) {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
var s = en.target, id = s.id || (s.classList.contains('hero') ? 'hero' : '');
if (!en.isIntersecting || !id || seen[id] || !on()) return;
seen[id] = true;
send('section_view', { section_id: id });
});
}, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
Array.prototype.forEach.call(document.querySelectorAll('main section[id], main section.hero'), function (s) { io.observe(s); });
}
}());
