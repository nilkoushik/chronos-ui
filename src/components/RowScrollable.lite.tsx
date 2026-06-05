import { useStore, useStyle } from '@builder.io/mitosis';

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
  useStyle(`.chronos-scrollable-container {
          font-family: var(--chronos-font-family);
        }
        .chronos-scrollable-title {
          margin-top: 0;
          margin-bottom: var(--chronos-spacing-md);
          color: var(--chronos-color-text-main);
          font-size: var(--chronos-font-size-subtitle);
        }
        .chronos-scrollable-row {
          display: flex;
          gap: var(--chronos-spacing-md);
          overflow-x: auto;
          padding-bottom: var(--chronos-spacing-sm);
          scroll-snap-type: x mandatory;
        }
        /* Custom scrollbar */
        .chronos-scrollable-row::-webkit-scrollbar {
          height: 6px;
        }
        .chronos-scrollable-row::-webkit-scrollbar-track {
          background: var(--chronos-color-surface);
          border-radius: 4px;
        }
        .chronos-scrollable-row::-webkit-scrollbar-thumb {
          background: var(--chronos-color-border);
          border-radius: 4px;
        }
        .chronos-scrollable-card {
          flex: 0 0 280px;
          background: var(--chronos-color-surface);
          border: var(--chronos-border-width) solid var(--chronos-color-border);
          border-radius: var(--chronos-border-radius-md);
          overflow: hidden;
          scroll-snap-align: start;
        }
        .chronos-scrollable-img-wrap {
          height: 160px;
        }
        .chronos-scrollable-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .chronos-scrollable-body {
          padding: var(--chronos-spacing-sm);
        }
        .chronos-scrollable-card-title {
          font-weight: 600;
          color: var(--chronos-color-text-main);
          margin-bottom: 0.25rem;
        }
        .chronos-scrollable-card-sub {
          font-size: 0.875rem;
          color: var(--chronos-color-text-muted);
        }



`);

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
