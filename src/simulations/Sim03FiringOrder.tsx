import { useRef, useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Seq } from '@/components/simkit/Seq';

const OFF: Record<number, number> = { 1: 0, 3: 180, 4: 360, 2: 540 };   // firing order 1-3-4-2
const phi = (theta: number, cyl: number) => (((theta - OFF[cyl]) % 720) + 720) % 720;
const stroke = (f: number) => (f < 180 ? 1 : f < 360 ? 2 : f < 540 ? 3 : 4) as 1 | 2 | 3 | 4; // 1 intake 2 comp 3 power 4 exhaust
const SCOL = ['', 'rgb(var(--cool))', 'rgb(var(--amber))', 'rgb(var(--hot))', 'rgb(var(--mute))'];
const NAMES: Record<number, Bi> = { 1: bi('इनटेक', 'Intake'), 2: bi('कंप्रेशन', 'Compression'), 3: bi('पावर', 'Power'), 4: bi('एक्ज़ॉस्ट', 'Exhaust') };
const QS = [{ th: 90, c: 3 }, { th: 270, c: 2 }, { th: 450, c: 4 }];

/** Unit 3 — four-cylinder engine on a 720° crank-angle model: identify power strokes, firing order and stroke at an angle. */
export default function Sim03FiringOrder() {
  const { s, L } = useT();
  const run = useRun(3, 14);
  const [phase, setPhase] = useState(0);
  const [theta, setTheta] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [seen, setSeen] = useState<number[]>([]);
  const [orderOk, setOrderOk] = useState(false);
  const [qi, setQi] = useState(0);
  const [qOk, setQOk] = useState<boolean[]>([false, false, false]);
  const th = useRef(0);

  useTicker(phase < 2, (dt) => { th.current = (th.current + speed * dt) % 720; setTheta(th.current); });

  const ang = phase === 2 ? QS[qi].th : theta;
  const tapCyl = (c: number) => {
    if (phase !== 0 || seen.includes(c)) return;
    if (stroke(phi(th.current, c)) === 3) {
      setSeen((x) => [...x, c]); run.add(1, bi(`सही — सिलेंडर ${c} अभी पावर स्ट्रोक पर है।`, `Right — cylinder ${c} is on its power stroke now.`));
    } else run.miss(bi(`सिलेंडर ${c} अभी पावर स्ट्रोक पर नहीं है। जिसका पिस्टन गर्म लाल है उसे दबाएँ।`, `Cylinder ${c} is not on its power stroke. Tap the one glowing red.`));
  };
  const answer = (o: number) => {
    const q = QS[qi]; const right = stroke(phi(q.th, q.c));
    if (qOk[qi]) return;
    if (o === right) { run.add(2, bi('सही! φ = (θ − ऑफ़सेट) mod 720।', 'Correct! φ = (θ − offset) mod 720.')); setQOk((x) => x.map((v, i) => (i === qi ? true : v))); }
    else run.miss(bi(`ग़लत। φ = (${q.th} − ${OFF[q.c]}) mod 720 = ${phi(q.th, q.c)}°। 0–180 इनटेक, 180–360 कंप्रेशन, 360–540 पावर, 540–720 एक्ज़ॉस्ट।`, `Not quite. φ = (${q.th} − ${OFF[q.c]}) mod 720 = ${phi(q.th, q.c)}°. 0–180 intake, 180–360 compression, 360–540 power, 540–720 exhaust.`));
  };

  const phases = [bi('पावर स्ट्रोक पहचानें', 'Spot the power strokes'), bi('फ़ायरिंग ऑर्डर लिखें', 'Enter the firing order'), bi('कोण पर स्ट्रोक', 'Stroke at an angle')];
  const canNext = phase === 0 ? seen.length === 4 : phase === 1 ? orderOk : qOk.every(Boolean);
  const hints = [bi('हर 180° पर एक सिलेंडर फ़ायर करता है; लाल पिस्टन वाला सिलेंडर दबाएँ।', 'One cylinder fires every 180°; tap the cylinder with the red piston.'),
    bi('देखें कौन-सा सिलेंडर पहले, फिर कौन-सा लाल होता है: 1 के बाद 3, फिर 4, फिर 2।', 'Watch which cylinder turns red after which: 1, then 3, then 4, then 2.'),
    bi('φ निकालें, फिर 0–180 इनटेक, 180–360 कंप्रेशन, 360–540 पावर, 540–720 एक्ज़ॉस्ट।', 'Work out φ, then 0–180 intake, 180–360 compression, 360–540 power, 540–720 exhaust.')];
  const reset = () => { run.reset(); setPhase(0); th.current = 0; setTheta(0); setSeen([]); setOrderOk(false); setQi(0); setQOk([false, false, false]); };
  const q = QS[qi];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('4-सिलेंडर फ़ायरिंग ऑर्डर बेंच', '4-cylinder firing-order bench')}
      intro={bi('क्रैंक 720° घूमता है। चलते इंजन में पावर स्ट्रोक पहचानें, फ़ायरिंग ऑर्डर निकालें और किसी कोण पर स्ट्रोक बताएँ।', 'The crank turns through 720°. Spot power strokes on the running engine, work out the firing order and name the stroke at an angle.')}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="chip bg-panel text-ink">θ <span className="readout ml-1" data-testid="theta">{Math.round(ang)}°</span></span>
          {phase < 2 && (
            <div className="inline-flex rounded-md border border-line overflow-hidden text-xs font-bold" role="group">
              {[50, 100, 200].map((v) => <button key={v} onClick={() => setSpeed(v)} aria-pressed={speed === v} className={`px-3 py-2 ${speed === v ? 'bg-cool text-bg' : 'bg-panel text-mute'}`}>{v === 50 ? s('धीमा', 'Slow') : v === 100 ? s('सामान्य', 'Normal') : s('तेज़', 'Fast')}</button>)}
            </div>
          )}
        </div>
        <svg viewBox="0 0 640 250" className="w-full h-auto" role="group" aria-label="four cylinders" data-testid="cyls">
          {[1, 2, 3, 4].map((c, i) => {
            const f = phi(ang, c); const st = stroke(f); const p = 0.5 * (1 - Math.cos((f * Math.PI) / 180));
            const x = 30 + i * 150; const pistonY = 64 + p * 84;
            const hot = st === 3;
            return (
              <g key={c} transform={`translate(${x},0)`} className={phase === 0 ? 'cursor-pointer' : ''} role={phase === 0 ? 'button' : undefined} tabIndex={phase === 0 ? 0 : -1} aria-label={`cylinder ${c}`} data-cyl={c} data-stroke={st}
                onClick={() => tapCyl(c)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') tapCyl(c); }}>
                <rect x="0" y="40" width="100" height="150" fill="rgb(var(--bg))" stroke={seen.includes(c) ? 'rgb(var(--ok))' : 'rgb(var(--line))'} strokeWidth={seen.includes(c) ? 4 : 2} />
                <rect x="2" y="40" width="96" height={pistonY - 40} fill={SCOL[st]} opacity={hot ? 0.55 : 0.3} />
                {hot && <ellipse cx="50" cy="60" rx="34" ry="14" fill="rgb(var(--hot) / .8)" />}
                <rect x="2" y={pistonY} width="96" height="30" rx="3" fill="rgb(var(--mute) / .65)" stroke="rgb(var(--ink))" strokeWidth="1.5" />
                <line x1="50" y1={pistonY + 30} x2="50" y2="214" stroke="rgb(var(--mute))" strokeWidth="7" strokeLinecap="round" />
                <text x="50" y="30" textAnchor="middle" fontSize="15" fontWeight="800" fill="rgb(var(--ink))">{s('सिलेंडर', 'Cyl')} {c}</text>
                <text x="50" y="236" textAnchor="middle" fontSize="12" fontWeight="700" fill={SCOL[st]}>{L(NAMES[st])}</text>
              </g>
            );
          })}
        </svg>

        {phase === 0 && <p className="text-sm text-mute" data-testid="seen">{s('पहचाने गए सिलेंडर:', 'Cylinders identified:')} <span className="readout text-cool">{seen.join(' → ') || '—'}</span> ({seen.length}/4)</p>}
        {phase === 1 && (
          <div className="grid gap-2"><p className="text-sm font-semibold">{s('सिलेंडरों को फ़ायरिंग के क्रम में दबाएँ (पहला फ़ायर करने वाला पहले):', 'Tap the cylinders in firing order (first to fire first):')}</p>
            <Seq items={[1, 2, 3, 4].map((c) => bi(`सिलेंडर ${c}`, `Cylinder ${c}`))} correct={[0, 2, 3, 1]} locked={orderOk}
              onWrong={() => run.miss(bi('ग़लत क्रम — ध्यान दें कि 1 के बाद कौन लाल होता है।', 'Wrong order — watch which cylinder turns red after 1.'))}
              onDone={() => { setOrderOk(true); run.add(4, bi('सही! फ़ायरिंग ऑर्डर 1-3-4-2, अंतराल 720°/4 = 180°।', 'Correct! Firing order 1-3-4-2, interval 720°/4 = 180°.')); }} />
          </div>
        )}
        {phase === 2 && (
          <div className="rounded-md border border-line bg-panel p-3" data-testid="angle-q">
            <p className="font-semibold mb-2">{s(`क्रैंक कोण θ = ${q.th}° पर सिलेंडर ${q.c} किस स्ट्रोक में है?`, `At crank angle θ = ${q.th}°, which stroke is cylinder ${q.c} in?`)} <span className="text-mute font-normal">({qi + 1}/3)</span></p>
            <div className="flex flex-wrap gap-2">{[1, 2, 3, 4].map((o) => <button key={o} className="btn" data-ans={o} onClick={() => answer(o)} disabled={qOk[qi]}>{L(NAMES[o])}</button>)}</div>
            <div className="mt-3 flex gap-2">{QS.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1 ${i === qi ? '!border-cool' : ''}`} onClick={() => setQi(i)}>{i + 1}{qOk[i] ? ' ✓' : ''}</button>)}</div>
          </div>
        )}
      </div>
    </SimFrame>
  );
}
