import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { MTSFormData } from '../hooks/useMTSOCR';

export interface SavedTrip extends MTSFormData {
  id: string;
  status: 'In Bearbeitung' | 'Abgerechnet';
  date: string;
  synced?: boolean;
}

const LOCAL_STORAGE_KEY = 'mts_trips';

/**
 * Checks if Supabase is properly configured with real credentials (not placeholders).
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    key &&
    !url.includes('placeholder-project-id') &&
    !key.includes('placeholderAnonCreateKey') &&
    url.trim() !== '' &&
    key.trim() !== ''
  );
};

/**
 * Checks if internet connection is active by making a lightweight head request.
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const response = await fetch('https://clients3.google.com/generate_204', {
      signal: controller.signal,
    });
    clearTimeout(id);
    return response.status === 204 || response.ok;
  } catch (e) {
    return false;
  }
};

/**
 * Helper to upload multiple trips to Supabase in a single batch.
 */
const uploadTripsToSupabase = async (trips: SavedTrip[]): Promise<boolean> => {
  if (trips.length === 0) return true;

  try {
    const dbTrips = trips.map(trip => ({
      id: trip.id,
      abholort: trip.abholort,
      zielort: trip.zielort,
      fahrtart: trip.fahrtart,
      hinfahrt_box_checked: trip.hinfahrtBoxChecked,
      rueckfahrt_box_checked: trip.rueckfahrtBoxChecked,
      confidence: trip.confidence,
      file: trip.file,
      status: trip.status,
      date: trip.date,
      coordinates: trip.coordinates,
      raw_details: trip.rawDetails,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('trips')
      .upsert(dbTrips, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase batch sync error (table may not exist or schema mismatch):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network or internal error uploading trips to Supabase:', err);
    return false;
  }
};

/**
 * Helper to upload a trip to Supabase.
 */
const uploadTripToSupabase = async (trip: SavedTrip): Promise<boolean> => {
  try {
    const dbTrip = {
      id: trip.id,
      abholort: trip.abholort,
      zielort: trip.zielort,
      fahrtart: trip.fahrtart,
      hinfahrt_box_checked: trip.hinfahrtBoxChecked,
      rueckfahrt_box_checked: trip.rueckfahrtBoxChecked,
      confidence: trip.confidence,
      file: trip.file,
      status: trip.status,
      date: trip.date,
      coordinates: trip.coordinates,
      raw_details: trip.rawDetails,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('trips')
      .upsert(dbTrip, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync error (table may not exist or schema mismatch):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network or internal error uploading trip to Supabase:', err);
    return false;
  }
};

/**
 * Gets trips directly from the local AsyncStorage.
 */
export const getLocalTrips = async (): Promise<SavedTrip[]> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading local trips cache:', err);
    return [];
  }
};

/**
 * Overwrites local AsyncStorage trip list.
 */
export const saveLocalTrips = async (trips: SavedTrip[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Error saving local trips cache:', err);
  }
};

/**
 * Retrieve trips: triggers background synchronization of pending items
 * and returns the locally cached trip records.
 */
export const getTrips = async (): Promise<SavedTrip[]> => {
  if (isSupabaseConfigured()) {
    isOnline().then(async (online) => {
      if (online) {
        await syncPendingTrips();
      }
    }).catch(() => {});
  }
  return getLocalTrips();
};

/**
 * Saves a trip to local storage first, then attempts syncing to Supabase.
 */
export const saveTrip = async (trip: SavedTrip): Promise<SavedTrip> => {
  const trips = await getLocalTrips();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  const updatedTrip: SavedTrip = { ...trip, synced: false };

  if (existingIndex >= 0) {
    trips[existingIndex] = updatedTrip;
  } else {
    trips.unshift(updatedTrip);
  }

  // Save to local cache first
  await saveLocalTrips(trips);

  // Attempt sync if configured and online
  if (isSupabaseConfigured()) {
    const online = await isOnline();
    if (online) {
      const success = await uploadTripToSupabase(updatedTrip);
      if (success) {
        updatedTrip.synced = true;
        // Update synced flag in local storage
        const latestTrips = await getLocalTrips();
        const idx = latestTrips.findIndex(t => t.id === trip.id);
        if (idx >= 0) {
          latestTrips[idx].synced = true;
          await saveLocalTrips(latestTrips);
        }
      }
    }
  }

  return updatedTrip;
};

/**
 * Iterates over local trips and uploads any unsynced ones.
 */
export const syncPendingTrips = async (): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const online = await isOnline();
  if (!online) return;

  try {
    const trips = await getLocalTrips();
    const pendingTrips = trips.filter(trip => !trip.synced);

    if (pendingTrips.length === 0) return;

    const success = await uploadTripsToSupabase(pendingTrips);

    if (success) {
      for (const trip of trips) {
        if (!trip.synced) {
          trip.synced = true;
        }
      }
      await saveLocalTrips(trips);
    }
  } catch (err) {
    console.warn('Error during background pending trips sync:', err);
  }
};

/**
 * Clears local AsyncStorage trips cache (useful for developer reset).
 */
export const clearLocalTrips = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing local trips:', err);
  }
};
