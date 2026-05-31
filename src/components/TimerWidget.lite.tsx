import { useStore, onMount, onUnMount } from '@builder.io/mitosis';

export interface TimerWidgetProps {
  targetDate: string;
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
      
    </div>
  );
}
