import { useStore } from '@builder.io/mitosis';

export interface GridBannerItem {
  id: string;
  imageUrl: string;
  title: string;
  link?: string;
}

export interface GridBannerProps {
  items: GridBannerItem[];
  columns?: number;
  className?: string;
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
      {props.items?.map((item) => (
        <a href={item.link || '#'} class="chronos-grid-item" key={item.id}>
          <div class="chronos-grid-img-wrap">
            <img src={item.imageUrl} alt={item.title} class="chronos-grid-img" />
          </div>
          <div class="chronos-grid-title">{item.title}</div>
        </a>
      ))}
      <style>{`
        .chronos-grid-banner {
          display: grid;
          gap: var(--chronos-spacing-md);
          font-family: var(--chronos-font-family);
        }
        @media (max-width: 768px) {
          .chronos-grid-banner {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .chronos-grid-banner {
            grid-template-columns: 1fr !important;
          }
        }
        .chronos-grid-item {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          background: var(--chronos-color-surface);
          border-radius: var(--chronos-border-radius-sm);
          overflow: hidden;
          border: var(--chronos-border-width) solid var(--chronos-color-border);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chronos-grid-item:hover {
          transform: translateY(-4px);
          box-shadow: var(--chronos-shadow-md);
        }
        .chronos-grid-img-wrap {
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .chronos-grid-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .chronos-grid-item:hover .chronos-grid-img {
          transform: scale(1.05);
        }
        .chronos-grid-title {
          padding: var(--chronos-spacing-sm);
          font-weight: 600;
          color: var(--chronos-color-text-main);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
