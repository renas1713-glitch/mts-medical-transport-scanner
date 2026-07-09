## 2024-05-18 - Avoid Dynamic Regex in OCR CorrectTypos Loop
**Learning:** Recompiling RegExp on every correctTypos invocation inside a processing loop for OCR scanning forms a performance bottleneck in this specific pipeline due to redundant JS object allocations.
**Action:** When defining static typo replacement rules (e.g. for OCR processing), pre-compile the RegExp objects outside the function scope into a module-level constant array.
