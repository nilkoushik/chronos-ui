import { useStore, useRef, onMount, onUnMount, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';

export interface RowScrollableItem {
  id: string;
  title?: string;
  subtitle?: string;
  media?: { type: 'image' | 'video'; url: string };
  mapLinks?: { url: string }[];
}

export interface RowScrollableConfig {
  showArrows?: boolean;
  hideArrowsIfNoScroll?: boolean;
  hideScrollbar?: boolean;
}

export interface RowScrollableProps {
  items: RowScrollableItem[];
  title?: string;
  className?: string;
  config?: RowScrollableConfig;
  isLoading?: boolean;
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function RowScrollable(props: RowScrollableProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    canScrollLeft: false,
    canScrollRight: false,
    isVisible: false,

    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
    },

    checkScroll() {
      const el = rowRef;
      if (el) {
        state.canScrollLeft = el.scrollLeft > 5;
        state.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 5;
      }
    },

    scroll(direction: 'left' | 'right') {
      const el = rowRef;
      if (el) {
        const scrollAmount = 300;
        el.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  });

  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  onMount(() => {
    const el = rowRef;
    if (el) {
      el.addEventListener('scroll', state.checkScroll);
      // Allow DOM to render then check
      setTimeout(() => {
        state.checkScroll();
      }, 150);
    }
    window.addEventListener('resize', state.checkScroll);

    if (props.lazyLoad === false) {
      state.isVisible = true;
      return;
    }
    if (containerRef) {
      observerBox.disconnect = observeLazyMount(
        containerRef,
        () => { state.isVisible = true; },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  onUnMount(() => {
    const el = rowRef;
    if (el) {
      el.removeEventListener('scroll', state.checkScroll);
    }
    window.removeEventListener('resize', state.checkScroll);
    if (observerBox.disconnect) observerBox.disconnect();
  });

  return (
    <div ref={containerRef} class={`chronos-scrollable-container ${props.className || ''}`}>
      {props.title && <h3 class="chronos-scrollable-title">{props.title}</h3>}

      <div class="chronos-scrollable-wrapper" style={{ position: 'relative' }}>
        <div
          ref={rowRef}
          class={`chronos-scrollable-row ${props.config?.hideScrollbar ? 'chronos-scrollable-hide-scrollbar' : ''}`}
        >
          {props.items?.map((item) => (
            <a
              href={item.mapLinks?.[0]?.url || '#'}
              class={`chronos-scrollable-card ${state.showSkeleton ? 'chronos-image-shimmer' : ''}`}
              key={item.id}
            >
              <Show when={!state.showSkeleton}>
                {item.media?.url && (
                  <div class="chronos-scrollable-img-wrap">
                    <Show when={item.media?.type === 'video'}>
                      <video src={item.media?.url} autoPlay loop muted playsInline class="chronos-scrollable-img" />
                    </Show>
                    <Show when={item.media?.type !== 'video'}>
                      <img src={item.media?.url} alt={item.title || ''} class="chronos-scrollable-img" />
                    </Show>
                  </div>
                )}
                <div class="chronos-scrollable-body">
                  {item.title && <div class="chronos-scrollable-card-title">{item.title}</div>}
                  {item.subtitle && <div class="chronos-scrollable-card-sub">{item.subtitle}</div>}
                </div>
              </Show>
            </a>
          ))}
        </div>

        {props.config?.showArrows !== false && (
          <>
            <Show when={!props.config?.hideArrowsIfNoScroll || state.canScrollLeft}>
              <button
                class="chronos-scrollable-arrow prev"
                aria-label="Previous"
                onClick={() => state.scroll('left')}
                style={{
                  opacity: !state.canScrollLeft ? '0.35' : '1',
                  pointerEvents: !state.canScrollLeft ? 'none' : 'auto'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
            </Show>
            <Show when={!props.config?.hideArrowsIfNoScroll || state.canScrollRight}>
              <button
                class="chronos-scrollable-arrow next"
                aria-label="Next"
                onClick={() => state.scroll('right')}
                style={{
                  opacity: !state.canScrollRight ? '0.35' : '1',
                  pointerEvents: !state.canScrollRight ? 'none' : 'auto'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </Show>
          </>
        )}
      </div>
    </div>
  );
}
