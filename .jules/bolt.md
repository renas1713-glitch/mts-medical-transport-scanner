
## 2024-05-18 - Optimized RegExp Initialization in OCR Processing
**Learning:** In text post-processing loops (`utils/mtsLogic.ts`), recreating RegExp objects with the `g` flag for `String.prototype.replace()` calls causes unnecessary memory allocation and CPU overhead on every function call. Reusing stateful global regular expressions is safe in JavaScript because `replace` automatically handles resetting `lastIndex` to 0.
**Action:** Always pre-compile static `RegExp` patterns outside of frequently called functions (especially for data processing/OCR tasks) to improve execution speed.
