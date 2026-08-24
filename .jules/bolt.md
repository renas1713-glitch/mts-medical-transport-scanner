## 2025-02-18 - Pre-compiled Regex for OCR typos
**Learning:** In the `correctTypos` function, `RegExp` objects were being instantiated within a `forEach` loop on every function call. Since `correctTypos` is likely called repeatedly for many OCR elements, this adds significant overhead.
**Action:** When finding iterative replacements of fixed patterns in hot paths, move the `RegExp` instantiation outside the function scope so it only compiles once.
