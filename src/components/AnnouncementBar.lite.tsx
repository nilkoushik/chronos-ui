import { useStore, Show } from '@builder.io/mitosis';

export interface AnnouncementBarProps {
  message: string;
  mapLinks?: { url: string }[];
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

export default function AnnouncementBar(props: AnnouncementBarProps) {
  

  return (
    <div
      class={`chronos-announcement-bar ${props.className || ''}`}
      style={{
        backgroundColor: props.backgroundColor || 'var(--violet, #8b5cf6)',
        color: props.textColor || '#ffffff'
      }}
    >
      <Show when={props.mapLinks && props.mapLinks.length > 0}>
        <a href={props.mapLinks?.[0]?.url} class="chronos-announcement-link">
          {props.message}
        </a>
      </Show>
      <Show when={!(props.mapLinks && props.mapLinks.length > 0)}>
        <span class="chronos-announcement-text">{props.message}</span>
      </Show>
    </div>
  );
}
