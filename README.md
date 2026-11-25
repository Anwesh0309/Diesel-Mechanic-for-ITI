# Diesel Mechanic Skill Lab

A standalone, bilingual (Hindi default / English) interactive training app for diesel mechanics.
It has its own dependencies, configuration and assets and shares no code with any other project.

## Run

```bash
npm install
npm run dev        # http://localhost:5175
npm run build      # type-check + production build into dist/
npm run preview    # serves dist/ on http://localhost:4175
```

Node 18+ is required. The `dist/` folder can be hosted on any static server (it uses hash routing).

## Curriculum — 10 job cards in two parts

**Part 1 — Engine and air/fuel**
1. Diesel Engine Fundamentals — compression-ignition simulator
2. Engine Components — cylinder-head torque-sequence bench
3. Four-Stroke Cycle — 4-cylinder firing-order bench
4. Fuel Injection & Common Rail — rail tuner, injection events, depressurise procedure
5. Air Intake & Turbocharging — boost, wastegate, intercooler, leak hunt

**Part 2 — Support systems and workshop**
6. Cooling & Lubrication — thermostat model, overheating drill, oil path
7. Maintenance — service-bay triage, parts kit, schedule
8. Electrical & Starting — virtual multimeter diagnostics
9. Diagnostics & Troubleshooting — symptom-to-cause case bay
10. Workshop Tools, Safety & Best Practices — hazard hunt, PPE, fire-extinguisher (PASS)

## Seven stages per job card

Watch · Read · Practice · Simulate · Quiz · Apply · Review (150 XP per card, 1500 XP in total).
Progress, language and theme are saved in the browser (`localStorage`, key `diesel-skill-lab:v1`).

## Notes

- Simulations are simplified teaching models. Typical values shown are for learning only;
  always follow the engine manufacturer's service manual and workshop safety rules.
- Fonts (Barlow, Noto Sans Devanagari, JetBrains Mono) load from Google Fonts when online;
  system fonts are used as a fallback offline.

## Structure

```
src/
  data/          bilingual content, one file per job card (unit01 … unit10)
  pages/         Home, Part, Unit, Progress + the seven stage pages
  simulations/   Sim01 … Sim10 (one interactive simulator per job card)
  components/    icons, art (logo, engine cutaway), scenes (Watch animations), simkit, layout, ui
  store/         persisted progress store
  translations/  UI strings (hi / en)
```
