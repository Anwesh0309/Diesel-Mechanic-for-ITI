import { useRef, useState } from 'react';
import { bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Dial, Meter } from '@/components/ui/kit';
import { playCrank, playIgnition, playMisfire } from '@/lib/sound';

const IGN = 450;
const tComp = (cr: number, amb: number, glow: boolean) => (amb + 273) * Math.pow(cr, 0.35) - 273 + (glow ? 60 : 0);

/** Unit 1 — Compression-ignition bench: ratio, ambient temperature and glow plug decide whether fuel ignites. */
export default function Sim01Ignition() {
  const { t, L, s } = useT();
  const run = useRun(1, 11);
  const [phase, setPhase] = useState(0);
  const [cr, setCr] = useState(12);
  const [glow, setGlow] = useState(false);
  const [prog, setProg] = useState(0);
  const [cranking, setCranking] = useState(false);
  const [verdict, setVerdict] = useState<null | 'burn' | 'miss'>(null);
  const [ok, setOk] = useState([false, false, false]);
  const [coldFail, setColdFail] = useState(false);
  const [qa, setQa] = useState<[number | null, number | null]>([null, null]);
  const timer = useRef<number | null>(null);
  const amb = phase === 0 ? 20 : -10;
  const live = tComp(cr, amb, glow);

  const progRef = useRef(0);
  useTicker(cranking, (dt) => {
    if (progRef.current >= 1) return;
    progRef.current = Math.min(1, progRef.current + dt / 1.1);
    setProg(progRef.current);
    if (progRef.current >= 1) finishCrank();
  });

  function finishCrank() {
    setCranking(false);
    const tc = tComp(cr, amb, glow); const burn = tc >= IGN;
    setVerdict(burn ? 'burn' : 'miss');
    const T = Math.round(tc);
    if (burn) {
      playIgnition();
      if (!ok[phase]) {
        const pts = phase === 0 ? 3 : 3;
        run.add(pts, bi(`इग्निशन! हवा ${T} °C तक पहुँची (≥ ${IGN} °C) — ईंधन अपने आप जल उठा।`, `Ignition! Air reached ${T} °C (≥ ${IGN} °C) — the fuel lit by itself.`));
        setOk((o) => o.map((v, i) => (i === phase ? true : v)));
      } else run.say('ok', bi(`फिर इग्निशन (${T} °C)।`, `Ignition again (${T} °C).`));
    } else {
      playMisfire();
      if (phase === 1 && !glow && !coldFail) { setColdFail(true); run.add(1); }
      run.say('bad', bi(`मिसफ़ायर — हवा केवल ${T} °C, जो ${IGN} °C से कम है।${phase === 1 ? ' ग्लो प्लग चालू करें व/या कंप्रेशन बढ़ाएँ।' : ' कंप्रेशन रेश्यो बढ़ाएँ।'}`, `Misfire — air only ${T} °C, below ${IGN} °C.${phase === 1 ? ' Switch glow plugs on and/or raise compression.' : ' Raise the compression ratio.'}`));
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { progRef.current = 0; setProg(0); setVerdict(null); }, 1800);
  }

  const crank = () => { if (cranking) return; if (timer.current) clearTimeout(timer.current); setVerdict(null); progRef.current = 0; setProg(0); setCranking(true); playCrank(); };

  const questions = [
    { q: bi('स्वेप्ट वॉल्यूम 450 cc, क्लीयरेंस 30 cc। कंप्रेशन रेश्यो?', 'Swept volume 450 cc, clearance 30 cc. Compression ratio?'), o: ['14:1', '15:1', '16:1', '17:1'], a: 2 },
    { q: bi('बोर 100 mm, स्ट्रोक 110 mm। एक सिलेंडर का स्वेप्ट वॉल्यूम (≈)?', 'Bore 100 mm, stroke 110 mm. Swept volume of one cylinder (≈)?'), o: ['432 cc', '864 cc', '1728 cc', '86 cc'], a: 1 },
  ];
  const answer = (qi: number, oi: number) => {
    if (qa[qi] === questions[qi].a) return;
    if (oi === questions[qi].a) { setQa((x) => (qi === 0 ? [oi, x[1]] : [x[0], oi])); run.add(2, bi('सही! गणना ठीक है।', 'Correct! Calculation is right.')); }
    else run.miss(bi(qi === 0 ? 'CR = (Vs + Vc) / Vc = (450 + 30) / 30 — फिर से करें।' : 'Vs = (π/4) × D² × L, D और L mm में → mm³ को 1000 से भाग देकर cc।', qi === 0 ? 'CR = (Vs + Vc) / Vc = (450 + 30) / 30 — try again.' : 'Vs = (π/4) × D² × L with D, L in mm → divide mm³ by 1000 for cc.'));
  };

  const phases = [bi('सामान्य तापमान पर इग्निशन', 'Ignite at normal temperature'), bi('ठंडा स्टार्ट (−10 °C)', 'Cold start (−10 °C)'), bi('गणना', 'Calculations')];
  const canNext = phase < 2 ? ok[phase] : qa[0] === 2 && qa[1] === 1;
  const hints = [
    bi(`20 °C पर हवा को ${IGN} °C से ऊपर ले जाने को कंप्रेशन रेश्यो कम से कम 14 रखें, फिर 'क्रैंक' दबाएँ।`, `At 20 °C you need a compression ratio of at least 14 to pass ${IGN} °C — then press Crank.`),
    bi('पहले ग्लो प्लग बंद रखकर क्रैंक करें (विफलता देखें), फिर ग्लो प्लग चालू करें। CR 15+ चाहिए।', 'First crank with glow plugs off (see the failure), then switch them on. You need CR 15 or more.'),
    bi('CR = (450 + 30) ÷ 30 और Vs = (π/4) × 100² × 110 mm³।', 'CR = (450 + 30) ÷ 30 and Vs = (π/4) × 100² × 110 mm³.'),
  ];
  const reset = () => { run.reset(); setPhase(0); setCr(12); setGlow(false); progRef.current = 0; setProg(0); setCranking(false); setVerdict(null); setOk([false, false, false]); setColdFail(false); setQa([null, null]); };

  // piston: 0.5 (mid) → 0.1 (TDC) while cranking
  const pp = 0.5 - 0.4 * prog;
  const top = 60, pistonY = top + 10 + pp * 120;

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => { setPhase(phase + 1); progRef.current = 0; setProg(0); setVerdict(null); run.say('info', bi('अगला चरण।', 'Next phase.')); }} getHint={() => hints[phase]} onReset={reset}
      title={bi('संपीड़न-प्रज्वलन बेंच', 'Compression-ignition bench')}
      intro={bi('कंप्रेशन रेश्यो व ग्लो प्लग चुनें, फिर क्रैंक करें — देखें हवा इतनी गर्म हुई या नहीं कि डीज़ल अपने आप जले।', 'Choose compression ratio and glow plugs, then crank — see whether the air gets hot enough for diesel to ignite by itself.')}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <svg viewBox="0 0 260 270" className="w-full max-w-[300px] mx-auto h-auto" role="img" aria-label="cylinder">
            <rect x="45" y={top - 22} width="170" height="26" rx="5" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x="55" y={top} width="150" height="170" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x="57" y={top} width="146" height={pistonY - top} fill={prog > 0.5 ? 'rgb(var(--amber) / .45)' : 'rgb(var(--cool) / .28)'} />
            <rect x="124" y={top - 44} width="12" height="24" fill="rgb(var(--cool))" /><path d={`M126 ${top - 20}h8l-2 18h-4z`} fill="rgb(var(--cool))" />
            {glow && <g><rect x="76" y={top - 34} width="8" height="26" fill="rgb(var(--amber))" /><circle cx="80" cy={top + 4} r="5" fill="rgb(var(--hot))" className="animate-pulse" /></g>}
            {verdict === 'burn' && <ellipse cx="130" cy={top + 30} rx="46" ry="26" fill="rgb(var(--hot) / .8)" className="animate-pulse" />}
            {verdict === 'miss' && [0, 1, 2].map((i) => <circle key={i} cx={100 + i * 30} cy={top + 30 - i * 6} r="12" fill="rgb(var(--mute) / .5)" />)}
            <rect x="57" y={pistonY} width="146" height="34" rx="3" fill="rgb(var(--mute) / .6)" stroke="rgb(var(--ink))" strokeWidth="1.5" />
            {[8, 14, 20].map((o) => <line key={o} x1="57" x2="203" y1={pistonY + o} y2={pistonY + o} stroke="rgb(var(--ink))" />)}
            <line x1="130" y1={pistonY + 34} x2="130" y2="240" stroke="rgb(var(--mute))" strokeWidth="8" strokeLinecap="round" />
            <text x="130" y="262" textAnchor="middle" fontSize="12" fill="rgb(var(--mute))">{s('परिवेश', 'Ambient')} {amb} °C</text>
          </svg>
        </div>
        <div className="grid gap-4 content-start">
          <div className="flex items-center gap-3">
            <Dial value={Math.max(0, live)} min={0} max={800} label={s('संपीड़न तापमान', 'Compression temp')} unit="°C" size={150} zones={[{ from: 0, to: IGN, tone: 'hot' }, { from: IGN, to: 800, tone: 'ok' }]} />
            <div className="text-sm min-w-0">
              <div className="text-mute">{s('अनुमानित (मॉडल)', 'Predicted (model)')}</div>
              <div className="readout text-2xl" data-testid="tc">{Math.round(live)} °C</div>
              <div className={live >= IGN ? 'text-ok font-bold' : 'text-hot font-bold'}>{live >= IGN ? s('इग्निशन संभव', 'Will ignite') : s('इग्निशन नहीं', 'Will not ignite')}</div>
            </div>
          </div>
          <label className="block">
            <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{s('कंप्रेशन रेश्यो', 'Compression ratio')}</span><span className="readout text-cool" data-testid="cr">{cr}:1</span></div>
            <input type="range" min={8} max={22} step={1} value={cr} onChange={(e) => setCr(Number(e.target.value))} className="w-full" aria-label="compression ratio" data-testid="cr-slider" />
          </label>
          {phase < 2 && (
            <>
              <button className={`btn justify-between ${glow ? '!border-amber !text-amber' : ''}`} aria-pressed={glow} onClick={() => setGlow(!glow)} data-testid="glow">
                <span>{s('ग्लो प्लग', 'Glow plugs')}</span><span className="chip bg-panel2">{glow ? 'ON  +60 °C' : 'OFF'}</span>
              </button>
              <button className="btn btn-cool" onClick={crank} disabled={cranking} data-testid="crank">{cranking ? '…' : s('क्रैंक / इंजेक्ट', 'Crank / inject')}</button>
              <Meter value={Math.max(0, live)} max={800} band={[IGN, 800]} label={s(`लक्ष्य ≥ ${IGN} °C`, `Target ≥ ${IGN} °C`)} unit=" °C" tone={live >= IGN ? 'ok' : 'hot'} />
            </>
          )}
          {phase === 2 && (
            <div className="grid gap-3" data-testid="calc">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-md border border-line bg-panel p-3">
                  <p className="text-sm font-semibold mb-2">{L(q.q)}</p>
                  <div className="flex flex-wrap gap-2">{q.o.map((o, oi) => (
                    <button key={oi} onClick={() => answer(qi, oi)} data-q={qi} data-o={oi} disabled={qa[qi] === questions[qi].a} className={`btn !min-h-0 !py-1.5 ${qa[qi] === oi ? '!bg-ok !text-bg' : ''}`}>{o}</button>
                  ))}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="sr-only">{t.sim.model}</span>
    </SimFrame>
  );
}
