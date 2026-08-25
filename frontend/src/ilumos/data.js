export const CASE_INFO = {
  id: 'case-us123456',
  title: 'US123456 vs Acme Thermostat',
  patent: 'US123456',
  accusedProduct: 'Acme Thermostat',
  analyst: 'Rohit',
  supervisor: 'Sarah',
};

export const AI_INSTRUCTIONS = [
  'Use only available source material.',
  'Distinguish direct evidence from inference.',
  'Never invent citations.',
  'Clearly state when evidence is insufficient.',
  'Do not silently modify analyst-authored reasoning.',
  'Surface important downstream effects of material reasoning changes.',
];

export const EVIDENCE = {
  guide8: {
    id: 'guide8', title: 'Acme Product Guide.pdf', docType: 'Product Documentation',
    page: 8, totalPages: 42, label: 'Acme Product Guide · p.8', evidenceType: 'Direct evidence',
    quote: 'WiFi-enabled smart thermostat connects to your home network.',
  },
  guide10: {
    id: 'guide10', title: 'Acme Product Guide.pdf', docType: 'Product Documentation',
    page: 10, totalPages: 42, label: 'Acme Product Guide · p.10', evidenceType: 'Direct evidence',
    quote: 'Use the schedule controls to set target temperatures throughout the day.',
  },
  guide14: {
    id: 'guide14', title: 'Acme Product Guide.pdf', docType: 'Product Documentation',
    page: 14, totalPages: 42, label: 'Acme Product Guide · p.14', evidenceType: 'Direct evidence',
    quote: 'Auto-Schedule learns your preferred temperatures over time.',
  },
  guide16: {
    id: 'guide16', title: 'Acme Product Guide.pdf', docType: 'Product Documentation',
    page: 16, totalPages: 42, label: 'Acme Product Guide · p.16', evidenceType: 'Direct evidence',
    quote: 'Auto-Schedule updates your heating and cooling schedule as your preferences change.',
  },
  guide22: {
    id: 'guide22', title: 'Acme Product Guide.pdf', docType: 'Product Documentation',
    page: 22, totalPages: 42, label: 'Acme Product Guide · p.22', evidenceType: 'Direct evidence',
    quote: 'You can manually adjust any scheduled setpoint at any time from the thermostat or app.',
  },
  arch6: {
    id: 'arch6', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 6, totalPages: 31, label: 'Acme Technical Architecture · p.6', evidenceType: 'Supporting evidence',
    quote: 'The temperature sensing module uses a high-precision thermistor for ambient readings.',
  },
  arch12: {
    id: 'arch12', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 12, totalPages: 31, label: 'Acme Technical Architecture · p.12', evidenceType: 'Direct evidence',
    quote: 'The occupancy module includes a PIR sensor and event classifier for in-home motion detection.',
  },
  arch18: {
    id: 'arch18', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 18, totalPages: 31, label: 'Acme Technical Architecture · p.18', evidenceType: 'Supporting evidence',
    quote: 'Preference history retains past temperature selections for use by scheduling behavior.',
  },
  arch20: {
    id: 'arch20', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 20, totalPages: 31, label: 'Acme Technical Architecture · p.20', evidenceType: 'Supporting evidence',
    quote: 'The prediction service outputs target temperatures derived from prior user interactions.',
  },
  arch27: {
    id: 'arch27', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 27, totalPages: 31, label: 'Acme Technical Architecture · p.27', evidenceType: 'Supporting evidence',
    quote: 'Adaptive temperature prediction uses historical user behavior.',
  },
  arch31: {
    id: 'arch31', title: 'Acme Technical Architecture.pdf', docType: 'Technical Documentation',
    page: 31, totalPages: 31, label: 'Acme Technical Architecture · p.31', evidenceType: 'Supporting evidence',
    quote: 'Adaptive scheduling rules update schedule behavior from historical inputs.',
  },
};

export const DEPENDENCIES = [
  {
    id: 'dep-e3-e7', from: 'e3', to: 'e7',
    sharedConcept: 'adaptive learning',
    sharedEvidence: ['arch27', 'arch31'],
    relationship: 'Potential relationship',
    reason:
      'Element 3 introduces a new interpretation of adaptive learning; Element 7 relies on the same concept under a different interpretation.',
  },
  {
    id: 'dep-e3-e9', from: 'e3', to: 'e9',
    sharedConcept: 'learning behavior',
    sharedEvidence: ['guide14', 'arch27'],
    relationship: 'Shared evidence chain',
    reason:
      'Element 9 uses learning behavior supported by the same evidence chain referenced by Element 3.',
  },
];

export const ELEMENTS = [
  {
    id: 'e1', num: 1, name: 'Wireless communication',
    claim: 'A temperature control device with a wireless communication module',
    mapping: 'Acme Thermostat WiFi connectivity',
    reasoning: 'WiFi-enabled smart thermostat connects to your home network.',
    evidenceIds: ['guide8'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Mapping is supported by direct product documentation.',
  },
  {
    id: 'e2', num: 2, name: 'Motion sensing',
    claim: 'A motion sensor for detecting occupancy',
    mapping: 'Built-in motion sensor',
    reasoning: 'Built-in motion sensor detects when people are home.',
    evidenceIds: ['arch6'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'The current citation describes the temperature sensing module, not occupancy detection. Source accuracy should be verified.',
  },
  {
    id: 'e3', num: 3, name: 'Learning algorithm',
    claim: 'Machine learning algorithm that learns user temperature preferences over time',
    mapping: 'Auto-Schedule',
    reasoning: 'Acme uses machine learning to learn user temperature preferences.',
    evidenceIds: [],
    status: 'needs_review', reasonTag: 'Evidence gap', version: 1, impactedBy: null,
    weakness: 'The reasoning asserts a machine learning implementation, but no available source explicitly discloses machine learning. This is an evidence gap, not a contradiction.',
  },
  {
    id: 'e4', num: 4, name: 'Temperature control',
    claim: 'A control interface configured to adjust target temperature',
    mapping: 'Thermostat schedule controls',
    reasoning: 'Schedule and setpoint controls are documented in the product guide.',
    evidenceIds: ['guide10'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Mapping is supported by direct product documentation.',
  },
  {
    id: 'e5', num: 5, name: 'Historical inputs',
    claim: 'A store of historical user temperature selections',
    mapping: 'Preference history',
    reasoning: 'Historical temperature selections are retained for scheduling behavior.',
    evidenceIds: ['arch18'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Retention of historical selections is described in the technical architecture.',
  },
  {
    id: 'e6', num: 6, name: 'Prediction output',
    claim: 'A prediction output derived from prior user interactions',
    mapping: 'Temperature prediction service',
    reasoning: 'Prediction output is described in the technical architecture.',
    evidenceIds: ['arch20'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Prediction output is described as derived from prior interactions.',
  },
  {
    id: 'e7', num: 7, name: 'Adaptive learning',
    claim: 'An adaptive learning mechanism that modifies scheduling behavior based on historical user inputs',
    mapping: 'Acme Auto-Schedule rule-based adaptation',
    reasoning: "The product's adaptive scheduling behavior can satisfy this limitation without requiring explicit disclosure of a trained model.",
    evidenceIds: ['arch27', 'arch31'],
    status: 'review', reasonTag: 'Review dependency', version: 1, impactedBy: null,
    weakness: 'Element 7 relies on an interpretation of adaptive learning that overlaps with Element 3. A change to Element 3 reasoning may affect this position.',
  },
  {
    id: 'e8', num: 8, name: 'Schedule update',
    claim: 'A scheduling instruction updated in response to learned preferences',
    mapping: 'Auto-Schedule updates',
    reasoning: 'Auto-Schedule updates are described as responding to learned preferences.',
    evidenceIds: ['guide16'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Schedule updates are described in the product guide.',
  },
  {
    id: 'e9', num: 9, name: 'Learning process',
    claim: 'A learning process operating over repeated user interactions',
    mapping: 'Acme preference history',
    reasoning: 'Repeated user interactions are used to refine scheduling behavior.',
    evidenceIds: ['guide14', 'arch27'],
    status: 'ready', reasonTag: 'Potential dependency', version: 1, impactedBy: null,
    weakness: 'Element 9 shares an evidence chain with Element 3 (learning behavior). Material changes to Element 3 may affect this element.',
  },
  {
    id: 'e10', num: 10, name: 'User override',
    claim: 'A manual user override for a generated schedule',
    mapping: 'Manual schedule adjustment',
    reasoning: 'Manual schedule adjustment is documented as available to the user.',
    evidenceIds: ['guide22'],
    status: 'ready', reasonTag: 'Evidence-backed', version: 1, impactedBy: null,
    weakness: 'No open weakness. Manual override is described in the product guide.',
  },
];

export const DEMO_DOCUMENTS = [
  { name: 'US123456 Patent Specification.pdf', type: 'Patent specification' },
  { name: 'Acme Thermostat Product Guide.pdf', type: 'Product documentation' },
  { name: 'Acme Technical Architecture.pdf', type: 'Technical documentation' },
  { name: 'Acme Product Website.pdf', type: 'Product / marketing evidence' },
];

export const HERO_PROPOSAL = {
  before: 'Acme uses machine learning to learn user temperature preferences.',
  after: "Acme's Auto-Schedule demonstrates adaptive learning of user temperature preferences over time based on historical user behavior.",
  evidenceIds: ['guide14', 'arch27'],
};

export const DEFAULT_RATIONALE =
  'Element 7 includes an additional limiting condition, so the broader treatment is intentional.';
