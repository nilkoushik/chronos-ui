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
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function GridBanner(props: GridBannerProps) {

  const rootRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    isVisible: false,
    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
    },
    get gridTemplateColumns() {
      const cols = props.columns || 3;
      return `repeat(${cols}, 1fr)`;
    }
  });

  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  onMount(() => {
    if (props.lazyLoad === false) {
      state.isVisible = true;
      return;
    }
    if (rootRef) {
      observerBox.disconnect = observeLazyMount(
        rootRef,
        () => { state.isVisible = true; },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  onUnMount(() => {
    if (observerBox.disconnect) observerBox.disconnect();
  });

  return (
    <div
      ref={rootRef}
      class={`contentvidya-grid-banner ${props.className || ''}`}
      style={{
        gridTemplateColumns: state.gridTemplateColumns,
        height: props.config?.height || '',
        minHeight: props.config?.minHeight || ''
      }}
    >
      {props.items?.map((item, index) => (
        <a href={item.mapLinks?.[0]?.url || '#'} class="contentvidya-grid-item" key={item.id || index}>
          <div
            class={`contentvidya-grid-img-wrap ${state.showSkeleton ? 'contentvidya-image-shimmer' : ''}`}
            style={{
              height: props.config?.height || '',
              minHeight: props.config?.minHeight || '',
              aspectRatio: props.config?.height ? 'unset' : '16/9'
            }}
          >
            <Show when={!state.showSkeleton}>
              <Show when={item.media?.type === 'video'}>
                <video
                  src={item.media?.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  class="contentvidya-grid-img"
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
                  class="contentvidya-grid-img"
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
          <Show when={state.showSkeleton}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: item.textAlignment || 'center', width: '100%', marginTop: '12px' }}>
              <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '70%', height: '14px', margin: '0 0 6px 0' }} />
              <div class="contentvidya-skeleton-text contentvidya-image-shimmer" style={{ width: '40%', height: '10px', margin: 0 }} />
            </div>
          </Show>
          <Show when={!state.showSkeleton}>
            <div class="contentvidya-grid-title" style={{ textAlign: item.textAlignment || 'center' }}>{item.title}</div>
          </Show>
        </a>
      ))}

    </div>
  );
}
