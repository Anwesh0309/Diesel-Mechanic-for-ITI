import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import type { Unit } from '@/data/types';
import { useT } from '@/translations';

const SIMS: Record<number, ComponentType> = {
  1: lazy(() => import('@/simulations/Sim01Ignition')),
  2: lazy(() => import('@/simulations/Sim02HeadTorque')),
  3: lazy(() => import('@/simulations/Sim03FiringOrder')),
  4: lazy(() => import('@/simulations/Sim04CommonRail')),
  5: lazy(() => import('@/simulations/Sim05Turbo')),
  6: lazy(() => import('@/simulations/Sim06Cooling')),
  7: lazy(() => import('@/simulations/Sim07ServiceBay')),
  8: lazy(() => import('@/simulations/Sim08Multimeter')),
  9: lazy(() => import('@/simulations/Sim09Diagnosis')),
  10: lazy(() => import('@/simulations/Sim10Hazards')),
};

export default function Simulate({ unit }: { unit: Unit }) {
  const { t } = useT();
  const Sim = SIMS[unit.id];
  return (
    <div className="grid gap-3 stage-in" data-testid="stage-simulate">
      <p className="text-sm text-mute max-w-2xl">{t.unit.simHelp}</p>
      <Suspense fallback={<div className="panel p-8 text-center text-mute">{t.sim.loading}</div>}>
        {/* key resets the simulation when the unit changes */}
        <Sim key={unit.id} />
      </Suspense>
    </div>
  );
}
