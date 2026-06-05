import { useStore, useStyle } from '@builder.io/mitosis';

export interface AnnouncementBarProps {
  message: string;
  mapLinks?: { url: string }[];
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

export default function AnnouncementBar(props: AnnouncementBarProps) {
  useStyle(`.chronos-announcement-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--chronos-spacing-sm);
  font-family: var(--chronos-font-family);
  font-size: var(--chronos-font-size-base);
  font-weight: 500;
  text-align: center;
}
.chronos-announcement-link {
  color: inherit;
  text-decoration: none;
}
.chronos-announcement-link:hover {
  text-decoration: underline;
}



`);

  return (
    <div
      class={`chronos-announcement-bar ${props.className || ''}`}
      style={{
        backgroundColor: props.backgroundColor || 'var(--violet, #8b5cf6)',
        color: props.textColor || '#ffffff'
      }}
    >
      {props.mapLinks && props.mapLinks.length > 0 ? (
        <a href={props.mapLinks[0].url} class="chronos-announcement-link">
          {props.message}
        </a>
      ) : (
        <span class="chronos-announcement-text">{props.message}</span>
      )}
    </div>
  );
}
