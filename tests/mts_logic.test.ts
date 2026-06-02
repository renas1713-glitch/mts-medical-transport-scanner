// Mock react-native-async-storage and supabase-js BEFORE importing databaseManager
const localStore: { [key: string]: string } = {};

const mockAsyncStorage = {
  getItem: async (key: string) => {
    return localStore[key] || null;
  },
  setItem: async (key: string, value: string) => {
    localStore[key] = value;
  },
  removeItem: async (key: string) => {
    delete localStore[key];
  },
  clear: async () => {
    Object.keys(localStore).forEach((key) => delete localStore[key]);
  },
};

// Intercept Module loading
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (this: any, id: string) {
  if (id === '@react-native-async-storage/async-storage') {
    return mockAsyncStorage;
  }
  if (id === '@supabase/supabase-js') {
    return {
      createClient: () => ({
        from: () => ({
          upsert: async () => ({ error: null }),
        }),
      }),
    };
  }
  return originalRequire.apply(this, arguments);
};

// Now import target files and modules
import assert from 'assert';
import {
  correctTypos,
  isCheckboxChecked,
  parseBoundingBoxText,
  OCRElement,
} from '../utils/mtsLogic';
import {
  saveTrip,
  getLocalTrips,
  clearLocalTrips,
  SavedTrip,
} from '../utils/databaseManager';
import {
  sanitizeAddress,
  validateAddress,
  validateConfidence,
  isConfidenceSufficient,
  secureClearObject,
  generateTripId,
  MAX_ADDRESS_LENGTH,
  MIN_CONFIDENCE_THRESHOLD,
} from '../utils/security';

// Define a test runner framework in miniature
const tests: { name: string; fn: () => void | Promise<void> }[] = [];
function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Text Typo Corrections Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Typo correction: standardizes exact and embedded words', () => {
  assert.strictEqual(correctTypos('KMSerkiinik'), 'Kinderklinik');
  assert.strictEqual(correctTypos('Neurop&atrie'), 'Neuropädiatrie');
  assert.strictEqual(correctTypos('Krankenbeirderung'), 'Krankenbeförderung');

  // Mixed text correction
  const mixedText = 'Die Fahrt geht zur KMSerkiinik in die Abteilung Neurop&atrie.';
  const expectedText = 'Die Fahrt geht zur Kinderklinik in die Abteilung Neuropädiatrie.';
  assert.strictEqual(correctTypos(mixedText), expectedText);

  // No typos test
  const cleanText = 'Alles in bester Ordnung.';
  assert.strictEqual(correctTypos(cleanText), cleanText);

  // Empty string edge case
  assert.strictEqual(correctTypos(''), '');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Checkbox Filling Density Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Checkbox filling density status logic', () => {
  // Default threshold = 0.08
  assert.strictEqual(isCheckboxChecked(0.02), false);
  assert.strictEqual(isCheckboxChecked(0.079), false);
  assert.strictEqual(isCheckboxChecked(0.081), true);
  assert.strictEqual(isCheckboxChecked(0.25), true);

  // Custom threshold
  assert.strictEqual(isCheckboxChecked(0.05, 0.04), true);
  assert.strictEqual(isCheckboxChecked(0.05, 0.06), false);

  // Exact boundary
  assert.strictEqual(isCheckboxChecked(0.08), false); // not strictly greater than
  assert.strictEqual(isCheckboxChecked(0.08001), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bounding Box Coordinates Parsing Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Bounding box coordinates parsing & sorting logic', () => {
  const elements: OCRElement[] = [
    { text: 'Nordufer', x: 210, y: 410, width: 60, height: 20 },
    { text: 'Berlin', x: 220, y: 435, width: 50, height: 20 },
    { text: 'Kinderzentrum', x: 290, y: 410, width: 100, height: 20 },
    { text: 'OUTSIDE', x: 700, y: 1200, width: 50, height: 20 },
    { text: 'Ambulantes', x: 200, y: 405, width: 80, height: 20 },
  ];

  // Target box: X:200-550, Y:400-480
  const targetBox = { xMin: 200, xMax: 550, yMin: 400, yMax: 480 };
  const parsedText = parseBoundingBoxText(elements, targetBox);
  const expected = 'Ambulantes Nordufer Kinderzentrum Berlin';
  assert.strictEqual(parsedText, expected);

  // Empty elements array
  assert.strictEqual(parseBoundingBoxText([], targetBox), '');

  // All elements outside the box
  const allOutside: OCRElement[] = [
    { text: 'Far', x: 900, y: 900, width: 50, height: 20 },
  ];
  assert.strictEqual(parseBoundingBoxText(allOutside, targetBox), '');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Database Manager Cached Saves & Reads Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Database manager: save, retrieve, clear local cache', async () => {
  await clearLocalTrips();
  let trips = await getLocalTrips();
  assert.strictEqual(trips.length, 0);

  const sampleTrip: SavedTrip = {
    id: 'test-trip-123',
    abholort: 'Musterstraße 1, 10115 Berlin',
    zielort: 'Testklinik, Friedrichstraße 10, 10117 Berlin',
    fahrtart: 'Hinfahrt',
    hinfahrtBoxChecked: true,
    rueckfahrtBoxChecked: false,
    confidence: 0.95,
    file: 'test.jpg',
    status: 'In Bearbeitung',
    date: '01.06.2026, 12:00',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 },
    },
    rawDetails: {
      ocrLinesProcessed: 10,
      typosCorrectedCount: 1,
      hinfahrtDarkRatio: 0.22,
      rueckfahrtDarkRatio: 0.01,
    },
  };

  const saved = await saveTrip(sampleTrip);
  assert.strictEqual(saved.id, sampleTrip.id);
  assert.strictEqual(saved.abholort, sampleTrip.abholort);

  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 1);
  assert.strictEqual(trips[0].status, 'In Bearbeitung');

  // Update status in place
  await saveTrip({ ...sampleTrip, status: 'Abgerechnet' });
  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 1);
  assert.strictEqual(trips[0].status, 'Abgerechnet');

  // Add second trip
  const secondTrip: SavedTrip = { ...sampleTrip, id: 'test-trip-456', abholort: 'Bahnhofstraße 5, 20099 Hamburg' };
  await saveTrip(secondTrip);
  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 2);
  assert.strictEqual(trips[0].id, 'test-trip-456'); // newest first

  await clearLocalTrips();
  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Security: Address Sanitization Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Security: sanitizeAddress removes dangerous characters', () => {
  // Removes script-injection characters
  assert.strictEqual(sanitizeAddress('<script>alert(1)</script>'), 'scriptalert(1)/script');
  assert.strictEqual(sanitizeAddress('Musterstraße 1; DROP TABLE trips;'), 'Musterstraße 1 DROP TABLE trips');
  assert.strictEqual(sanitizeAddress('Gültige Straße 45, 10115 Berlin'), 'Gültige Straße 45, 10115 Berlin');

  // Collapses whitespace
  assert.strictEqual(sanitizeAddress('  Straße   1  '), 'Straße 1');

  // Enforces max length
  const longInput = 'A'.repeat(MAX_ADDRESS_LENGTH + 50);
  assert.strictEqual(sanitizeAddress(longInput).length, MAX_ADDRESS_LENGTH);

  // Non-string / empty inputs
  assert.strictEqual(sanitizeAddress(''), '');
  assert.strictEqual(sanitizeAddress(null as unknown as string), '');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Security: Address Validation Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Security: validateAddress catches invalid addresses', () => {
  // Valid German addresses
  assert.strictEqual(validateAddress('Hauptstraße 12, 10115 Berlin').valid, true);
  assert.strictEqual(validateAddress('Charité, Luisenstraße 65, 10117 Berlin').valid, true);

  // Empty / too short
  assert.strictEqual(validateAddress('').valid, false);
  assert.strictEqual(validateAddress('  ').valid, false);
  assert.strictEqual(validateAddress('AB').valid, false); // Too short

  // No digit in address → suspicious for a German address
  const noDigit = 'Hauptstraße Berlin';
  const noDigitResult = validateAddress(noDigit);
  // If it has no digit, it must be invalid
  if (/\d/.test(noDigit)) {
    // Should not happen but guard the test
    assert.strictEqual(noDigitResult.valid, true);
  } else {
    assert.strictEqual(noDigitResult.valid, false);
  }

  // Too long
  const tooLong = 'Straße 1 ' + 'x'.repeat(MAX_ADDRESS_LENGTH);
  assert.strictEqual(validateAddress(tooLong).valid, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Security: Confidence Validation Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Security: validateConfidence and isConfidenceSufficient', () => {
  // Valid range
  assert.strictEqual(validateConfidence(0.95).valid, true);
  assert.strictEqual(validateConfidence(0).valid, true);
  assert.strictEqual(validateConfidence(1).valid, true);

  // Invalid values
  assert.strictEqual(validateConfidence(-0.1).valid, false);
  assert.strictEqual(validateConfidence(1.1).valid, false);
  assert.strictEqual(validateConfidence(NaN).valid, false);
  assert.strictEqual(validateConfidence('high' as unknown as number).valid, false);
  assert.strictEqual(validateConfidence(null as unknown as number).valid, false);

  // Sufficient threshold check
  assert.strictEqual(isConfidenceSufficient(MIN_CONFIDENCE_THRESHOLD), true);
  assert.strictEqual(isConfidenceSufficient(0.59), false);
  assert.strictEqual(isConfidenceSufficient(0.99), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. GDPR: secureClearObject Tests
// ─────────────────────────────────────────────────────────────────────────────
test('GDPR: secureClearObject wipes sensitive patient data from memory', () => {
  const sensitiveData: Record<string, unknown> = {
    abholort: 'Patientenstraße 1, 10115 Berlin',
    zielort: 'Klinik Mitte, Berlin',
    confidence: 0.94,
    hinfahrtBoxChecked: true,
    rawDetails: {
      ocrLinesProcessed: 14,
      hinfahrtDarkRatio: 0.28,
    },
  };

  secureClearObject(sensitiveData);

  assert.strictEqual(sensitiveData.abholort, '');
  assert.strictEqual(sensitiveData.zielort, '');
  assert.strictEqual(sensitiveData.confidence, 0);
  assert.strictEqual(sensitiveData.hinfahrtBoxChecked, false);
  assert.strictEqual((sensitiveData.rawDetails as Record<string, unknown>).ocrLinesProcessed, 0);
  assert.strictEqual((sensitiveData.rawDetails as Record<string, unknown>).hinfahrtDarkRatio, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Security: Trip ID Generation Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Security: generateTripId produces unique, correctly formatted IDs', () => {
  const id1 = generateTripId();
  const id2 = generateTripId();

  // Format check: starts with "trip-"
  assert.ok(id1.startsWith('trip-'), `Expected ID to start with "trip-", got: ${id1}`);
  assert.ok(id2.startsWith('trip-'), `Expected ID to start with "trip-", got: ${id2}`);

  // Uniqueness check (generated a millisecond apart — random part ensures this)
  assert.notStrictEqual(id1, id2, 'Two generated IDs must not be identical');

  // Length sanity check (at least "trip-" + timestamp + random)
  assert.ok(id1.length >= 15, `ID too short: ${id1}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Run all registered tests sequentially
// ─────────────────────────────────────────────────────────────────────────────
async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('   MTS — Security & Logic Test Suite');
  console.log('═══════════════════════════════════════════\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    try {
      process.stdout.write(`  ▶ ${t.name} ... `);
      await t.fn();
      console.log('✅ PASSED');
      passedCount++;
    } catch (err: any) {
      console.log('❌ FAILED');
      console.error(`     → ${err.message || err}`);
      failedCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Total:   ${tests.length}`);
  console.log(`  Passed:  ${passedCount} ✅`);
  console.log(`  Failed:  ${failedCount} ${failedCount > 0 ? '❌' : '✅'}`);
  console.log('═══════════════════════════════════════════\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runAllTests();
