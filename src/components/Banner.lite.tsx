import { useStore, Show } from '@builder.io/mitosis';

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
}

export default function Banner(props: BannerProps) {
  

  const state = useStore({
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
      return props.config?.minHeight || props.config?.height || '';
    }
  });
  return (
    <div
      class={`chronos-banner ${props.className || ''}`}
      style={{
        backgroundImage: !props.isLoading && !state.hasVideo && state.imageUrl && props.config?.height !== 'auto' ? `url(${state.imageUrl})` : 'none',
        textAlign: state.alignment,
        backgroundPosition: state.backgroundPosition || 'center',
        minHeight: state.minHeightValue || '',
        height: props.config?.height || ''
      }}
    >
      <Show when={!props.isLoading && state.hasVideo}>
        <video 
          src={state.videoUrl} 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      </Show>
      <Show when={!props.isLoading && !state.hasVideo && state.imageUrl && props.config?.height === 'auto'}>
        <img 
          src={state.imageUrl} 
          alt="" 
          style={{ width: '100%', height: 'auto', display: 'block', zIndex: 0, objectFit: 'cover', objectPosition: state.backgroundPosition || 'center' }} 
        />
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
          <Show when={props.isLoading}>
            <div class="chronos-skeleton-title chronos-image-shimmer" style={{ width: '60%', height: '36px', marginBottom: '16px' }} />
            <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '80%', height: '18px', marginBottom: '10px' }} />
            <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '50%', height: '18px', marginBottom: '24px' }} />
            <div class="chronos-skeleton-button chronos-image-shimmer" style={{ width: '140px', height: '42px' }} />
          </Show>
          <Show when={!props.isLoading}>
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
