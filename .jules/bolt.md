## 2024-07-26 - Pre-compiling RegExp objects for OCR typo correction
**Learning:** Hoisting and pre-compiling RegExp objects instead of dynamically creating them on each function call can significantly improve string replacement performance, especially for functions that might be called frequently during OCR post-processing.
**Action:** When performing dictionary-based string replacements or utilizing regex extensively, always look for opportunities to pre-compile the patterns at module load time to avoid repetitive instantiation overhead.
