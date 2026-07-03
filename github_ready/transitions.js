/* ============================================================
   SMOOTH PAGE TRANSITIONS
   This is a normal multi-page static site (no SPA/router) — every
   link still does a full page load. This file just fades the
   current page out for a moment before the browser navigates there,
   and the CSS fades each page in on load, so navigating between
   pages (e.g. catalog -> cart) reads as a soft cross-fade instead
   of an abrupt white-flash reload. Loaded on every page via
   <script src="transitions.js"></script>, before cart.js.
   ============================================================ */
const PAGE_FADE_MS = 320;

// call this instead of setting location.href directly, so the fade-out plays before the browser navigates
function pageGoTo(href){
  document.body.classList.add('page-leaving');
  setTimeout(()=>{ window.location.href = href; }, PAGE_FADE_MS);
}

// intercept normal <a> clicks site-wide so every internal link gets the same fade, with no per-link wiring needed
document.addEventListener('click', function(e){
  const a = e.target.closest('a[href]');
  if (!a) return;
  if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  const href = a.getAttribute('href');
  if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
  if (/^https?:\/\//i.test(href)) return; // leave external links alone
  e.preventDefault();
  pageGoTo(href);
});

// if the page is restored from the back/forward cache mid-fade, make sure it isn't left stuck invisible
window.addEventListener('pageshow', function(){
  document.body.classList.remove('page-leaving');
});
