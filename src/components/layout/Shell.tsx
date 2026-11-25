import { useEffect, type ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Ui } from '@/components/icons';
import { Logo } from '@/components/art/Logo';
import { actions, useProgress } from '@/store/progress';
import { useT } from '@/translations';
import { playClick } from '@/lib/sound';

export function Shell({ children }: { children: ReactNode }) {
  const p = useProgress();
  const { t } = useT();
  const { pathname } = useLocation();

  useEffect(() => { document.documentElement.dataset.theme = p.theme; }, [p.theme]);
  useEffect(() => { document.documentElement.lang = p.lang; document.title = p.lang === 'hi' ? 'डीज़ल मैकेनिक स्किल लैब' : 'Diesel Mechanic Skill Lab'; }, [p.lang]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  // Global click sound — fires for every button/link/[role=button] click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest('button, a, [role="button"], input[type="range"], select');
      if (interactive) playClick();
    };
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, []);

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-semibold transition ${isActive ? 'bg-cool/15 text-cool' : 'text-mute hover:text-ink hover:bg-panel2'}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto max-w-6xl h-14 px-3 sm:px-5 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5 mr-2 min-w-0" aria-label={t.appName}>
            <Logo size={34} />
            <span className="font-head font-bold text-lg leading-none truncate hidden xs:block sm:block">{t.appName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="primary">
            <NavLink to="/" end className={link}>{t.nav.home}</NavLink>
            <NavLink to="/part/1" className={link}>{t.part[1].name}</NavLink>
            <NavLink to="/part/2" className={link}>{t.part[2].name}</NavLink>
            <NavLink to="/progress" className={link}>{t.nav.progress}</NavLink>
          </nav>
          <div className="flex-1" />
          <span className="chip bg-amber/15 text-amber hidden sm:inline-flex" data-testid="xp">{p.xp} {t.home.xp}</span>
          <div className="inline-flex rounded-md border border-line overflow-hidden text-xs font-bold" role="group" aria-label={t.nav.language}>
            {(['hi', 'en'] as const).map((l) => (
              <button key={l} data-lang={l} aria-pressed={p.lang === l} onClick={() => actions.setLang(l)}
                className={`px-3 py-2 ${p.lang === l ? 'bg-cool text-bg' : 'bg-panel text-mute hover:text-ink'}`}>{l === 'hi' ? 'हिं' : 'EN'}</button>
            ))}
          </div>
          <button className="btn !px-2.5" data-testid="theme-toggle" onClick={actions.toggleTheme} aria-label={t.nav.theme}>
            <Ui name={p.theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-5 py-5 sm:py-8 pb-28 md:pb-10">{children}</main>

      <footer className="hidden md:block border-t border-line">
        <div className="hazard h-1.5" />
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-mute font-semibold tracking-wide">{t.footer}</p>
      </footer>

      {/* mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-panel/95 backdrop-blur grid grid-cols-4" aria-label="mobile">
        {([['/', 'home', t.nav.home], ['/part/1', 'engine', t.part[1].name], ['/part/2', 'tools', t.part[2].name], ['/progress', 'bars', t.nav.progress]] as const).map(([to, ic, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold ${isActive ? 'text-cool' : 'text-mute'}`}>
            <Ui name={ic === 'engine' ? 'cpu' : (ic as 'home' | 'tools' | 'bars')} size={20} />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
