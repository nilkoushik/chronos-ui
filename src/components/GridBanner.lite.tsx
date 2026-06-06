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

export interface GridBannerProps {
  items: GridBannerItem[];
  columns?: number;
  className?: string;
  isLoading?: boolean;
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
      style={{ gridTemplateColumns: state.gridTemplateColumns }}
    >
      {props.items?.map((item, index) => (
        <a href={item.mapLinks?.[0]?.url || '#'} class={`chronos-grid-item ${props.isLoading ? 'chronos-image-shimmer' : ''}`} key={item.id || index}>
          <div class="chronos-grid-img-wrap">
            <Show when={!props.isLoading}>
              <Show when={item.media?.type === 'video'}>
                <video 
                  src={item.media?.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  class="chronos-grid-img" 
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Show>
              <Show when={item.media?.type !== 'video'}>
                <img src={item.media?.url} alt={item.title} class="chronos-grid-img" />
              </Show>
            </Show>
          </div>
          <div class="chronos-grid-title" style={{ textAlign: item.textAlignment || 'center' }}>{item.title}</div>
        </a>
      ))}
      
    </div>
  );
}
