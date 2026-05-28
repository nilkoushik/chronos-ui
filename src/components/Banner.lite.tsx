import { useStore } from '@builder.io/mitosis';

export interface BannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function Banner(props: BannerProps) {
  const state = useStore({
    get alignment() {
      return props.align || 'center';
    }
  });

  return (
    <div
      class={`chronos-banner ${props.className || ''}`}
      style={{
        backgroundImage: props.backgroundImageUrl ? `url(${props.backgroundImageUrl})` : 'none',
        textAlign: state.alignment
      }}
    >
      <div class="chronos-banner-overlay">
        <div class="chronos-banner-content">
          {props.title && <h2 class="chronos-banner-title">{props.title}</h2>}
          {props.subtitle && <p class="chronos-banner-subtitle">{props.subtitle}</p>}
          {props.ctaText && (
            <a href={props.ctaLink || '#'} class="chronos-banner-cta">
              {props.ctaText}
            </a>
          )}
        </div>
      </div>
      
      
    </div>
  );
}
