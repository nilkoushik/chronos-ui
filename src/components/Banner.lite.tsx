import { useStore, Show, useStyle } from '@builder.io/mitosis';

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
  useStyle(`.chronos-banner {
          position: relative;
          background-size: cover;
          background-position: center;
          border-radius: var(--chronos-border-radius-md);
          overflow: hidden;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          font-family: var(--chronos-font-family);
          color: var(--chronos-color-text-main);
          background-color: var(--chronos-color-surface);
          border: var(--chronos-border-width) solid var(--chronos-color-border);
        }
        .chronos-banner-overlay {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: var(--chronos-spacing-xl);
          background: rgba(0, 0, 0, 0.4);
        }
        .chronos-banner-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .chronos-banner-title {
          font-size: var(--chronos-font-size-title);
          margin-bottom: var(--chronos-spacing-sm);
          color: #fff;
          margin-top: 0;
        }
        .chronos-banner-subtitle {
          font-size: var(--chronos-font-size-subtitle);
          margin-bottom: var(--chronos-spacing-lg);
          color: #f1f5f9;
        }
        .chronos-banner-cta {
          display: inline-block;
          background-color: var(--chronos-color-primary);
          color: #fff;
          padding: var(--chronos-spacing-sm) var(--chronos-spacing-lg);
          border-radius: var(--chronos-border-radius-sm);
          text-decoration: none;
          font-weight: 600;
          transition: filter 0.2s;
        }
        .chronos-banner-cta:hover {
          filter: brightness(1.1);
        }



`);

  const state = useStore({
    get alignment() {
      return props.textAlignment || 'center';
    }
  });
  return (
    <div
      class={`chronos-banner ${props.className || ''} ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
      style={{
        backgroundImage: props.media?.type !== 'video' && props.media?.url ? `url(${props.media.url})` : 'none',
        textAlign: state.alignment
      }}
    >
      <Show when={props.media?.type === 'video'}>
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
        <div class="chronos-banner-content">
          {props.title && <h2 class="chronos-banner-title">{props.title}</h2>}
          {props.subtitle && <p class="chronos-banner-subtitle">{props.subtitle}</p>}
          {props.ctaText && (
            <a href={props.mapLinks?.[0]?.url || '#'} class="chronos-banner-cta">
              {props.ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
