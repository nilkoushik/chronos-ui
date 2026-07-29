import { useStore, useRef, onMount, onUnMount, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';

export interface BannerMedia {
  type?: string;
  url?: string;
  settings?: any;
}

export interface MapLink {
  label?: string;
  url?: string;
}

export interface WidgetItem {
  id?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  textAlignment?: 'left' | 'center' | 'right';
  media?: BannerMedia;
  mapLinks?: MapLink[];
}

export interface AlternatingConfig {
  columns: number;
  autoStart: boolean;
  delayMs: number;
  showArrows: boolean;
  showDots: boolean;
  hideArrowsIfNoScroll?: boolean;
  height?: string;
  minHeight?: string;
  bgPosition?: string;
}

export interface AlternatingSliderProps {
  items: WidgetItem[];
  config?: AlternatingConfig;
  className?: string;
  isLoading?: boolean;
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function AlternatingSlider(props: AlternatingSliderProps) {

  const rootRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    currentIndex: 0,
    intervalId: null as any,
    isVisible: false,

    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
    },
    get columns() {
      return props.config?.columns || 2;
    },

    // We group items into sets, each set has length = columns
    get slideSets() {
      const sets: WidgetItem[][] = [];
      const currentItems = props.items || [];
      const cols = state.columns;
      for (let i = 0; i < currentItems.length; i += cols) {
        sets.push(currentItems.slice(i, i + cols));
      }
      return sets;
    },

    get totalSlides() {
      return state.slideSets.length;
    },

    next() {
      if (state.totalSlides <= 1) return;
      state.currentIndex = (state.currentIndex + 1) % state.totalSlides;
    },
    prev() {
      if (state.totalSlides <= 1) return;
      state.currentIndex = (state.currentIndex - 1 + state.totalSlides) % state.totalSlides;
    },
    goTo(index: number) {
      state.currentIndex = index;
    },
    startAutoPlay() {
      if (props.config?.autoStart !== false && state.totalSlides > 1) {
        state.intervalId = setInterval(() => {
          state.next();
        }, props.config?.delayMs || 5000);
      }
    },
    stopAutoPlay() {
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }
    }
  });

  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  onMount(() => {
    if (props.lazyLoad === false) {
      state.isVisible = true;
      state.startAutoPlay();
      return;
    }
    if (rootRef) {
      observerBox.disconnect = observeLazyMount(
        rootRef,
        () => { state.isVisible = true; state.startAutoPlay(); },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  onUnMount(() => {
    state.stopAutoPlay();
    if (observerBox.disconnect) observerBox.disconnect();
  });
  return (
    <div
      ref={rootRef}
      class={`contentvidya-alt-slider ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''} ${props.className || ''}`}
      onMouseEnter={() => state.stopAutoPlay()}
      onMouseLeave={() => state.startAutoPlay()}
      role="region"
      style={{
        height: props.config?.height || '',
        minHeight: props.config?.height === 'auto' ? 'auto' : (props.config?.minHeight || '')
      }}
    >
      <Show when={props.config?.height === 'auto' && props.items?.[0]?.media?.url}>
        <img
          src={props.items[0].media.url}
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block', visibility: 'hidden', pointerEvents: 'none' }}
        />
      </Show>

      <div
        class="contentvidya-alt-cols-container"
        style={{
          gridTemplateColumns: `repeat(${state.columns}, 1fr)`,
          position: props.config?.height === 'auto' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {Array.from({ length: state.columns }).map((_, colIndex) => (
          <div class="contentvidya-alt-col" key={`col-${colIndex}`}>
            <div
              class="contentvidya-alt-track"
              style={{ transform: `translateY(${colIndex % 2 === 0 ? -state.currentIndex * 100 : state.currentIndex * 100}%)` }}
            >
              {state.slideSets.map((slideRow, slideIndex) => (
                <div
                  class="contentvidya-alt-cell"
                  key={`cell-${slideIndex}-${colIndex}`}
                  style={{ top: `${colIndex % 2 === 0 ? slideIndex * 100 : -slideIndex * 100}%` }}
                >
                  <Show when={slideRow[colIndex]}>
                    <Show when={slideRow[colIndex].mapLinks?.[0]?.url}>
                      <a class="contentvidya-alt-content-wrap" href={slideRow[colIndex].mapLinks[0].url} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        <Show when={state.shouldMount && slideRow[colIndex].media?.type === 'video'}>
                          <video
                            src={slideRow[colIndex].media?.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            class={`contentvidya-alt-bg-video ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Show>
                        <Show when={state.shouldMount && slideRow[colIndex].media?.type !== 'video'}>
                          <div
                            style={{
                              backgroundImage: slideRow[colIndex].media?.url ? `url(${slideRow[colIndex].media.url})` : 'none',
                              backgroundPosition: props.config?.bgPosition || 'center'
                            }}
                            class={`contentvidya-alt-bg ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''}`}
                          />
                        </Show>
                        <div class="contentvidya-alt-overlay" />
                        <div
                          class="contentvidya-alt-content"
                          style={{
                            textAlign: slideRow[colIndex].textAlignment || 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: (slideRow[colIndex].textAlignment || 'left') === 'center' ? 'center' : (slideRow[colIndex].textAlignment || 'left') === 'right' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <Show when={state.showSkeleton}>
                            <div class="contentvidya-skeleton-title contentvidya-image-shimmer" style={{ width: '60%', height: '24px', marginBottom: '12px' }} />
                            <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
                            <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '50%', height: '14px', marginBottom: '16px' }} />
                            <div class="contentvidya-skeleton-button contentvidya-image-shimmer" style={{ width: '110px', height: '36px' }} />
                          </Show>
                          <Show when={!state.showSkeleton}>
                            <h2 class="contentvidya-alt-title">{slideRow[colIndex].title}</h2>
                            <Show when={slideRow[colIndex].subtitle}>
                              <p class="contentvidya-alt-subtitle">{slideRow[colIndex].subtitle}</p>
                            </Show>
                            <Show when={slideRow[colIndex].ctaText}>
                              <span class="contentvidya-alt-cta">{slideRow[colIndex].ctaText}</span>
                            </Show>
                          </Show>
                        </div>
                      </a>
                    </Show>
                    <Show when={!slideRow[colIndex].mapLinks?.[0]?.url}>
                      <div class="contentvidya-alt-content-wrap">
                        <Show when={state.shouldMount && slideRow[colIndex].media?.type === 'video'}>
                          <video
                            src={slideRow[colIndex].media?.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            class={`contentvidya-alt-bg-video ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Show>
                        <Show when={state.shouldMount && slideRow[colIndex].media?.type !== 'video'}>
                          <div
                            style={{
                              backgroundImage: slideRow[colIndex].media?.url ? `url(${slideRow[colIndex].media.url})` : 'none',
                              backgroundPosition: props.config?.bgPosition || 'center'
                            }}
                            class={`contentvidya-alt-bg ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''}`}
                          />
                        </Show>
                        <div class="contentvidya-alt-overlay" />
                        <div
                          class="contentvidya-alt-content"
                          style={{
                            textAlign: slideRow[colIndex].textAlignment || 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: (slideRow[colIndex].textAlignment || 'left') === 'center' ? 'center' : (slideRow[colIndex].textAlignment || 'left') === 'right' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <Show when={state.showSkeleton}>
                            <div class="contentvidya-skeleton-title contentvidya-image-shimmer" style={{ width: '60%', height: '24px', marginBottom: '12px' }} />
                            <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
                            <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '50%', height: '14px', marginBottom: '16px' }} />
                            <div class="contentvidya-skeleton-button contentvidya-image-shimmer" style={{ width: '110px', height: '36px' }} />
                          </Show>
                          <Show when={!state.showSkeleton}>
                            <h2 class="contentvidya-alt-title">{slideRow[colIndex].title}</h2>
                            <Show when={slideRow[colIndex].subtitle}>
                              <p class="contentvidya-alt-subtitle">{slideRow[colIndex].subtitle}</p>
                            </Show>
                            <Show when={slideRow[colIndex].ctaText}>
                              <span class="contentvidya-alt-cta">{slideRow[colIndex].ctaText}</span>
                            </Show>
                          </Show>
                        </div>
                      </div>
                    </Show>
                  </Show>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(props.config?.showArrows &&
        (!props.config?.hideArrowsIfNoScroll || state.slideSets.length > 1)) && (
        <>
          <button class="contentvidya-alt-arrow prev" aria-label="Previous" onClick={() => state.prev()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button class="contentvidya-alt-arrow next" aria-label="Next" onClick={() => state.next()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {props.config?.showDots && (
        <div class="contentvidya-alt-dots">
          {state.slideSets.map((_, index) => (
            <button
              key={`dot-${index}`}
              class={`contentvidya-alt-dot ${index === state.currentIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => state.goTo(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
