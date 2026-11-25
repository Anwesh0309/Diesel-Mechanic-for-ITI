import type { Unit } from './types';
import { bi } from './types';
import { unit01 } from './unit01';
import { unit02 } from './unit02';
import { unit03 } from './unit03';
import { unit04 } from './unit04';
import { unit05 } from './unit05';
import { unit06 } from './unit06';
import { unit07 } from './unit07';
import { unit08 } from './unit08';
import { unit09 } from './unit09';
import { unit10 } from './unit10';

export const UNITS: Unit[] = [unit01, unit02, unit03, unit04, unit05, unit06, unit07, unit08, unit09, unit10];
export const getUnit = (id: number) => UNITS.find((u) => u.id === id);
export const unitsOfPart = (p: 1 | 2) => UNITS.filter((u) => u.part === p);

export const PARTS = {
  1: { title: bi('भाग 1 — इंजन की बनावट व संचालन', 'Part 1 — Engine Build and Operation') },
  2: { title: bi('भाग 2 — सपोर्ट सिस्टम, सर्विस व सुरक्षा', 'Part 2 — Support Systems, Service and Safety') },
} as const;
