import type { IconName } from '@/data/types';

interface P { size?: number; className?: string; stroke?: number }
const base = (size: number, stroke: number, className?: string) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className, 'aria-hidden': true,
});

/** Diesel-trade icon set (original line icons). */
export function DieselIcon({ name, size = 22, className, stroke = 1.8 }: P & { name: IconName }) {
  const p = base(size, stroke, className);
  switch (name) {
    case 'piston': return (<svg {...p}><rect x="6" y="3" width="12" height="9" rx="1.5" /><path d="M6 6h12M6 8.5h12" /><path d="M12 12v5" /><circle cx="12" cy="19" r="2.4" /></svg>);
    case 'engine': return (<svg {...p}><path d="M5 9h12v9H5z" /><path d="M8 9V6h6v3M9 4h4" /><path d="M17 12h3v3h-3M5 13H3" /><path d="M8 18v2M14 18v2" /></svg>);
    case 'cycle': return (<svg {...p}><path d="M20 12a8 8 0 0 1-14 5.3" /><path d="M4 12A8 8 0 0 1 18 6.7" /><path d="M18 3v4h-4M6 21v-4h4" /></svg>);
    case 'injector': return (<svg {...p}><path d="M10 2h4v5l-1 3h-2l-1-3z" /><path d="M11 10v5h2v-5" /><path d="M12 15v2M8.5 19.5l1.5-2M15.5 19.5l-1.5-2M12 22v-3" /></svg>);
    case 'turbo': return (<svg {...p}><path d="M19 12a7 7 0 1 1-7-7c3 0 5 2 5 4s-2 3-4 3" /><circle cx="12" cy="12" r="1.6" /><path d="M19 12h3M2 12h3" /></svg>);
    case 'coolant': return (<svg {...p}><path d="M9 3v11.2a3.5 3.5 0 1 0 4 0V3z" /><path d="M11 9v6" /><path d="M17 5c2 2.4 3 3.6 3 5a3 3 0 0 1-6 0c0-1.400 1-2.600 3-5z" /></svg>);
    case 'wrench': return (<svg {...p}><path d="M14.500 6.500a4 4 0 0 0 5 5L13 18a2.100 2.100 0 0 1-3-3z" /><path d="M10 14l-5.500 5.500" /><path d="M14.500 6.500l2.500-2.500" /></svg>);
    case 'battery': return (<svg {...p}><rect x="3" y="7" width="18" height="12" rx="1.500" /><path d="M7 7V5h3v2M14 7V5h3v2" /><path d="M7 13h3M8.500 11.500v3M14 13h3" /></svg>);
    case 'scan': return (<svg {...p}><rect x="3" y="4" width="18" height="12" rx="1.500" /><path d="M5 11h3l1.500-3 2 6 1.500-3H19" /><path d="M9 20h6M12 16v4" /></svg>);
    case 'helmet': return (<svg {...p}><path d="M4 16a8 8 0 0 1 16 0z" /><path d="M2.500 16h19v2h-19z" /><path d="M12 8v8M9 9.500V16M15 9.500V16" /></svg>);
    case 'gauge': return (<svg {...p}><path d="M4.500 17A8.500 8.500 0 1 1 19.500 17" /><path d="M12 13l4-4" /><circle cx="12" cy="13" r="1.200" /><path d="M7 17h10" /></svg>);
    case 'filter': return (<svg {...p}><rect x="6" y="5" width="12" height="15" rx="2" /><path d="M8 3h8v2H8z" /><path d="M9 9v7M12 9v7M15 9v7" /></svg>);
    case 'oil': return (<svg {...p}><path d="M12 3c3.500 4.200 5 6.600 5 9a5 5 0 0 1-10 0c0-2.400 1.500-4.800 5-9z" /><path d="M9.500 13.500a2.600 2.600 0 0 0 2.500 2" /></svg>);
    case 'bolt': return (<svg {...p}><path d="M12 2.500l7 4v8l-7 4-7-4v-8z" /><circle cx="12" cy="10.500" r="2.800" /><path d="M12 18.500V22" /></svg>);
  }
}

export type UiIcon = 'menu' | 'x' | 'check' | 'chevL' | 'chevR' | 'play' | 'pause' | 'sun' | 'moon' | 'home' | 'lock' | 'bulb' | 'reset' | 'alert' | 'arrowR' | 'list' | 'bars' | 'eye' | 'book' | 'tools' | 'cpu' | 'quiz' | 'flag' | 'doc' | 'trophy';

export function Ui({ name, size = 18, className, stroke = 2 }: P & { name: UiIcon }) {
  const p = base(size, stroke, className);
  switch (name) {
    case 'menu': return (<svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
    case 'x': return (<svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case 'check': return (<svg {...p}><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>);
    case 'chevL': return (<svg {...p}><path d="M15 5l-7 7 7 7" /></svg>);
    case 'chevR': return (<svg {...p}><path d="M9 5l7 7-7 7" /></svg>);
    case 'play': return (<svg {...p} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>);
    case 'pause': return (<svg {...p} fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>);
    case 'sun': return (<svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500L19 19M19 5l-1.500 1.500M6.500 17.500L5 19" /></svg>);
    case 'moon': return (<svg {...p}><path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z" /></svg>);
    case 'home': return (<svg {...p}><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" /></svg>);
    case 'lock': return (<svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
    case 'bulb': return (<svg {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.500 10.900c.700.600 1 1.300 1 2.100h5c0-.800.300-1.500 1-2.100A6 6 0 0 0 12 3z" /></svg>);
    case 'reset': return (<svg {...p}><path d="M4 12a8 8 0 1 0 3-6.200" /><path d="M4 4v4.500h4.500" /></svg>);
    case 'alert': return (<svg {...p}><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.01" /></svg>);
    case 'arrowR': return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    case 'list': return (<svg {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>);
    case 'bars': return (<svg {...p}><path d="M5 20V10M12 20V4M19 20v-7" /></svg>);
    case 'eye': return (<svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'book': return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M9 7h6" /></svg>);
    case 'tools': return (<svg {...p}><path d="M14 6a4 4 0 0 0 5 5L10 20a2 2 0 0 1-3-3z" /><path d="M4 4l5 5M7 3l-4 4 3 3 4-4z" /></svg>);
    case 'cpu': return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.500" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>);
    case 'quiz': return (<svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9.500a3 3 0 1 1 4 2.800c-.700.300-1 .900-1 1.700M12 17v.01" /></svg>);
    case 'flag': return (<svg {...p}><path d="M5 21V4M5 4h12l-2 4 2 4H5" /></svg>);
    case 'doc': return (<svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></svg>);
    case 'trophy': return (<svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4" /></svg>);
  }
}

export const STAGE_ICON: Record<string, UiIcon> = { watch: 'eye', read: 'book', practice: 'tools', simulate: 'cpu', quiz: 'quiz', apply: 'flag', review: 'doc' };
