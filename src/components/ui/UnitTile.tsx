import { Link } from 'react-router-dom';
import type { Unit } from '@/data/types';
import { STAGES } from '@/data/types';
import { useT } from '@/translations';
import { isDone, useProgress } from '@/store/progress';
import { DieselIcon } from '@/components/icons';
import { Chip } from './kit';

/** Job-card tile: icon, title, 7 stage dots, status. */
export function UnitTile({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const n = STAGES.filter((s) => isDone(p, unit.id, s)).length;
  const status = n === 0 ? 'new' : n === STAGES.length ? 'done' : 'going';
  return (
    <Link to={`/unit/${unit.id}`} data-unit={unit.id} className="panel group p-4 flex flex-col gap-3 transition hover:!border-cool/70 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-cool/15 text-cool grid place-items-center shrink-0 group-hover:bg-cool group-hover:text-bg transition"><DieselIcon name={unit.icon} size={28} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2"><span className="kicker !text-mute">{t.home.jobCard} {String(unit.id).padStart(2, '0')}</span>
            <Chip tone={status === 'done' ? 'ok' : status === 'going' ? 'amber' : 'mute'}>{t.home.status[status]}</Chip></div>
          <h4 className="font-bold text-lg leading-tight mt-0.5">{L(unit.title)}</h4>
        </div>
      </div>
      <p className="text-sm text-mute leading-snug">{L(unit.tagline)}</p>
      <div className="flex gap-1 mt-auto" aria-label={`${n}/7`}>
        {STAGES.map((s) => <span key={s} title={t.stages[s].n} className={`h-1.5 flex-1 rounded-full ${isDone(p, unit.id, s) ? 'bg-ok' : 'bg-line'}`} />)}
      </div>
    </Link>
  );
}
