import { useStore } from '@builder.io/mitosis';

export interface AnnouncementBarProps {
  message: string;
  link?: string;
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
      {props.link ? (
        <a href={props.link} class="chronos-announcement-link">
          {props.message}
        </a>
      ) : (
        <span class="chronos-announcement-text">{props.message}</span>
      )}
    </div>
  );
}
