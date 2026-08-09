## 2024-05-19 - Pre-compiling Regexes in OCR typo correction
**Learning:** Instantiating `RegExp` objects inside a hot path like `correctTypos` creates unnecessary overhead, especially when processing numerous OCR elements.
**Action:** Always extract and pre-compile regular expressions outside of functions that are called frequently or iteratively.
