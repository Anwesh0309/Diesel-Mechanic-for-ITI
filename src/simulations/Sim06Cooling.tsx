import { useRef, useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Seq } from '@/components/simkit/Seq';
import { Dial } from '@/components/ui/kit';
import { Trace } from '@/components/simkit/Trace';

const EMERG: Bi[] = [
  bi('इंजन के ठंडा होने तक रुकें; रेडिएटर कैप न छुएँ', 'Wait for the engine to cool; do not touch the radiator cap'),
  bi('सुरक्षित जगह रोकें व हैज़र्ड लाइट चालू करें', 'Pull over safely and switch on the hazard lights'),
  bi('कूलेंट स्तर जाँचें, रिसाव ढूँढें; फिर ही कूलेंट डालें', 'Check coolant level and look for leaks; only then top up'),
  bi('कुछ देर बिना लोड आइडल चलाएँ, फिर इंजन बंद करें', 'Idle briefly with no load, then switch the engine off'),
];
const OIL: Bi[] = [
  bi('ऑयल फ़िल्टर', 'Oil filter'), bi('सम्प (पिकअप स्ट्रेनर)', 'Sump (pick-up strainer)'), bi('क्रैंक बेयरिंग व टर्बो', 'Crank bearings and turbo'), bi('ऑयल पंप', 'Oil pump'), bi('मेन ऑयल गैलरी', 'Main oil gallery'),
];

/** Unit 6 — thermostat warm-up, hill-climb temperature control, overheating emergency, oil-path order. */
export default function Sim06Cooling() {
  const { s } = useT();
  const run = useRun(6, 15);
  const [phase, setPhase] = useState(0);
  const [T, setT] = useState(25);
  const [on, setOn] = useState(false);
  const [fan, setFan] = useState(false);
  const [hist, setHist] = useState<number[]>([]);
  const [hold, setHold] = useState(0);
  const [ok, setOk] = useState([false, false, false, false]);
  const r = useRef({ T: 25, hold: 0, acc: 0, over: false });

  const load = phase === 0 ? 30 : 90;
  const f = Math.max(0, Math.min(1, (T - 82) / 8));

  useTicker(on && phase < 2, (dt) => {
    const x = r.current; const sim = dt * 4;
    const fr = Math.max(0, Math.min(1, (x.T - 82) / 8));
    const gain = 1.4 + 3.2 * (load / 100);
    const loss = (0.012 + (0.045 + (fan ? 0.03 : 0)) * fr) * (x.T - 25);
    x.T = Math.max(25, x.T + (gain - loss) * sim);
    if (phase === 1 && !ok[1]) {
      const good = x.T >= 82 && x.T <= 98; x.hold = good ? x.hold + dt : 0;
      if (x.T > 106 && !x.over) { x.over = true; run.miss(bi('ओवरहीटिंग! पंखा चालू करें — तापमान 106 °C पार।', 'Overheating! Switch the fan on — temperature past 106 °C.')); }
      if (x.T < 100) x.over = false;
      if (x.hold >= 8) { setOk((o) => [o[0], true, o[2], o[3]]); run.add(4, bi('चढ़ाई में तापमान 82–98 °C में स्थिर रहा।', 'Temperature stayed within 82–98 °C on the climb.')); }
    }
    x.acc += dt; if (x.acc > 0.25) { x.acc = 0; setHist((h) => [...h.slice(-59), x.T]); }
    setT(x.T); setHold(x.hold);
  });

  const record = () => {
    if (ok[0]) return;
    if (!on) { run.say('info', bi('पहले इंजन चालू करें।', 'Start the engine first.')); return; }
    if (f <= 0) { run.say('info', bi('थर्मोस्टेट अभी बंद है — तब रिकॉर्ड करें जब बहाव रेडिएटर की ओर चले।', 'Thermostat still shut — record once flow switches to the radiator.')); return; }
    setOk((o) => [true, o[1], o[2], o[3]]); run.add(3, bi(`थर्मोस्टेट लगभग 82 °C पर खुलना शुरू हुआ — आपने ${Math.round(T)} °C दर्ज किया।`, `The thermostat starts opening near 82 °C — you recorded ${Math.round(T)} °C.`));
  };
  const next = () => {
    const n = phase + 1; setPhase(n);
    if (n === 1) { r.current = { T: 88, hold: 0, acc: 0, over: false }; setT(88); setHist([]); setFan(false); setOn(true); run.say('info', bi('चढ़ाई शुरू — लोड 90%। तापमान 82–98 °C रखें।', 'Hill climb — load 90%. Keep temperature at 82–98 °C.')); }
    if (n === 2) { setOn(false); setT(112); setFan(false); }
  };
  const phases = [bi('गर्म होना व थर्मोस्टेट', 'Warm-up and thermostat'), bi('चढ़ाई पर तापमान', 'Temperature on a climb'), bi('ओवरहीटिंग आपात', 'Overheating emergency'), bi('तेल का मार्ग', 'Oil path')];
  const canNext = ok[phase];
  const hints = [bi("'स्टार्ट' दबाएँ, तापमान ~82 °C पहुँचने पर बहाव रेडिएटर की ओर मुड़ेगा — तब 'दर्ज करें' दबाएँ।", "Press Start; at about 82 °C the flow turns to the radiator — then press Record."),
    bi('पंखा चालू करें; खुले थर्मोस्टेट के साथ पंखा रेडिएटर की ठंडक बढ़ाता है।', 'Switch the fan on; with the thermostat open the fan adds radiator cooling.'),
    bi('पहले सुरक्षित रोकें, फिर बिना लोड आइडल, फिर इंतज़ार, फिर जाँच।', 'Stop safely, idle unloaded, wait, then check.'),
    bi('सम्प → पंप → फ़िल्टर → गैलरी → बेयरिंग।', 'Sump → pump → filter → gallery → bearings.')];
  const reset = () => { run.reset(); setPhase(0); setT(25); setOn(false); setFan(false); setHist([]); setHold(0); setOk([false, false, false, false]); r.current = { T: 25, hold: 0, acc: 0, over: false }; };

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={next} getHint={() => hints[phase]} onReset={reset}
      title={bi('कूलिंग व लुब्रिकेशन बेंच', 'Cooling and lubrication bench')}
      intro={bi('इंजन गर्म करें, थर्मोस्टेट का खुलना देखें, चढ़ाई में तापमान संभालें और आपात स्थिति व तेल-मार्ग का सही क्रम चुनें।', 'Warm the engine, watch the thermostat open, hold temperature on a climb, then choose the right order for an emergency and the oil path.')}>
      <div className="grid gap-4">
        {phase < 2 && (
          <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
            <div className="flex flex-col items-center gap-2">
              <Dial value={T} min={0} max={130} label={s('कूलेंट तापमान', 'Coolant temp')} unit="°C" size={170} zones={[{ from: 82, to: 98, tone: 'ok' }, { from: 98, to: 106, tone: 'amber' }, { from: 106, to: 130, tone: 'hot' }]} />
              <div className="w-full max-w-[220px]"><Trace data={hist} min={20} max={125} band={[82, 98]} label="temperature trace" /></div>
            </div>
            <div className="grid gap-3">
              <svg viewBox="0 0 440 160" className="w-full h-auto rounded-lg overflow-hidden border border-line bg-panel" role="img" aria-label="coolant flow" data-testid="coolant-flow" data-open={f > 0 ? '1' : '0'}>
                {/* Engine Water Jacket Block */}
                <rect x="18" y="26" width="134" height="96" rx="8" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
                <rect x="26" y="34" width="118" height="80" rx="4" fill="rgb(var(--bg))" />
                {/* Cylinder liners */}
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={36 + k * 38} y="42" width="28" height="64" rx="2" fill="rgb(var(--panel))" stroke="rgb(var(--line))" />
                ))}
                <text x="85" y="80" textAnchor="middle" fontSize="11" fontWeight="800" fill="rgb(var(--cool))">{s('इंजन ब्लॉक', 'ENGINE')}</text>

                {/* Thermostat Housing & Valve */}
                <rect x="176" y="58" width="36" height="34" rx="6" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
                <circle cx="194" cy="75" r="13" fill={f > 0 ? 'rgb(var(--ok) / .3)' : 'rgb(var(--hot) / .3)'} stroke="rgb(var(--ink))" strokeWidth="1.5" />
                <path d={`M${194 - 8 + f * 10} 69 v12`} stroke={f > 0 ? 'rgb(var(--ok))' : 'rgb(var(--hot))'} strokeWidth="3" strokeLinecap="round" />
                <text x="194" y="104" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgb(var(--mute))">{s('थर्मोस्टेट', 'Thermostat')}</text>

                {/* Radiator Assembly */}
                <rect x="315" y="24" width="95" height="100" rx="6" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
                <rect x="323" y="32" width="79" height="84" rx="4" fill="rgb(var(--bg))" />
                {/* Radiator cooling tubes */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line key={i} x1="327" x2="397" y1={38 + i * 12} y2={38 + i * 12} stroke="rgb(var(--cool))" strokeWidth="2" opacity={0.25 + f * 0.75} />
                ))}
                <text x="362" y="20" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="rgb(var(--ink))">{s('रेडिएटर', 'Radiator')}</text>

                {/* Flow lines */}
                {/* Engine head to thermostat */}
                <line x1="144" y1="75" x2="176" y2="75" stroke={T > 80 ? 'rgb(var(--hot))' : 'rgb(var(--cool))'} strokeWidth="6" strokeLinecap="round" />
                {/* Thermostat to Radiator top */}
                <line x1="212" y1="75" x2="315" y2="75" stroke="rgb(var(--hot))" strokeWidth="6" strokeDasharray="8 6" className={f > 0 ? 'animate-flow' : ''} opacity={f > 0 ? 1 : 0.2} strokeLinecap="round" />
                {/* Bypass Pipe (Thermostat down back to Engine inlet) */}
                <path d="M194 58 V 16 H85 V 26" fill="none" stroke="rgb(var(--amber))" strokeWidth="4.5" strokeDasharray="6 5" className={on ? 'animate-flow' : ''} opacity={f < 0.9 ? 1 : 0.25} />
                <text x="140" y="13" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgb(var(--amber))">{s('बाईपास', 'BYPASS')}</text>
                {/* Cold Return (Radiator bottom to Engine water pump) */}
                <path d="M362 124 V 144 H 85 V 122" fill="none" stroke="rgb(var(--cool))" strokeWidth="5" strokeDasharray="8 6" className={f > 0 ? 'animate-flow' : ''} opacity={f > 0 ? 1 : 0.25} />

                {/* Radiator Cooling Fan */}
                <g transform="translate(416, 74)">
                  <circle r="16" fill="rgb(var(--panel))" stroke={fan ? 'rgb(var(--cool))' : 'rgb(var(--mute))'} strokeWidth="2" />
                  <g className={fan ? 'animate-spin' : ''} style={{ transformOrigin: '0px 0px' }}>
                    {[0, 90, 180, 270].map((deg) => (
                      <line key={deg} x1="0" y1="0" x2="0" y2="-12" transform={`rotate(${deg})`} stroke={fan ? 'rgb(var(--cool))' : 'rgb(var(--mute))'} strokeWidth="4" strokeLinecap="round" />
                    ))}
                  </g>
                  {fan && <text x="18" y="4" fontSize="12" fontWeight="bold" fill="rgb(var(--cool))">AIR</text>}
                </g>
              </svg>
              <div className="flex flex-wrap items-center gap-2">
                {phase === 0 && <>
                  <button className="btn btn-cool" onClick={() => setOn(!on)} data-testid="engine-toggle">{on ? s('रोकें', 'Pause') : s('इंजन चालू', 'Start engine')}</button>
                  <button className="btn" onClick={record} data-testid="record">{s('खुलने का तापमान दर्ज करें', 'Record opening temperature')}</button>
                </>}
                {phase === 1 && <button className={`btn ${fan ? '!border-cool !text-cool' : ''}`} aria-pressed={fan} onClick={() => setFan(!fan)} data-testid="fan">{s('पंखा', 'Fan')}: {fan ? 'ON' : 'OFF'}</button>}
                <span className="chip bg-panel text-ink">{s('लोड', 'Load')} <span className="readout ml-1">{load}%</span></span>
                <span className="chip bg-panel text-ink">{s('थर्मोस्टेट', 'Thermostat')}: <span className="readout ml-1" data-testid="th-state">{f <= 0 ? s('बंद', 'closed') : f < 1 ? s('खुल रहा', 'opening') : s('पूरा खुला', 'open')}</span></span>
                {phase === 1 && <span className="chip bg-panel text-ink">{s('स्थिरता', 'Hold')} <span className="readout ml-1">{hold.toFixed(1)}/8 s</span></span>}
              </div>
            </div>
          </div>
        )}
        {phase === 2 && (
          <div className="grid gap-2" data-testid="emergency">
            <div className="rounded-md border border-hot/60 bg-hot/10 px-3 py-2 text-sm font-bold text-hot">{s('तापमान 112 °C — बोनट से भाप निकल रही है!', 'Temperature 112 °C — steam coming from the bonnet!')}</div>
            <p className="text-sm font-semibold">{s('सही क्रम में कदम चुनें:', 'Pick the steps in the right order:')}</p>
            <Seq items={EMERG} correct={[1, 3, 0, 2]} locked={ok[2]} onWrong={() => run.miss(bi('यह कदम अभी नहीं — गर्म सिस्टम का कैप कभी न खोलें।', 'Not this step yet — never open the cap on a hot system.'))}
              onDone={() => { setOk((o) => [o[0], o[1], true, o[3]]); run.add(4, bi('सही — ठंडा होने के बाद ही जाँच करें; भाप से गंभीर जलन हो सकती है।', 'Correct — check only after cooling; steam can cause severe burns.')); }} />
          </div>
        )}
        {phase === 3 && (
          <div className="grid gap-2" data-testid="oilpath">
            <p className="text-sm font-semibold">{s('तेल के बहाव का क्रम चुनें (सम्प से शुरू करके):', 'Tap the oil flow order (starting at the sump):')}</p>
            <Seq items={OIL} correct={[1, 3, 0, 4, 2]} locked={ok[3]} onWrong={() => run.miss(bi('तेल इस क्रम में नहीं बहता — पंप फ़िल्टर से पहले आता है।', 'Oil does not flow in that order — the pump comes before the filter.'))}
              onDone={() => { setOk((o) => [o[0], o[1], o[2], true]); run.add(4, bi('सही — सम्प → पंप → फ़िल्टर → गैलरी → बेयरिंग/टर्बो।', 'Correct — sump → pump → filter → gallery → bearings/turbo.')); }} />
          </div>
        )}
      </div>
    </SimFrame>
  );
}
