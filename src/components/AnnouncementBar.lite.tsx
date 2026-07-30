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
      class={`contentvidya-announcement-bar ${props.className || ''}`}
      style={{
        // Defaults pair white text with violet-700, which measures 7.10:1 --
        // clearing WCAG 2.1 AAA. The previous violet-500 (#8b5cf6) default was
        // only 4.23:1, failing even AA. Falls back through the shared primary
        // token so a consumer theming the library gets their colour, not this
        // hardcoded one.
        backgroundColor:
          props.backgroundColor || 'var(--contentvidya-color-primary, #6d28d9)',
        color: props.textColor || '#ffffff'
      }}
    >
      <Show when={props.mapLinks && props.mapLinks.length > 0}>
        <a href={props.mapLinks?.[0]?.url} class="contentvidya-announcement-link">
          {props.message}
        </a>
      </Show>
      <Show when={!(props.mapLinks && props.mapLinks.length > 0)}>
        <span class="contentvidya-announcement-text">{props.message}</span>
      </Show>
    </div>
  );
}
