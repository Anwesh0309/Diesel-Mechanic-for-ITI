import { Link, Navigate, useParams } from 'react-router-dom';
import { unitsOfPart } from '@/data';
import { useT } from '@/translations';
import { Ui } from '@/components/icons';
import { UnitTile } from '@/components/ui/UnitTile';

export default function PartPage() {
  const { n } = useParams();
  const { t, L } = useT();
  const part = n === '1' ? 1 : n === '2' ? 2 : null;
  if (!part) return <Navigate to="/" replace />;
  const units = unitsOfPart(part);
  const other = part === 1 ? 2 : 1;
  return (
    <div className="grid gap-6">
      <header className="panel panel-rivets p-5 sm:p-7 pt-8 bg-gradient-to-br from-panel to-panel2/60">
        <div className="kicker">{t.part[part].name}</div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight" data-testid="part-title">{t.part[part].title}</h1>
        <p className="mt-3 text-mute max-w-3xl leading-relaxed">{t.part[part].text}</p>
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{t.part.outcomes}</div>
          <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">
            {units.flatMap((u) => u.objectives.slice(0, 1).map((o, i) => <li key={`${u.id}-${i}`} className="flex gap-2"><Ui name="check" size={16} className="text-ok mt-0.5 shrink-0" />{L(o)}</li>))}
          </ul>
        </div>
      </header>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-mute mb-3">{units.length} {t.part.units}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{units.map((u) => <UnitTile key={u.id} unit={u} />)}</div>
      </div>
      <div className="flex justify-between">
        <Link to="/" className="btn"><Ui name="home" size={16} />{t.nav.home}</Link>
        <Link to={`/part/${other}`} className="btn btn-cool">{t.part[other].name}<Ui name="arrowR" size={16} /></Link>
      </div>
    </div>
  );
}
