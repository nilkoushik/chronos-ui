import { useStore } from '@builder.io/mitosis';

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
}

export default function MediaGrid(props: MediaGridProps) {
  return (
    <div class={`chronos-media-grid ${props.className || ''}`}>
      {props.primaryMedia && (
        <a href={props.primaryMedia.mapLinks?.[0]?.url || '#'} class="chronos-media-primary">
          {props.primaryMedia.media?.type === 'video' ? (
            <video src={props.primaryMedia.media?.url} autoPlay loop muted playsInline class="chronos-media-asset" />
          ) : (
            <img src={props.primaryMedia.media?.url} alt={props.primaryMedia.altText || props.primaryMedia.title || ''} class="chronos-media-asset" />
          )}
        </a>
      )}
      
      {props.secondaryMedia && props.secondaryMedia.length > 0 && (
        <div class="chronos-media-secondary-col">
          {props.secondaryMedia.map((item) => (
            <a href={item.mapLinks?.[0]?.url || '#'} class="chronos-media-secondary-item" key={item.id}>
              {item.media?.type === 'video' ? (
                <video src={item.media?.url} autoPlay loop muted playsInline class="chronos-media-asset" />
              ) : (
                <img src={item.media?.url} alt={item.altText || item.title || ''} class="chronos-media-asset" />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
