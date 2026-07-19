// Shared IntersectionObserver registry used by chronos-ui widgets for lazy/deferred
// mounting. Widgets on the same page that request the same threshold+rootMargin share
// a single IntersectionObserver instance instead of each creating their own.

type LazyCallback = () => void;

interface ObserverEntry {
  observer: IntersectionObserver;
  callbacks: WeakMap<Element, LazyCallback>;
}

const registry = new Map<string, ObserverEntry>();

function keyFor(threshold: number, rootMargin: string): string {
  return `${threshold}|${rootMargin}`;
}

function getOrCreateObserver(threshold: number, rootMargin: string): ObserverEntry {
  const key = keyFor(threshold, rootMargin);
  let entry = registry.get(key);
  if (!entry) {
    const callbacks = new WeakMap<Element, LazyCallback>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const observerEntry of entries) {
          if (observerEntry.isIntersecting) {
            const cb = callbacks.get(observerEntry.target);
            if (cb) {
              cb();
              observer.unobserve(observerEntry.target);
              callbacks.delete(observerEntry.target);
            }
          }
        }
      },
      { threshold, rootMargin }
    );
    entry = { observer, callbacks };
    registry.set(key, entry);
  }
  return entry;
}

// Observes `el` and invokes `onVisible` once, the first time it crosses `threshold`
// (with `rootMargin` applied), then automatically stops observing it.
export function observeLazyMount(
  el: Element,
  onVisible: LazyCallback,
  threshold = 0.1,
  rootMargin = "200px"
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    // No IO support (e.g. SSR/old browser) — mount immediately, real fallback not a suppression.
    onVisible();
    return () => {};
  }
  const entry = getOrCreateObserver(threshold, rootMargin);
  entry.callbacks.set(el, onVisible);
  entry.observer.observe(el);
  return () => {
    entry.observer.unobserve(el);
    entry.callbacks.delete(el);
  };
}
