import { useStore, useRef, onMount, onUnMount, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';

export interface MediaGridItem {
  id: string;
  media?: { type: 'image' | 'video'; url: string };
  mapLinks?: { url: string }[];
  altText?: string;
  title?: string;
}

export interface MediaGridProps {
  primaryMedia: MediaGridItem;
  secondaryMedia?: MediaGridItem[];
  className?: string;
  isLoading?: boolean;
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function MediaGrid(props: MediaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    isVisible: false,
    get shouldMount() {
      return props.lazyLoad === false || state.isVisible;
    },
    get showSkeleton() {
      return !!props.isLoading || !state.shouldMount;
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
    <div ref={rootRef} class={`chronos-media-grid ${props.className || ''}`}>
      <Show when={state.showSkeleton}>
        <div class="chronos-media-primary chronos-image-shimmer" />
        <div class="chronos-media-secondary-col">
          <div class="chronos-media-secondary-item chronos-image-shimmer" />
          <div class="chronos-media-secondary-item chronos-image-shimmer" />
        </div>
      </Show>

      <Show when={!state.showSkeleton}>
        {props.primaryMedia && (
          <a href={props.primaryMedia.mapLinks?.[0]?.url || '#'} class="chronos-media-primary">
            <Show when={props.primaryMedia.media?.type === 'video'}>
              <video src={props.primaryMedia.media?.url} autoPlay loop muted playsInline class="chronos-media-asset" />
            </Show>
            <Show when={props.primaryMedia.media?.type !== 'video'}>
              <img src={props.primaryMedia.media?.url} alt={props.primaryMedia.altText || props.primaryMedia.title || ''} class="chronos-media-asset" />
            </Show>
          </a>
        )}

        {props.secondaryMedia && props.secondaryMedia.length > 0 && (
          <div class="chronos-media-secondary-col">
            {props.secondaryMedia.map((item) => (
              <a href={item.mapLinks?.[0]?.url || '#'} class="chronos-media-secondary-item" key={item.id}>
                <Show when={item.media?.type === 'video'}>
                  <video src={item.media?.url} autoPlay loop muted playsInline class="chronos-media-asset" />
                </Show>
                <Show when={item.media?.type !== 'video'}>
                  <img src={item.media?.url} alt={item.altText || item.title || ''} class="chronos-media-asset" />
                </Show>
              </a>
            ))}
          </div>
        )}
      </Show>
    </div>
  );
}
