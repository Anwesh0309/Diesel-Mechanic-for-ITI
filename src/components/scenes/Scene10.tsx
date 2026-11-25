import { useT } from '@/translations';

/** Unit 10 — workshop tools, PPE, hazards, 5S. */
export function Scene10({ step }: { step: number }) {
  const { s } = useT();
  const dim = (k: number) => (step === k ? 1 : 0.18);
  const tr = { transition: 'opacity .5s' };
  return (
    <svg viewBox="0 0 640 320" className="w-full h-auto" role="img" aria-label="workshop" data-testid="scene-10">
      {/* floor */}
      <rect x="0" y="262" width="640" height="58" fill="rgb(var(--panel))" /><rect x="0" y="262" width="640" height="5" fill="rgb(var(--amber))" opacity=".7" />
      {/* 0: tool board + measuring tools */}
      <g opacity={dim(0)} style={tr}>
        <rect x="30" y="30" width="250" height="150" rx="8" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${52 + i * 44},48)`}><rect x="0" y="0" width="12" height="96" rx="5" fill="rgb(var(--mute))" /><circle cx="6" cy="6" r={i % 2 ? 10 : 12} fill="none" stroke="rgb(var(--mute))" strokeWidth="6" /></g>)}
        <rect x="52" y="156" width="206" height="10" rx="3" fill="rgb(var(--cool))" /><rect x="52" y="156" width="40" height="22" rx="3" fill="rgb(var(--cool))" />
        <text x="155" y="205" textAnchor="middle" fontSize="13" fontWeight="700" fill="rgb(var(--cool))">{s('सही औज़ार, सही माप', 'Right tool, right size')}</text>
        <g transform="translate(300,60)"><rect width="160" height="14" rx="3" fill="rgb(var(--amber))" /><rect x="120" y="-18" width="40" height="50" rx="4" fill="rgb(var(--amber) / .6)" /><text x="80" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--amber))">{s('टॉर्क रेंच', 'Torque wrench')}</text></g>
        <g transform="translate(300,130)"><rect width="150" height="10" rx="2" fill="rgb(var(--ink))" /><rect x="0" y="-18" width="12" height="48" rx="2" fill="rgb(var(--ink))" /><rect x="30" y="-10" width="12" height="20" fill="rgb(var(--ink))" /><text x="75" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--ink))">{s('वर्नियर कैलिपर', 'Vernier caliper')}</text></g>
      </g>
      {/* 1: PPE worker */}
      <g opacity={dim(1)} style={tr}>
        <g transform="translate(500,40)">
          <rect x="-30" y="70" width="60" height="110" rx="8" fill="rgb(var(--cool) / .55)" />
          <rect x="-24" y="180" width="18" height="70" fill="rgb(var(--ink) / .7)" /><rect x="6" y="180" width="18" height="70" fill="rgb(var(--ink) / .7)" />
          <rect x="-28" y="246" width="26" height="14" rx="4" fill="rgb(var(--amber))" /><rect x="2" y="246" width="26" height="14" rx="4" fill="rgb(var(--amber))" />
          <circle cx="0" cy="45" r="24" fill="rgb(var(--mute) / .7)" />
          <path d="M-28 40a28 22 0 0 1 56 0z" fill="rgb(var(--amber))" /><rect x="-32" y="38" width="64" height="6" rx="3" fill="rgb(var(--amber))" />
          <rect x="-18" y="48" width="36" height="9" rx="4" fill="rgb(var(--bg))" stroke="rgb(var(--cool))" strokeWidth="2" />
          <circle cx="-28" cy="52" r="8" fill="rgb(var(--hot))" /><circle cx="28" cy="52" r="8" fill="rgb(var(--hot))" />
          <rect x="-48" y="120" width="18" height="18" rx="5" fill="rgb(var(--ok))" /><rect x="30" y="120" width="18" height="18" rx="5" fill="rgb(var(--ok))" />
        </g>
        {[[s('हेलमेट', 'Helmet'), 430, 58], [s('चश्मा', 'Eye'), 430, 100], [s('कान', 'Ear'), 560, 100], [s('दस्ताने', 'Gloves'), 420, 170], [s('शूज़', 'Shoes'), 570, 300]].map(([t, x, y], i) => (
          <text key={i} x={x as number} y={y as number} fontSize="12" fontWeight="700" fill="rgb(var(--cool))">{t as string}</text>
        ))}
      </g>
      {/* 2: hazards */}
      <g opacity={dim(2)} style={tr}>
        <ellipse cx="150" cy="288" rx="70" ry="10" fill="rgb(var(--amber) / .6)" />
        <rect x="320" y="200" width="150" height="40" rx="10" fill="rgb(var(--mute))" /><rect x="340" y="240" width="8" height="22" fill="rgb(var(--ink))" /><rect x="440" y="240" width="8" height="22" fill="rgb(var(--ink))" />
        <path d="M530 120l20 -40l20 40z" fill="rgb(var(--amber))" stroke="rgb(var(--ink))" strokeWidth="2" /><text x="550" y="115" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgb(var(--bg))">!</text>
        <path d="M130 150l16-30l16 30z" fill="rgb(var(--hot))" /><text x="146" y="147" textAnchor="middle" fontSize="14" fontWeight="700" fill="rgb(var(--bg))">!</text>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={420 + i * 6} y1="170" x2={430 + i * 12} y2={150 - (i % 2) * 14} stroke="rgb(var(--amber))" strokeWidth="2" />)}
        <text x="150" y="255" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--amber))">{s('फिसलन', 'Slip')}</text>
        <text x="395" y="275" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--hot))">{s('स्टैंड ज़रूरी', 'Stands needed')}</text>
      </g>
      {/* 3: 5S */}
      <g opacity={dim(3)} style={tr}>
        {['Sort', 'Set', 'Shine', 'Standardise', 'Sustain'].map((e, i) => {
          const hi = ['छाँटो', 'सजाओ', 'चमकाओ', 'मानक बनाओ', 'अनुशासन'][i];
          return (
            <g key={i} transform={`translate(${46 + i * 118},120)`}>
              <circle cx="40" cy="40" r="38" fill="rgb(var(--panel2))" stroke="rgb(var(--cool))" strokeWidth="3" />
              <text x="40" y="50" textAnchor="middle" fontSize="28" fontWeight="700" fill="rgb(var(--cool))" fontFamily="JetBrains Mono, monospace">{i + 1}S</text>
              <text x="40" y="100" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--ink))">{s(hi, e)}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
