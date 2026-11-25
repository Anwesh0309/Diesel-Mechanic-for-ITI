import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { playWrench } from '@/lib/sound';

const STAGE = [{ v: 40, step: 10, max: 120, unit: 'N·m' }, { v: 80, step: 10, max: 120, unit: 'N·m' }, { v: 90, step: 30, max: 180, unit: '°' }];
const col = (id: number) => Math.floor((id - 1) / 2);
const dist = (id: number) => Math.abs(col(id) - 2);
const IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PREP: { t: Bi; good: boolean }[] = [
  { t: bi('नए टॉर्क-टू-यील्ड (TTY) हेड बोल्ट लगाएँ', 'Fit NEW torque-to-yield (TTY) head bolts'), good: true },
  { t: bi('ब्लॉक व हेड की सतह साफ़ करें; स्ट्रेट-एज से समतलता जाँचें', 'Clean block and head faces; check flatness with a straight-edge'), good: true },
  { t: bi('नया गैस्केट सही दिशा में (TOP निशान ऊपर) लगाएँ', 'Fit a new gasket the right way up (TOP mark up)'), good: true },
  { t: bi('पैसे बचाने को पुराने बोल्ट दोबारा लगाएँ', 'Reuse the old bolts to save money'), good: false },
  { t: bi('गैस्केट के दोनों ओर मोटा सीलेंट लगाएँ', 'Smear thick sealant on both sides of the gasket'), good: false },
];

/** Unit 2 — cylinder-head bolt tightening: preparation, then 3 staged passes centre-outwards. */
export default function Sim02HeadTorque() {
  const { t, s, L } = useT();
  const run = useRun(2, 32);
  const [phase, setPhase] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [prepOk, setPrepOk] = useState(false);
  const [wr, setWr] = useState(0);
  const [done, setDone] = useState<number[][]>([[], [], []]);
  const [shake, setShake] = useState<number | null>(null);
  const [flash, setFlash] = useState<number | null>(null);

  const st = phase - 1;
  const stage = STAGE[Math.max(0, st)];
  const cur = st >= 0 ? done[st] : [];
  const stageDone = st >= 0 && cur.length === 10;

  const confirmPrep = () => {
    const good = PREP.map((p, i) => (p.good ? i : -1)).filter((i) => i >= 0);
    const exact = good.length === sel.length && good.every((i) => sel.includes(i));
    if (exact) { run.add(2, bi('सही तैयारी — नए बोल्ट, साफ़ सतहें, सही गैस्केट।', 'Correct preparation — new bolts, clean faces, right gasket.')); setPrepOk(true); }
    else {
      const bad = sel.filter((i) => !PREP[i].good).length; const missing = good.filter((i) => !sel.includes(i)).length;
      run.miss(bi(`जाँचें: ${bad} ग़लत चयन, ${missing} सही मद छूटी।`, `Check again: ${bad} wrong choice(s), ${missing} correct item(s) missing.`));
    }
  };

  const tap = (id: number) => {
    if (stageDone || cur.includes(id)) return;
    if (wr !== stage.v) { run.miss(bi(`रेंच ${stage.v} ${stage.unit} पर सेट करें — अभी ${wr} है।`, `Set the wrench to ${stage.v} ${stage.unit} — it is at ${wr}.`)); setShake(id); setTimeout(() => setShake(null), 350); return; }
    const left = IDS.filter((i) => !cur.includes(i));
    const minD = Math.min(...left.map(dist));
    if (dist(id) > minD) { run.miss(bi('बीच से बाहर की ओर कसें — यह बोल्ट अभी बहुत बाहर है।', 'Tighten from the centre outwards — that bolt is too far out yet.')); setShake(id); setTimeout(() => setShake(null), 350); return; }
    const nd = done.map((a, i) => (i === st ? [...a, id] : a));
    setDone(nd); run.add(1); playWrench();
    if (cur.length + 1 === 10) {
      run.say('ok', st === 2 ? bi('तीनों चरण पूरे — हेड समान दबाव से कसा।', 'All three stages complete — head clamped evenly.') : bi(`चरण ${st + 1} पूरा। अब अगला चरण।`, `Stage ${st + 1} complete. On to the next stage.`));
    }
  };

  const hint = (): Bi => {
    if (phase === 0) return bi('TTY बोल्ट एक बार के हैं; सतह साफ़ करें; गैस्केट सही दिशा में; सीलेंट गलत है।', 'TTY bolts are single-use; clean the faces; gasket the right way up; no thick sealant.');
    if (wr !== stage.v) return bi(`इस चरण का मान ${stage.v} ${stage.unit} है।`, `This stage's value is ${stage.v} ${stage.unit}.`);
    const left = IDS.filter((i) => !cur.includes(i)); const minD = Math.min(...left.map(dist));
    const nxt = left.filter((i) => dist(i) === minD)[0];
    setFlash(nxt); setTimeout(() => setFlash(null), 2500);
    return bi('बीच के बोल्ट पहले (5, 6), फिर बाहर की ओर बारी-बारी से। चमकता बोल्ट अगला है।', 'Centre bolts first (5, 6), then outwards, alternating sides. The glowing bolt is next.');
  };

  const reset = () => { run.reset(); setPhase(0); setSel([]); setPrepOk(false); setWr(0); setDone([[], [], []]); };
  const phases = [bi('तैयारी', 'Preparation'), bi('चरण 1: 40 N·m', 'Stage 1: 40 N·m'), bi('चरण 2: 80 N·m', 'Stage 2: 80 N·m'), bi('चरण 3: +90°', 'Stage 3: +90°')];
  const canNext = phase === 0 ? prepOk : stageDone;
  const boltColor = ['rgb(var(--amber))', 'rgb(var(--hot))', 'rgb(var(--ok))'];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => { setPhase(phase + 1); setWr(0); }} getHint={hint} onReset={reset}
      title={bi('हेड बोल्ट टॉर्क बेंच', 'Head-bolt torque bench')}
      intro={bi('गैस्केट के नीचे समान दबाव के लिए पहले तैयारी करें, फिर रेंच सेट कर बोल्ट बीच से बाहर की ओर तीन चरणों में कसें।', 'Prepare first, then set the wrench and tighten the bolts centre-outwards in three stages for even gasket pressure.')}>
      {phase === 0 ? (
        <div className="grid gap-3" data-testid="prep">
          <p className="text-sm font-semibold">{s('सही कदम चुनें (एक से अधिक):', 'Select the correct steps (more than one):')}</p>
          {PREP.map((p, i) => (
            <button key={i} aria-pressed={sel.includes(i)} data-prep={i} onClick={() => setSel((x) => (x.includes(i) ? x.filter((v) => v !== i) : [...x, i]))}
              className={`text-left rounded-md border px-3 py-2.5 text-sm flex gap-3 items-center ${sel.includes(i) ? 'border-cool bg-cool/10' : 'border-line bg-panel hover:border-cool/60'}`}>
              <span className={`w-5 h-5 rounded border-2 shrink-0 ${sel.includes(i) ? 'bg-cool border-cool' : 'border-mute'}`} /><span>{L(p.t)}</span>
            </button>
          ))}
          <div><button className="btn btn-cool" onClick={confirmPrep} data-testid="prep-confirm" disabled={prepOk}>{s('पुष्टि करें', 'Confirm')}</button></div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-center">
            <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2" data-testid="wrench">
              <button className="btn !min-h-0 !px-3 !py-1" aria-label="-" onClick={() => setWr(Math.max(0, wr - stage.step))} data-testid="wr-minus">−</button>
              <div className="text-center w-24"><div className="text-[11px] text-mute">{s('टॉर्क रेंच', 'Torque wrench')}</div><div className="readout text-xl text-amber" data-testid="wr-val">{wr} {stage.unit}</div></div>
              <button className="btn !min-h-0 !px-3 !py-1" aria-label="+" onClick={() => setWr(Math.min(stage.max, wr + stage.step))} data-testid="wr-plus">+</button>
            </div>
            <p className="text-sm text-mute">{s(`इस चरण का मान: ${stage.v} ${stage.unit}`, `Value for this stage: ${stage.v} ${stage.unit}`)} · <span className="readout text-cool">{cur.length}/10</span> {s('बोल्ट', 'bolts')}</p>
          </div>
          <svg viewBox="0 0 640 210" className="w-full h-auto" role="group" aria-label="head bolts" data-testid="bolts">
            <rect x="20" y="20" width="600" height="170" rx="18" fill="rgb(var(--panel))" stroke="rgb(var(--mute))" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((c) => <rect key={c} x={95 + c * 115} y="48" width="52" height="114" rx="8" fill="rgb(var(--bg))" stroke="rgb(var(--line))" />)}
            {IDS.map((id) => {
              const c = col(id), top = id % 2 === 1; const bx = 121 + c * 115; const by = top ? 50 : 160;
              const d = cur.includes(id); const wasPrev = done.slice(0, Math.max(0, st)).every((a) => a.includes(id));
              return (
                <g key={id} className="cursor-pointer" role="button" tabIndex={0} aria-label={`bolt ${id}`} data-bolt={id} data-done={d ? '1' : '0'} onClick={() => tap(id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') tap(id); }}
                  style={{ transformOrigin: `${bx}px ${by}px`, animation: shake === id ? 'rise .2s' : undefined }}>
                  <circle cx={bx} cy={by} r="26" fill="transparent" />
                  <circle cx={bx} cy={by} r="19" fill={d ? boltColor[st] : wasPrev && st > 0 ? 'rgb(var(--mute) / .6)' : 'rgb(var(--panel2))'} stroke={flash === id ? 'rgb(var(--cool))' : 'rgb(var(--ink))'} strokeWidth={flash === id ? 5 : 2.5} className={flash === id ? 'animate-pulse' : ''} />
                  <path d={`M${bx - 8} ${by - 4.6}l8 -4.6l8 4.6v9.2l-8 4.6l-8 -4.6z`} fill="none" stroke="rgb(var(--ink))" strokeWidth="1.8" />
                  <text x={bx} y={by + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={d ? 'rgb(var(--bg))' : 'rgb(var(--ink))'} fontFamily="JetBrains Mono, monospace">{id}</text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-mute">{s('आगे वाला इंजन ← → पीछे। संख्या = बोल्ट की स्थिति; क्रम आपको तय करना है।', 'Front of engine ← → rear. Numbers are bolt positions; you decide the order.')} <span className="sr-only">{t.sim.model}</span></p>
        </div>
      )}
    </SimFrame>
  );
}
