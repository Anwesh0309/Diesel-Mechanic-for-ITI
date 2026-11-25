import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { Seq } from '@/components/simkit/Seq';
import { playAlert } from '@/lib/sound';

interface Item { id: string; x: number; y: number; name: Bi; hazard: boolean; why: Bi; fix?: Bi[]; ans?: number }
const ITEMS: Item[] = [
  { id: 'oil', x: 110, y: 262, name: bi('फ़र्श पर तेल', 'Oil on the floor'), hazard: true, why: bi('फिसलने का ख़तरा।', 'A slip hazard.'),
    fix: [bi('चेतावनी बोर्ड लगाकर अवशोषक से साफ़ करें', 'Put up a warning sign and clean with absorbent'), bi('ऊपर से गत्ता बिछा दें', 'Lay cardboard over it'), bi('अनदेखा करें', 'Ignore it')], ans: 0 },
  { id: 'jack', x: 262, y: 212, name: bi('सिर्फ़ जैक पर उठा वाहन', 'Vehicle held only by a jack'), hazard: true, why: bi('जैक फिसलने पर वाहन गिर सकता है।', 'The vehicle can fall if the jack slips.'),
    fix: [bi('जल्दी से काम निपटा लें', 'Finish the job quickly'), bi('एक्सल स्टैंड लगाएँ व पहियों पर चॉक रखें', 'Fit axle stands and chock the wheels'), bi('लकड़ी का टुकड़ा लगा दें', 'Wedge a block of wood')], ans: 1 },
  { id: 'grind', x: 430, y: 175, name: bi('बिना गार्ड/चश्मे के ग्राइंडर', 'Grinder with no guard or eye protection'), hazard: true, why: bi('चिंगारी व टूटे पहिए के टुकड़े आँख को चोट पहुँचा सकते हैं।', 'Sparks and wheel fragments can injure eyes.'),
    fix: [bi('दूर खड़े हो जाएँ', 'Just stand further back'), bi('सिर्फ़ दस्ताने पहनें', 'Wear gloves only'), bi('गार्ड लगाएँ व चश्मा/फ़ेस शील्ड पहनें', 'Refit the guard and wear glasses/face shield')], ans: 2 },
  { id: 'cable', x: 565, y: 252, name: bi('फटा बिजली का तार', 'Frayed electric cable'), hazard: true, why: bi('करंट व शॉर्ट-सर्किट से आग का ख़तरा।', 'Risk of shock and fire from a short circuit.'),
    fix: [bi('इन्सुलेशन-टेप लपेटकर चलाते रहें', 'Wrap with tape and keep using it'), bi('सावधानी से हाथ लगाएँ', 'Handle it carefully'), bi('बंद कर टैग लगाएँ व तार बदलें', 'Isolate, tag it out and replace the cable')], ans: 2 },
  { id: 'fuel', x: 505, y: 258, name: bi('चिंगारियों के पास खुला डीज़ल कैन', 'Open diesel can near sparks'), hazard: true, why: bi('वाष्प/गिरा ईंधन आग पकड़ सकता है।', 'Vapour or spilled fuel can catch fire.'),
    fix: [bi('मान्य ज्वलनशील-अलमारी में दूर रखें', 'Store it away in an approved flammables cabinet'), bi('कपड़ा ढक दें', 'Cover it with a rag'), bi('फ़र्श पर बहा दें', 'Pour it on the floor')], ans: 0 },
  { id: 'exit', x: 592, y: 118, name: bi('बंद निकास व अग्निशामक के आगे सामान', 'Fire exit and extinguisher blocked by stock'), hazard: true, why: bi('आपात में निकलना या बुझाना असंभव।', 'Impossible to escape or fight a fire in an emergency.'),
    fix: [bi('रास्ता साफ़ रखें, पहुँच खुली रखें', 'Clear the route and keep access open'), bi('बस एक साइन लटका दें', 'Just hang a sign'), bi('सामान और ऊँचा रख दें', 'Stack the stock higher')], ans: 0 },
  { id: 'board', x: 120, y: 92, name: bi('करीने से सजा टूल-बोर्ड', 'Neat, organised tool board'), hazard: false, why: bi('यह 5S का अच्छा उदाहरण है — ख़तरा नहीं।', 'A good example of 5S — not a hazard.') },
  { id: 'aid', x: 330, y: 70, name: bi('दीवार पर प्राथमिक चिकित्सा बॉक्स', 'First-aid box on the wall'), hazard: false, why: bi('यह सुरक्षा उपकरण है — ख़तरा नहीं।', 'This is safety equipment — not a hazard.') },
  { id: 'ppe', x: 232, y: 118, name: bi('पूर्ण PPE में काम करता मैकेनिक', 'Mechanic working in full PPE'), hazard: false, why: bi('सही आचरण — ख़तरा नहीं।', 'Correct practice — not a hazard.') },
];
interface Task { t: Bi; items: { t: Bi; good: boolean }[] }
const TASKS: Task[] = [
  { t: bi('ज़ंग लगे बोल्ट को ग्राइंडर से काटना', 'Cutting a rusted bolt with an angle grinder'), items: [{ t: bi('सुरक्षा चश्मा / फ़ेस शील्ड', 'Safety glasses / face shield'), good: true }, { t: bi('ईयर प्लग', 'Ear plugs'), good: true }, { t: bi('फ़िट दस्ताने', 'Fitted gloves'), good: true }, { t: bi('ढीला दुपट्टा/स्कार्फ़', 'Loose scarf'), good: false }, { t: bi('चप्पल', 'Sandals'), good: false }] },
  { t: bi('बैटरी बदलना', 'Changing a battery'), items: [{ t: bi('गॉगल्स', 'Goggles'), good: true }, { t: bi('एसिड-रोधी दस्ताने', 'Acid-resistant gloves'), good: true }, { t: bi('अँगूठी/घड़ी उतारें', 'Remove rings and watch'), good: true }, { t: bi('धातु का कड़ा पहनें', 'Wear a metal bracelet'), good: false }, { t: bi('खुले पाँव', 'Bare feet'), good: false }] },
  { t: bi('उठे ट्रक के नीचे काम (स्टैंड पर)', 'Working under a stand-supported truck'), items: [{ t: bi('स्टील-टो सेफ़्टी शूज़', 'Steel-toe safety shoes'), good: true }, { t: bi('बंप कैप/हेलमेट', 'Bump cap / helmet'), good: true }, { t: bi('फ़िट ओवरऑल', 'Fitted overalls'), good: true }, { t: bi('लटकती चेन', 'Dangling chain'), good: false }, { t: bi('फ़्लिप-फ़्लॉप', 'Flip-flops'), good: false }] },
];
const PASS: Bi[] = [bi('हैंडल दबाएँ (Squeeze)', 'Squeeze the handle'), bi('पिन खींचें (Pull)', 'Pull the pin'), bi('आग के आधार पर निशाना (Aim)', 'Aim at the base of the fire'), bi('दाएँ-बाएँ घुमाएँ (Sweep)', 'Sweep side to side')];

/** Unit 10 — hazard hunt in a workshop scene, PPE selection per job, and fire-extinguisher PASS. */
export default function Sim10Hazards() {
  const { s, L } = useT();
  const run = useRun(10, 22);
  const [phase, setPhase] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [fixed, setFixed] = useState<string[]>([]);
  const [tIdx, setTIdx] = useState(0);
  const [pick, setPick] = useState<number[][]>([[], [], []]);
  const [tOk, setTOk] = useState([false, false, false]);
  const [passOk, setPassOk] = useState(false);
  const [fireQ, setFireQ] = useState(false);

  const hazards = ITEMS.filter((i) => i.hazard);
  const item = ITEMS.find((i) => i.id === sel);
  const tapItem = (id: string) => {
    const it = ITEMS.find((x) => x.id === id)!; setSel(id);
    if (found.includes(id) || fixed.includes(id)) return;
    if (it.hazard) { setFound((f) => [...f, id]); run.add(1, bi(`ख़तरा मिला: ${it.name.hi}। ${it.why.hi} उपाय चुनें।`, `Hazard found: ${it.name.en}. ${it.why.en} Choose the remedy.`)); playAlert(); }
    else run.miss(bi(`यह ख़तरा नहीं है — ${it.why.hi}`, `That is not a hazard — ${it.why.en}`));
  };
  const remedy = (i: number) => {
    if (!item || !item.hazard || fixed.includes(item.id)) return;
    if (i === item.ans) { setFixed((f) => [...f, item.id]); run.add(1, bi('सही उपाय।', 'Correct remedy.')); } else run.miss(bi('यह उपाय असुरक्षित है — मूल कारण दूर करें, छिपाएँ नहीं।', 'That remedy is unsafe — remove the cause, do not hide it.'));
  };
  const confirmPpe = () => {
    const t = TASKS[tIdx]; const good = t.items.map((x, i) => (x.good ? i : -1)).filter((i) => i >= 0); const p = pick[tIdx];
    if (tOk[tIdx]) return;
    if (good.length === p.length && good.every((i) => p.includes(i))) { setTOk((o) => o.map((v, i) => (i === tIdx ? true : v))); run.add(2, bi('सही PPE-चयन।', 'Correct PPE selection.')); }
    else run.miss(bi(`PPE सही नहीं: ${p.filter((i) => !t.items[i].good).length} ग़लत, ${good.filter((i) => !p.includes(i)).length} छूटे।`, `PPE not right: ${p.filter((i) => !t.items[i].good).length} wrong, ${good.filter((i) => !p.includes(i)).length} missing.`));
  };

  const phases = [bi('ख़तरे खोजें', 'Hunt the hazards'), bi('सही PPE', 'Right PPE'), bi('आग बुझाना', 'Fighting fire')];
  const canNext = phase === 0 ? fixed.length === hazards.length : phase === 1 ? tOk.every(Boolean) : passOk && fireQ;
  const hints = [bi('फिसलन, उठा वाहन, चिंगारी, तार, ईंधन और रास्ते में रुकावट — सब को ध्यान से देखें; सुरक्षित चीज़ें न छुएँ।', 'Look for slips, lifted vehicle, sparks, wiring, fuel and blocked routes; leave safe items alone.'),
    bi('काम के जोखिम (चिंगारी, एसिड, गिरता भार) से PPE मिलाएँ; ढीली/लटकती चीज़ें ग़लत हैं।', 'Match PPE to the risk (sparks, acid, falling load); loose or dangling items are wrong.'),
    bi('PASS: Pull → Aim → Squeeze → Sweep। तेल की आग पर पानी नहीं।', 'PASS: Pull → Aim → Squeeze → Sweep. No water on oil fires.')];
  const reset = () => { run.reset(); setPhase(0); setSel(null); setFound([]); setFixed([]); setTIdx(0); setPick([[], [], []]); setTOk([false, false, false]); setPassOk(false); setFireQ(false); };

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => { setPhase(phase + 1); setSel(null); }} getHint={() => hints[phase]} onReset={reset}
      title={bi('वर्कशॉप सुरक्षा — ख़तरा खोज', 'Workshop safety — hazard hunt')}
      intro={bi('वर्कशॉप के दृश्य में ख़तरे खोजें और उनके सही उपाय चुनें, फिर हर काम के लिए PPE तय करें और आग बुझाने का क्रम सीखें।', 'Find hazards in the workshop scene and pick the right remedies, then choose PPE for each job and learn the fire-fighting sequence.')}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="hazard-scene">
          <svg viewBox="0 0 640 300" className="w-full h-auto rounded-lg overflow-hidden border border-line" role="group" aria-label="workshop scene">
            <defs>
              <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.65"/>
              </filter>
            </defs>
            <rect width="640" height="300" fill="rgb(var(--panel))" />
            <rect y="240" width="640" height="60" fill="rgb(var(--panel2))" />
            <line x1="0" y1="240" x2="640" y2="240" stroke="rgb(var(--line))" strokeWidth="2" />
            <image href="/images/workshop_hazards.jpg" x="0" y="0" width="640" height="300" preserveAspectRatio="xMidYMid slice" opacity="0.95" />
            <rect width="640" height="300" fill="rgb(var(--bg) / .12)" />
            {ITEMS.map((it) => {
              const done = fixed.includes(it.id); const fd = found.includes(it.id);
              return (
                <g key={it.id} transform={`translate(${it.x},${it.y})`} filter="url(#pin-shadow)" className="cursor-pointer" role="button" tabIndex={0} aria-label={L(it.name)} data-item={it.id} data-state={done ? 'fixed' : fd ? 'found' : ''} onClick={() => tapItem(it.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') tapItem(it.id); }}>
                  <circle r="26" fill="transparent" />
                  {!fd && !done && <circle r="20" fill="none" stroke="rgb(var(--cool))" strokeWidth="1.5" className="animate-ping opacity-60" />}
                  <circle r="14" fill={done ? 'rgb(var(--ok))' : fd ? 'rgb(var(--hot))' : 'rgb(var(--cool))'} stroke={sel === it.id ? '#ffffff' : 'rgb(var(--bg))'} strokeWidth={sel === it.id ? 3.5 : 2.5} />
                  <text textAnchor="middle" y="5" fontSize="13" fontWeight="900" fill="rgb(var(--bg))">{done ? '✓' : fd ? '!' : '?'}</text>
                </g>
              );
            })}
          </svg>
          <div className="rounded-md border border-line bg-panel p-3 min-h-[6rem]" data-testid="hz-panel">
            {item && item.hazard && found.includes(item.id) ? (
              <div className="grid gap-2"><div className="font-bold">{L(item.name)}</div><p className="text-sm text-mute">{L(item.why)}</p>
                {fixed.includes(item.id) ? <div className="text-ok font-bold text-sm">{s('उपाय लागू ✓', 'Remedy applied ✓')}</div>
                  : <div className="grid gap-2">{item.fix!.map((f, i) => <button key={i} className="btn !justify-start text-left" data-fix={i} onClick={() => remedy(i)}>{L(f)}</button>)}</div>}</div>
            ) : <p className="text-sm text-mute">{s('दृश्य में किसी बिंदु (?) को दबाएँ जिसे आप ख़तरा मानते हैं।', 'Tap a point (?) in the scene that you think is a hazard.')}</p>}
          </div>
          <p className="text-sm text-mute">{s('ख़तरे ठीक किए', 'Hazards resolved')}: <span className="readout text-cool" data-testid="hz-count">{fixed.length}/{hazards.length}</span></p>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ppe">
          <div className="flex gap-2">{TASKS.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1.5 ${i === tIdx ? '!border-cool' : ''}`} onClick={() => setTIdx(i)}>{i + 1}{tOk[i] ? ' ✓' : ''}</button>)}</div>
          <p className="font-semibold">{s('काम:', 'Job:')} {L(TASKS[tIdx].t)}</p>
          {TASKS[tIdx].items.map((x, i) => {
            const on = pick[tIdx].includes(i);
            return <button key={i} aria-pressed={on} data-ppe={i} disabled={tOk[tIdx]} onClick={() => setPick((p) => p.map((a, k) => (k === tIdx ? (a.includes(i) ? a.filter((v) => v !== i) : [...a, i]) : a)))}
              className={`text-left rounded-md border px-3 py-2.5 text-sm flex gap-3 items-center ${on ? 'border-cool bg-cool/10' : 'border-line bg-panel hover:border-cool/60'}`}><span className={`w-5 h-5 rounded border-2 shrink-0 ${on ? 'bg-cool border-cool' : 'border-mute'}`} />{L(x.t)}</button>;
          })}
          <div><button className="btn btn-cool" onClick={confirmPpe} disabled={tOk[tIdx]} data-testid="ppe-confirm">{s('पुष्टि करें', 'Confirm')}</button></div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-4" data-testid="fire">
          <div className="rounded-md border border-line bg-panel p-3"><p className="font-semibold mb-2">{s('डीज़ल/तेल की आग के लिए क्या सही है?', 'What is right for a diesel/oil fire?')}</p>
            <div className="flex flex-wrap gap-2">{[{ t: bi('पानी की बाल्टी', 'A bucket of water'), g: false }, { t: bi('ABC पाउडर / CO₂ अग्निशामक', 'ABC powder / CO₂ extinguisher'), g: true }, { t: bi('कुछ नहीं, भाग जाएँ', 'Nothing — just run'), g: false }].map((o, i) => (
              <button key={i} disabled={fireQ} className={`btn ${fireQ && o.g ? '!bg-ok !text-bg' : ''}`} data-fq={i} onClick={() => { if (o.g) { setFireQ(true); run.add(1, bi('सही — पानी तेल की आग फैला देता है।', 'Right — water spreads an oil fire.')); } else run.miss(bi('तेल/बिजली की आग पर पानी नहीं।', 'No water on oil or electrical fires.')); }}>{L(o.t)}</button>))}</div></div>
          <div><p className="text-sm font-semibold mb-2">{s('अग्निशामक चलाने का PASS-क्रम:', 'PASS sequence for using the extinguisher:')}</p>
            <Seq items={PASS} correct={[1, 2, 0, 3]} locked={passOk} onWrong={() => run.miss(bi('क्रम गलत — पहले पिन, फिर निशाना, फिर दबाएँ, फिर घुमाएँ।', 'Wrong order — pull, aim, squeeze, sweep.'))}
              onDone={() => { setPassOk(true); run.add(3, bi('सही — Pull, Aim, Squeeze, Sweep।', 'Correct — Pull, Aim, Squeeze, Sweep.')); }} /></div>
        </div>
      )}
    </SimFrame>
  );
}
