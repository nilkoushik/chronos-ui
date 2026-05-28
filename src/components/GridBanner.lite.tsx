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
      
    </div>
  );
}
