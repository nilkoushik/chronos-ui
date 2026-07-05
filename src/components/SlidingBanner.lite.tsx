import { useStore, onMount, onUnMount, useRef, Show, onUpdate } from '@builder.io/mitosis';

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
  animationEffect?: 'slide' | 'fade' | 'zoom' | 'flip' | 'push-up' | 'push-down' | 'push-left' | 'push-right' | 'wipe-left' | 'wipe-right' | 'cube' | 'door' | 'fall' | 'crush' | 'peel-off' | 'curtain';
  backgroundEffect?: 'none' | 'particles' | 'waves';
  hideArrowsIfNoScroll?: boolean;
}

export interface SlidingBannerProps {
  items: WidgetItem[];
  config?: SliderConfig;
  className?: string;
  isLoading?: boolean;
}

export default function SlidingBanner(props: SlidingBannerProps) {
  

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const animContext = useRef({
    intervalId: null as any,
    animationFrameId: null as any,
    resizeHandler: null as any,
    dimResizeHandler: null as any
  });
  
  const state = useStore({
    currentIndex: 0,
    previousIndex: 0,
    direction: 'next' as 'next' | 'prev',
    
    get animationClass() {
      return props.config?.animationEffect || 'slide';
    },
    get backgroundClass() {
      return props.config?.backgroundEffect || 'none';
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
    },
    initCanvasAnimations(canvas: HTMLCanvasElement) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const effect = props.config?.backgroundEffect;
      if (effect !== 'particles' && effect !== 'waves') return;

      const resize = () => {
        if (canvas) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        }
      };
      resize();
      animContext.resizeHandler = resize;
      window.addEventListener('resize', animContext.resizeHandler);

      if (effect === 'particles') {
        const particles: any[] = [];
        for(let i=0; i<70; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * -1 - 0.2,
            opacity: Math.random() * 0.5 + 0.1
          });
        }
        
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
          }
          animContext.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
      } else if (effect === 'waves') {
        let time = 0;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Back wave
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for(let i=0; i<=canvas.width; i+=20) {
            ctx.lineTo(i, canvas.height - 80 + Math.sin(i * 0.005 + time) * 30);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.fill();
          
          // Front wave
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for(let i=0; i<=canvas.width; i+=20) {
            ctx.lineTo(i, canvas.height - 40 + Math.sin(i * 0.008 + time * 1.5) * 20);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.fill();

          time += 0.03;
          animContext.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
      }
    }
  });

  onMount(() => {
    state.startAutoPlay();
    state.setupDimensions();
    animContext.dimResizeHandler = () => state.setupDimensions();
    window.addEventListener('resize', animContext.dimResizeHandler);
    if (canvasRef) {
      state.initCanvasAnimations(canvasRef);
    }
  });

  onUpdate(() => {
    // Cancel the old canvas loop
    if (animContext.animationFrameId) {
      cancelAnimationFrame(animContext.animationFrameId);
      animContext.animationFrameId = null;
    }
    if (animContext.resizeHandler) {
      window.removeEventListener('resize', animContext.resizeHandler);
      animContext.resizeHandler = null;
    }
    // Start a fresh loop on the canvas
    if (canvasRef) {
      state.initCanvasAnimations(canvasRef);
    }
  }, [props.config?.backgroundEffect, canvasRef]);

  onUnMount(() => {
    state.stopAutoPlay();
    if (animContext.animationFrameId) {
      cancelAnimationFrame(animContext.animationFrameId);
    }
    if (animContext.resizeHandler) {
      window.removeEventListener('resize', animContext.resizeHandler);
    }
    if (animContext.dimResizeHandler) {
      window.removeEventListener('resize', animContext.dimResizeHandler);
    }
  });
  return (
    <div 
      ref={rootRef}
      class={`chronos-sliding-banner ${props.className || ''} effect-${state.animationClass} bg-effect-${state.backgroundClass}`}
      onMouseEnter={() => state.stopAutoPlay()}
      onMouseLeave={() => state.startAutoPlay()}
    >
      {(state.backgroundClass === 'particles' || state.backgroundClass === 'waves') && (
        <canvas 
          ref={canvasRef} 
          class="chronos-sliding-banner-canvas"
        ></canvas>
      )}
      
      <div 
        class={`chronos-sliding-banner-track dir-${state.direction}`}
        style={{ transform: `translateX(-${state.currentIndex * 100}%)` }}
      >
        {props.items?.map((item, index) => (
          <div 
            class={`chronos-sliding-slide ${index === state.currentIndex ? 'active' : ''} ${index === state.previousIndex && index !== state.currentIndex ? 'previous' : ''}`} 
            key={item.id || index}
          >
            <Show when={item.media?.type === 'video'}>
              <video 
                src={item.media?.url} 
                autoPlay 
                loop 
                muted 
                playsInline 
                class={`chronos-sliding-bg-video ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Show>
            <Show when={item.media?.type !== 'video'}>
              <div 
                class={`chronos-sliding-bg ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
                style={{ backgroundImage: item.media?.url ? `url(${item.media.url})` : 'none' }}
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
              <Show when={props.isLoading}>
                <div class="chronos-skeleton-title chronos-image-shimmer" style={{ width: '50%', height: '32px', marginBottom: '16px' }} />
                <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '70%', height: '16px', marginBottom: '10px' }} />
                <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '40%', height: '16px', marginBottom: '24px' }} />
                <div class="chronos-skeleton-button chronos-image-shimmer" style={{ width: '130px', height: '40px' }} />
              </Show>
              <Show when={!props.isLoading}>
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
          <button class="chronos-sliding-arrow prev" onClick={() => state.prev()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button class="chronos-sliding-arrow next" onClick={() => state.next()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {props.config?.showDots && (
        <div class="chronos-sliding-dots">
          {props.items?.map((_, index) => (
            <button 
              key={index}
              class={`chronos-sliding-dot ${index === state.currentIndex ? 'active' : ''}`}
              onClick={() => state.goTo(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
