import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';

const TESTS: { id: string; n: Bi }[] = [
  { id: 'air', n: bi('एयर फ़िल्टर सूचक', 'Air-filter indicator') }, { id: 'boost', n: bi('बूस्ट दाब मापें', 'Measure boost pressure') },
  { id: 'inj', n: bi('इंजेक्टर बैलेंस / रिटर्न-लीक', 'Injector balance / return leak') }, { id: 'comp', n: bi('कंप्रेशन टेस्ट', 'Compression test') },
  { id: 'leak', n: bi('लीक-डाउन टेस्ट', 'Leak-down test') }, { id: 'cool', n: bi('कूलिंग सिस्टम प्रेशर टेस्ट', 'Cooling-system pressure test') },
  { id: 'oil', n: bi('डिपस्टिक पर तेल की स्थिति', 'Oil condition on dipstick') }, { id: 'dtc', n: bi('स्कैन टूल: DTC पढ़ें', 'Scan tool: read DTCs') },
  { id: 'turbo', n: bi('टर्बो शाफ़्ट प्ले / सील', 'Turbo shaft play / seals') }, { id: 'fuel', n: bi('ईंधन आपूर्ति दाब', 'Fuel supply pressure') },
];
const DIAG: Bi[] = [bi('बंद एयर फ़िल्टर / हवा में रुकावट', 'Clogged air filter / air restriction'), bi('घिसी पिस्टन रिंग (सभी सिलेंडरों का कम कंप्रेशन)', 'Worn piston rings (low compression on all cylinders)'), bi('फटा हेड गैस्केट', 'Blown head gasket'), bi('ख़राब इंजेक्टर (अधिक ईंधन)', 'Faulty injectors (over-fuelling)'), bi('टर्बो बेयरिंग फेल', 'Failed turbo bearings')];
interface Case { title: Bi; story: Bi; res: Record<string, Bi>; ans: number }
const norm = (hi: string, en: string) => bi(hi, en);
const CASES: Case[] = [
  { title: bi('केस 1 — काला धुआँ, कम शक्ति', 'Case 1 — black smoke, low power'), story: bi('ट्रक भार में काला धुआँ देता है और शक्ति कम है।', 'A truck gives black smoke under load and lacks power.'), ans: 0, res: {
    air: bi('सूचक पूरा लाल — फ़िल्टर बुरी तरह बंद।', 'Indicator fully red — filter badly clogged.'), boost: bi('बूस्ट केवल 0.4 bar (सामान्य ≈ 1.5 bar)।', 'Boost only 0.4 bar (normal ≈ 1.5 bar).'),
    inj: norm('बैलेंस ठीक; रिटर्न-लीक सामान्य।', 'Balanced; return leak normal.'), comp: norm('सभी सिलेंडर 26–28 bar — सामान्य।', 'All cylinders 26–28 bar — normal.'),
    leak: norm('हर सिलेंडर में लगभग 6% रिसाव — सामान्य।', 'About 6% leakage on each cylinder — normal.'), cool: norm('सिस्टम दाब रोकता है।', 'System holds pressure.'),
    oil: norm('स्तर व स्थिति सामान्य।', 'Level and condition normal.'), dtc: bi('कोड: बूस्ट दाब कम।', 'Code: boost pressure low.'),
    turbo: norm('शाफ़्ट प्ले सामान्य; कंप्रेसर हाउसिंग में तेल नहीं।', 'Shaft play normal; no oil in compressor housing.'), fuel: norm('आपूर्ति दाब सामान्य।', 'Supply pressure normal.') } },
  { title: bi('केस 2 — नीला धुआँ, तेल की खपत', 'Case 2 — blue smoke, oil consumption'), story: bi('इंजन नीला धुआँ देता है; हर 1,000 km पर लगभग 1 L तेल घटता है।', 'The engine gives blue smoke; about 1 L of oil is used every 1,000 km.'), ans: 1, res: {
    air: norm('सूचक हरा — फ़िल्टर ठीक।', 'Indicator green — filter fine.'), boost: norm('बूस्ट 1.4 bar — सामान्य।', 'Boost 1.4 bar — normal.'),
    inj: norm('बैलेंस ठीक।', 'Balanced.'), comp: bi('चारों सिलेंडर 17–19 bar (मानक ≈ 27) — सभी कम।', 'All four cylinders 17–19 bar (spec ≈ 27) — all low.'),
    leak: bi('लगभग 42% रिसाव; हवा ऑयल-फ़िलर (ब्रीदर) से निकल रही है।', 'About 42% leakage; air escaping at the oil filler (breather).'), cool: norm('सिस्टम दाब रोकता है।', 'System holds pressure.'),
    oil: bi('तेल पतला व काला; स्तर नियमित रूप से घट रहा।', 'Oil thin and black; level falling steadily.'), dtc: norm('कोई कोड नहीं।', 'No codes.'),
    turbo: norm('शाफ़्ट प्ले सामान्य।', 'Shaft play normal.'), fuel: norm('आपूर्ति दाब सामान्य।', 'Supply pressure normal.') } },
  { title: bi('केस 3 — सफ़ेद धुआँ, कूलेंट घटना', 'Case 3 — white smoke, coolant loss'), story: bi('गर्म इंजन से सफ़ेद धुआँ; कूलेंट घटता है, बाहर रिसाव नहीं; तेल का रंग अजीब।', 'Hot engine blows white smoke; coolant falls with no external leak; oil looks odd.'), ans: 2, res: {
    air: norm('सूचक हरा।', 'Indicator green.'), boost: norm('बूस्ट सामान्य।', 'Boost normal.'), inj: norm('बैलेंस ठीक।', 'Balanced.'),
    comp: bi('सिलेंडर 3 केवल 12 bar, बाक़ी ≈ 27 bar।', 'Cylinder 3 only 12 bar, the rest ≈ 27 bar.'),
    leak: bi('सिलेंडर 3: कूलेंट रिज़र्वायर में बुलबुले; रेडिएटर में हवा की फुफकार।', 'Cylinder 3: bubbles in the coolant reservoir; air hissing in the radiator.'),
    cool: bi('दाब तेज़ी से गिरता है; बाहरी रिसाव नहीं।', 'Pressure drops quickly; no external leak.'), oil: bi('डिपस्टिक पर मलाईदार इमल्शन।', 'Milky emulsion on the dipstick.'),
    dtc: norm('कोई कोड नहीं।', 'No codes.'), turbo: norm('शाफ़्ट प्ले सामान्य।', 'Shaft play normal.'), fuel: norm('आपूर्ति दाब सामान्य।', 'Supply pressure normal.') } },
];
const ptsFor = (n: number) => (n <= 3 ? 4 : n <= 5 ? 3 : 2);

/** Unit 9 — diagnostic cases: choose tests wisely (efficiency is scored), then commit to a root cause. */
export default function Sim09Diagnosis() {
  const { s, L } = useT();
  const run = useRun(9, 12);
  const [phase, setPhase] = useState(0);
  const [used, setUsed] = useState<string[][]>([[], [], []]);
  const [ok, setOk] = useState([false, false, false]);
  const [pick, setPick] = useState<number | null>(null);
  const c = CASES[phase];
  const u = used[phase];

  const test = (id: string) => { if (ok[phase] || u.includes(id)) return; setUsed((x) => x.map((a, i) => (i === phase ? [...a, id] : a))); run.say('info', c.res[id]); };
  const submit = () => {
    if (pick === null || ok[phase]) return;
    if (pick === c.ans) {
      const p = ptsFor(u.length);
      setOk((o) => o.map((v, i) => (i === phase ? true : v)));
      run.add(p, bi(`सही मूल कारण! ${u.length} परीक्षणों में — ${p}/4 अंक।`, `Correct root cause! In ${u.length} tests — ${p}/4 points.`));
    } else run.miss(bi('यह कारण आपके परीक्षण-परिणामों से मेल नहीं खाता। और परीक्षण करें।', 'That cause does not fit your test results. Run more tests.'));
  };
  const phases = CASES.map((x) => x.title);
  const hints = [bi('काला धुआँ = हवा की कमी: हवा के रास्ते (फ़िल्टर, बूस्ट) जाँचें।', 'Black smoke = lack of air: check the air path (filter, boost).'),
    bi('नीला धुआँ = तेल जल रहा है: कंप्रेशन व लीक-डाउन देखें।', 'Blue smoke = oil burning: look at compression and leak-down.'),
    bi('सफ़ेद धुआँ + कूलेंट घटना: कूलिंग-सिस्टम दाब व कंप्रेशन देखें।', 'White smoke + coolant loss: check cooling-system pressure and compression.')];
  const reset = () => { run.reset(); setPhase(0); setUsed([[], [], []]); setOk([false, false, false]); setPick(null); };

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={ok[phase]} onNext={() => { setPhase(phase + 1); setPick(null); }} getHint={() => hints[phase]} onReset={reset}
      title={bi('डायग्नोस्टिक केस बे', 'Diagnostic case bay')}
      intro={bi('लक्षण पढ़ें, ज़रूरी परीक्षण ही चुनें और मूल कारण बताएँ। कम परीक्षणों में सही निदान पर अधिक अंक मिलते हैं।', 'Read the symptoms, choose only the tests you need and name the root cause. Fewer tests to a correct diagnosis score more.')}>
      <div className="grid gap-4">
        <div className="rounded-md border border-line bg-panel p-3"><div className="font-bold">{L(c.title)}</div><p className="text-sm text-mute">{L(c.story)}</p></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{s('परीक्षण चुनें', 'Choose a test')} · <span className="readout text-cool" data-testid="tests-used">{u.length}</span> {s('प्रयुक्त', 'used')}</div>
            <div className="grid grid-cols-2 gap-2">{TESTS.map((t) => <button key={t.id} data-test={t.id} onClick={() => test(t.id)} disabled={ok[phase]} className={`btn !justify-start text-left !text-xs !py-2 ${u.includes(t.id) ? '!border-cool/60 bg-cool/10' : ''}`}>{L(t.n)}</button>)}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{s('परीक्षण-लॉग', 'Test log')}</div>
            <ul className="grid gap-1.5 text-sm min-h-[6rem]" data-testid="log">
              {u.length === 0 && <li className="text-mute">{s('अभी कोई परीक्षण नहीं।', 'No tests yet.')}</li>}
              {u.map((id) => <li key={id} className="rounded border border-line bg-panel px-2.5 py-1.5"><b>{L(TESTS.find((t) => t.id === id)!.n)}:</b> {L(c.res[id])}</li>)}
            </ul>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{s('मूल कारण', 'Root cause')}</div>
          <div className="grid gap-2 sm:grid-cols-2">{DIAG.map((d, i) => <button key={i} data-diag={i} aria-pressed={pick === i} disabled={ok[phase]} onClick={() => setPick(i)} className={`btn !justify-start text-left ${pick === i ? '!border-cool bg-cool/10' : ''} ${ok[phase] && i === c.ans ? '!bg-ok !text-bg' : ''}`}>{L(d)}</button>)}</div>
          <div className="mt-3"><button className="btn btn-amber" onClick={submit} disabled={pick === null || ok[phase]} data-testid="submit-diag">{s('निदान जमा करें', 'Submit diagnosis')}</button></div>
        </div>
      </div>
    </SimFrame>
  );
}
