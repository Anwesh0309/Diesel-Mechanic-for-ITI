import { bi } from '@/data/types';
import type { BDef } from './BlockDiagram';

const n = (id: string, x: number, y: number, hi: string, en: string, kind?: 'part' | 'ctrl' | 'end') => ({ id, x, y, label: bi(hi, en), kind });

export const BLOCKS: Record<number, BDef> = {
  4: {
    nodes: [
      n('tank', 8, 36, 'ईंधन टंकी', 'Fuel tank'), n('pre', 136, 36, 'प्री-फ़िल्टर / वाटर सेपरेटर', 'Pre-filter / water separator'),
      n('lift', 264, 36, 'लिफ़्ट पंप', 'Lift pump'), n('main', 392, 36, 'मुख्य फ़िल्टर', 'Main filter'), n('hp', 520, 36, 'हाई-प्रेशर पंप', 'High-pressure pump'),
      n('cyl', 264, 126, 'सिलेंडर', 'Cylinder', 'end'), n('inj', 392, 126, 'इंजेक्टर', 'Injector'), n('rail', 520, 126, 'कॉमन रेल', 'Common rail'),
      n('ecu', 392, 216, 'ECU', 'ECU', 'ctrl'), n('sens', 520, 216, 'रेल प्रेशर सेंसर', 'Rail pressure sensor', 'ctrl'),
    ],
    edges: [['tank', 'pre'], ['pre', 'lift'], ['lift', 'main'], ['main', 'hp'], ['hp', 'rail'], ['rail', 'inj'], ['inj', 'cyl'], ['rail', 'sens'], ['sens', 'ecu'], ['ecu', 'inj']],
    steps: [['tank', 'pre', 'lift', 'main'], ['main', 'hp', 'rail'], ['rail', 'sens', 'ecu'], ['rail', 'inj', 'cyl', 'ecu']],
  },
  5: {
    nodes: [
      n('filt', 8, 36, 'एयर फ़िल्टर', 'Air filter'), n('comp', 152, 36, 'कंप्रेसर', 'Compressor'), n('ic', 296, 36, 'इंटरकूलर', 'Intercooler'), n('man', 440, 36, 'इनटेक मैनिफ़ोल्ड', 'Intake manifold'),
      n('eng', 440, 126, 'इंजन', 'Engine', 'end'), n('exm', 296, 126, 'एक्ज़ॉस्ट मैनिफ़ोल्ड', 'Exhaust manifold'), n('turb', 152, 126, 'टरबाइन', 'Turbine'), n('out', 8, 126, 'एक्ज़ॉस्ट बाहर', 'Exhaust out', 'end'),
      n('wg', 152, 216, 'वेस्टगेट', 'Wastegate', 'ctrl'),
    ],
    edges: [['filt', 'comp'], ['comp', 'ic'], ['ic', 'man'], ['man', 'eng'], ['eng', 'exm'], ['exm', 'turb'], ['turb', 'out'], ['turb', 'comp'], ['exm', 'wg'], ['wg', 'out']],
    steps: [['filt', 'comp'], ['exm', 'turb', 'comp', 'eng'], ['comp', 'ic', 'man', 'eng'], ['exm', 'wg', 'out', 'turb']],
  },
  6: {
    nodes: [
      n('blk', 8, 20, 'इंजन ब्लॉक', 'Engine block'), n('head', 136, 20, 'सिलेंडर हेड', 'Cylinder head'), n('th', 264, 20, 'थर्मोस्टेट', 'Thermostat', 'ctrl'), n('pump', 8, 100, 'वॉटर पंप', 'Water pump'), n('rad', 392, 100, 'रेडिएटर', 'Radiator'),
      n('sump', 8, 190, 'सम्प', 'Sump'), n('opump', 136, 190, 'ऑयल पंप', 'Oil pump'), n('oflt', 264, 190, 'ऑयल फ़िल्टर', 'Oil filter'), n('gal', 392, 190, 'मेन गैलरी', 'Main gallery'), n('brg', 520, 190, 'बेयरिंग / टर्बो', 'Bearings / turbo', 'end'),
      n('rel', 520, 100, 'रिलीफ़ वाल्व', 'Relief valve', 'ctrl'),
    ],
    edges: [['pump', 'blk'], ['blk', 'head'], ['head', 'th'], ['th', 'rad'], ['rad', 'pump'], ['sump', 'opump'], ['opump', 'oflt'], ['oflt', 'gal'], ['gal', 'brg'], ['gal', 'rel']],
    steps: [['pump', 'blk', 'head'], ['head', 'th', 'rad', 'pump'], ['sump', 'opump', 'oflt', 'gal', 'brg'], ['gal', 'rel', 'oflt']],
  },
  7: {
    nodes: [
      n('plan', 8, 36, 'योजना / शेड्यूल', 'Plan / schedule'), n('insp', 176, 36, 'दैनिक जाँच', 'Daily inspection'), n('svc', 344, 36, 'आवधिक सर्विस', 'Periodic service'), n('parts', 512, 36, 'सही पार्ट', 'Correct parts'),
      n('next', 8, 136, 'अगली सर्विस तय', 'Next service due'), n('rec', 176, 136, 'जॉब कार्ड रिकॉर्ड', 'Job-card record'), n('test', 344, 136, 'टेस्ट / रोड-टेस्ट', 'Test / road test'), n('cust', 512, 136, 'ग्राहक को सौंपना', 'Hand over to customer', 'end'),
    ],
    edges: [['plan', 'insp'], ['insp', 'svc'], ['parts', 'svc'], ['svc', 'test'], ['test', 'rec'], ['rec', 'next'], ['next', 'plan'], ['test', 'cust']],
    steps: [['plan', 'next', 'rec'], ['plan', 'insp', 'svc'], ['insp', 'svc', 'parts', 'test'], ['test', 'rec', 'next', 'cust']],
  },
  8: {
    nodes: [
      n('bat', 8, 120, 'बैटरी', 'Battery'), n('key', 140, 30, 'चाबी स्विच', 'Key switch'), n('sol', 272, 30, 'सोलनॉइड', 'Solenoid'), n('st', 404, 30, 'स्टार्टर मोटर', 'Starter motor'), n('fly', 536, 30, 'फ़्लाईव्हील', 'Flywheel', 'end'),
      n('alt', 404, 120, 'अल्टरनेटर', 'Alternator'), n('reg', 272, 120, 'रेगुलेटर', 'Regulator', 'ctrl'),
      n('grel', 140, 210, 'ग्लो प्लग रिले', 'Glow-plug relay', 'ctrl'), n('plug', 272, 210, 'ग्लो प्लग', 'Glow plugs'),
    ],
    edges: [['bat', 'key'], ['key', 'sol'], ['sol', 'st'], ['st', 'fly'], ['alt', 'reg'], ['reg', 'bat'], ['bat', 'grel'], ['grel', 'plug']],
    steps: [['bat'], ['bat', 'key', 'sol', 'st', 'fly'], ['alt', 'reg', 'bat'], ['bat', 'grel', 'plug']],
  },
  9: {
    nodes: [
      n('sym', 8, 36, 'शिकायत / लक्षण', 'Complaint / symptom'), n('ver', 150, 36, 'लक्षण की पुष्टि', 'Verify symptom'), n('ins', 292, 36, 'दृश्य जाँच', 'Visual checks'), n('dtc', 434, 36, 'DTC / जानकारी', 'DTC / information'),
      n('lst', 434, 136, 'कारणों की सूची', 'List causes'), n('tst', 292, 136, 'परीक्षण करें', 'Run tests'), n('rep', 150, 136, 'मरम्मत', 'Repair'), n('rev', 8, 136, 'पुनः जाँच', 'Re-verify', 'end'),
    ],
    edges: [['sym', 'ver'], ['ver', 'ins'], ['ins', 'dtc'], ['dtc', 'lst'], ['lst', 'tst'], ['tst', 'rep'], ['rep', 'rev'], ['rev', 'sym']],
    steps: [['sym', 'ver'], ['ver', 'ins', 'dtc'], ['dtc', 'lst', 'tst'], ['tst', 'rep', 'rev', 'sym']],
  },
};
