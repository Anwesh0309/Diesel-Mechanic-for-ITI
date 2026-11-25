import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { playBeep } from '@/lib/sound';

type St = 'rest' | 'crank' | 'run';
type Pt = 'bpos' | 'bneg' | 'spos' | 'block' | 'abpos';
const PTS: { id: Pt; n: Bi }[] = [
  { id: 'bpos', n: bi('बैटरी (+) पोस्ट', 'Battery (+) post') }, { id: 'bneg', n: bi('बैटरी (−) पोस्ट', 'Battery (−) post') },
  { id: 'spos', n: bi('स्टार्टर (+) टर्मिनल', 'Starter (+) terminal') }, { id: 'block', n: bi('इंजन ब्लॉक (ग्राउंड)', 'Engine block (ground)') }, { id: 'abpos', n: bi('अल्टरनेटर B+', 'Alternator B+') },
];
interface Case { title: Bi; story: Bi; vb: Record<St, number>; dpos: Record<St, number>; dneg: Record<St, number>; req: string[]; ans: number }
const CASES: Case[] = [
  { title: bi('केस 1 — धीमा क्रैंक', 'Case 1 — slow crank'), story: bi('सुबह इंजन बहुत धीरे क्रैंक होता है व स्टार्ट नहीं होता। बैटरी का स्वास्थ्य जाँचें।', 'In the morning the engine cranks very slowly and will not start. Check the battery.'),
    vb: { rest: 11.9, crank: 8.7, run: 13.9 }, dpos: { rest: 0, crank: 0.25, run: 0.05 }, dneg: { rest: 0, crank: 0.12, run: 0 }, req: ['rest|bpos|bneg', 'crank|bpos|bneg'], ans: 0 },
  { title: bi('केस 2 — क्लिक व मंद बत्तियाँ', 'Case 2 — click and dim lamps'), story: bi('चाबी घुमाने पर क्लिक होता है, पर क्रैंक नहीं। विश्राम में बैटरी ठीक लगती है।', 'On key-turn there is a click but no crank. The battery seems fine at rest.'),
    vb: { rest: 12.6, crank: 10.6, run: 14.1 }, dpos: { rest: 0, crank: 1.2, run: 0.05 }, dneg: { rest: 0, crank: 0.12, run: 0 }, req: ['crank|bpos|bneg', 'crank|bpos|spos'], ans: 1 },
  { title: bi('केस 3 — चलते में बैटरी लैंप', 'Case 3 — battery lamp while running'), story: bi('इंजन आराम से स्टार्ट होता है, पर चलते में बैटरी चेतावनी जलती है।', 'The engine starts easily but the battery warning lamp stays on while running.'),
    vb: { rest: 12.5, crank: 10.2, run: 12.1 }, dpos: { rest: 0, crank: 0.25, run: 0.05 }, dneg: { rest: 0, crank: 0.12, run: 0 }, req: ['rest|bpos|bneg', 'run|bpos|bneg'], ans: 2 },
];
const DIAG: Bi[] = [bi('बैटरी डिस्चार्ज / कमज़ोर', 'Discharged / weak battery'), bi('पॉज़िटिव स्टार्टर केबल/टर्मिनल में उच्च प्रतिरोध', 'High resistance in positive starter cable/terminal'), bi('चार्जिंग सिस्टम (अल्टरनेटर/रेगुलेटर/बेल्ट) खराब', 'Charging system fault (alternator/regulator/belt)'), bi('स्टार्टर मोटर जली', 'Burnt-out starter motor')];

function volt(c: Case, st: St, p: Pt) { const vb = c.vb[st]; return p === 'bpos' || p === 'abpos' ? vb : p === 'bneg' ? 0 : p === 'spos' ? vb - c.dpos[st] : c.dneg[st]; }
function judge(key: string, v: number): Bi | null {
  if (key === 'rest|bpos|bneg') return v >= 12.4 ? bi(`${v.toFixed(2)} V — बैटरी अच्छी तरह चार्ज (≥ 12.4 V)।`, `${v.toFixed(2)} V — battery well charged (≥ 12.4 V).`) : v >= 12.0 ? bi(`${v.toFixed(2)} V — आंशिक चार्ज।`, `${v.toFixed(2)} V — partly charged.`) : bi(`${v.toFixed(2)} V — बैटरी डिस्चार्ज (< 12.0 V)।`, `${v.toFixed(2)} V — battery discharged (< 12.0 V).`);
  if (key === 'crank|bpos|bneg') return v >= 9.6 ? bi(`${v.toFixed(2)} V — क्रैंकिंग में ≥ 9.6 V: ठीक।`, `${v.toFixed(2)} V — cranking ≥ 9.6 V: acceptable.`) : bi(`${v.toFixed(2)} V — क्रैंकिंग में 9.6 V से कम: बैटरी कमज़ोर।`, `${v.toFixed(2)} V — below 9.6 V while cranking: weak battery.`);
  if (key === 'crank|bpos|spos') return v <= 0.5 ? bi(`ड्रॉप ${v.toFixed(2)} V (≤ 0.5 V): ठीक।`, `Drop ${v.toFixed(2)} V (≤ 0.5 V): fine.`) : bi(`ड्रॉप ${v.toFixed(2)} V — 0.5 V से अधिक: केबल/जोड़ में उच्च प्रतिरोध।`, `Drop ${v.toFixed(2)} V — over 0.5 V: high resistance in cable/joint.`);
  if (key === 'run|bpos|bneg') return v >= 13.8 && v <= 14.4 ? bi(`${v.toFixed(2)} V — चार्जिंग सामान्य।`, `${v.toFixed(2)} V — charging normal.`) : v < 13.5 ? bi(`${v.toFixed(2)} V — चलते इंजन पर 13.8 V से कम: चार्ज नहीं हो रहा।`, `${v.toFixed(2)} V — below 13.8 V running: not charging.`) : bi(`${v.toFixed(2)} V`, `${v.toFixed(2)} V`);
  return null;
}

/** Unit 8 — virtual multimeter: take real-looking readings on three faulty vehicles and diagnose. */
export default function Sim08Multimeter() {
  const { s, L } = useT();
  const run = useRun(8, 12);
  const [phase, setPhase] = useState(0);
  const [st, setSt] = useState<St>('rest');
  const [red, setRed] = useState<Pt>('bpos');
  const [blk, setBlk] = useState<Pt>('bneg');
  const [logs, setLogs] = useState<string[][]>([[], [], []]);
  const [diagOk, setDiagOk] = useState([false, false, false]);
  const c = CASES[phase];
  const v = volt(c, st, red) - volt(c, st, blk);
  const key = `${st}|${red}|${blk}`;
  const got = logs[phase];
  const reqDone = c.req.every((k) => got.includes(k));

  const record = () => {
    const j = judge(key, v);
    playBeep();
    if (!j) { run.say('info', bi(`${v.toFixed(2)} V दर्ज। यह इस केस की मुख्य जाँच नहीं है।`, `${v.toFixed(2)} V logged. This is not a key test for this case.`)); return; }
    if (got.includes(key)) { run.say('info', j); return; }
    setLogs((l) => l.map((a, i) => (i === phase ? [...a, key] : a)));
    if (c.req.includes(key)) run.add(1, j); else run.say('info', j);
  };
  const diagnose = (i: number) => {
    if (diagOk[phase]) return;
    if (!reqDone) { run.say('info', bi('पहले ज़रूरी माप लें, फिर निदान चुनें।', 'Take the required measurements before choosing a diagnosis.')); return; }
    if (i === c.ans) { setDiagOk((d) => d.map((x, k) => (k === phase ? true : x))); run.add(2, bi('सही निदान — माप से प्रमाणित।', 'Correct diagnosis — backed by your measurements.')); }
    else run.miss(bi('निदान आपके मापों से मेल नहीं खाता — रीडिंग फिर देखें।', 'That diagnosis does not match your readings — look at them again.'));
  };
  const needHint = () => {
    const k = c.req.find((x) => !got.includes(x));
    if (!k) return bi('माप पूरे हैं — रीडिंग का अर्थ सीमाओं से मिलाकर निदान चुनें।', 'Measurements complete — compare readings with the limits and pick the diagnosis.');
    const [a, b, d] = k.split('|') as [St, Pt, Pt];
    const nm = (p: Pt) => PTS.find((x) => x.id === p)!.n;
    return bi(`इंजन अवस्था "${a === 'rest' ? 'विश्राम' : a === 'crank' ? 'क्रैंकिंग' : 'चालू'}" में लाल लीड ${nm(b).hi} पर व काली ${nm(d).hi} पर रखें और 'दर्ज करें' दबाएँ।`, `With the engine "${a}", put red on ${nm(b).en} and black on ${nm(d).en}, then press Record.`);
  };
  const phases = CASES.map((x) => x.title);
  const reset = () => { run.reset(); setPhase(0); setSt('rest'); setRed('bpos'); setBlk('bneg'); setLogs([[], [], []]); setDiagOk([false, false, false]); };
  const sel = (val: Pt, set: (p: Pt) => void, label: string, tid: string) => (
    <label className="block text-sm"><span className="font-semibold block mb-1">{label}</span>
      <select value={val} onChange={(e) => set(e.target.value as Pt)} data-testid={tid} className="w-full rounded-md border border-line bg-panel px-2 py-2.5 text-sm">{PTS.map((p) => <option key={p.id} value={p.id}>{L(p.n)}</option>)}</select></label>
  );

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={diagOk[phase]} onNext={() => { setPhase(phase + 1); setSt('rest'); setRed('bpos'); setBlk('bneg'); }} getHint={needHint} onReset={reset}
      title={bi('मल्टीमीटर डायग्नोस्टिक बेंच', 'Multimeter diagnostic bench')}
      intro={bi('तीन खराब वाहनों पर लीड लगाकर वोल्टेज और वोल्टेज-ड्रॉप मापें, फिर माप के आधार पर ख़राबी बताएँ।', 'Place the leads on three faulty vehicles, measure voltage and voltage drop, then name the fault from your readings.')}>
      <div className="grid gap-4">
        <div className="rounded-md border border-line bg-panel p-3"><div className="font-bold">{L(c.title)}</div><p className="text-sm text-mute">{L(c.story)}</p></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3 content-start">
            <div className="inline-flex rounded-md border border-line overflow-hidden text-sm font-bold w-full" role="group" aria-label="engine state">
              {(['rest', 'crank', 'run'] as St[]).map((x) => <button key={x} data-state={x} aria-pressed={st === x} onClick={() => setSt(x)} className={`flex-1 px-2 py-2.5 ${st === x ? 'bg-cool text-bg' : 'bg-panel text-mute hover:text-ink'}`}>{x === 'rest' ? s('विश्राम', 'Key off') : x === 'crank' ? s('क्रैंकिंग', 'Cranking') : s('चालू इंजन', 'Running')}</button>)}
            </div>
            {sel(red, setRed, s('लाल लीड (+)', 'Red lead (+)'), 'red')}
            {sel(blk, setBlk, s('काली लीड (−)', 'Black lead (−)'), 'black')}
          </div>
          <div className="grid gap-3 content-start">
            <div className="rounded-lg border-2 border-line bg-bg p-4 text-center" aria-live="polite">
              <div className="text-[11px] uppercase tracking-widest text-mute mb-1">DC V</div>
              <div className="readout text-4xl sm:text-5xl text-ok" data-testid="reading">{v.toFixed(2)}<span className="text-xl ml-1">V</span></div>
            </div>
            <button className="btn btn-cool" onClick={record} data-testid="record">{s('रीडिंग दर्ज करें', 'Record reading')}</button>
            <div className="text-xs text-mute">{s('दर्ज आवश्यक माप', 'Required readings logged')}: <span className="readout text-cool" data-testid="req-count">{c.req.filter((k) => got.includes(k)).length}/{c.req.length}</span></div>
          </div>
        </div>

        {/* Interactive Electrical Circuit Probe Diagram */}
        <div className="panel p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{s('परीक्षण बिंदु (टर्मिनल दबाकर लीड लगाएँ)', 'Test points (tap terminals to attach leads)')}</div>
          <svg viewBox="0 0 560 140" className="w-full h-auto rounded-lg bg-panel2 border border-line" role="group" aria-label="circuit diagram">
            {/* Battery */}
            <rect x="25" y="30" width="110" height="75" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
            <text x="80" y="72" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgb(var(--mute))">BATTERY</text>
            {/* BPOS */}
            <g className="cursor-pointer" onClick={() => setRed('bpos')} role="button" tabIndex={0} aria-label="Battery Positive">
              <circle cx="50" cy="30" r="14" fill={red === 'bpos' ? 'rgb(var(--hot))' : 'rgb(var(--hot) / .3)'} stroke="rgb(var(--hot))" strokeWidth="2" />
              <text x="50" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">+</text>
            </g>
            {/* BNEG */}
            <g className="cursor-pointer" onClick={() => setBlk('bneg')} role="button" tabIndex={0} aria-label="Battery Negative">
              <circle cx="110" cy="30" r="14" fill={blk === 'bneg' ? '#334155' : 'rgb(var(--mute) / .3)'} stroke="rgb(var(--ink))" strokeWidth="2" />
              <text x="110" y="34" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">−</text>
            </g>

            {/* Heavy cables */}
            <path d="M50 30 C50 15, 230 15, 250 35" fill="none" stroke="rgb(var(--hot) / .6)" strokeWidth="4" />
            <path d="M110 30 C110 120, 200 115, 250 115" fill="none" stroke="rgb(var(--mute) / .6)" strokeWidth="4" />

            {/* Engine Block / Ground */}
            <rect x="215" y="80" width="130" height="48" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
            <text x="280" y="108" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgb(var(--mute))">ENGINE BLOCK</text>
            {/* BLOCK terminal */}
            <g className="cursor-pointer" onClick={() => setBlk('block')} role="button" tabIndex={0} aria-label="Engine Block Ground">
              <circle cx="280" cy="80" r="14" fill={blk === 'block' ? '#334155' : 'rgb(var(--mute) / .3)'} stroke="rgb(var(--line))" strokeWidth="2" />
              <text x="280" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgb(var(--cool))">GND</text>
            </g>

            {/* Starter Motor */}
            <rect x="235" y="24" width="90" height="48" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
            <text x="280" y="52" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgb(var(--mute))">STARTER</text>
            {/* SPOS terminal */}
            <g className="cursor-pointer" onClick={() => setRed('spos')} role="button" tabIndex={0} aria-label="Starter Positive">
              <circle cx="250" cy="24" r="14" fill={red === 'spos' ? 'rgb(var(--hot))' : 'rgb(var(--hot) / .3)'} stroke="rgb(var(--hot))" strokeWidth="2" />
              <text x="250" y="28" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">S+</text>
            </g>

            {/* Alternator */}
            <circle cx="450" cy="65" r="36" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2" />
            <circle cx="450" cy="65" r="16" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" />
            <text x="450" y="116" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgb(var(--mute))">ALTERNATOR</text>
            {/* ABPOS terminal */}
            <g className="cursor-pointer" onClick={() => setRed('abpos')} role="button" tabIndex={0} aria-label="Alternator B+">
              <circle cx="450" cy="29" r="14" fill={red === 'abpos' ? 'rgb(var(--hot))' : 'rgb(var(--hot) / .3)'} stroke="rgb(var(--hot))" strokeWidth="2" />
              <text x="450" y="33" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">B+</text>
            </g>

            {/* Probe cable lines overlay */}
            <text x="540" y="24" textAnchor="end" fontSize="10" fontWeight="bold" fill="rgb(var(--hot))">🔴 RED: {red.toUpperCase()}</text>
            <text x="540" y="40" textAnchor="end" fontSize="10" fontWeight="bold" fill="rgb(var(--cool))">⚫ BLK: {blk.toUpperCase()}</text>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">{s('आपका निदान:', 'Your diagnosis:')}</p>
          <div className="grid gap-2 sm:grid-cols-2">{DIAG.map((d, i) => <button key={i} data-diag={i} onClick={() => diagnose(i)} disabled={diagOk[phase]} className={`btn !justify-start text-left ${diagOk[phase] && i === c.ans ? '!bg-ok !text-bg' : ''}`}>{L(d)}</button>)}</div>
        </div>
      </div>
    </SimFrame>
  );
}
