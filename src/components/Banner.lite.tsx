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
}

export default function Banner(props: BannerProps) {
  

  const state = useStore({
    get alignment() {
      return props.textAlignment || 'center';
    }
  });
  return (
    <div
      class={`chronos-banner ${props.className || ''}`}
      style={{
        backgroundImage: !props.isLoading && props.media?.type !== 'video' && props.media?.url ? `url(${props.media.url})` : 'none',
        textAlign: state.alignment
      }}
    >
      <Show when={!props.isLoading && props.media?.type === 'video'}>
        <video 
          src={props.media?.url} 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      </Show>
      <div class="chronos-banner-overlay" style={{ zIndex: 1, position: 'relative' }}>
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
              <a href={props.mapLinks?.[0]?.url || '#'} class="chronos-banner-cta">
                {props.ctaText}
              </a>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}
