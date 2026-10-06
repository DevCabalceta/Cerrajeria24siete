import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useHydrated } from '../../utils/useHydrated';

type Phase = 'locked' | 'opening' | 'unlocked';

const copy: Record<Phase, string> = {
  locked: 'Cerrado',
  opening: 'Abriendo…',
  unlocked: 'Abierto',
};

const dot: Record<Phase, string> = {
  locked: 'bg-signal',
  opening: 'bg-ink/40',
  unlocked: 'bg-live',
};

const easePremium = [0.22, 1, 0.36, 1] as const;
const easeInOut = [0.65, 0, 0.35, 1] as const;

/**
 * Decorative "lock state" readout layered on the hero photo: a quiet
 * simulation of an opening, CERRADO → ABIERTO, with the padlock shackle
 * lifting at the end. Hovering or tapping the card replays it, and so does
 * touching the house key in the hero keyring.
 * Purely illustrative, so it is hidden from assistive technology.
 */
export interface LockStatusHandle {
  /** Replays the opening (e.g. when the house key is touched). */
  replay: () => void;
}

interface LockStatusProps {
  ref?: Ref<LockStatusHandle>;
}

export default function LockStatus({ ref }: LockStatusProps) {
  const reduceMotion = useReducedMotion();
  // Reduced motion shows the final state, but only after hydration so the
  // first client render matches the server.
  const reduced = useHydrated() && Boolean(reduceMotion);
  const [runPhase, setPhase] = useState<Phase>('locked');
  const phase: Phase = reduced ? 'unlocked' : runPhase;
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (v) => `${String(Math.round(v * 100)).padStart(3, '0')}%`);
  const running = useRef(false);

  const run = useCallback(
    async (initialDelay: number) => {
      if (running.current || reduceMotion) return;
      running.current = true;
      progress.set(0);
      await new Promise((resolve) => setTimeout(resolve, initialDelay));
      setPhase('opening');
      await animate(progress, 1, { duration: 1.6, ease: easeInOut });
      setPhase('unlocked');
      running.current = false;
    },
    [progress, reduceMotion],
  );

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    // Let the entrance animations settle before the first run.
    void run(900);
  }, [run, reduced, progress]);

  const replay = useCallback(() => {
    if (phase !== 'unlocked' || reduced) return;
    setPhase('locked');
    void run(350);
  }, [phase, reduced, run]);

  useImperativeHandle(ref, () => ({ replay }), [replay]);

  return (
    <div
      aria-hidden="true"
      onPointerEnter={(event) => event.pointerType === 'mouse' && replay()}
      onClick={replay}
      className="w-60 cursor-default rounded-2xl bg-paper/85 p-3.5 shadow-[0_18px_40px_-20px_rgb(10_15_26/0.45)] ring-1 ring-ink/5 backdrop-blur-md select-none"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-paper">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <motion.path
              d="M8 11V8a4 4 0 0 1 8 0v3"
              initial={false}
              animate={phase === 'unlocked' ? { y: -2.5, x: 0 } : { y: 0, x: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14 }}
            />
            <rect x="5.5" y="11" width="13" height="9.5" rx="2.25" fill="currentColor" stroke="none" />
            <circle cx="12" cy="15.75" r="1.35" className="fill-ink" stroke="none" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-label text-muted uppercase">Estado</p>
          <div className="relative h-5 overflow-hidden text-sm leading-5 font-medium tracking-[-0.01em] text-ink">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={phase}
                className="block"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.45, ease: easePremium }}
              >
                {copy[phase]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <span className={`size-1.5 shrink-0 rounded-full transition-colors duration-500 ${dot[phase]}`} />
      </div>

      <div className="mt-3.5 h-px overflow-hidden bg-ink/10">
        <motion.div className="h-full origin-left bg-ink" style={{ scaleX: progress }} />
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-label text-muted uppercase">
        <span>Apertura</span>
        <motion.span className="tabular-nums">{percent}</motion.span>
      </div>
    </div>
  );
}
