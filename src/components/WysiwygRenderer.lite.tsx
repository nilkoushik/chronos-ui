import { useStore } from '@builder.io/mitosis';

export interface WysiwygRendererProps {
  htmlContent: string;
  className?: string;
}

export default function WysiwygRenderer(props: WysiwygRendererProps) {
  return (
    <div 
      class={`chronos-wysiwyg-content ${props.className || ''}`}
      innerHTML={props.htmlContent}
    >
      <style>{`
        .chronos-wysiwyg-content {
          font-family: var(--chronos-font-family);
          color: var(--chronos-color-text-main);
          line-height: 1.6;
        }
        .chronos-wysiwyg-content h1,
        .chronos-wysiwyg-content h2,
        .chronos-wysiwyg-content h3,
        .chronos-wysiwyg-content h4,
        .chronos-wysiwyg-content h5,
        .chronos-wysiwyg-content h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: var(--chronos-color-text-main);
        }
        .chronos-wysiwyg-content p {
          margin-bottom: 1em;
        }
        .chronos-wysiwyg-content a {
          color: var(--chronos-color-primary);
          text-decoration: underline;
        }
        .chronos-wysiwyg-content img {
          max-width: 100%;
          height: auto;
          border-radius: var(--chronos-border-radius-sm);
        }
        .chronos-wysiwyg-content blockquote {
          border-left: 4px solid var(--chronos-color-primary);
          padding-left: 1em;
          margin-left: 0;
          color: var(--chronos-color-text-muted);
          background: var(--chronos-color-surface);
          padding: 1em;
          border-radius: 0 var(--chronos-border-radius-sm) var(--chronos-border-radius-sm) 0;
        }
        .chronos-wysiwyg-content pre {
          background: var(--chronos-color-surface);
          padding: 1em;
          border-radius: var(--chronos-border-radius-sm);
          overflow-x: auto;
          border: var(--chronos-border-width) solid var(--chronos-color-border);
        }
      `}</style>
    </div>
  );
}
