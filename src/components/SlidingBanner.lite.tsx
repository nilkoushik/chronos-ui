import { useStore, onMount, onUnMount, useRef, Show, onUpdate } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';
import { startBackgroundEffect, stopBackgroundEffect, BackgroundEffectContext, BackgroundEffectName } from '../utils/backgroundEffects';

export interface BannerMedia {
  type?: 'image' | 'video' | string;
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

export interface SliderConfig {
  autoStart: boolean;
  rotateAgain: boolean;
  delayMs: number;
  showNextPrev: boolean;
  showArrows?: boolean;
  showDots: boolean;
  animationEffect?: 'slide' | 'fade' | 'zoom' | 'flip' | 'push' | 'push-up' | 'push-down' | 'push-left' | 'push-right' | 'wipe-left' | 'wipe-right' | 'cube' | 'door' | 'fall' | 'crush' | 'peel-off' | 'curtain';
  animationQuality?: 'light' | 'detailed';
  backgroundEffect?: BackgroundEffectName;
  hideArrowsIfNoScroll?: boolean;
  height?: string;
  minHeight?: string;
  bgPosition?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SlidingBannerProps {
  items: WidgetItem[];
  config?: SliderConfig;
  className?: string;
  isLoading?: boolean;
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function SlidingBanner(props: SlidingBannerProps) {
  

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const animContext = useRef({
    intervalId: null as any,
    dimResizeHandler: null as any
  });
  const bgEffectContext = useRef<BackgroundEffectContext>({ animationFrameId: null, resizeHandler: null });
  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  const state = useStore({
    currentIndex: 0,
    previousIndex: 0,
    direction: 'next' as 'next' | 'prev',
    isVisible: false,

    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
    },
    get animationClass() {
      return props.config?.animationEffect || 'slide';
    },
    get backgroundClass() {
      return props.config?.backgroundEffect || 'none';
    },
    get qualityClass() {
      return props.config?.animationQuality || 'detailed';
    },
    next() {
      if (!props.items?.length) return;
      state.direction = 'next';
      state.previousIndex = state.currentIndex;
      if (state.currentIndex >= props.items.length - 1) {
        if (props.config?.rotateAgain !== false) {
          state.currentIndex = 0;
        }
      } else {
        state.currentIndex++;
      }
    },
    prev() {
      if (!props.items?.length) return;
      state.direction = 'prev';
      state.previousIndex = state.currentIndex;
      if (state.currentIndex <= 0) {
        if (props.config?.rotateAgain !== false) {
          state.currentIndex = props.items.length - 1;
        }
      } else {
        state.currentIndex--;
      }
    },
    goTo(index: number) {
      if (state.currentIndex !== index) {
        state.direction = index > state.currentIndex ? 'next' : 'prev';
        state.previousIndex = state.currentIndex;
        state.currentIndex = index;
      }
    },
    startAutoPlay() {
      if (props.config?.autoStart !== false && props.items?.length > 1) {
        animContext.intervalId = setInterval(() => {
          state.next();
        }, props.config?.delayMs || 5000);
      }
    },
    stopAutoPlay() {
      if (animContext.intervalId) {
        clearInterval(animContext.intervalId);
      }
    },
    setupDimensions() {
      if (rootRef) {
        rootRef.style.setProperty('--slider-half-width', `${rootRef.offsetWidth / 2}px`);
      }
    }
  });

  function mountHeavyContent() {
    state.startAutoPlay();
    state.setupDimensions();
    animContext.dimResizeHandler = () => state.setupDimensions();
    window.addEventListener('resize', animContext.dimResizeHandler);
    if (canvasRef) {
      startBackgroundEffect(canvasRef, state.backgroundClass as BackgroundEffectName, bgEffectContext);
    }
  }

  onMount(() => {
    if (props.lazyLoad === false) {
      state.isVisible = true;
      mountHeavyContent();
      return;
    }
    if (rootRef) {
      observerBox.disconnect = observeLazyMount(
        rootRef,
        () => { state.isVisible = true; mountHeavyContent(); },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  // Only restart once the widget has actually mounted its heavy content, and
  // only when the effect name itself changed (state.backgroundClass is a
  // stable derived string) — not on every unrelated re-render such as a
  // slide index change, which would otherwise tear down and restart the
  // canvas loop on every click and make the effect look like it's
  // stuttering/never settling.
  onUpdate(() => {
    if (state.isVisible && canvasRef) {
      startBackgroundEffect(canvasRef, state.backgroundClass as BackgroundEffectName, bgEffectContext);
    }
  }, [state.backgroundClass, canvasRef]);

  onUnMount(() => {
    state.stopAutoPlay();
    stopBackgroundEffect(bgEffectContext);
    if (animContext.dimResizeHandler) {
      window.removeEventListener('resize', animContext.dimResizeHandler);
    }
    if (observerBox.disconnect) observerBox.disconnect();
  });
  return (
    <div
      ref={rootRef}
      class={`chronos-sliding-banner ${state.showSkeleton ? 'chronos-image-shimmer' : ''} ${props.className || ''} effect-${state.animationClass} bg-effect-${state.backgroundClass} quality-${state.qualityClass}`}
      onMouseEnter={() => state.stopAutoPlay()}
      onMouseLeave={() => state.startAutoPlay()}
      role="region"
      style={{
        height: props.config?.height || '',
        minHeight: props.config?.height === 'auto' ? 'auto' : (props.config?.minHeight || '')
      }}
    >
      {state.backgroundClass !== 'none' && (
        <canvas
          ref={canvasRef}
          class="chronos-sliding-banner-canvas"
        ></canvas>
      )}
      
      <Show when={props.config?.height === 'auto' && props.items?.[0]?.media?.url}>
        <img 
          src={props.items[0].media.url} 
          alt="" 
          style={{ width: '100%', height: 'auto', display: 'block', visibility: 'hidden', pointerEvents: 'none' }} 
        />
      </Show>

      <div 
        class={`chronos-sliding-banner-track dir-${state.direction}`}
        style={{ 
          transform: `translateX(-${state.currentIndex * 100}%)`,
          position: props.config?.height === 'auto' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {props.items?.map((item, index) => (
          <div 
            class={`chronos-sliding-slide ${index === state.currentIndex ? 'active' : ''} ${index === state.previousIndex && index !== state.currentIndex ? 'previous' : ''}`} 
            key={item.id || index}
          >
            <Show when={state.shouldMount && item.media?.type === 'video'}>
              <video 
                src={item.media?.url} 
                autoPlay 
                loop 
                muted 
                playsInline 
                class={`chronos-sliding-bg-video ${state.showSkeleton ? 'chronos-image-shimmer' : ''}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Show>
            <Show when={state.shouldMount && item.media?.type !== 'video'}>
              <div 
                class={`chronos-sliding-bg ${state.showSkeleton ? 'chronos-image-shimmer' : ''}`}
                style={{ 
                  backgroundImage: item.media?.url ? `url(${item.media.url})` : 'none',
                  backgroundPosition: props.config?.bgPosition || 'center'
                }}
              ></div>
            </Show>
            <div class="chronos-sliding-overlay"></div>
            <div 
              class="chronos-sliding-content" 
              style={{ 
                textAlign: item.textAlignment || props.config?.align || 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: (item.textAlignment || props.config?.align || 'center') === 'center' ? 'center' : (item.textAlignment || props.config?.align || 'center') === 'right' ? 'flex-end' : 'flex-start'
              }}
            >
              <Show when={state.showSkeleton}>
                <div class="chronos-skeleton-title chronos-image-shimmer" style={{ width: '50%', height: '32px', marginBottom: '16px' }} />
                <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '70%', height: '16px', marginBottom: '10px' }} />
                <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '40%', height: '16px', marginBottom: '24px' }} />
                <div class="chronos-skeleton-button chronos-image-shimmer" style={{ width: '130px', height: '40px' }} />
              </Show>
              <Show when={!state.showSkeleton}>
                <h2 class="chronos-sliding-title">{item.title}</h2>
                {item.subtitle && <p class="chronos-sliding-subtitle">{item.subtitle}</p>}
                {item.ctaText && (
                  <a href={item.mapLinks?.[0]?.url || '#'} class="chronos-sliding-cta">
                    {item.ctaText}
                  </a>
                )}
              </Show>
            </div>
          </div>
        ))}
      </div>

      {((props.config?.showArrows || props.config?.showNextPrev) && 
        (!props.config?.hideArrowsIfNoScroll || (props.items && props.items.length > 1))) && (
        <>
          <button type="button" class="chronos-sliding-arrow prev" aria-label="Previous" onClick={() => state.prev()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button type="button" class="chronos-sliding-arrow next" aria-label="Next" onClick={() => state.next()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {props.config?.showDots && (
        <div class="chronos-sliding-dots">
          {props.items?.map((_, index) => (
            <button
              type="button"
              key={index}
              class={`chronos-sliding-dot ${index === state.currentIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => state.goTo(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
