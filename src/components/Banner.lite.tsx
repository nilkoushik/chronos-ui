import { useStore, useRef, onMount, onUnMount, onUpdate, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';
import { defaultBackgroundEffectPlugin } from '../utils/backgroundEffects';
import type { BackgroundEffectContext, BackgroundEffectName, BackgroundEffectPlugin } from '../utils/backgroundEffects';

export interface BannerMedia {
  type?: 'image' | 'video' | string;
  url?: string;
  settings?: any;
}

export interface MapLink {
  label?: string;
  url?: string;
}

export interface BannerConfig {
  align?: 'left' | 'center' | 'right';
  textAlignment?: 'left' | 'center' | 'right';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | string;
  bgGradient?: string;
  autoplay?: boolean;
  height?: string;
  minHeight?: string;
  bgPosition?: string;
  hotspotMinTargetSize?: number;
  backgroundEffect?: BackgroundEffectName;
  backgroundEffectPlugin?: BackgroundEffectPlugin;
}

export type HotspotShape = 'rect' | 'oval' | 'polygon';
export interface HotspotCoords { x: number; y: number; width: number; height: number; }
export interface HotspotPoint { x: number; y: number; }
export interface HotspotAction { type: 'link' | 'deeplink'; url: string; deeplink?: string; }
export interface Hotspot {
  id: string;
  label?: string;
  altText: string;
  shape: HotspotShape;
  coords: HotspotCoords;
  points?: HotspotPoint[];
  action: HotspotAction;
  showTooltip?: boolean;
  pulse?: boolean;
}

export interface BannerProps {
  id?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  media?: BannerMedia;
  mapLinks?: MapLink[];
  textAlignment?: 'left' | 'center' | 'right';
  className?: string;
  isLoading?: boolean;
  align?: 'left' | 'center' | 'right';
  backgroundImageUrl?: string;
  ctaLink?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl' | string;
  bgGradient?: string;
  config?: BannerConfig;
  hotspots?: Hotspot[];
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function Banner(props: BannerProps) {

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animContext = useRef<BackgroundEffectContext>({ animationFrameId: null, resizeHandler: null });

  const state = useStore({
    isVisible: false,

    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
    },
    get alignment() {
      return props.textAlignment || props.align || props.config?.textAlignment || props.config?.align || 'center';
    },
    get hasVideo() {
      return props.media?.type === 'video' || (props.backgroundImageUrl && props.backgroundImageUrl.endsWith('.mp4')) || (props.media?.url && props.media.url.endsWith('.mp4'));
    },
    get videoUrl() {
      return props.media?.url || props.backgroundImageUrl || '';
    },
    get imageUrl() {
      return props.media?.url || props.backgroundImageUrl || '';
    },
    get linkUrl() {
      return props.mapLinks?.[0]?.url || props.ctaLink || '#';
    },
    get gradientOverlay() {
      return props.config?.bgGradient || props.bgGradient || '';
    },
    get paddingValue() {
      const p = props.config?.padding || props.padding;
      if (p === 'sm') return 'var(--chronos-spacing-sm)';
      if (p === 'md') return 'var(--chronos-spacing-md)';
      if (p === 'lg') return 'var(--chronos-spacing-lg)';
      if (p === 'xl') return 'var(--chronos-spacing-xl)';
      return p || '';
    },
    get backgroundPosition() {
      return props.config?.bgPosition || '';
    },
    get minHeightValue() {
      if (props.config?.height === 'auto') return 'auto';
      return props.config?.minHeight || props.config?.height || '300px';
    },
    get hotspotMinTarget() {
      return props.config?.hotspotMinTargetSize ?? 24;
    },
    get backgroundEffectClass() {
      return props.config?.backgroundEffect || 'none';
    },
    get plugin() {
      return props.config?.backgroundEffectPlugin || defaultBackgroundEffectPlugin;
    },
    hotspotHref(h: Hotspot) {
      return h.action?.type === 'deeplink' ? (h.action.deeplink || h.action.url || '#') : (h.action?.url || '#');
    },
    hotspotLabel(h: Hotspot) {
      return h.altText || h.label || 'Hotspot link';
    },
    // SVG points string for polygon shapes, in the shared 0-100 viewBox space.
    hotspotPolygonPoints(h: Hotspot) {
      if (!h.points?.length) return '';
      return h.points.map((p) => `${p.x},${p.y}`).join(' ');
    },
    // Center of the shape's bounding box (0-100 space) — used to anchor the
    // real interactive <a> so it can be enlarged to the minimum target size
    // without shifting off the visual shape.
    hotspotCenter(h: Hotspot) {
      return {
        x: h.coords.x + h.coords.width / 2,
        y: h.coords.y + h.coords.height / 2
      };
    },
    // The interactive hit-target, positioned by its center and sized with a
    // CSS min-width/min-height floor (independent of the % based visual
    // shape) so it always satisfies WCAG 2.5.8 (24x24 CSS px minimum),
    // even when the authored hotspot is drawn smaller than that.
    hotspotHitStyle(h: Hotspot) {
      const c = state.hotspotCenter(h);
      return {
        position: 'absolute',
        left: `${c.x}%`,
        top: `${c.y}%`,
        width: `${h.coords.width}%`,
        height: `${h.coords.height}%`,
        minWidth: `${state.hotspotMinTarget}px`,
        minHeight: `${state.hotspotMinTarget}px`,
        transform: 'translate(-50%, -50%)'
      };
    }
  });

  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  onMount(() => {
    if (props.lazyLoad === false) {
      state.isVisible = true;
      if (canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
      return;
    }
    if (rootRef) {
      observerBox.disconnect = observeLazyMount(
        rootRef,
        () => {
          state.isVisible = true;
          if (canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
        },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  // Only restart the canvas loop when the effect name itself changes (a
  // stable derived string), not on every unrelated re-render — e.g. toggling
  // isLoading or hotspot state shouldn't tear down and restart the animation.
  onUpdate(() => {
    if (state.isVisible && canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
  }, [state.backgroundEffectClass, canvasRef]);

  onUnMount(() => {
    if (observerBox.disconnect) observerBox.disconnect();
    state.plugin.stop(animContext);
  });

  return (
    <div
      ref={rootRef}
      class={`chronos-banner ${state.showSkeleton ? 'chronos-image-shimmer' : ''} ${props.className || ''}`}
      style={{
        backgroundImage: state.shouldMount && !props.isLoading && !state.hasVideo && state.imageUrl && props.config?.height !== 'auto' ? `url(${state.imageUrl})` : 'none',
        textAlign: state.alignment,
        backgroundPosition: state.backgroundPosition || 'center',
        minHeight: state.minHeightValue || '',
        height: props.config?.height || ''
      }}
    >
      <Show when={state.shouldMount && !props.isLoading && state.hasVideo}>
        <video
          src={state.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      </Show>
      <Show when={state.shouldMount && !props.isLoading && !state.hasVideo && state.imageUrl && props.config?.height === 'auto'}>
        <img
          src={state.imageUrl}
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block', zIndex: 0, objectFit: 'cover', objectPosition: state.backgroundPosition || 'center' }}
        />
      </Show>

      <Show when={!!props.config?.backgroundEffect && props.config.backgroundEffect !== 'none'}>
        <canvas
          ref={canvasRef}
          class="chronos-banner-bg-effect"
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        />
      </Show>

      <Show when={state.shouldMount && !!props.hotspots?.length}>
        <div class="chronos-banner-hotspots" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
          {/* Visual layer: a true SVG image map with native anti-aliasing (no jagged clip-path edges); the pulse ring uses the same geometry for every shape, including polygons. */}
          <svg
            class="chronos-banner-hotspots-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {props.hotspots?.map((h) => (
              <g key={`${h.id}-visual`}>
              <g class={`chronos-hotspot-visual chronos-hotspot-visual-${h.shape}`}>
                <Show when={h.shape === 'rect'}>
                  <rect x={h.coords.x} y={h.coords.y} width={h.coords.width} height={h.coords.height} vector-effect="non-scaling-stroke" />
                </Show>
                <Show when={h.shape === 'oval'}>
                  <ellipse
                    cx={h.coords.x + h.coords.width / 2}
                    cy={h.coords.y + h.coords.height / 2}
                    rx={h.coords.width / 2}
                    ry={h.coords.height / 2}
                    vector-effect="non-scaling-stroke"
                  />
                </Show>
                <Show when={h.shape === 'polygon'}>
                  <polygon points={state.hotspotPolygonPoints(h)} vector-effect="non-scaling-stroke" />
                </Show>
                {h.pulse && (
                  <Show when={h.shape === 'rect'}>
                    <rect class="chronos-hotspot-pulse-ring" x={h.coords.x} y={h.coords.y} width={h.coords.width} height={h.coords.height} vector-effect="non-scaling-stroke" />
                  </Show>
                )}
                {h.pulse && (
                  <Show when={h.shape === 'oval'}>
                    <ellipse
                      class="chronos-hotspot-pulse-ring"
                      cx={h.coords.x + h.coords.width / 2}
                      cy={h.coords.y + h.coords.height / 2}
                      rx={h.coords.width / 2}
                      ry={h.coords.height / 2}
                      vector-effect="non-scaling-stroke"
                    />
                  </Show>
                )}
                {h.pulse && (
                  <Show when={h.shape === 'polygon'}>
                    <polygon class="chronos-hotspot-pulse-ring" points={state.hotspotPolygonPoints(h)} vector-effect="non-scaling-stroke" />
                  </Show>
                )}
              </g>
              </g>
            ))}
          </svg>

          {/* Interactive layer: real HTML <a> elements, kept separate from the SVG visuals so each link can have a guaranteed minimum touch target (2.5.8), a visible focus outline (2.4.7), and a hoverable/focusable tooltip (1.4.13). */}
          {props.hotspots?.map((h) => (
            <div key={h.id}>
              <div class="chronos-hotspot-hit" style={state.hotspotHitStyle(h)}>
                <a
                  href={state.hotspotHref(h)}
                  aria-label={state.hotspotLabel(h)}
                  aria-describedby={h.showTooltip ? `chronos-hotspot-tip-${h.id}` : undefined}
                  class={`chronos-hotspot chronos-hotspot-${h.shape}`}
                >
                  <Show when={!!h.showTooltip}>
                    <span id={`chronos-hotspot-tip-${h.id}`} role="tooltip" class="chronos-hotspot-tooltip">
                      {h.label || h.altText}
                    </span>
                  </Show>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Show>

      <div
        class="chronos-banner-overlay"
        style={{
          zIndex: 1,
          position: props.config?.height === 'auto' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: state.gradientOverlay || 'rgba(0, 0, 0, 0.4)',
          padding: state.paddingValue || 'var(--chronos-spacing-xl)'
        }}
      >
        <div
          class="chronos-banner-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: state.alignment === 'center' ? 'center' : state.alignment === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          <Show when={state.showSkeleton}>
            <div class="chronos-skeleton-title chronos-image-shimmer" style={{ width: '60%', height: '36px', marginBottom: '16px' }} />
            <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '80%', height: '18px', marginBottom: '10px' }} />
            <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '50%', height: '18px', marginBottom: '24px' }} />
            <div class="chronos-skeleton-button chronos-image-shimmer" style={{ width: '140px', height: '42px' }} />
          </Show>
          <Show when={!state.showSkeleton}>
            {props.title && <h2 class="chronos-banner-title">{props.title}</h2>}
            {props.subtitle && <p class="chronos-banner-subtitle">{props.subtitle}</p>}
            {props.ctaText && (
              <a href={state.linkUrl} class="chronos-banner-cta">
                {props.ctaText}
              </a>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}
