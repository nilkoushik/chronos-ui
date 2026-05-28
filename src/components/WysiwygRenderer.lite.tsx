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
      
    </div>
  );
}
