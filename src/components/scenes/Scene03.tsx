import { useT } from '@/translations';

/** Unit 3 — the four-stroke cycle with the 720° ring. */
export function Scene03({ step }: { step: number }) {
  const { s } = useT();
  const pos = [1, 0.06, 1, 0.06][step];              // piston 0 = TDC, 1 = BDC
  const gas = ['rgb(var(--cool) / .30)', 'rgb(var(--amber) / .5)', 'rgb(var(--hot) / .35)', 'rgb(var(--mute) / .35)'][step];
  const iOpen = step === 0, eOpen = step === 3;
  const pistonY = 96 + pos * 108;
  const names = [s('इनटेक', 'Intake'), s('कंप्रेशन', 'Compression'), s('पावर', 'Power'), s('एक्ज़ॉस्ट', 'Exhaust')];
  const cols = ['rgb(var(--cool))', 'rgb(var(--amber))', 'rgb(var(--hot))', 'rgb(var(--mute))'];
  const arc = (a0: number, a1: number, r: number) => {
    const p = (a: number) => [Math.cos(((a - 90) * Math.PI) / 180) * r, Math.sin(((a - 90) * Math.PI) / 180) * r];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  return (
    <svg viewBox="0 0 640 320" className="w-full h-auto" role="img" aria-label="four stroke cycle" data-testid="scene-3">
      <g transform="translate(130,0)">
        <rect x="-10" y="40" width="140" height="40" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
        <rect x="0" y="80" width="120" height="170" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
        <rect x="2" y="80" width="116" height={pistonY - 80} fill={gas} style={{ transition: 'all .9s ease' }} />
        {/* valves */}
        <g style={{ transform: `translateY(${iOpen ? 14 : 0}px)`, transition: 'transform .5s' }}><line x1="28" y1="42" x2="28" y2="78" stroke="rgb(var(--ink))" strokeWidth="5" /><rect x="14" y="78" width="28" height="5" fill="rgb(var(--cool))" /></g>
        <g style={{ transform: `translateY(${eOpen ? 14 : 0}px)`, transition: 'transform .5s' }}><line x1="92" y1="42" x2="92" y2="78" stroke="rgb(var(--ink))" strokeWidth="5" /><rect x="78" y="78" width="28" height="5" fill="rgb(var(--mute))" /></g>
        <rect x="52" y="30" width="16" height="30" fill="rgb(var(--amber))" />
        {step === 1 && <g>{[0, 1, 2].map((i) => <line key={i} x1={44 + i * 16} y1="110" x2={44 + i * 16} y2="150" stroke="rgb(var(--amber))" strokeWidth="2" strokeDasharray="3 3" className="animate-flow" />)}</g>}
        {step === 2 && <ellipse cx="60" cy="108" rx="44" ry="26" fill="rgb(var(--hot) / .75)" />}
        <g style={{ transform: `translateY(${pistonY - 96}px)`, transition: 'transform .9s ease-in-out' }}>
          <rect x="2" y="96" width="116" height="38" rx="3" fill="rgb(var(--mute) / .6)" stroke="rgb(var(--ink))" strokeWidth="1.5" />
          {[104, 110, 116].map((y) => <line key={y} x1="2" x2="118" y1={y} y2={y} stroke="rgb(var(--ink))" />)}
          <line x1="60" y1="134" x2="60" y2="200" stroke="rgb(var(--mute))" strokeWidth="7" strokeLinecap="round" />
        </g>
        {iOpen && <text x="28" y="22" textAnchor="middle" fontSize="20" fill="rgb(var(--cool))">↓</text>}
        {eOpen && <text x="92" y="22" textAnchor="middle" fontSize="20" fill="rgb(var(--mute))">↑</text>}
        <text x="60" y="290" textAnchor="middle" fontSize="17" fontWeight="700" fill={cols[step]}>{names[step]}</text>
        <text x="60" y="310" textAnchor="middle" fontSize="11" fill="rgb(var(--mute))">{s('इनटेक (ठंडा)', 'intake')} ◀  ▶ {s('एक्ज़ॉस्ट', 'exhaust')}</text>
      </g>
      {/* 720° ring */}
      <g transform="translate(450,150)">
        {[0, 1, 2, 3].map((i) => <path key={i} d={arc(i * 90 + 3, i * 90 + 87, 88)} fill="none" stroke={cols[i]} strokeWidth={step === i ? 20 : 10} opacity={step === i ? 1 : 0.4} strokeLinecap="butt" style={{ transition: 'all .4s' }} />)}
        <g style={{ transform: `rotate(${step * 90 + 45}deg)`, transition: 'transform 1s ease' }}><line x1="0" y1="0" x2="0" y2="-70" stroke="rgb(var(--ink))" strokeWidth="3" strokeLinecap="round" /><circle r="6" fill="rgb(var(--ink))" /></g>
        <text y="-8" textAnchor="middle" fontSize="12" fill="rgb(var(--mute))">720° CA</text>
        <text y="18" textAnchor="middle" fontSize="20" fontWeight="700" fill={cols[step]} fontFamily="JetBrains Mono, monospace">{step * 180}°–{step * 180 + 180}°</text>
        {names.map((n, i) => { const a = ((i * 90 + 45 - 90) * Math.PI) / 180; return <text key={i} x={Math.cos(a) * 124} y={Math.sin(a) * 124 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={cols[i]}>{n}</text>; })}
      </g>
    </svg>
  );
}
