## 2026-08-23 - Pre-compile Regex in tight loops
**Learning:** Compiling regex patterns on every invocation inside standard utility functions (like typo correction) causes an unnecessary performance overhead, especially noticeable when processing bulk text or multiple OCR passes.
**Action:** Always extract and pre-compile regular expressions (e.g. into module-level variables) outside the function body to run faster during loops/OCR scanning.
