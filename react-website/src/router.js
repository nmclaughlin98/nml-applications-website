import { useCallback, useEffect, useState } from 'react';

function getLocation() {
  return { pathname: window.location.pathname, search: window.location.search };
}

function isModifiedClick(event) {
  return event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey;
}

/**
 * Minimal client-side router: tracks the current path/query in state and
 * intercepts same-origin link clicks so navigation happens without a full
 * page reload. Falls back to a real navigation for external links, links
 * with target="_blank", or download links.
 */
export function useRouter() {
  const [location, setLocation] = useState(getLocation);

  const navigate = useCallback((href) => {
    const url = new URL(href, window.location.href);

    if (url.origin !== window.location.origin) {
      window.location.href = href;
      return;
    }

    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setLocation({ pathname: url.pathname, search: url.search });
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPopState = () => setLocation(getLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    function onClick(event) {
      if (isModifiedClick(event)) return;

      const anchor = event.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (/^([a-z][a-z0-9+.-]*:)/i.test(href) && !href.startsWith('http')) return; // mailto:, tel:, etc.

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return { ...location, navigate };
}
