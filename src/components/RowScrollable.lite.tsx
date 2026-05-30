import { useStore } from '@builder.io/mitosis';

export interface RowScrollableItem {
  id: string;
  title?: string;
  subtitle?: string;
  media?: { type: 'image' | 'video'; url: string };
  mapLinks?: { url: string }[];
}

export interface RowScrollableProps {
  items: RowScrollableItem[];
  title?: string;
  className?: string;
}

export default function RowScrollable(props: RowScrollableProps) {
  return (
    <div class={`chronos-scrollable-container ${props.className || ''}`}>
      {props.title && <h3 class="chronos-scrollable-title">{props.title}</h3>}
      <div class="chronos-scrollable-row">
        {props.items?.map((item) => (
          <a href={item.mapLinks?.[0]?.url || '#'} class="chronos-scrollable-card" key={item.id}>
            {item.media?.url && (
              <div class="chronos-scrollable-img-wrap">
                {item.media?.type === 'video' ? (
                  <video src={item.media?.url} autoPlay loop muted playsInline class="chronos-scrollable-img" />
                ) : (
                  <img src={item.media?.url} alt={item.title || ''} class="chronos-scrollable-img" />
                )}
              </div>
            )}
            <div class="chronos-scrollable-body">
              {item.title && <div class="chronos-scrollable-card-title">{item.title}</div>}
              {item.subtitle && <div class="chronos-scrollable-card-sub">{item.subtitle}</div>}
            </div>
          </a>
        ))}
      </div>
      
    </div>
  );
}
