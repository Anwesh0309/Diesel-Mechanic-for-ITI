import { Link, useNavigate } from 'react-router-dom';
import { STAGES } from '@/data/types';
import { UNITS, unitsOfPart } from '@/data';
import { useT } from '@/translations';
import { isDone, useProgress } from '@/store/progress';
import { DieselIcon, STAGE_ICON, Ui } from '@/components/icons';
import { Ring } from '@/components/ui/kit';
import { EngineCutaway } from '@/components/art/EngineCutaway';
import { UnitTile } from '@/components/ui/UnitTile';

export default function Home() {
  const { t, L } = useT();
  const p = useProgress();
  const nav = useNavigate();
  const unitPct = (id: number) => STAGES.filter((s) => isDone(p, id, s)).length / STAGES.length;
  const overall = Math.round((UNITS.reduce((a, u) => a + unitPct(u.id), 0) / UNITS.length) * 100);
  const doneIds = UNITS.filter((u) => unitPct(u.id) === 1).map((u) => u.id);
  const resume = UNITS.find((u) => unitPct(u.id) < 1) ?? UNITS[0];
  const started = overall > 0;
  const stageNow = STAGES.find((s) => !isDone(p, resume.id, s)) ?? 'watch';

  return (
    <div className="grid gap-10">
      <section className="grid lg:grid-cols-[1fr_1.15fr] gap-6 items-center">
        <div className="stage-in">
          <div className="kicker mb-2">{t.home.kicker}</div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05]" data-testid="hero-title">{t.home.heroTitle}</h1>
          <p className="mt-4 text-[15px] sm:text-base text-mute max-w-xl leading-relaxed">{t.home.heroText}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={started ? `/unit/${resume.id}/${stageNow}` : '/unit/1'} className="btn btn-amber !px-5" data-testid="cta">
              <Ui name="play" size={16} />{started ? `${t.home.resume} · ${t.home.jobCard} ${String(resume.id).padStart(2, '0')}` : t.home.start}
            </Link>
            <Link to="/progress" className="btn">{t.nav.progress}</Link>
          </div>
          <div className="mt-6 flex items-center gap-4 panel p-3 max-w-md">
            <Ring value={overall} size={68} />
            <div className="text-sm"><div className="font-bold">{t.home.overall}</div>
              <div className="text-mute"><span className="readout text-cool">{doneIds.length}</span>/10 {t.home.unitsDone} · <span className="readout text-amber">{p.xp}</span> {t.home.xp}</div></div>
          </div>
        </div>
        <div className="panel panel-rivets p-2 sm:p-4 pt-5 bg-gradient-to-b from-panel to-panel2/60">
          <EngineCutaway doneIds={doneIds} onPick={(id) => nav(`/unit/${id}`)} />
          <p className="text-center text-xs text-mute mt-1">{t.home.explore}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.home.partsTitle}</h2>
        <div className="grid gap-8">
          {([1, 2] as const).map((n) => (
            <div key={n}>
              <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
                <div><div className="kicker">{t.part[n].name}</div><h3 className="text-xl sm:text-2xl font-bold">{t.part[n].title}</h3></div>
                <Link to={`/part/${n}`} className="btn !py-1.5" data-testid={`open-part-${n}`}>{t.home.openCard}<Ui name="arrowR" size={15} /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unitsOfPart(n).map((u) => <UnitTile key={u.id} unit={u} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t.home.stagesTitle}</h2>
        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STAGES.map((s, i) => (
            <li key={s} className="panel p-3">
              <div className="flex items-center gap-2 mb-1"><span className="w-8 h-8 rounded-md bg-cool/15 text-cool grid place-items-center"><Ui name={STAGE_ICON[s]} size={17} /></span><span className="readout text-xs text-mute">0{i + 1}</span></div>
              <div className="font-bold">{t.stages[s].n}</div><div className="text-xs text-mute leading-snug">{t.stages[s].d}</div>
            </li>
          ))}
        </ol>
      </section>
      <span className="hidden"><DieselIcon name="wrench" />{L(UNITS[0].title)}</span>
    </div>
  );
}
