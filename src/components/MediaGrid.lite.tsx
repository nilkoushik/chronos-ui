import { useStore } from '@builder.io/mitosis';

export interface MediaGridItem {
  id: string;
  mediaUrl: string;
  type?: 'image' | 'video';
  link?: string;
  altText?: string;
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
        <a href={props.primaryMedia.link || '#'} class="chronos-media-primary">
          {props.primaryMedia.type === 'video' ? (
            <video src={props.primaryMedia.mediaUrl} autoPlay loop muted playsInline class="chronos-media-asset" />
          ) : (
            <img src={props.primaryMedia.mediaUrl} alt={props.primaryMedia.altText || ''} class="chronos-media-asset" />
          )}
        </a>
      )}
      
      {props.secondaryMedia && props.secondaryMedia.length > 0 && (
        <div class="chronos-media-secondary-col">
          {props.secondaryMedia.map((item) => (
            <a href={item.link || '#'} class="chronos-media-secondary-item" key={item.id}>
              {item.type === 'video' ? (
                <video src={item.mediaUrl} autoPlay loop muted playsInline class="chronos-media-asset" />
              ) : (
                <img src={item.mediaUrl} alt={item.altText || ''} class="chronos-media-asset" />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
