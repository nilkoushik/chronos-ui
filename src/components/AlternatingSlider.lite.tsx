import { useStore, onMount, onUnMount, useStyle } from '@builder.io/mitosis';

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
}

export interface AlternatingSliderProps {
  items: WidgetItem[];
  config?: AlternatingConfig;
  className?: string;
  isLoading?: boolean;
}

export default function AlternatingSlider(props: AlternatingSliderProps) {
  useStyle(`.chronos-alt-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 600px;
  background: var(--chronos-color-surface);
  border-radius: var(--chronos-border-radius-lg);
  overflow: hidden;
  position: relative;
  border: var(--chronos-border-width) solid var(--chronos-color-border);
}
.chronos-alt-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.chronos-alt-slide {
  flex: 0 0 100%;
  display: flex;
  flex-direction: row;
  height: 100%;
}
.chronos-alt-slide-reverse {
  flex-direction: row-reverse;
}
.chronos-alt-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: var(--chronos-color-background);
}
.chronos-alt-image-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.chronos-alt-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.chronos-alt-image-container:hover .chronos-alt-image {
  transform: scale(1.05);
}
.chronos-alt-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--chronos-color-text-main);
}
.chronos-alt-desc {
  font-size: 1.125rem;
  color: var(--chronos-color-text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}
.chronos-alt-cta {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: var(--chronos-color-primary);
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: var(--chronos-border-radius-sm);
  transition: background 0.3s;
}
.chronos-alt-cta:hover {
  background: var(--chronos-color-secondary);
}


`);

  const state = useStore({
    currentIndex: 0,
    intervalId: null as any,
    
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

  onMount(() => {
    state.startAutoPlay();
  });

  onUnMount(() => {
    state.stopAutoPlay();
  });
  return (
    <div 
      class={`chronos-alt-slider ${props.className || ''}`}
      onMouseEnter={() => state.stopAutoPlay()}
      onMouseLeave={() => state.startAutoPlay()}
    >
      <div class="chronos-alt-cols-container" style={{ gridTemplateColumns: `repeat(${state.columns}, 1fr)` }}>
        {Array.from({ length: state.columns }).map((_, colIndex) => (
          <div class="chronos-alt-col" key={`col-${colIndex}`}>
            <div 
              class="chronos-alt-track" 
              style={{ transform: `translateY(${colIndex % 2 === 0 ? -state.currentIndex * 100 : state.currentIndex * 100}%)` }}
            >
              {state.slideSets.map((slideRow, slideIndex) => (
                <div 
                  class="chronos-alt-cell" 
                  key={`cell-${slideIndex}-${colIndex}`}
                  style={{ top: `${colIndex % 2 === 0 ? slideIndex * 100 : -slideIndex * 100}%` }}
                >
                  <Show when={slideRow[colIndex]}>
                    {slideRow[colIndex].mapLinks?.[0]?.url ? (
                      <a class="chronos-alt-content-wrap" href={slideRow[colIndex].mapLinks[0].url} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        <Show when={slideRow[colIndex].media?.type === 'video'}>
                          <video 
                            src={slideRow[colIndex].media?.url} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            class={`chronos-alt-bg-video ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Show>
                        <Show when={slideRow[colIndex].media?.type !== 'video'}>
                          <div
                            style={{
                              backgroundImage: slideRow[colIndex].media?.url ? `url(${slideRow[colIndex].media.url})` : 'none'
                            }}
                            class={`chronos-alt-bg ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                          />
                        </Show>
                        <div class="chronos-alt-overlay" />
                        <div class="chronos-alt-content" style={{ textAlign: slideRow[colIndex].textAlignment || 'left' }}>
                          <h2 class="chronos-alt-title">{slideRow[colIndex].title}</h2>
                          <Show when={slideRow[colIndex].subtitle}>
                            <p class="chronos-alt-subtitle">{slideRow[colIndex].subtitle}</p>
                          </Show>
                          <Show when={slideRow[colIndex].ctaText}>
                            <span class="chronos-alt-cta">{slideRow[colIndex].ctaText}</span>
                          </Show>
                        </div>
                      </a>
                    ) : (
                      <div class="chronos-alt-content-wrap">
                        <Show when={slideRow[colIndex].media?.type === 'video'}>
                          <video 
                            src={slideRow[colIndex].media?.url} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            class={`chronos-alt-bg-video ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Show>
                        <Show when={slideRow[colIndex].media?.type !== 'video'}>
                          <div
                            style={{
                              backgroundImage: slideRow[colIndex].media?.url ? `url(${slideRow[colIndex].media.url})` : 'none'
                            }}
                            class={`chronos-alt-bg ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                          />
                        </Show>
                        <div class="chronos-alt-overlay" />
                        <div class="chronos-alt-content" style={{ textAlign: slideRow[colIndex].textAlignment || 'left' }}>
                          <h2 class="chronos-alt-title">{slideRow[colIndex].title}</h2>
                          <Show when={slideRow[colIndex].subtitle}>
                            <p class="chronos-alt-subtitle">{slideRow[colIndex].subtitle}</p>
                          </Show>
                          <Show when={slideRow[colIndex].ctaText}>
                            <span class="chronos-alt-cta">{slideRow[colIndex].ctaText}</span>
                          </Show>
                        </div>
                      </div>
                    )}
                  </Show>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {props.config?.showArrows && (
        <>
          <button class="chronos-alt-arrow prev" onClick={() => state.prev()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button class="chronos-alt-arrow next" onClick={() => state.next()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {props.config?.showDots && (
        <div class="chronos-alt-dots">
          {state.slideSets.map((_, index) => (
            <button 
              key={`dot-${index}`}
              class={`chronos-alt-dot ${index === state.currentIndex ? 'active' : ''}`}
              onClick={() => state.goTo(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
