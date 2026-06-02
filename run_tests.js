const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Compiling TypeScript test files...');
const outDir = path.join(__dirname, 'tests_dist');

try {
  // Ensure any old dist directory is removed first
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  // Compile using tsc
  // We specify skipLibCheck, esModuleInterop, and commonjs to run smoothly on Node.js
  const cmd = `npx tsc --target es2020 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --outDir tests_dist tests/mts_logic.test.ts`;
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  
  console.log('Running tests...');
  const testJsPath = path.join(outDir, 'tests', 'mts_logic.test.js');
  
  // Run the compiled JS tests
  execSync(`node "${testJsPath}"`, { stdio: 'inherit' });
  
  console.log('Cleaning up temporary build files...');
  fs.rmSync(outDir, { recursive: true, force: true });
  
  console.log('All tests completed successfully!');
  process.exit(0);
} catch (err) {
  console.error('\nTest runner failed or tests failed.');
  
  // Clean up on failure too
  if (fs.existsSync(outDir)) {
    try {
      fs.rmSync(outDir, { recursive: true, force: true });
    } catch (_) {}
  }
  process.exit(1);
}
