import { useStore, useRef, onMount, onUnMount, onUpdate, Show } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';
import { defaultBackgroundEffectPlugin } from '../utils/backgroundEffects';
import type { BackgroundEffectContext, BackgroundEffectName, BackgroundEffectPlugin } from '../utils/backgroundEffects';

export interface TimerWidgetProps {
  targetDate: string;
  title?: string;
  className?: string;
  variant?: 'neon' | 'dark' | 'gray';
  backgroundImageUrl?: string;
  backgroundPosition?: string;
  overlay?: string;
  backgroundEffect?: BackgroundEffectName;
  backgroundEffectPlugin?: BackgroundEffectPlugin;
  expiredText?: string;
  width?: string;
  height?: string;
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function TimerWidget(props: TimerWidgetProps) {

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animContext = useRef<BackgroundEffectContext>({ animationFrameId: null, resizeHandler: null });

  const state = useStore({
    timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    timerId: null as any,
    isExpired: false,
    calculateTimeLeft() {
      const difference = new Date(props.targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        state.isExpired = false;
        state.timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        state.isExpired = true;
        state.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    },
    startTicking() {
      state.calculateTimeLeft();
      state.timerId = setInterval(() => {
        state.calculateTimeLeft();
      }, 1000);
    },
    get hasBackgroundImage() {
      return !!props.backgroundImageUrl;
    },
    get widthValue() {
      return props.width || 'auto';
    },
    get heightMode() {
      return props.height || 'auto';
    },
    get useImageForHeight() {
      return state.hasBackgroundImage && state.heightMode === 'auto';
    },
    get fixedHeightValue() {
      return state.heightMode !== 'auto' ? state.heightMode : undefined;
    },
    get contentOverlaysBox() {
      return state.useImageForHeight || !!state.fixedHeightValue;
    },
    get backgroundEffectClass() {
      return props.backgroundEffect || 'none';
    },
    get plugin() {
      return props.backgroundEffectPlugin || defaultBackgroundEffectPlugin;
    }
  });

  const observerBox = useRef<{ disconnect: (() => void) | null }>({ disconnect: null });

  onMount(() => {
    if (props.lazyLoad === false) {
      state.startTicking();
      if (canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
      return;
    }
    if (rootRef) {
      observerBox.disconnect = observeLazyMount(
        rootRef,
        () => {
          state.startTicking();
          if (canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
        },
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  // Depend on the stable derived class (and NOT on state.timerId, which
  // changes every second via the countdown tick) so the canvas loop starts
  // once and only restarts if the effect name itself actually changes —
  // otherwise it was tearing down and restarting every second, which made
  // the animation look like it was stuttering/never settling.
  onUpdate(() => {
    if (canvasRef) state.plugin.start(canvasRef, state.backgroundEffectClass as BackgroundEffectName, animContext);
  }, [state.backgroundEffectClass, canvasRef]);

  onUnMount(() => {
    if (state.timerId) clearInterval(state.timerId);
    if (observerBox.disconnect) observerBox.disconnect();
    state.plugin.stop(animContext);
  });
  return (
    <div
      ref={rootRef}
      class={`contentvidya-timer-widget contentvidya-timer-variant-${props.variant || 'dark'} ${state.hasBackgroundImage ? 'contentvidya-timer-has-bg' : ''} ${props.className || ''}`}
      style={{
        width: state.widthValue,
        height: state.fixedHeightValue || undefined,
        backgroundImage: state.hasBackgroundImage && !state.useImageForHeight ? `url(${props.backgroundImageUrl})` : undefined,
        backgroundPosition: props.backgroundPosition || 'center'
      }}
    >
      <Show when={state.useImageForHeight}>
        <img
          src={props.backgroundImageUrl}
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', objectPosition: props.backgroundPosition || 'center' }}
        />
      </Show>
      <Show when={state.hasBackgroundImage}>
        <div class="contentvidya-timer-overlay" style={{ background: props.overlay || 'rgba(0, 0, 0, 0.45)' }} />
      </Show>
      <Show when={state.backgroundEffectClass !== 'none'}>
        <canvas
          ref={canvasRef}
          class="contentvidya-timer-bg-effect"
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        />
      </Show>
      <div class="contentvidya-timer-content" style={{ position: state.contentOverlaysBox ? 'absolute' : 'relative', top: state.contentOverlaysBox ? 0 : undefined, left: state.contentOverlaysBox ? 0 : undefined, width: state.contentOverlaysBox ? '100%' : undefined, height: state.contentOverlaysBox ? '100%' : undefined }}>
        {props.title && <h3 class="contentvidya-timer-title">{props.title}</h3>}
        <Show when={!state.isExpired}>
          <div class="contentvidya-timer-blocks" role="timer" aria-live="off" aria-label={`Time remaining: ${state.timeLeft.days} days, ${state.timeLeft.hours} hours, ${state.timeLeft.minutes} minutes, ${state.timeLeft.seconds} seconds`}>
            <div class="contentvidya-timer-block">
              <span class="contentvidya-timer-value" aria-hidden="true">{state.timeLeft.days}</span>
              <span class="contentvidya-timer-label" aria-hidden="true">Days</span>
            </div>
            <div class="contentvidya-timer-block">
              <span class="contentvidya-timer-value" aria-hidden="true">{state.timeLeft.hours}</span>
              <span class="contentvidya-timer-label" aria-hidden="true">Hours</span>
            </div>
            <div class="contentvidya-timer-block">
              <span class="contentvidya-timer-value" aria-hidden="true">{state.timeLeft.minutes}</span>
              <span class="contentvidya-timer-label" aria-hidden="true">Minutes</span>
            </div>
            <div class="contentvidya-timer-block">
              <span class="contentvidya-timer-value" aria-hidden="true">{state.timeLeft.seconds}</span>
              <span class="contentvidya-timer-label" aria-hidden="true">Seconds</span>
            </div>
          </div>
        </Show>
        <Show when={!!state.isExpired && !!props.expiredText}>
          <p class="contentvidya-timer-expired">{props.expiredText}</p>
        </Show>
      </div>
    </div>
  );
}
