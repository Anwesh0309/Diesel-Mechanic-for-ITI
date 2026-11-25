import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { Seq } from '@/components/simkit/Seq';
import { Meter } from '@/components/ui/kit';

const model = (P: number, pilot: number, A: number) => ({
  noise: 52 + 1.3 * A - 3 * pilot + 0.004 * (P - 500) + (pilot === 0 ? 8 : 0),
  nox: 18 + 3.2 * A + 0.01 * (P - 500) - 3 * pilot,
  soot: 78 - 0.032 * (P - 500) - 1.2 * A + 3 * Math.max(0, pilot - 2),
});
const LIM = { noise: 58, nox: 50, soot: 40 };
const SAFE: Bi[] = [
  bi('निर्माता द्वारा बताया समय रुकें ताकि रेल का दाब उतर जाए', "Wait the maker's specified time so rail pressure drops"),
  bi('बैटरी का निगेटिव टर्मिनल हटाएँ', 'Disconnect the battery negative'),
  bi('आँखों की सुरक्षा पहनकर, फ़िटिंग पर कपड़ा लपेट लाइन धीरे-धीरे ढीली करें', 'Wearing eye protection, wrap a cloth round the fitting and loosen the line slowly'),
  bi('इंजन बंद करें व चाबी निकालें', 'Stop the engine and remove the key'),
];

/** Unit 4 — common-rail calibration, multi-injection scenarios and high-pressure safety sequence. */
export default function Sim04CommonRail() {
  const { s, L } = useT();
  const run = useRun(4, 12);
  const [phase, setPhase] = useState(0);
  const [P, setP] = useState(1000);
  const [pilot, setPilot] = useState(0);
  const [A, setA] = useState(8);
  const [locked, setLocked] = useState(false);
  const [scs, setScs] = useState([{ pilot: false, post: false }, { pilot: false, post: false }]);
  const [scOk, setScOk] = useState([false, false]);
  const [sIdx, setSIdx] = useState(0);
  const [safeOk, setSafeOk] = useState(false);
  const sc = scs[sIdx];
  const m = model(P, pilot, A);
  const pass = m.noise <= LIM.noise && m.nox <= LIM.nox && m.soot <= LIM.soot;

  const lock = () => {
    if (locked) return;
    if (pass) { setLocked(true); run.add(4, bi('कैलिब्रेशन लॉक — शोर, NOx और कालिख तीनों लक्ष्य में।', 'Calibration locked — noise, NOx and soot all on target.')); }
    else {
      const bad: string[] = [];
      if (m.noise > LIM.noise) bad.push(s('शोर बहुत अधिक (पायलट बढ़ाएँ)', 'noise too high (add pilot)'));
      if (m.nox > LIM.nox) bad.push(s('NOx अधिक (टाइमिंग कम करें)', 'NOx too high (retard timing)'));
      if (m.soot > LIM.soot) bad.push(s('कालिख अधिक (रेल दाब बढ़ाएँ)', 'soot too high (raise rail pressure)'));
      run.miss(bi(`लक्ष्य पूरा नहीं: ${bad.join('; ')}।`, `Targets not met: ${bad.join('; ')}.`));
    }
  };
  const scen = [
    { t: bi('परिदृश्य A — अस्पताल क्षेत्र में शांत आइडल', 'Scenario A — quiet idle in a hospital zone'), need: { pilot: true, post: false } },
    { t: bi('परिदृश्य B — DPF रीजनरेशन की ज़रूरत', 'Scenario B — DPF regeneration required'), need: { pilot: true, post: true } },
  ];
  const applySc = () => {
    const need = scen[sIdx].need;
    if (scOk[sIdx]) return;
    if (sc.pilot === need.pilot && sc.post === need.post) { setScOk((o) => o.map((v, i) => (i === sIdx ? true : v))); run.add(2, bi('सही इंजेक्शन पैटर्न।', 'Correct injection pattern.')); }
    else run.miss(bi(sIdx === 0 ? 'शांत इंजन के लिए पायलट चाहिए; पोस्ट इंजेक्शन अनावश्यक है।' : 'DPF रीजनरेशन के लिए पोस्ट इंजेक्शन चाहिए, और शोर के लिए पायलट भी।', sIdx === 0 ? 'A quiet engine needs pilot injection; post injection is unnecessary.' : 'DPF regeneration needs post injection, and pilot to keep noise down.'));
  };

  const phases = [bi('रेल कैलिब्रेशन', 'Rail calibration'), bi('मल्टी-इंजेक्शन', 'Multiple injections'), bi('उच्च-दाब सुरक्षा', 'High-pressure safety')];
  const canNext = phase === 0 ? locked : phase === 1 ? scOk.every(Boolean) : safeOk;
  const hints = [bi('शोर के लिए पायलट ~2 mm³, कालिख के लिए रेल दाब ~1600 bar, NOx के लिए टाइमिंग लगभग 4° BTDC।', 'Pilot ≈ 2 mm³ for noise, rail ≈ 1600 bar for soot, timing ≈ 4° BTDC for NOx.'),
    bi('पायलट = शोर घटाए; पोस्ट = DPF/उत्सर्जन में मदद।', 'Pilot = less noise; post = helps DPF/emissions.'),
    bi('इंजन बंद → बैटरी → दाब उतरने की प्रतीक्षा → तभी ढीला करें।', 'Engine off → battery → wait for pressure to drop → only then loosen.')];
  const reset = () => { run.reset(); setPhase(0); setP(1000); setPilot(0); setA(8); setLocked(false); setScs([{ pilot: false, post: false }, { pilot: false, post: false }]); setScOk([false, false]); setSIdx(0); setSafeOk(false); };

  const usePilot = phase === 1 ? sc.pilot : pilot > 0; const usePost = phase === 1 && sc.post;
  const mainX = 330 - A * 4;
  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, unit: string, tid: string) => (
    <label className="block"><div className="flex justify-between text-sm mb-1"><span className="font-semibold">{label}</span><span className="readout text-cool">{v} {unit}</span></div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} disabled={locked} data-testid={tid} aria-label={label} /></label>
  );

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('कॉमन रेल कैलिब्रेशन बेंच', 'Common-rail calibration bench')}
      intro={bi('रेल दाब, पायलट मात्रा व टाइमिंग को ट्यून कर शोर, NOx और कालिख को एक साथ लक्ष्य में लाएँ।', 'Tune rail pressure, pilot quantity and timing to bring noise, NOx and soot on target together.')}>
      <div className="grid gap-4">
        <svg viewBox="0 0 620 110" className="w-full h-auto" role="img" aria-label="injection pulses" data-testid="pulses">
          <rect width="620" height="110" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--line))" />
          <line x1="20" y1="90" x2="600" y2="90" stroke="rgb(var(--mute))" /><line x1="360" y1="14" x2="360" y2="94" stroke="rgb(var(--amber))" strokeDasharray="4 4" />
          <text x="364" y="24" fontSize="11" fill="rgb(var(--amber))">TDC</text>
          {usePilot && <rect x={mainX - 54} y="62" width={Math.max(8, (phase === 1 ? 2 : pilot) * 8)} height="28" fill="rgb(var(--cool))" />}
          <rect x={mainX - 8} y="30" width="44" height="60" fill="rgb(var(--hot))" /><text x={mainX + 14} y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--hot))">{s('मुख्य', 'Main')}</text>
          {usePost && <rect x="440" y="66" width="22" height="24" fill="rgb(var(--amber))" />}
          {usePilot && <text x={mainX - 40} y="56" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--cool))">{s('पायलट', 'Pilot')}</text>}
          {usePost && <text x="451" y="60" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--amber))">{s('पोस्ट', 'Post')}</text>}
        </svg>

        {phase === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-3 content-start">
              {slider(s('रेल दाब', 'Rail pressure'), P, setP, 500, 2000, 50, 'bar', 'rail')}
              {slider(s('पायलट मात्रा', 'Pilot quantity'), pilot, setPilot, 0, 3, 0.5, 'mm³', 'pilot')}
              {slider(s('मुख्य इंजेक्शन टाइमिंग', 'Main injection timing'), A, setA, 0, 12, 1, '° BTDC', 'timing')}
              <button className="btn btn-cool" onClick={lock} disabled={locked} data-testid="lock">{locked ? '✓' : s('कैलिब्रेशन लॉक करें', 'Lock calibration')}</button>
            </div>
            <div className="grid gap-3 content-start rounded-md border border-line bg-panel p-3" data-testid="indicators">
              <Meter value={m.noise} max={90} label={s('शोर (लक्ष्य ≤ 58 dB)', 'Noise (target ≤ 58 dB)')} unit=" dB" tone={m.noise <= LIM.noise ? 'ok' : 'hot'} band={[0, LIM.noise]} />
              <Meter value={m.nox} max={100} label={s('NOx सूचकांक (≤ 50)', 'NOx index (≤ 50)')} unit="" tone={m.nox <= LIM.nox ? 'ok' : 'hot'} band={[0, LIM.nox]} />
              <Meter value={m.soot} max={100} label={s('कालिख सूचकांक (≤ 40)', 'Soot index (≤ 40)')} unit="" tone={m.soot <= LIM.soot ? 'ok' : 'hot'} band={[0, LIM.soot]} />
              <div className={`text-sm font-bold ${pass ? 'text-ok' : 'text-mute'}`}>{pass ? s('तीनों लक्ष्य पूरे ✓', 'All three targets met ✓') : s('कम से कम एक लक्ष्य पूरा नहीं', 'At least one target missed')}</div>
            </div>
          </div>
        )}

        {phase === 1 && (
          <div className="grid gap-3" data-testid="scenarios">
            <div className="flex gap-2">{scen.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1.5 ${i === sIdx ? '!border-cool' : ''}`} onClick={() => setSIdx(i)}>{i === 0 ? 'A' : 'B'}{scOk[i] ? ' ✓' : ''}</button>)}</div>
            <p className="font-semibold">{L(scen[sIdx].t)}</p>
            <div className="grid sm:grid-cols-3 gap-2">
              <button className="btn" aria-pressed={sc.pilot} disabled={scOk[sIdx]} onClick={() => setScs((x) => x.map((item, idx) => idx === sIdx ? { ...item, pilot: !item.pilot } : item))} data-testid="tg-pilot">{s('पायलट', 'Pilot')}: {sc.pilot ? 'ON' : 'OFF'}</button>
              <button className="btn opacity-70" disabled>{s('मुख्य', 'Main')}: ON</button>
              <button className="btn" aria-pressed={sc.post} disabled={scOk[sIdx]} onClick={() => setScs((x) => x.map((item, idx) => idx === sIdx ? { ...item, post: !item.post } : item))} data-testid="tg-post">{s('पोस्ट', 'Post')}: {sc.post ? 'ON' : 'OFF'}</button>
            </div>
            <div><button className="btn btn-cool" onClick={applySc} disabled={scOk[sIdx]} data-testid="apply-sc">{scOk[sIdx] ? '✓' : s('लागू करें', 'Apply')}</button></div>
          </div>
        )}

        {phase === 2 && (
          <div className="grid gap-2"><p className="text-sm font-semibold">{s('उच्च-दाब ईंधन लाइन खोलने का सही क्रम चुनें:', 'Pick the correct order to open a high-pressure fuel line:')}</p>
            <Seq items={SAFE} correct={[3, 1, 0, 2]} locked={safeOk}
              onWrong={() => run.miss(bi('यह कदम अभी नहीं — पहले सुरक्षा और बंद करना।', 'Not this step yet — protect and shut down first.'))}
              onDone={() => { setSafeOk(true); run.add(4, bi('सही क्रम — उच्च-दाब ईंधन त्वचा के नीचे घुस सकता है, इसलिए दाब उतारना ज़रूरी है।', 'Correct order — high-pressure fuel can penetrate skin, so depressurising is essential.')); }} />
          </div>
        )}
      </div>
    </SimFrame>
  );
}
