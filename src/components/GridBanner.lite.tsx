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

export interface GridBannerItem {
  id?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  textAlignment?: 'left' | 'center' | 'right';
  media?: BannerMedia;
  mapLinks?: MapLink[];
}

export interface GridBannerConfig {
  height?: string;
  minHeight?: string;
  bgPosition?: string;
}

export interface GridBannerProps {
  items: GridBannerItem[];
  columns?: number;
  className?: string;
  isLoading?: boolean;
  config?: GridBannerConfig;
}

export default function GridBanner(props: GridBannerProps) {
  

  const state = useStore({
    get gridTemplateColumns() {
      const cols = props.columns || 3;
      return `repeat(${cols}, 1fr)`;
    }
  });
  return (
    <div 
      class={`chronos-grid-banner ${props.className || ''}`}
      style={{ 
        gridTemplateColumns: state.gridTemplateColumns,
        height: props.config?.height || '',
        minHeight: props.config?.minHeight || ''
      }}
    >
      {props.items?.map((item, index) => (
        <a href={item.mapLinks?.[0]?.url || '#'} class="chronos-grid-item" key={item.id || index}>
          <div 
            class={`chronos-grid-img-wrap ${props.isLoading ? 'chronos-image-shimmer' : ''}`}
            style={{ 
              height: props.config?.height || '', 
              minHeight: props.config?.minHeight || '',
              aspectRatio: props.config?.height ? 'unset' : '16/9'
            }}
          >
            <Show when={!props.isLoading}>
              <Show when={item.media?.type === 'video'}>
                <video 
                  src={item.media?.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  class="chronos-grid-img" 
                  style={{ 
                    objectFit: 'cover', 
                    width: '100%', 
                    height: '100%',
                    objectPosition: props.config?.bgPosition || 'center'
                  }}
                />
              </Show>
              <Show when={item.media?.type !== 'video'}>
                <img 
                  src={item.media?.url} 
                  alt={item.title} 
                  class="chronos-grid-img" 
                  style={{ 
                    objectFit: 'cover', 
                    width: '100%', 
                    height: '100%',
                    objectPosition: props.config?.bgPosition || 'center'
                  }}
                />
              </Show>
            </Show>
          </div>
          <Show when={props.isLoading}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: item.textAlignment || 'center', width: '100%', marginTop: '12px' }}>
              <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '70%', height: '14px', margin: '0 0 6px 0' }} />
              <div class="chronos-skeleton-text chronos-image-shimmer" style={{ width: '40%', height: '10px', margin: 0 }} />
            </div>
          </Show>
          <Show when={!props.isLoading}>
            <div class="chronos-grid-title" style={{ textAlign: item.textAlignment || 'center' }}>{item.title}</div>
          </Show>
        </a>
      ))}
      
    </div>
  );
}
