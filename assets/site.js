/* ==========================================================================
   Valantiq — analytics consent

   Google Analytics sets cookies, so it must not load until a visitor accepts.
   This file handles that.

   TO SWITCH ANALYTICS ON: paste your GA4 Measurement ID between the quotes
   on the GA_ID line below (it looks like G-XXXXXXXXXX). Nothing else to do.

   Google Tag Manager works the same way: set "gtm_container_id" in config.json
   (GTM-XXXXXXX) and the container is loaded here, after Accept and never
   before. It is not pasted into any page's head or body, and its noscript
   iframe is left out on purpose (it would load without any consent). When a
   container is set it replaces the direct GA4 tag: the container carries it.

   While GA_ID and GTM_ID are both empty this file does nothing at all: no
   prompt, no cookies, no request to Google.
   ========================================================================== */
(function () {
  'use strict';

  var GA_ID = '';
  var GTM_ID = 'GTM-WLCNP9V2';
  var GA_OPTOUT = 'G-VWL5HZ8KF7';   // the GA4 id the container's tag carries: Google's own opt-out switch is keyed on it

  var TEXT = {
    prompt: 'We would like to use Google Analytics and Microsoft Clarity cookies to see how this site is used. Nothing is set unless you accept, and you can change your mind at any time.',
    accept: 'Accept',
    decline: 'Decline',
    privacy: 'Privacy Policy'
  };

  var KEY = 'valantiq-analytics';
  var demo = window.VALANTIQ_CONSENT_DEMO === true;   // used only by the design preview
  if (!GA_ID && !GTM_ID && !demo) return;

  function read() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { if (demo) return; try { window.localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if ((!GA_ID && !GTM_ID) || window.__valantiqAnalytics) return;
    window.__valantiqAnalytics = true;
    if (GTM_ID) {                                   // Google's own loader, minus the noscript iframe: the container's tags run now, after consent
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var g = document.createElement('script');
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
      document.head.appendChild(g);
      return;
    }
    window['ga-disable-' + GA_ID] = false;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function stopAnalytics() {
    var optout = GA_ID || GA_OPTOUT;
    if (optout) window['ga-disable-' + optout] = true;
    // Microsoft Clarity (a tag inside the container): its own call erases its cookies, then the page restarts without it
    if (typeof window.clarity === 'function') window.clarity('consent', false);
    var host = window.location.hostname;
    var domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].replace(/^\s+/, '');
      if (name === '_ga' || name === '_gid' || name === '_gat' || name.indexOf('_ga_') === 0 || name === '_clck' || name === '_clsk') {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
    // a container that has already loaded cannot be taken back out of the page: so that nothing more is sent, the page starts again without it
    if (window.__valantiqAnalytics) window.location.reload();
  }

  var bar = null;

  function close() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function open() {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookies');

    var inner = document.createElement('div');
    inner.className = 'consent__inner';

    var p = document.createElement('p');
    p.appendChild(document.createTextNode(TEXT.prompt + ' '));
    var a = document.createElement('a');
    a.className = 'link';
    a.href = '/privacy/';
    a.appendChild(document.createTextNode(TEXT.privacy));
    p.appendChild(a);

    var actions = document.createElement('div');
    actions.className = 'consent__actions';

    // the two choices carry equal weight: same size, same style
    [['accept', 'accepted'], ['decline', 'declined']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--quiet';
      b.appendChild(document.createTextNode(TEXT[pair[0]]));
      b.addEventListener('click', function () {
        write(pair[1]);
        if (pair[1] === 'accepted') { loadAnalytics(); } else { stopAnalytics(); }
        close();
      });
      actions.appendChild(b);
    });

    inner.appendChild(p);
    inner.appendChild(actions);
    bar.appendChild(inner);
    document.body.appendChild(bar);
  }

  function ready(fn) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn); } else { fn(); }
  }

  var choice = demo ? null : read();
  if (choice === 'accepted') { loadAnalytics(); }

  ready(function () {
    if (choice !== 'accepted' && choice !== 'declined') open();

    // "Change your analytics choice" on the privacy page
    var controls = document.querySelectorAll('[data-analytics-choice]');
    Array.prototype.forEach.call(controls, function (el) {
      el.hidden = false;
      el.addEventListener('click', open);
    });
  });
})();
