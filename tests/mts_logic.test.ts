// Mock react-native-async-storage, expo-secure-store, and supabase-js BEFORE importing databaseManager
const localStore: { [key: string]: string } = {};

const mockSecureStore = {
  getItemAsync: async (key: string) => {
    return localStore[key] || null;
  },
  setItemAsync: async (key: string, value: string) => {
    localStore[key] = value;
  },
  deleteItemAsync: async (key: string) => {
    delete localStore[key];
  },
};

// Also keep AsyncStorage mock for supabase
const mockAsyncStorage = {
  getItem: async (key: string) => localStore[key] || null,
  setItem: async (key: string, value: string) => { localStore[key] = value; },
  removeItem: async (key: string) => { delete localStore[key]; },
};

// Intercept Module loading
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (this: any, id: string) {
  if (id === 'expo-secure-store') {
    return mockSecureStore;
  }
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

// Define a test runner framework in miniature
const tests: { name: string; fn: () => void | Promise<void> }[] = [];
function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

// ----------------------------------------------------
// 1. Text Typo Corrections Tests
// ----------------------------------------------------
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
});

// ----------------------------------------------------
// 2. Checkbox Filling Density Tests
// ----------------------------------------------------
test('Checkbox filling density status logic', () => {
  // Default threshold = 0.08
  assert.strictEqual(isCheckboxChecked(0.02), false); // Under default
  assert.strictEqual(isCheckboxChecked(0.079), false); // Under default
  assert.strictEqual(isCheckboxChecked(0.081), true); // Over default
  assert.strictEqual(isCheckboxChecked(0.25), true); // Well over default

  // Custom threshold
  assert.strictEqual(isCheckboxChecked(0.05, 0.04), true);
  assert.strictEqual(isCheckboxChecked(0.05, 0.06), false);
});

// ----------------------------------------------------
// 3. Bounding Box Coordinates Parsing Tests
// ----------------------------------------------------
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
  
  // Sort should group them by y first (with 10px threshold)
  // y=405, 410, 410 -> Ambulantes, Nordufer, Kinderzentrum (sorted by x since y difference < 10)
  // then y=435 -> Berlin
  // OUTSIDE should be ignored
  const expected = 'Ambulantes Nordufer Kinderzentrum Berlin';
  assert.strictEqual(parsedText, expected);
});

// ----------------------------------------------------
// 4. Database Manager Cached Saves & Reads Tests
// ----------------------------------------------------
test('Database manager: save, retrieve, clear local cache', async () => {
  // Make sure we start clean
  await clearLocalTrips();
  let trips = await getLocalTrips();
  assert.strictEqual(trips.length, 0);

  const sampleTrip: SavedTrip = {
    id: 'test-trip-123',
    abholort: 'Musterstraße 1, Berlin',
    zielort: 'Testklinik, Berlin',
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
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 10,
      typosCorrectedCount: 1,
      hinfahrtDarkRatio: 0.22,
      rueckfahrtDarkRatio: 0.01
    }
  };

  // Save the trip
  const saved = await saveTrip(sampleTrip);
  assert.strictEqual(saved.id, sampleTrip.id);
  assert.strictEqual(saved.abholort, sampleTrip.abholort);

  // Retrieve
  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 1);
  assert.strictEqual(trips[0].id, sampleTrip.id);
  assert.strictEqual(trips[0].abholort, sampleTrip.abholort);
  assert.strictEqual(trips[0].status, 'In Bearbeitung');

  // Update in place
  const updatedTrip: SavedTrip = {
    ...sampleTrip,
    status: 'Abgerechnet',
  };
  await saveTrip(updatedTrip);

  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 1);
  assert.strictEqual(trips[0].status, 'Abgerechnet');

  // Add a second trip
  const secondTrip: SavedTrip = {
    ...sampleTrip,
    id: 'test-trip-456',
    abholort: 'Bahnhofstraße 5, Hamburg',
  };
  await saveTrip(secondTrip);

  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 2);
  // It unshifts, so the newest should be first
  assert.strictEqual(trips[0].id, 'test-trip-456');

  // Clear cache
  await clearLocalTrips();
  trips = await getLocalTrips();
  assert.strictEqual(trips.length, 0);
});

// Run all registered tests sequentially
async function runAllTests() {
  console.log('--- STARTING MTS LOGIC TESTS ---');
  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    try {
      console.log(`[TEST] Running: ${t.name}...`);
      await t.fn();
      console.log(`  => PASSED`);
      passedCount++;
    } catch (err: any) {
      console.error(`  => FAILED:`, err.message || err);
      if (err.stack) {
        console.error(err.stack);
      }
      failedCount++;
    }
  }

  console.log('\n--- TEST RUN SUMMARY ---');
  console.log(`Total tests: ${tests.length}`);
  console.log(`Passed:      ${passedCount}`);
  console.log(`Failed:      ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
