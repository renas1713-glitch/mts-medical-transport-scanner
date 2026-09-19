## 2024-05-16 - OCR Regex Optimization
**Learning:** `correctTypos` was re-instantiating and compiling regular expressions inside a `.forEach` loop on every execution, causing unnecessary overhead for OCR tasks.
**Action:** Always extract static regular expressions, especially those parsing fixed replacement strings, to the module level and use `TYPO_REPLACEMENTS` arrays with standard `for` loops.
