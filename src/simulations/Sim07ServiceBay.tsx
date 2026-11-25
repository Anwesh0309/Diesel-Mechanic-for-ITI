import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';

interface Spot { id: string; x: number; y: number; name: Bi; obs: Bi; defect: boolean }
const SPOTS: Spot[] = [
  { id: 'dip', x: 150, y: 118, name: bi('तेल डिपस्टिक', 'Oil dipstick'), obs: bi('तेल का स्तर MIN निशान पर है; तेल गहरा काला।', 'Oil level is at the MIN mark; oil is dark black.'), defect: true },
  { id: 'cool', x: 290, y: 52, name: bi('कूलेंट रिज़र्वायर', 'Coolant reservoir'), obs: bi('स्तर MAX–MIN के बीच, रंग साफ़।', 'Level between MAX and MIN, colour clean.'), defect: false },
  { id: 'belt', x: 80, y: 158, name: bi('ड्राइव बेल्ट', 'Drive belt'), obs: bi('पसलियों पर आड़ी दरारें और चमकदार सतह।', 'Cross-cracks on the ribs and a glazed surface.'), defect: true },
  { id: 'air', x: 500, y: 62, name: bi('एयर फ़िल्टर सूचक', 'Air-filter indicator'), obs: bi('सूचक हरे में — रुकावट कम।', 'Indicator in green — low restriction.'), defect: false },
  { id: 'drip', x: 262, y: 226, name: bi('इंजन के नीचे फ़र्श', 'Floor under engine'), obs: bi('ताज़ा तेल की बूँदें सम्प के पास गिर रही हैं।', 'Fresh oil drips falling near the sump.'), defect: true },
  { id: 'batt', x: 565, y: 168, name: bi('बैटरी टर्मिनल', 'Battery terminals'), obs: bi('टर्मिनल साफ़, कसे हुए; ग्रीस लगी।', 'Terminals clean and tight, greased.'), defect: false },
  { id: 'sep', x: 425, y: 170, name: bi('वाटर सेपरेटर', 'Water separator'), obs: bi('कटोरे में तली पर पानी की परत दिख रही है।', 'A layer of water is visible at the bottom of the bowl.'), defect: true },
  { id: 'hose', x: 398, y: 74, name: bi('रेडिएटर होज़', 'Radiator hoses'), obs: bi('होज़ दबाने पर मज़बूत; कोई दरार/रिसाव नहीं।', 'Hoses firm when squeezed; no cracks or leaks.'), defect: false },
];
const PARTS: { t: Bi; good: boolean }[] = [
  { t: bi('इंजन ऑयल 15W-40 (CK-4) — 13 लीटर', 'Engine oil 15W-40 (CK-4) — 13 litres'), good: true },
  { t: bi('ऑयल फ़िल्टर (सही पार्ट नंबर)', 'Oil filter (correct part number)'), good: true },
  { t: bi('फ़्यूल फ़िल्टर व वाटर-सेपरेटर तत्व', 'Fuel filter and water-separator element'), good: true },
  { t: bi('एयर फ़िल्टर तत्व', 'Air-filter element'), good: true },
  { t: bi('ड्राइव बेल्ट (सही पार्ट नंबर)', 'Drive belt (correct part number)'), good: true },
  { t: bi('ड्रेन प्लग का नया वॉशर', 'New drain-plug washer'), good: true },
  { t: bi('पेट्रोल इंजन के स्पार्क प्लग', 'Petrol-engine spark plugs'), good: false },
  { t: bi('पेट्रोल-ग्रेड तेल 5W-20 (SN)', 'Petrol-grade oil 5W-20 (SN)'), good: false },
  { t: bi('गियरबॉक्स तेल', 'Gearbox oil'), good: false },
];
const Q = [
  { q: bi('अंतिम सर्विस 35,000 km पर, अंतराल 15,000 km। अगली सर्विस कब?', 'Last service at 35,000 km, interval 15,000 km. When is the next due?'), o: ['48,000 km', '50,000 km', '55,000 km', '65,000 km'], a: 1 },
  { q: bi('वाहन धूल भरे कठोर काम में है — अंतराल आधा (7,500 km)। रीडिंग 48,200 km है। स्थिति?', 'The vehicle is in severe, dusty duty — interval halved (7,500 km). The reading is 48,200 km. Status?'), o: ['48,200 → not due', 'Due in 1,800 km', 'Overdue by 5,700 km', 'Overdue by 13,200 km'], a: 2 },
];

/** Unit 7 — service bay: walk-around triage, parts kit from a catalogue, service-schedule calculation. */
export default function Sim07ServiceBay() {
  const { s, L } = useT();
  const run = useRun(7, 16);
  const [phase, setPhase] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [cls, setCls] = useState<Record<string, 'ok' | 'defect'>>({});
  const [kit, setKit] = useState<number[]>([]);
  const [kitOk, setKitOk] = useState(false);
  const [qa, setQa] = useState<(number | null)[]>([null, null]);

  const spot = SPOTS.find((x) => x.id === sel);
  const classify = (verdict: 'ok' | 'defect') => {
    if (!spot || cls[spot.id]) return;
    if ((verdict === 'defect') === spot.defect) { setCls({ ...cls, [spot.id]: verdict }); run.add(1, bi(spot.defect ? 'सही — यह ख़राबी जॉब कार्ड में दर्ज करें।' : 'सही — यह मद ठीक है।', spot.defect ? 'Right — note this defect on the job card.' : 'Right — this item is fine.')); }
    else run.miss(bi('फिर से देखें — अवलोकन ध्यान से पढ़ें।', 'Look again — read the observation carefully.'));
  };
  const confirmKit = () => {
    const good = PARTS.map((p, i) => (p.good ? i : -1)).filter((i) => i >= 0);
    if (good.length === kit.length && good.every((i) => kit.includes(i))) { setKitOk(true); run.add(4, bi('सही किट — डीज़ल-ग्रेड तेल, मैचिंग फ़िल्टर और बेल्ट।', 'Correct kit — diesel-grade oil, matching filters and belt.')); }
    else run.miss(bi(`किट सही नहीं: ${kit.filter((i) => !PARTS[i].good).length} अनुपयुक्त, ${good.filter((i) => !kit.includes(i)).length} ज़रूरी मद छूटी।`, `Kit is not right: ${kit.filter((i) => !PARTS[i].good).length} unsuitable, ${good.filter((i) => !kit.includes(i)).length} needed item(s) missing.`));
  };
  const answer = (qi: number, oi: number) => {
    if (qa[qi] === Q[qi].a) return;
    if (oi === Q[qi].a) { setQa((x) => x.map((v, i) => (i === qi ? oi : v))); run.add(2, bi('सही गणना।', 'Correct calculation.')); }
    else run.miss(bi(qi === 0 ? 'अगली सर्विस = पिछली + अंतराल।' : 'अगली = 35,000 + 7,500 = 42,500; रीडिंग 48,200 उससे आगे है।', qi === 0 ? 'Next service = last + interval.' : 'Next = 35,000 + 7,500 = 42,500; the reading 48,200 is beyond it.'));
  };

  const found = Object.keys(cls).length;
  const phases = [bi('वॉक-अराउंड जाँच', 'Walk-around inspection'), bi('सर्विस किट चुनें', 'Pick the service kit'), bi('सर्विस शेड्यूल', 'Service schedule')];
  const canNext = phase === 0 ? found === SPOTS.length : phase === 1 ? kitOk : qa[0] === Q[0].a && qa[1] === Q[1].a;
  const hints = [bi('हर बिंदु दबाएँ, अवलोकन पढ़ें, फिर तय करें: ठीक या ख़राबी। 4 ख़राबियाँ छिपी हैं।', 'Tap each point, read the observation, then decide: OK or defect. Four defects are hidden.'),
    bi('इंजन डीज़ल है — पेट्रोल पार्ट व गियरबॉक्स तेल नहीं; 6 सही मदें हैं।', 'The engine is diesel — no petrol parts or gearbox oil; six items are correct.'),
    bi('अगली सर्विस = पिछली सर्विस + अंतराल; कठोर काम में अंतराल आधा।', 'Next service = last service + interval; severe duty halves the interval.')];
  const reset = () => { run.reset(); setPhase(0); setSel(null); setCls({}); setKit([]); setKitOk(false); setQa([null, null]); };

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('सर्विस बे — जॉब कार्ड', 'Service bay — job card')}
      intro={bi('ग्राहक का ट्रक सर्विस के लिए आया है: जाँच करें, सही पार्ट चुनें और अगली सर्विस तय करें।', "The customer's truck is in for service: inspect it, pick the right parts and set the next service.")}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="walkaround">
          <svg viewBox="0 0 640 260" className="w-full h-auto rounded-lg overflow-hidden border border-line" role="group" aria-label="engine bay">
            <defs>
              <filter id="spot-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.65"/>
              </filter>
              <pattern id="radiator-fins" width="6" height="6" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="6" y2="0" stroke="rgb(var(--cool))" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>

            {/* Engine Bay Outer Chassis */}
            <rect x="15" y="10" width="610" height="240" rx="14" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="2.5" />
            {/* Front crossmember & radiator frame */}
            <rect x="130" y="20" width="380" height="26" rx="4" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="1.5" />
            <rect x="140" y="24" width="360" height="18" fill="url(#radiator-fins)" />
            {/* Radiator Pressure Cap */}
            <rect x="300" y="16" width="30" height="8" rx="2" fill="rgb(var(--amber) / .8)" stroke="rgb(var(--ink))" strokeWidth="1" />
            <text x="315" y="23" textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgb(var(--bg))">PRESS</text>

            {/* Front Serpentine Belt & Pulleys (Left side: belt at x=80, y=158) */}
            <g id="drive-belt-system">
              <circle cx="80" cy="188" r="28" fill="rgb(var(--panel2))" stroke="rgb(var(--mute))" strokeWidth="3" />
              <circle cx="80" cy="188" r="14" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
              <circle cx="85" cy="122" r="18" fill="rgb(var(--panel2))" stroke="rgb(var(--mute))" strokeWidth="2.5" />
              <circle cx="85" cy="122" r="8" fill="rgb(var(--bg))" />
              <circle cx="112" cy="155" r="14" fill="rgb(var(--panel2))" stroke="rgb(var(--mute))" strokeWidth="2" />
              <circle cx="58" cy="150" r="16" fill="rgb(var(--panel2))" stroke="rgb(var(--mute))" strokeWidth="2" />
              <path d="M58 134 C70 110, 95 108, 103 122 C115 140, 105 165, 108 188 C108 216, 52 216, 52 188 C52 165, 42 155, 58 134 Z" fill="none" stroke="rgb(var(--ink))" strokeWidth="6" strokeLinecap="round" />
              <path d="M58 134 C70 110, 95 108, 103 122 C115 140, 105 165, 108 188 C108 216, 52 216, 52 188 C52 165, 42 155, 58 134 Z" fill="none" stroke="rgb(var(--mute))" strokeWidth="2" strokeDasharray="3 3" />
            </g>

            {/* Engine Main Block & Valve Cover */}
            <g id="engine-block">
              <rect x="160" y="70" width="230" height="135" rx="10" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2.5" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={175 + i * 35} y="82" width="22" height="110" rx="4" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="1" />
              ))}
              <circle cx="360" cy="100" r="12" fill="rgb(var(--amber) / .85)" stroke="rgb(var(--ink))" strokeWidth="1.5" />
              <text x="360" y="103" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgb(var(--bg))">OIL</text>
              <text x="275" y="145" textAnchor="middle" fontSize="13" fontWeight="900" fill="rgb(var(--mute) / .5)" letterSpacing="4">DIESEL 5.9L</text>
            </g>

            {/* Oil Dipstick Guide & Handle (x=150, y=118) */}
            <path d="M165 170 C155 155, 150 135, 150 124" fill="none" stroke="rgb(var(--amber))" strokeWidth="3" />
            <circle cx="150" cy="118" r="8" fill="none" stroke="#eab308" strokeWidth="3" />
            <circle cx="150" cy="118" r="4" fill="#eab308" />

            {/* Coolant Expansion Reservoir (x=290, y=52) */}
            <rect x="260" y="36" width="60" height="34" rx="6" fill="rgb(var(--bg))" stroke="rgb(var(--cool) / .7)" strokeWidth="2" />
            <rect x="262" y="48" width="56" height="20" rx="3" fill="rgb(var(--ok) / .35)" />
            <line x1="264" y1="46" x2="274" y2="46" stroke="rgb(var(--ok))" strokeWidth="1.5" />
            <text x="278" y="48" fontSize="7" fill="rgb(var(--ok))" fontWeight="bold">MAX</text>
            <line x1="264" y1="58" x2="274" y2="58" stroke="rgb(var(--ok))" strokeWidth="1.5" />
            <text x="278" y="60" fontSize="7" fill="rgb(var(--ok))" fontWeight="bold">MIN</text>

            {/* Radiator Upper Hose (x=398, y=74) */}
            <path d="M370 95 C380 90, 395 85, 398 74 C402 62, 408 50, 420 40" fill="none" stroke="rgb(var(--ink))" strokeWidth="14" strokeLinecap="round" />
            <path d="M370 95 C380 90, 395 85, 398 74 C402 62, 408 50, 420 40" fill="none" stroke="rgb(var(--mute))" strokeWidth="10" strokeLinecap="round" />
            <rect x="372" y="88" width="5" height="12" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
            <rect x="414" y="42" width="5" height="12" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />

            {/* Air Filter Canister & Restriction Indicator (x=500, y=62) */}
            <rect x="460" y="40" width="80" height="50" rx="8" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x="465" y="44" width="70" height="42" rx="5" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="1" />
            <circle cx="500" cy="62" r="10" fill="rgb(var(--panel))" stroke="rgb(var(--ok))" strokeWidth="2" />
            <circle cx="500" cy="62" r="5" fill="rgb(var(--ok))" />

            {/* Heavy Vehicle Battery (x=565, y=168) */}
            <rect x="525" y="140" width="80" height="60" rx="6" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x="535" y="144" width="20" height="8" rx="2" fill="rgb(var(--hot))" />
            <text x="545" y="151" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">+</text>
            <rect x="575" y="144" width="20" height="8" rx="2" fill="rgb(var(--ink))" />
            <text x="585" y="151" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">−</text>
            <line x1="520" y1="170" x2="610" y2="170" stroke="rgb(var(--amber) / .7)" strokeWidth="2" />

            {/* Fuel Water Separator Filter (x=425, y=170) */}
            <rect x="408" y="140" width="34" height="42" rx="4" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
            <rect x="412" y="170" width="26" height="18" rx="3" fill="rgb(var(--cool) / .25)" stroke="rgb(var(--cool))" strokeWidth="1.5" />
            <rect x="413" y="179" width="24" height="8" rx="2" fill="rgb(var(--cool) / .7)" />
            <rect x="422" y="188" width="6" height="5" fill="rgb(var(--amber))" />

            {/* Floor under Engine & Oil Drips (x=262, y=226) */}
            <rect x="220" y="210" width="85" height="14" rx="4" fill="rgb(var(--panel))" stroke="rgb(var(--line))" strokeWidth="1.5" />
            <ellipse cx="262" cy="232" rx="32" ry="7" fill="rgb(var(--amber) / .4)" />
            <circle cx="262" cy="226" r="4.5" fill="rgb(var(--hot))" />
            <circle cx="274" cy="232" r="3" fill="rgb(var(--hot))" />
            <circle cx="250" cy="233" r="2.5" fill="rgb(var(--hot))" />

            {/* Photo overlay if available */}
            <image href="/images/engine_bay.jpg" x="15" y="10" width="610" height="240" preserveAspectRatio="xMidYMid slice" opacity="0.9" />

            {SPOTS.map((p) => {
              const c = cls[p.id];
              return (
                <g key={p.id} transform={`translate(${p.x},${p.y})`} filter="url(#spot-shadow)" className="cursor-pointer" role="button" tabIndex={0} aria-label={L(p.name)} data-spot={p.id} data-cls={c ?? ''} onClick={() => setSel(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSel(p.id); }}>
                  <circle r="24" fill="transparent" />
                  {!c && <circle r="18" fill="none" stroke="rgb(var(--cool))" strokeWidth="1.5" className="animate-ping opacity-60" />}
                  <circle r="13" fill={c === 'defect' ? 'rgb(var(--hot))' : c === 'ok' ? 'rgb(var(--ok))' : 'rgb(var(--cool))'} stroke={sel === p.id ? '#ffffff' : 'rgb(var(--bg))'} strokeWidth={sel === p.id ? 3.5 : 2.5} />
                  <text textAnchor="middle" y="4.5" fontSize="13" fontWeight="900" fill="rgb(var(--bg))">{c === 'defect' ? '!' : c === 'ok' ? '✓' : '?'}</text>
                </g>
              );
            })}
          </svg>
          <div className="rounded-md border border-line bg-panel p-3 min-h-[5.5rem]" data-testid="spot-panel">
            {spot ? (
              <div className="grid gap-2"><div className="font-bold">{L(spot.name)}</div><p className="text-sm">{L(spot.obs)}</p>
                {cls[spot.id] ? <div className={`text-sm font-bold ${cls[spot.id] === 'defect' ? 'text-hot' : 'text-ok'}`}>{cls[spot.id] === 'defect' ? s('दर्ज: ख़राबी', 'Logged: defect') : s('दर्ज: ठीक', 'Logged: OK')}</div>
                  : <div className="flex gap-2"><button className="btn !border-ok/60" onClick={() => classify('ok')} data-testid="mark-ok">{s('ठीक है', 'OK')}</button><button className="btn !border-hot/60" onClick={() => classify('defect')} data-testid="mark-defect">{s('ख़राबी', 'Defect')}</button></div>}</div>
            ) : <p className="text-sm text-mute">{s('किसी बिंदु (?) को दबाएँ।', 'Tap a point (?) to inspect it.')}</p>}
          </div>
          <p className="text-sm text-mute">{s('जाँचे गए', 'Inspected')}: <span className="readout text-cool">{found}/{SPOTS.length}</span></p>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="kit">
          <div className="rounded-md border border-line bg-panel p-3 text-sm"><b>{s('जॉब कार्ड:', 'Job card:')}</b> {s('6-सिलेंडर, 5.9 L टर्बो डीज़ल; तेल CK-4 15W-40; सम्प 13 L; कठोर परिस्थिति सर्विस।', '6-cylinder 5.9 L turbo diesel; oil CK-4 15W-40; sump 13 L; severe-duty service.')}</div>
          {PARTS.map((p, i) => (
            <button key={i} aria-pressed={kit.includes(i)} data-part={i} onClick={() => setKit((k) => (k.includes(i) ? k.filter((v) => v !== i) : [...k, i]))}
              className={`text-left rounded-md border px-3 py-2.5 text-sm flex gap-3 items-center ${kit.includes(i) ? 'border-cool bg-cool/10' : 'border-line bg-panel hover:border-cool/60'}`}>
              <span className={`w-5 h-5 rounded border-2 shrink-0 ${kit.includes(i) ? 'bg-cool border-cool' : 'border-mute'}`} />{L(p.t)}</button>
          ))}
          <div><button className="btn btn-cool" onClick={confirmKit} disabled={kitOk} data-testid="kit-confirm">{s('किट की पुष्टि करें', 'Confirm kit')}</button></div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="schedule">
          {Q.map((q, qi) => (
            <div key={qi} className="rounded-md border border-line bg-panel p-3"><p className="text-sm font-semibold mb-2">{L(q.q)}</p>
              <div className="flex flex-wrap gap-2">{q.o.map((o, oi) => <button key={oi} className={`btn !min-h-0 !py-1.5 ${qa[qi] === oi ? '!bg-ok !text-bg' : ''}`} data-q={qi} data-o={oi} disabled={qa[qi] === Q[qi].a} onClick={() => answer(qi, oi)}>{o}</button>)}</div></div>
          ))}
        </div>
      )}
    </SimFrame>
  );
}
