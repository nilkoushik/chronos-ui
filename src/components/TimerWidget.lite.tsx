import { useStore, onMount, onUnMount } from '@builder.io/mitosis';

export interface TimerWidgetProps {
  targetDate: string; // ISO String
  title?: string;
  className?: string;
}

export default function TimerWidget(props: TimerWidgetProps) {
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
    }
  });

  onMount(() => {
    state.calculateTimeLeft();
    state.timerId = setInterval(() => {
      state.calculateTimeLeft();
    }, 1000);
  });

  onUnMount(() => {
    if (state.timerId) clearInterval(state.timerId);
  });

  return (
    <div class={`chronos-timer-widget ${props.className || ''}`}>
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
      <style>{`
        .chronos-timer-widget {
          background-color: var(--chronos-color-surface);
          border: var(--chronos-border-width) solid var(--chronos-color-border);
          border-radius: var(--chronos-border-radius-md);
          padding: var(--chronos-spacing-lg);
          font-family: var(--chronos-font-family);
          color: var(--chronos-color-text-main);
          text-align: center;
          box-shadow: var(--chronos-shadow-sm);
        }
        .chronos-timer-title {
          margin-top: 0;
          margin-bottom: var(--chronos-spacing-md);
          font-size: var(--chronos-font-size-subtitle);
        }
        .chronos-timer-blocks {
          display: flex;
          justify-content: center;
          gap: var(--chronos-spacing-md);
        }
        .chronos-timer-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--chronos-color-background);
          padding: var(--chronos-spacing-sm);
          border-radius: var(--chronos-border-radius-sm);
          min-width: 60px;
          border: var(--chronos-border-width) solid var(--chronos-color-border);
        }
        .chronos-timer-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--chronos-color-primary);
        }
        .chronos-timer-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--chronos-color-text-muted);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
