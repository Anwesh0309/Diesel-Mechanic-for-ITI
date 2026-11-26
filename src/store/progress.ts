import { useSyncExternalStore } from 'react';
import type { Lang } from '@/data/types';

export interface Attempt { unit: number; kind: 'sim' | 'quiz'; score: number; at: number }
export interface ProgressState {
  lang: Lang;
  theme: 'dark' | 'light';
  done: Record<string, true>;          // `${unit}:${stage}`
  ticks: Record<string, true>;         // practice tick boxes `${unit}:${index}`
  applied: Record<string, number>;     // `${unit}:${caseIndex}` -> chosen option
  simBest: Record<number, number>;
  quizBest: Record<number, number>;
  xp: number;
  attempts: Attempt[];
}

const KEY = 'diesel-skill-lab:v1';
const MANUAL_LANG_KEY = 'diesel-skill-lab:manual-lang';

/**
 * Whenever the user starts the module, it starts with Hindi language ('hi').
 * It only switches to English ('en') when the user manually toggles it in the UI.
 * The manual choice is remembered within the active session so refreshing preserves
 * the choice, but fresh starts always begin in Hindi.
 */
function getInitialLang(): Lang {
  try {
    const manual = sessionStorage.getItem(MANUAL_LANG_KEY);
    if (manual === 'en' || manual === 'hi') return manual;
  } catch { /* ignore */ }
  return 'hi';
}

const fresh = (): ProgressState => ({ lang: getInitialLang(), theme: 'dark', done: {}, ticks: {}, applied: {}, simBest: {}, quizBest: {}, xp: 0, attempts: [] });

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...fresh(), ...parsed, lang: getInitialLang() };
    }
  } catch { /* ignore */ }
  return fresh();
}

let state: ProgressState = load();
const listeners = new Set<() => void>();
const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } listeners.forEach((l) => l()); };
const set = (patch: Partial<ProgressState>) => { state = { ...state, ...patch }; emit(); };

export const getState = () => state;
export function useProgress(): ProgressState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state, () => state);
}

export const actions = {
  setLang: (lang: Lang) => {
    try { sessionStorage.setItem(MANUAL_LANG_KEY, lang); } catch { /* ignore */ }
    set({ lang });
  },
  toggleTheme: () => set({ theme: state.theme === 'dark' ? 'light' : 'dark' }),
  /** marks a stage done once; returns true if it was new (awards XP) */
  completeStage(unit: number, stage: string, xp = 10) {
    const k = `${unit}:${stage}`;
    if (state.done[k]) return false;
    set({ done: { ...state.done, [k]: true }, xp: state.xp + xp });
    return true;
  },
  setTick(unit: number, idx: number, on: boolean) {
    const k = `${unit}:${idx}`; const t = { ...state.ticks };
    if (on) t[k] = true; else delete t[k];
    set({ ticks: t });
  },
  setApplied(unit: number, idx: number, choice: number) {
    set({ applied: { ...state.applied, [`${unit}:${idx}`]: choice } });
  },
  recordSim(unit: number, score: number) {
    set({ simBest: { ...state.simBest, [unit]: Math.max(state.simBest[unit] ?? 0, score) }, attempts: [...state.attempts, { unit, kind: 'sim', score, at: Date.now() }] });
  },
  recordQuiz(unit: number, score: number) {
    set({ quizBest: { ...state.quizBest, [unit]: Math.max(state.quizBest[unit] ?? 0, score) }, attempts: [...state.attempts, { unit, kind: 'quiz', score, at: Date.now() }] });
  },
  addXp: (n: number) => set({ xp: state.xp + n }),
  reset: () => {
    try { sessionStorage.removeItem(MANUAL_LANG_KEY); } catch { /* ignore */ }
    state = { ...fresh(), lang: 'hi', theme: state.theme };
    emit();
  },
};

export const isDone = (s: ProgressState, unit: number, stage: string) => !!s.done[`${unit}:${stage}`];
