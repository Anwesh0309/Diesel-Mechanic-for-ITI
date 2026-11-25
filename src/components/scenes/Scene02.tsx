import { useT } from '@/translations';

type G = 0 | 1 | 2 | 3;
const labels: { g: G; x: number; y: number; hi: string; en: string; a?: 'start' | 'end' | 'middle' }[] = [
  { g: 0, x: 215, y: 215, hi: 'सिलेंडर ब्लॉक', en: 'Cylinder block', a: 'end' },
  { g: 0, x: 205, y: 100, hi: 'सिलेंडर हेड', en: 'Cylinder head', a: 'end' },
  { g: 0, x: 435, y: 132, hi: 'हेड गैस्केट', en: 'Head gasket', a: 'start' },
  { g: 1, x: 375, y: 172, hi: 'पिस्टन', en: 'Piston', a: 'start' },
  { g: 1, x: 375, y: 196, hi: 'रिंग्स (2+1)', en: 'Rings (2+1)', a: 'start' },
  { g: 1, x: 375, y: 222, hi: 'गजन पिन', en: 'Gudgeon pin', a: 'start' },
  { g: 2, x: 330, y: 280, hi: 'कनेक्टिंग रॉड', en: 'Connecting rod', a: 'start' },
  { g: 2, x: 320, y: 385, hi: 'क्रैंकशाफ़्ट', en: 'Crankshaft', a: 'middle' },
  { g: 2, x: 505, y: 378, hi: 'फ़्लाईव्हील', en: 'Flywheel', a: 'middle' },
  { g: 3, x: 100, y: 47, hi: 'रॉकर आर्म', en: 'Rocker arm', a: 'middle' },
  { g: 3, x: 232, y: 175, hi: 'पुश रॉड', en: 'Pushrod', a: 'end' },
  { g: 3, x: 232, y: 285, hi: 'कैमशाफ़्ट', en: 'Camshaft', a: 'end' },
  { g: 3, x: 320, y: 112, hi: 'वाल्व', en: 'Valves', a: 'middle' },
];

/** Unit 2 — engine cutaway; each step spotlights a group of parts. */
export function Scene02({ step }: { step: number }) {
  const { s, L } = useT();
  const on = (g: G) => (step === g ? 1 : 0.22);
  const t = { transition: 'opacity .5s' };
  const crankA = step === 2 ? 40 : 0;
  return (
    <svg viewBox="0 0 640 420" className="w-full h-auto" role="img" aria-label="engine cutaway" data-testid="scene-2">
      {/* 0: block + head + gasket */}
      <g opacity={on(0)} style={t}>
        <rect x="220" y="130" width="200" height="170" fill="rgb(var(--panel))" stroke="rgb(var(--mute))" strokeWidth="2" />
        <rect x="270" y="130" width="100" height="130" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
        <rect x="224" y="140" width="16" height="110" fill="rgb(var(--cool) / .25)" /><rect x="400" y="140" width="16" height="110" fill="rgb(var(--cool) / .25)" />
        <rect x="210" y="70" width="220" height="58" rx="4" fill="rgb(var(--panel2))" stroke="rgb(var(--mute))" strokeWidth="2" />
        <rect x="210" y="128" width="220" height="5" fill="rgb(var(--amber))" />
        <path d="M200 300h240l-18 34H218z" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
      </g>
      {/* 3: valve train */}
      <g opacity={on(3)} style={t}>
        {[290, 350].map((x) => <g key={x}><line x1={x} y1="62" x2={x} y2="128" stroke="rgb(var(--ink))" strokeWidth="5" /><path d={`M${x - 14} 128 h28 l-6 -7 h-16z`} fill="rgb(var(--ink))" /></g>)}
        <line x1="70" y1="52" x2="370" y2="52" stroke="rgb(var(--cool))" strokeWidth="7" strokeLinecap="round" />
        <circle cx="320" cy="52" r="6" fill="rgb(var(--amber))" />
        <line x1="240" y1="52" x2="240" y2="236" stroke="rgb(var(--cool))" strokeWidth="5" />
        <circle cx="240" cy="258" r="20" fill="rgb(var(--panel))" stroke="rgb(var(--ink))" strokeWidth="2.5" />
        <path d="M240 238 l9 14 h-18z" fill="rgb(var(--ink))" />
        <circle cx="400" cy="258" r="20" fill="rgb(var(--panel))" stroke="rgb(var(--ink))" strokeWidth="2.5" />
        <line x1="240" y1="278" x2="400" y2="278" stroke="rgb(var(--line))" strokeWidth="2" strokeDasharray="6 4" />
      </g>
      {/* 1: piston */}
      <g opacity={on(1)} style={t}>
        <rect x="275" y="165" width="90" height="48" rx="4" fill="rgb(var(--mute) / .6)" stroke="rgb(var(--ink))" strokeWidth="2" />
        {[172, 179, 186].map((y, i) => <line key={y} x1="275" x2="365" y1={y} y2={y} stroke="rgb(var(--ink))" strokeWidth={i === 2 ? 3 : 2} />)}
        <circle cx="320" cy="200" r="7" fill="rgb(var(--amber))" stroke="rgb(var(--ink))" />
      </g>
      {/* 2: rod, crank, flywheel */}
      <g opacity={on(2)} style={t}>
        <line x1="320" y1="205" x2="320" y2="340" stroke="rgb(var(--ink))" strokeWidth="14" strokeLinecap="round" />
        <circle cx="320" cy="340" r="16" fill="rgb(var(--panel))" stroke="rgb(var(--ink))" strokeWidth="3" />
        <g style={{ transformOrigin: '320px 345px', transform: `rotate(${crankA}deg)`, transition: 'transform 1s' }}>
          <circle cx="320" cy="345" r="40" fill="none" stroke="rgb(var(--mute))" strokeWidth="3" strokeDasharray="6 5" />
          <rect x="296" y="343" width="48" height="8" rx="4" fill="rgb(var(--amber))" />
        </g>
        <line x1="320" y1="345" x2="505" y2="345" stroke="rgb(var(--mute))" strokeWidth="9" />
        <circle cx="505" cy="345" r="42" fill="rgb(var(--panel2))" stroke="rgb(var(--ink))" strokeWidth="3" />
        <circle cx="505" cy="345" r="46" fill="none" stroke="rgb(var(--cool))" strokeWidth="3" strokeDasharray="3 4" />
        <circle cx="505" cy="345" r="9" fill="rgb(var(--mute))" />
      </g>
      {labels.filter((l) => l.g === step).map((l, i) => (
        <g key={i}>
          <rect x={l.x - (l.a === 'end' ? 108 : l.a === 'middle' ? 54 : 0) - 4} y={l.y - 14} width="116" height="20" rx="4" fill="rgb(var(--bg) / .85)" />
          <text x={l.x} y={l.y} textAnchor={l.a ?? 'start'} fontSize="13" fontWeight="700" fill="rgb(var(--cool))">{s(l.hi, l.en)}</text>
        </g>
      ))}
      <text x="12" y="408" fontSize="11" fill="rgb(var(--mute))">{L({ hi: 'सरल अनुभागीय चित्र — उदाहरण', en: 'Simplified cutaway — schematic' })}</text>
    </svg>
  );
}
