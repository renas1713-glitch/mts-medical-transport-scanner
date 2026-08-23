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

const TYPO_REPLACEMENTS = [
  { regex: new RegExp('KMSerkiinik'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), replacement: 'Kinderklinik' },
  { regex: new RegExp('Neurop&atrie'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), replacement: 'Neuropädiatrie' },
  { regex: new RegExp('Krankenbeirderung'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), replacement: 'Krankenbeförderung' },
];

/**
 * Standardizes common typos from OCR scans.
 * ⚡ Bolt Optimization: Uses pre-compiled RegExp to avoid re-compilation on every call.
 * Reduces typo correction execution time.
 */
export const correctTypos = (text: string): string => {
  if (!text) return '';
  let corrected = text;
  
  // Perform word-based or substring replacements using pre-compiled regex
  for (let i = 0; i < TYPO_REPLACEMENTS.length; i++) {
    corrected = corrected.replace(TYPO_REPLACEMENTS[i].regex, TYPO_REPLACEMENTS[i].replacement);
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
