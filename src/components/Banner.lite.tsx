import { useStore, useRef, onMount, onUnMount, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';

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
    hotspotClip(h: Hotspot) {
      if (h.shape !== 'polygon' || !h.points?.length) return '';
      const points = h.points
        .map((p) => `${((p.x - h.coords.x) / h.coords.width) * 100}% ${((p.y - h.coords.y) / h.coords.height) * 100}%`)
        .join(', ');
      return `polygon(${points})`;
    },
    hotspotHref(h: Hotspot) {
      return h.action?.type === 'deeplink' ? (h.action.deeplink || h.action.url || '#') : (h.action?.url || '#');
    }
  });

  let disconnectObserver: (() => void) | null = null;

  onMount(() => {
    if (props.lazyLoad === false) {
      state.isVisible = true;
      return;
    }
    if (rootRef) {
      disconnectObserver = observeLazyMount(
        rootRef,
        () => { state.isVisible = true; },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  onUnMount(() => {
    if (disconnectObserver) disconnectObserver();
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

      <Show when={state.shouldMount && !!props.hotspots?.length}>
        <div class="chronos-banner-hotspots" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
          {props.hotspots?.map((h) => (
            <a
              key={h.id}
              href={state.hotspotHref(h)}
              aria-label={h.altText || h.label || 'Hotspot link'}
              title={h.showTooltip ? (h.label || h.altText) : undefined}
              class={`chronos-hotspot chronos-hotspot-${h.shape} ${h.pulse ? 'chronos-hotspot-pulse' : ''}`}
              style={{
                position: 'absolute',
                left: `${h.coords.x}%`,
                top: `${h.coords.y}%`,
                width: `${h.coords.width}%`,
                height: `${h.coords.height}%`,
                borderRadius: h.shape === 'oval' ? '50%' : '0',
                clipPath: state.hotspotClip(h) || undefined,
                display: 'block'
              }}
            >
              <Show when={!!h.pulse}>
                <span class="chronos-hotspot-pulse-ring"></span>
              </Show>
            </a>
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
