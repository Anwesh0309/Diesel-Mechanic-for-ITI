import { useT } from '@/translations';

/** Unit 1 — petrol vs diesel: compression ignition animated in 4 steps. */
function Cyl({ x, p, gas, kind, spray, flame, fade, title }: { x: number; p: number; gas: string; kind: 'spark' | 'inj'; spray?: boolean; flame?: number; fade?: boolean; title: string }) {
  const top = 70, h = 170, w = 110; const pistonY = top + 14 + p * 100;
  return (
    <g transform={`translate(${x},0)`} opacity={fade ? 0.35 : 1} style={{ transition: 'opacity .6s' }}>
      <text x={w / 2} y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill="rgb(var(--ink))">{title}</text>
      <rect x="-10" y={top - 22} width={w + 20} height="30" rx="5" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
      <rect x="0" y={top} width={w} height={h} fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
      <rect x="2" y={top} width={w - 4} height={pistonY - top} fill={gas} style={{ transition: 'all .9s ease' }} />
      {kind === 'spark'
        ? <g><rect x={w / 2 - 5} y={top - 40} width="10" height="26" fill="rgb(var(--mute))" /><path d={`M${w / 2} ${top - 12} l-4 8 h8 z`} fill="rgb(var(--amber))" /></g>
        : <g><rect x={w / 2 - 6} y={top - 42} width="12" height="26" fill="rgb(var(--cool))" /><path d={`M${w / 2 - 4} ${top - 16} h8 l-2 14 h-4 z`} fill="rgb(var(--cool))" /></g>}
      {spray && kind === 'inj' && (
        <g>{[-26, -13, 0, 13, 26].map((dx, i) => <line key={i} x1={w / 2} y1={top - 2} x2={w / 2 + dx} y2={top + 52} stroke="rgb(var(--amber))" strokeWidth="2.5" strokeDasharray="4 4" className="animate-flow" />)}</g>
      )}
      {!!flame && <ellipse cx={w / 2} cy={top + 10 + flame * 24} rx={14 + flame * 30} ry={8 + flame * 20} fill="rgb(var(--hot) / .75)" style={{ transition: 'all .8s' }} />}
      <g style={{ transform: `translateY(${pistonY - (top + 14)}px)`, transition: 'transform .9s ease-in-out' }}>
        <rect x="2" y={top + 14} width={w - 4} height="34" rx="3" fill="rgb(var(--mute) / .55)" stroke="rgb(var(--ink))" strokeWidth="1.5" />
        {[20, 26, 32].map((o) => <line key={o} x1="2" x2={w - 2} y1={top + o} y2={top + o} stroke="rgb(var(--ink))" strokeWidth="1" />)}
        <line x1={w / 2} y1={top + 48} x2={w / 2} y2={top + 130} stroke="rgb(var(--mute))" strokeWidth="6" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Scene01({ step }: { step: number }) {
  const { s } = useT();
  const gasAir = 'rgb(var(--cool) / .28)', gasHot = 'rgb(var(--amber) / .45)', gasMix = 'rgb(var(--ok) / .30)';
  const tmp = step === 1 ? '≈ 500–700 °C' : step >= 2 ? '> 800 °C' : '≈ 30 °C';
  return (
    <svg viewBox="0 0 640 310" className="w-full h-auto" role="img" aria-label="compression ignition" data-testid="scene-1">
      <Cyl x={90} p={step === 1 ? 0.15 : 0.5} gas={gasMix} kind="spark" fade={step >= 1} title={s('पेट्रोल: मिश्रण + स्पार्क', 'Petrol: mixture + spark')} />
      <Cyl x={440} p={step === 0 ? 0.5 : step === 1 ? 0.1 : step === 2 ? 0.1 : 0.9} gas={step === 0 ? gasAir : gasHot} kind="inj" spray={step === 2} flame={step === 2 ? 0.3 : step === 3 ? 1 : 0} title={s('डीज़ल: केवल हवा', 'Diesel: air only')} />
      <g transform="translate(260,110)">
        <rect width="120" height="90" rx="8" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
        <text x="60" y="22" textAnchor="middle" fontSize="11" fill="rgb(var(--mute))">{s('हवा का तापमान', 'Air temperature')}</text>
        <text x="60" y="52" textAnchor="middle" fontSize="17" fontWeight="700" fill={step >= 1 ? 'rgb(var(--hot))' : 'rgb(var(--cool))'} fontFamily="JetBrains Mono, monospace">{tmp}</text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" fill="rgb(var(--mute))">{step === 3 ? s('पावर स्ट्रोक ↓', 'Power stroke ↓') : step === 2 ? s('इंजेक्शन → स्वतः जलना', 'Inject → self-ignite') : step === 1 ? s('CR 14–22 : 1', 'CR 14–22 : 1') : s('हवा खींचना', 'Air drawn in')}</text>
      </g>
    </svg>
  );
}
