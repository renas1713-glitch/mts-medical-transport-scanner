## 2026-09-04 - Optimization of OCR string/array manipulation
**Learning:** Chaining array methods like .filter(), .map(), and .join() in hot paths can cause significant overhead, as can repeatedly instantiating RegExp instances inside loops or functions.
**Action:** When identifying functions called extremely frequently (like parseBoundingBoxText during OCR reading), pre-compile regexes at module scope and use single-pass `for` loops with inlined conditionals to drastically reduce execution time.
