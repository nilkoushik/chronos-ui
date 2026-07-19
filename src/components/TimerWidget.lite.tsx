import { useStore, useRef, onMount, onUnMount } from '@builder.io/mitosis';
import { observeLazyMount } from '../utils/lazyObserver';

export interface TimerWidgetProps {
  targetDate: string;
  title?: string;
  className?: string;
  variant?: 'neon' | 'dark' | 'gray';
  lazyLoad?: boolean;
  lazyThreshold?: number;
  lazyRootMargin?: string;
}

export default function TimerWidget(props: TimerWidgetProps) {

  const rootRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    timerId: null as any,
    calculateTimeLeft() {
      const difference = new Date(props.targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        state.timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        state.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    },
    startTicking() {
      state.calculateTimeLeft();
      state.timerId = setInterval(() => {
        state.calculateTimeLeft();
      }, 1000);
    }
  });

  let disconnectObserver: (() => void) | null = null;

  onMount(() => {
    if (props.lazyLoad === false) {
      state.startTicking();
      return;
    }
    if (rootRef) {
      disconnectObserver = observeLazyMount(
        rootRef,
        () => state.startTicking(),
        props.lazyThreshold ?? 0.1,
        props.lazyRootMargin ?? '200px'
      );
    }
  });

  onUnMount(() => {
    if (state.timerId) clearInterval(state.timerId);
    if (disconnectObserver) disconnectObserver();
  });
  return (
    <div ref={rootRef} class={`chronos-timer-widget chronos-timer-variant-${props.variant || 'dark'} ${props.className || ''}`}>
      {props.title && <h3 class="chronos-timer-title">{props.title}</h3>}
      <div class="chronos-timer-blocks">
        <div class="chronos-timer-block">
          <span class="chronos-timer-value">{state.timeLeft.days}</span>
          <span class="chronos-timer-label">Days</span>
        </div>
        <div class="chronos-timer-block">
          <span class="chronos-timer-value">{state.timeLeft.hours}</span>
          <span class="chronos-timer-label">Hours</span>
        </div>
        <div class="chronos-timer-block">
          <span class="chronos-timer-value">{state.timeLeft.minutes}</span>
          <span class="chronos-timer-label">Minutes</span>
        </div>
        <div class="chronos-timer-block">
          <span class="chronos-timer-value">{state.timeLeft.seconds}</span>
          <span class="chronos-timer-label">Seconds</span>
        </div>
      </div>

    </div>
  );
}
