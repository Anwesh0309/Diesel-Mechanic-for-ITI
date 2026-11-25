import { useRef, useState } from 'react';
import { bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Dial, Meter } from '@/components/ui/kit';
import { Trace } from '@/components/simkit/Trace';
import { playWhoosh } from '@/lib/sound';

const OVER = 190;
const PARTS = [
  { id: 'filter', x: 20, w: 90, hi: 'एयर फ़िल्टर बॉक्स', en: 'Air-filter box' },
  { id: 'compOut', x: 150, w: 90, hi: 'कंप्रेसर आउटलेट होज़', en: 'Compressor outlet hose' },
  { id: 'ic', x: 275, w: 110, hi: 'इंटरकूलर कोर', en: 'Intercooler core' },
  { id: 'hoseB', x: 420, w: 90, hi: 'इंटरकूलर आउटलेट क्लैंप', en: 'Intercooler outlet clamp' },
  { id: 'manifold', x: 540, w: 80, hi: 'इनटेक मैनिफ़ोल्ड', en: 'Intake manifold' },
];

/** Unit 5 — turbo boost lab: wastegate control, intercooler benefit, boost-leak hunt. */
export default function Sim05Turbo() {
  const { s, L } = useT();
  const run = useRun(5, 11);
  const [phase, setPhase] = useState(0);
  const [rpm, setRpm] = useState(1800);
  const [load, setLoad] = useState(100);
  const [wg, setWg] = useState(20);
  const [ic, setIc] = useState(false);
  const [leak, setLeak] = useState(false);
  const [boost, setBoost] = useState(0);
  const [rot, setRot] = useState(0);
  const [hist, setHist] = useState<number[]>([]);
  const [hold, setHold] = useState(0);
  const [ok, setOk] = useState([false, false, false]);
  const refs = useRef({ boost: 0, hold: 0, over: 0, overFlag: false, acc: 0, rot: 0 });

  const E = (rpm / 2400) * (load / 100);
  const target = 300 * E * (1 - 0.9 * (wg / 100)) * (leak ? 0.5 : 1);
  const temp = 30 + 0.8 * boost * (ic ? 0.15 : 1);
  const dens = ((101 + boost) / 101) * (303 / (273 + temp)) * 100;
  const inBand = boost >= 150 && boost <= 180;

  useTicker(!run.finished, (dt) => {
    const r = refs.current;
    r.boost += (target - r.boost) * (1 - Math.exp(-dt / 0.9));
    r.rot = (r.rot + (120 + r.boost * 8) * dt) % 360;
    // overboost protection
    if (r.boost > OVER) { r.over += dt; if (r.over > 1.5 && !r.overFlag) { r.overFlag = true; run.miss(bi('ओवरबूस्ट! टर्बो/इंजन को ख़तरा — वेस्टगेट और खोलें।', 'Overboost! Risk to turbo/engine — open the wastegate more.')); } } else { r.over = 0; r.overFlag = false; }
    // hold timers
    if (phase === 0 && !ok[0]) { r.hold = inBand ? r.hold + dt : 0; if (r.hold >= 2.5) { setOk((o) => [true, o[1], o[2]]); run.add(4, bi('बूस्ट 150–180 kPa में स्थिर — वेस्टगेट सही सेट।', 'Boost steady at 150–180 kPa — wastegate set correctly.')); playWhoosh(); } }
    if (phase === 1 && !ok[1]) { const good = temp < 70 && r.boost >= 140; r.hold = good ? r.hold + dt : 0; if (r.hold >= 2) { setOk((o) => [o[0], true, o[2]]); run.add(3, bi('इंटरकूलर से हवा 70 °C से कम व घनत्व अधिक — अधिक ऑक्सीजन।', 'Intercooler brings charge air under 70 °C with higher density — more oxygen.')); } }
    r.acc += dt; if (r.acc > 0.12) { r.acc = 0; setHist((h) => [...h.slice(-59), r.boost]); }
    setBoost(r.boost); setRot(r.rot); setHold(r.hold);
  });

  const pick = (id: string) => {
    if (phase !== 2 || ok[2]) return;
    if (id === 'hoseB') { setLeak(false); setOk((o) => [o[0], o[1], true]); run.add(4, bi('रिसाव मिला — आउटलेट क्लैंप ढीला था; कसते ही बूस्ट लौट आया।', 'Leak found — the outlet clamp was loose; boost returns once tightened.')); }
    else run.miss(bi('यहाँ रिसाव नहीं। कंप्रेसर के बाद के ज़्यादा-दाब वाले जोड़ और क्लैंप देखें — सीटी की आवाज़ कहाँ से?', 'No leak here. Look at the high-pressure joints and clamps after the compressor — where is the hiss?'));
  };
  const next = () => {
    const n = phase + 1; setPhase(n); refs.current.hold = 0; setHold(0);
    if (n === 1) { setRpm(1800); setLoad(100); setWg(25); setIc(false); }
    if (n === 2) { setIc(true); setWg(25); setLeak(true); run.say('info', bi('इंजन में बूस्ट कम है और सीटी जैसी आवाज़ आ रही है — रिसाव खोजें।', 'Boost is low and you can hear a hiss — find the leak.')); }
  };
  const phases = [bi('वेस्टगेट ट्यूनिंग', 'Wastegate tuning'), bi('इंटरकूलर', 'Intercooler'), bi('बूस्ट-लीक खोज', 'Boost-leak hunt')];
  const canNext = ok[phase];
  const hints = [bi('1800 rpm, पूरे लोड पर बूस्ट बहुत ऊँचा जाता है; वेस्टगेट लगभग 25% खोलें और स्थिर रखें।', 'At 1800 rpm full load boost climbs too high; open the wastegate about 25% and hold it.'),
    bi('इंटरकूलर चालू करें और बूस्ट 140 kPa से ऊपर रखें।', 'Switch the intercooler on and keep boost above 140 kPa.'),
    bi('हवा-रिसाव आम तौर पर कंप्रेसर के बाद, ऊँचे दाब वाले पाइप के क्लैंप पर होता है।', 'Air leaks usually occur at clamps on the pressurised pipes after the compressor.')];
  const reset = () => { run.reset(); setPhase(0); setRpm(1800); setLoad(100); setWg(20); setIc(false); setLeak(false); setOk([false, false, false]); refs.current = { boost: 0, hold: 0, over: 0, overFlag: false, acc: 0, rot: 0 }; setBoost(0); setHist([]); setHold(0); };

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={next} getHint={() => hints[phase]} onReset={reset}
      title={bi('टर्बो बूस्ट लैब', 'Turbo boost lab')}
      intro={bi('वेस्टगेट से बूस्ट नियंत्रित करें, इंटरकूलर का असर देखें और हवा का रिसाव खोजें।', 'Control boost with the wastegate, see the intercooler effect and hunt a boost leak.')}>
      <div className="grid gap-4">
        <svg viewBox="0 0 640 190" className="w-full h-auto" role="group" aria-label="intake path" data-testid="air-path">
          <line x1="20" y1="100" x2="620" y2="100" stroke="rgb(var(--cool))" strokeWidth="5" opacity=".35" />
          {PARTS.map((p) => (
            <g key={p.id} className={phase === 2 && !ok[2] ? 'cursor-pointer' : ''} role={phase === 2 ? 'button' : undefined} tabIndex={phase === 2 ? 0 : -1} aria-label={L(bi(p.hi, p.en))} data-part={p.id}
              onClick={() => pick(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(p.id); }}>
              <rect x={p.x} y="62" width={p.w} height="76" rx="8" fill={p.id === 'ic' ? 'rgb(var(--cool) / .18)' : 'rgb(var(--panel))'} stroke={phase === 2 && !ok[2] ? 'rgb(var(--amber))' : 'rgb(var(--mute))'} strokeWidth="2.5" strokeDasharray={phase === 2 && !ok[2] ? '5 4' : undefined} />
              {p.id === 'ic' && [0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={p.x + 12 + i * 17} x2={p.x + 12 + i * 17} y1="70" y2="130" stroke="rgb(var(--cool))" strokeWidth="2" opacity={ic ? 1 : 0.35} />)}
              <text x={p.x + p.w / 2} y="155" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="rgb(var(--ink))">{L(bi(p.hi, p.en))}</text>
              {leak && p.id === 'hoseB' && <g>{[0, 1, 2].map((i) => <circle key={i} cx={p.x + 20 + i * 24} cy={50 - i * 6} r="5" fill="rgb(var(--mute) / .6)" className="animate-pulse" />)}</g>}
            </g>
          ))}
          <g transform="translate(130,30)"><circle r="22" fill="rgb(var(--panel2))" stroke="rgb(var(--ink))" strokeWidth="2.5" /><g style={{ transformOrigin: '0px 0px', transform: `rotate(${rot}deg)` }}>{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1="0" y1="0" x2="0" y2="-18" transform={`rotate(${a})`} stroke="rgb(var(--cool))" strokeWidth="3" />)}</g></g>
          <text x="130" y="66" textAnchor="middle" fontSize="10" fill="rgb(var(--mute))">{s('टर्बो', 'Turbo')}</text>
        </svg>

        <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
          <div className="flex flex-col items-center gap-2">
            <Dial value={boost} min={0} max={250} label={s('बूस्ट', 'Boost')} unit="kPa (g)" zones={[{ from: 150, to: 180, tone: 'ok' }, { from: OVER, to: 250, tone: 'hot' }]} size={170} />
            <div className="w-full max-w-[220px]"><Trace data={hist} min={0} max={250} band={[150, 180]} label="boost trace" /></div>
          </div>
          <div className="grid gap-3">
            <label className="block"><div className="flex justify-between text-sm mb-1"><span className="font-semibold">{s('इंजन गति', 'Engine speed')}</span><span className="readout text-cool">{rpm} rpm</span></div>
              <input type="range" className="w-full" min={800} max={2400} step={100} value={rpm} disabled={phase < 2} onChange={(e) => setRpm(Number(e.target.value))} aria-label="rpm" data-testid="rpm" /></label>
            <label className="block"><div className="flex justify-between text-sm mb-1"><span className="font-semibold">{s('लोड', 'Load')}</span><span className="readout text-cool">{load}%</span></div>
              <input type="range" className="w-full" min={10} max={100} step={10} value={load} disabled={phase < 2} onChange={(e) => setLoad(Number(e.target.value))} aria-label="load" /></label>
            <label className="block"><div className="flex justify-between text-sm mb-1"><span className="font-semibold">{s('वेस्टगेट खुला', 'Wastegate open')}</span><span className="readout text-amber" data-testid="wg-val">{wg}%</span></div>
              <input type="range" className="w-full" min={0} max={100} step={5} value={wg} disabled={phase === 2} onChange={(e) => setWg(Number(e.target.value))} aria-label="wastegate" data-testid="wg" /></label>
            <button className={`btn justify-between ${ic ? '!border-cool !text-cool' : ''}`} aria-pressed={ic} onClick={() => setIc(!ic)} disabled={phase === 2} data-testid="ic"><span>{s('इंटरकूलर', 'Intercooler')}</span><span className="chip bg-panel2">{ic ? 'ON' : 'OFF'}</span></button>
            <Meter value={temp} max={200} band={[0, 70]} label={s('चार्ज-एयर तापमान (लक्ष्य < 70 °C)', 'Charge-air temp (target < 70 °C)')} unit=" °C" tone={temp < 70 ? 'ok' : 'hot'} />
            <div className="text-sm text-mute">{s('हवा का घनत्व', 'Air density')}: <span className="readout text-cool">{Math.round(dens)}%</span> · {s('स्थिरता', 'Hold')}: <span className="readout">{hold.toFixed(1)} s</span></div>
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
