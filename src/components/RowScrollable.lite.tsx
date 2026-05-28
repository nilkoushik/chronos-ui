import { useStore } from '@builder.io/mitosis';

export interface RowScrollableItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
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
          <div class="chronos-scrollable-card" key={item.id}>
            {item.imageUrl && (
              <div class="chronos-scrollable-img-wrap">
                <img src={item.imageUrl} alt={item.title} class="chronos-scrollable-img" />
              </div>
            )}
            <div class="chronos-scrollable-body">
              <div class="chronos-scrollable-card-title">{item.title}</div>
              {item.subtitle && <div class="chronos-scrollable-card-sub">{item.subtitle}</div>}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
