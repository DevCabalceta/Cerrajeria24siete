import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Emergency } from '../../data/emergencies';
import { glyphs } from '../ui/glyphs';
import { PhoneIcon, WhatsAppIcon } from '../ui/icons';

interface EmergencyPickerProps {
  emergencies: ReadonlyArray<Pick<Emergency, 'id' | 'label' | 'glyph' | 'message'>>;
  phone: { href: string; display: string };
  whatsappNumber: string;
}

const easePremium = [0.22, 1, 0.36, 1] as const;

const waHref = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

/**
 * Emergency triage: one tap on what happened pre-writes the WhatsApp message.
 * Calling never depends on the selection. Options are native radios, so it is
 * keyboard- and screen-reader-friendly by default.
 */
export default function EmergencyPicker({ emergencies, phone, whatsappNumber }: EmergencyPickerProps) {
  const name = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const current = emergencies.find((e) => e.id === selected) ?? null;

  const message = current
    ? `Hola, tengo una emergencia: ${current.message}. Mi ubicación es: `
    : 'Hola, tengo una emergencia de cerrajería. Mi ubicación es: ';

  return (
    <div>
      <fieldset>
        <legend className="font-mono text-label text-paper/80 uppercase">¿Qué pasó?</legend>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
          {emergencies.map((option) => {
            const checked = option.id === selected;
            return (
              <label
                key={option.id}
                className={`group/opt relative flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-[0.8125rem] leading-snug tracking-[-0.01em] transition-[background-color,box-shadow,color] duration-300 ease-premium select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-paper sm:text-sm ${
                  checked ? 'bg-paper text-cobalt' : 'text-paper ring-1 ring-paper/25 ring-inset hover:bg-paper/[0.08]'
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.id}
                  checked={checked}
                  onChange={() => setSelected(option.id)}
                  className="sr-only"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 shrink-0 transition-transform duration-500 ease-spring group-hover/opt:-rotate-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {glyphs[option.glyph]}
                </svg>
                <span className="text-pretty">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {/* Call: the padlock's shackle lifts on hover — unlocked, ready to dial */}
        <a
          href={phone.href}
          className="group/call relative flex h-16 items-center justify-between gap-3 rounded-full bg-paper pr-2 pl-6 text-cobalt transition-[scale,background-color] duration-300 ease-premium hover:bg-white active:scale-[0.98]"
        >
          <span className="flex flex-col leading-tight">
            <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">Llamar ahora</span>
            <span className="font-mono text-label text-cobalt tabular-nums">{phone.display}</span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-cobalt text-paper">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path
                d="M8 11V8a4 4 0 0 1 8 0v3"
                className="origin-[16px_11px] transition-transform duration-500 ease-spring group-hover/call:-translate-y-[2.5px] group-hover/call:-rotate-[18deg]"
              />
              <rect x="5.5" y="11" width="13" height="9.5" rx="2.25" fill="currentColor" stroke="none" />
              <PhoneIcon x="8.5" y="12.6" width="7" height="7" className="text-cobalt" strokeWidth={2.2} />
            </svg>
          </span>
        </a>

        <a
          href={waHref(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="group/wa relative flex h-16 items-center justify-between gap-3 overflow-hidden rounded-full pr-2 pl-6 text-paper ring-1 ring-paper/35 ring-inset transition-[background-color,scale] duration-300 ease-premium hover:bg-paper/[0.08] active:scale-[0.98]"
        >
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">Escribir por WhatsApp</span>
            <span className="relative block h-4 overflow-hidden font-mono text-label text-paper/80">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={current?.id ?? 'none'}
                  className="block truncate"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.4, ease: easePremium }}
                >
                  {current ? `«${current.label}»` : 'Mensaje listo para enviar'}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/10 transition-transform duration-500 ease-spring group-hover/wa:rotate-[-8deg]">
            <WhatsAppIcon className="size-5" />
          </span>
        </a>
      </div>
    </div>
  );
}
