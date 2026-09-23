// Words the site never translates, in any language: product and program names,
// third-party software, standards, protocols and technical acronyms.
//
// Shared by the client (to leave such strings alone) and by /api/translate (to
// mask them before text reaches the translation model, so they cannot be
// translated or transliterated by accident). Longest names first, so that
// "Simorgh Design Suite" is matched before "Design Suite".

export const productNames = [
  'SIMORGH Design Suite', 'SIMORGH Digital Twin', 'SIMORGH Grid', 'SIMORGH Kara', 'SIMORGH Shop', 'SIMORGH Draw', 'SIMORGH Cloud', 'SIMORGH AI',
  'Simorgh Design Suite', 'Simorgh Digital Twin', 'Simorgh Grid', 'Simorgh Kara', 'Simorgh Shop', 'Simorgh Draw', 'Simorgh Cloud', 'Simorgh AI',
  'Simorgh Site Intelligence', 'Simorgh Intelligence', 'Simorgh Soft',
  'Design Suite', 'Digital Twin', 'Smart Grid', 'Kara', 'SIMORGH', 'Simorgh',
];

export const softwareNames = [
  'EPLAN Integration', 'EPLAN', 'AutoCAD', 'Kubernetes', 'VideoObject',
  'Siemens', 'ABB', 'Schneider Electric', 'Rockwell', 'Microsoft',
];

export const technicalTerms = [
  'AI', 'RAG', 'RBAC', 'PLC', 'SLD', 'SLDs', 'BOM', 'GIS', 'IoT', 'SCADA', 'HMI', 'API', 'APIs', 'SaaS', 'MCP', 'ERP', 'SKU',
  'AMI', 'CCTV', 'PPE', 'DXF', 'PDF', 'CAD', 'IEC', 'ANSI', 'Modbus', 'OPC UA', 'MQTT', 'HR', 'KPI',
];

export const protectedTerms = [...productNames, ...softwareNames, ...technicalTerms]
  .sort((a, b) => b.length - a.length);

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches any protected term as a whole word. */
export const protectedPattern = new RegExp(`(?<![A-Za-z])(${protectedTerms.map(escape).join('|')})(?![A-Za-z])`, 'g');

/** Short product names that are only names when they stand alone ("Grid", "Shop"…). */
const standaloneNames = new Set(['grid', 'shop', 'draw', 'cloud', 'twin', 'eng', 'ent']);

/**
 * True when there is nothing in the text to translate: it is made only of
 * protected names, codes, numbers and punctuation — "SIMORGH GRID",
 * "DESIGN SUITE · 12:40", "SLD-MV-014 · R02", "IEC 60617 v12".
 */
export function isProtectedOnly(text: string) {
  const value = text.trim();
  if (standaloneNames.has(value.toLowerCase())) return true;
  const upperPattern = new RegExp(protectedPattern.source, 'gi');
  const rest = value
    .replace(upperPattern, ' ')
    // Codes: anything carrying a digit, e.g. R02, v12, SP-4, MV-014.
    .replace(/\S*\d\S*/g, ' ')
    // Leftover name fragments when a product name is upper-cased ("SIMORGH GRID").
    .replace(/(?<![A-Za-z])(grid|shop|draw|cloud|twin)(?![A-Za-z])/gi, ' ');
  return !/[A-Za-z]{2,}/.test(rest);
}
