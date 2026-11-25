import { useState } from 'react';
import { UNITS } from '@/data';
import { useT } from '@/translations';

const HOT: Record<number, [number, number]> = {
  1: [265, 205], 2: [205, 262], 3: [330, 122], 4: [325, 76], 5: [112, 150], 6: [62, 292], 7: [448, 215], 8: [545, 292], 9: [578, 128], 10: [594, 222],
};

/** Illustrated diesel-engine cutaway with 10 tappable hotspots → one per job card. */
export function EngineCutaway({ onPick, doneIds }: { onPick: (id: number) => void; doneIds: number[] }) {
  const { L } = useT();
  const [hover, setHover] = useState<number | null>(null);
  const hv = hover ? UNITS.find((u) => u.id === hover) : null;
  const line = 'rgb(var(--mute))';
  return (
    <div className="relative">
      <svg viewBox="0 0 640 370" className="w-full h-auto" role="group" aria-label="engine">
        {/* radiator + hoses */}
        <rect x="26" y="248" width="70" height="86" rx="6" fill="rgb(var(--panel))" stroke={line} strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1="34" x2="88" y1={258 + i * 11} y2={258 + i * 11} stroke="rgb(var(--cool))" strokeWidth="2" opacity=".6" />)}
        <path d="M96 270h60q14 0 14 14v-20M96 318h60q14 0 14-14" fill="none" stroke="rgb(var(--cool))" strokeWidth="5" opacity=".55" />
        {/* turbo + pipes */}
        <path d="M140 150h40" stroke="rgb(var(--amber))" strokeWidth="9" opacity=".7" /><path d="M140 168h40M170 168v40h12" stroke="rgb(var(--hot))" strokeWidth="9" opacity=".55" fill="none" />
        <circle cx="110" cy="150" r="34" fill="rgb(var(--panel2))" stroke={line} strokeWidth="3" />
        <circle cx="110" cy="150" r="20" fill="none" stroke="rgb(var(--cool))" strokeWidth="3" strokeDasharray="8 5" className="origin-center" />
        <circle cx="110" cy="150" r="5" fill="rgb(var(--ink))" />
        {/* common rail + injectors + tank */}
        <rect x="238" y="62" width="178" height="14" rx="6" fill="rgb(var(--amber))" opacity=".8" />
        {[265, 355].map((x) => <g key={x}><rect x={x - 4} y="76" width="8" height="34" fill="rgb(var(--cool))" /><path d={`M${x - 3} 110h6l-1 12h-4z`} fill="rgb(var(--cool))" /></g>)}
        <rect x="474" y="48" width="70" height="40" rx="6" fill="rgb(var(--panel))" stroke={line} strokeWidth="2" /><path d="M416 69h58" stroke="rgb(var(--amber))" strokeWidth="4" strokeDasharray="6 4" />
        {/* block, head, cylinders */}
        <rect x="190" y="128" width="236" height="172" fill="rgb(var(--panel))" stroke={line} strokeWidth="2.5" />
        <rect x="178" y="92" width="260" height="38" rx="4" fill="rgb(var(--panel2))" stroke={line} strokeWidth="2.5" />
        <rect x="178" y="128" width="260" height="4" fill="rgb(var(--amber))" />
        {[265, 355].map((x, i) => (
          <g key={x}>
            <rect x={x - 32} y="132" width="64" height="118" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x={x - 28} y={i ? 168 : 182} width="56" height="30" rx="3" fill="rgb(var(--mute) / .6)" stroke="rgb(var(--ink))" />
            <line x1={x} y1={(i ? 168 : 182) + 30} x2={x} y2="282" stroke="rgb(var(--ink))" strokeWidth="9" strokeLinecap="round" />
            <circle cx={x} cy="284" r="14" fill="rgb(var(--panel))" stroke="rgb(var(--ink))" strokeWidth="2.5" />
            <path d={`M${x - 40} 120l-5 -22M${x + 40} 120l5 -22`} stroke="rgb(var(--ink))" strokeWidth="3" />
          </g>
        ))}
        {/* oil filter + sump */}
        <rect x="436" y="190" width="24" height="52" rx="5" fill="rgb(var(--amber) / .55)" stroke={line} strokeWidth="2" />
        <path d="M186 300h244l-22 36H208z" fill="rgb(var(--panel2))" stroke={line} strokeWidth="2.5" />
        {/* flywheel, starter, battery */}
        <line x1="425" y1="284" x2="474" y2="284" stroke={line} strokeWidth="9" />
        <circle cx="500" cy="284" r="36" fill="rgb(var(--panel2))" stroke="rgb(var(--ink))" strokeWidth="3" /><circle cx="500" cy="284" r="40" fill="none" stroke="rgb(var(--cool))" strokeWidth="3" strokeDasharray="3 4" />
        <rect x="528" y="310" width="46" height="26" rx="5" fill="rgb(var(--panel))" stroke={line} strokeWidth="2" />
        <rect x="574" y="300" width="56" height="42" rx="4" fill="rgb(var(--ok) / .3)" stroke={line} strokeWidth="2" /><path d="M586 300v-7h10v7M608 300v-7h10v7" stroke={line} strokeWidth="3" fill="none" />
        {/* scan tool + toolbox */}
        <rect x="548" y="100" width="62" height="44" rx="4" fill="rgb(var(--panel))" stroke={line} strokeWidth="2" /><path d="M556 124h12l6-12 8 22 6-10h14" stroke="rgb(var(--ok))" strokeWidth="2.5" fill="none" />
        <rect x="566" y="196" width="56" height="42" rx="5" fill="rgb(var(--panel))" stroke={line} strokeWidth="2" /><path d="M582 196v-8h24v8M566 214h56" stroke={line} strokeWidth="2" fill="none" />

        {UNITS.map((u) => {
          const [x, y] = HOT[u.id]; const d = doneIds.includes(u.id);
          return (
            <g key={u.id} transform={`translate(${x},${y})`} className="cursor-pointer" tabIndex={0} role="button" aria-label={L(u.title)} data-hotspot={u.id}
              onClick={() => onPick(u.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(u.id); }}
              onMouseEnter={() => setHover(u.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(u.id)} onBlur={() => setHover(null)}>
              <circle r="21" fill="transparent" />
              <circle r="14" fill={d ? 'rgb(var(--ok))' : 'rgb(var(--cool))'} stroke="rgb(var(--bg))" strokeWidth="2.5" className={d ? '' : 'animate-pulseRing'} />
              <text textAnchor="middle" y="4.5" fontSize="12.500" fontWeight="800" fill="rgb(var(--bg))" fontFamily="JetBrains Mono, monospace">{u.id}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute left-2 bottom-2 right-2 sm:right-auto sm:max-w-sm pointer-events-none">
        {hv && <div className="rounded-md border border-cool/50 bg-panel/95 px-3 py-2 text-sm font-bold shadow-lg"><span className="readout text-cool mr-2">{String(hv.id).padStart(2, '0')}</span>{L(hv.title)}</div>}
      </div>
    </div>
  );
}
