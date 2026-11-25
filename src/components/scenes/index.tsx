import { BlockDiagram } from './BlockDiagram';
import { BLOCKS } from './blockData';
import { Scene01 } from './Scene01';
import { Scene02 } from './Scene02';
import { Scene03 } from './Scene03';
import { Scene10 } from './Scene10';

/** Watch-stage animation for a unit: custom SVG scenes for 1, 2, 3, 10; data-driven block diagrams for the rest. */
export function Scene({ unit, step }: { unit: number; step: number }) {
  if (unit === 1) return <Scene01 step={step} />;
  if (unit === 2) return <Scene02 step={step} />;
  if (unit === 3) return <Scene03 step={step} />;
  if (unit === 10) return <Scene10 step={step} />;
  const def = BLOCKS[unit];
  return def ? <BlockDiagram def={def} step={step} /> : null;
}
