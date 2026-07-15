export interface CoordinateBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRElement {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const REPLACEMENTS_MAP: Record<string, string> = {
  'KMSerkiinik': 'Kinderklinik',
  'Neurop&atrie': 'Neuropädiatrie',
  'Krankenbeirderung': 'Krankenbeförderung',
};

// Pre-compile regular expressions to avoid recompilation on every call
// Optimization: Moved outside the function to improve OCR post-processing speed
const PRECOMPILED_REGEXES = Object.keys(REPLACEMENTS_MAP).map((typo) => ({
  regex: new RegExp(typo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'),
  replacement: REPLACEMENTS_MAP[typo],
}));

/**
 * Standardizes common typos from OCR scans.
 */
export const correctTypos = (text: string): string => {
  if (!text) return '';
  let corrected = text;

  // Perform word-based or substring replacements using precompiled regexes
  for (let i = 0; i < PRECOMPILED_REGEXES.length; i++) {
    const { regex, replacement } = PRECOMPILED_REGEXES[i];
    corrected = corrected.replace(regex, replacement);
  }

  return corrected;
};

/**
 * Determines if an OCR element's bounding box center is inside the target bounding box.
 */
export const isInsideBox = (elem: CoordinateBox, target: { xMin: number; xMax: number; yMin: number; yMax: number }): boolean => {
  const centerX = elem.x + elem.width / 2;
  const centerY = elem.y + elem.height / 2;
  return (
    centerX >= target.xMin &&
    centerX <= target.xMax &&
    centerY >= target.yMin &&
    centerY <= target.yMax
  );
};

/**
 * Parses OCR elements and extracts text that falls within the specified bounding box coordinates.
 */
export const parseBoundingBoxText = (
  elements: OCRElement[],
  targetBox: { xMin: number; xMax: number; yMin: number; yMax: number }
): string => {
  const filtered = elements.filter(elem => isInsideBox(elem, targetBox));
  
  // Sort elements: top to bottom, then left to right
  const sorted = [...filtered].sort((a, b) => {
    // If elements are on similar vertical level (within 10px), sort left to right
    if (Math.abs(a.y - b.y) < 10) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  return sorted.map(elem => elem.text.trim()).join(' ');
};

/**
 * Determines if a checkbox is checked based on dark pixel density ratio.
 * Default threshold is 0.08.
 */
export const isCheckboxChecked = (darkRatio: number, threshold: number = 0.08): boolean => {
  return darkRatio > threshold;
};
