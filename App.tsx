import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Colors from './constants/Colors';
import MTSCamera from './components/MTSCamera';
import MTSReview from './components/MTSReview';
import { MTSFormData } from './hooks/useMTSOCR';
import { openMapsWithAddress } from './utils/navigationHelper';
import { getTrips, saveTrip, SavedTrip } from './utils/databaseManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INITIAL_TRIPS: SavedTrip[] = [
  {
    id: 'trip-1',
    abholort: 'Ambulantes Kinderzentrum, Nordufer 20, 13353 Berlin, Deutschland',
    zielort: 'Kinderklinik, Neuropädiatrie, Wedding, Deutschland',
    fahrtart: 'Hinfahrt',
    hinfahrtBoxChecked: true,
    rueckfahrtBoxChecked: false,
    confidence: 0.94,
    file: '23.jpeg',
    status: 'Abgerechnet',
    date: 'Heute, 14:32',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 14,
      typosCorrectedCount: 2,
      hinfahrtDarkRatio: 0.28,
      rueckfahrtDarkRatio: 0.02
    }
  },
  {
    id: 'trip-2',
    abholort: 'Kaiserstraße 18, 12099 Berlin, Deutschland',
    zielort: 'Unfallkrankenhaus Berlin, Warener Str. 7, 12683 Berlin, Deutschland',
    fahrtart: 'Hin- & Rückfahrt',
    hinfahrtBoxChecked: true,
    rueckfahrtBoxChecked: true,
    confidence: 0.89,
    file: 'scan_0928.png',
    status: 'Abgerechnet',
    date: 'Gestern, 09:15',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 12,
      typosCorrectedCount: 0,
      hinfahrtDarkRatio: 0.35,
      rueckfahrtDarkRatio: 0.32
    }
  }
];

// Memoized TripCard to prevent unnecessary re-renders in FlatList
const TripCard = React.memo(({ item, onStartNavigation }: { item: SavedTrip, onStartNavigation: (address: string) => void }) => {
  return (
    <View style={styles.tripCard}>
      <View style={styles.tripCardHeader}>
        <View>
          <Text style={styles.tripCardTitle}>{item.fahrtart}</Text>
          <Text style={styles.tripCardDate}>{item.date}</Text>
        </View>
        <View style={[
          styles.statusChip,
          item.status === 'Abgerechnet' ? styles.statusChipSettled : styles.statusChipPending
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Abgerechnet' ? styles.statusTextSettled : styles.statusTextPending
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.tripCardDetails}>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>Start:</Text>
          <Text style={styles.addressValue} numberOfLines={2}>{item.abholort}</Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>Ziel:</Text>
          <Text style={styles.addressValue} numberOfLines={2}>{item.zielort}</Text>
        </View>
      </View>

      <View style={styles.tripCardActions}>
        <TouchableOpacity
          onPress={() => onStartNavigation(item.abholort)}
          style={styles.cardActionBtn}
        >
          <Text style={styles.cardActionBtnText}>📍 Start-Navi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onStartNavigation(item.zielort)}
          style={styles.cardActionBtn}
        >
          <Text style={styles.cardActionBtnText}>🏁 Ziel-Navi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'scanner' | 'review'>('dashboard');
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [activeScannedData, setActiveScannedData] = useState<MTSFormData | null>(null);

  // Load and sync trips from the databaseManager
  useEffect(() => {
    const initializeApp = async () => {
      try {
        let stored = await getTrips();
        if (stored.length === 0) {
          // Seed the database with INITIAL_TRIPS on first launch
          for (const trip of INITIAL_TRIPS) {
            await saveTrip(trip);
          }
          stored = await getTrips();
        }
        setTrips(stored);
      } catch (err) {
        console.error('Failed to initialize database trips:', err);
      }
    };
    initializeApp();
  }, []);

  // Navigation callbacks
  const handleScanCompleted = (data: MTSFormData, imageUri: string) => {
    setActiveScannedData(data);
    setCurrentScreen('review');
  };

  const handleReviewSaved = (savedTrip: SavedTrip) => {
    setTrips(prev => {
      const idx = prev.findIndex(t => t.id === savedTrip.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedTrip;
        return next;
      }
      return [savedTrip, ...prev];
    });
    setActiveScannedData(null);
    setCurrentScreen('dashboard');
  };

  const handleCancelScanner = () => {
    setCurrentScreen('dashboard');
  };

  const handleCancelReview = () => {
    setActiveScannedData(null);
    setCurrentScreen('dashboard');
  };

  const handleStartNavigation = React.useCallback((address: string) => {
    openMapsWithAddress(address);
  }, []);

  // Render a single trip card on dashboard
  const renderTripCard = React.useCallback(({ item }: { item: SavedTrip }) => (
    <TripCard item={item} onStartNavigation={handleStartNavigation} />
  ), [handleStartNavigation]);

  // Memoize dashboard stats calculations
  const { totalTrips, settledTrips, avgConfidence } = React.useMemo(() => {
    const total = trips.length;
    const settled = trips.filter(t => t.status === 'Abgerechnet').length;
    const confidence = total > 0
      ? `${Math.round(trips.reduce((acc, t) => acc + t.confidence, 0) / total * 100)}%`
      : '0%';

    return {
      totalTrips: total,
      settledTrips: settled,
      avgConfidence: confidence
    };
  }, [trips]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />

      {currentScreen === 'dashboard' && (
        <View style={styles.dashboardContainer}>
          {/* Dashboard Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>MedDrive Core</Text>
              <Text style={styles.headerSubtitle}>Medizintransport-Scanner (MTS)</Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileInitials}>F1</Text>
            </View>
          </View>

          {/* Quick Stats banner */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalTrips}</Text>
              <Text style={styles.statLabel}>Gesamtbelege</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{settledTrips}</Text>
              <Text style={styles.statLabel}>Übermittelt</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{avgConfidence}</Text>
              <Text style={styles.statLabel}>OCR Genauigkeit</Text>
            </View>
          </View>

          {/* Trips Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transportprotokolle</Text>
            <Text style={styles.sectionSubtitle}>Verifizierte Belege</Text>
          </View>

          {/* Trips List */}
          {trips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTextIcon}>📄</Text>
              <Text style={styles.emptyTextTitle}>Keine Fahrten vorhanden</Text>
              <Text style={styles.emptyTextSub}>Scannen Sie ein "Muster 4"-Formular, um zu starten.</Text>
            </View>
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(item) => item.id}
              renderItem={renderTripCard}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Bottom Floating Action Scan Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('scanner')}
              style={styles.scanBtn}
            >
              <Text style={styles.scanBtnText}>📸 Beleg scannen (Muster 4)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentScreen === 'scanner' && (
        <MTSCamera
          onScanCompleted={handleScanCompleted}
          onCancel={handleCancelScanner}
        />
      )}

      {currentScreen === 'review' && activeScannedData && (
        <MTSReview
          scannedData={activeScannedData}
          onSave={handleReviewSaved}
          onCancel={handleCancelReview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  dashboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: Colors.dark.outline,
    backgroundColor: Colors.dark.surfaceDim,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  profileBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.primaryLight,
  },
  profileInitials: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    margin: 16,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.primaryLight,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.dark.textDim,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: Colors.dark.outline,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tripCardTitle: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
  },
  tripCardDate: {
    color: Colors.dark.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  statusChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusChipSettled: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusChipPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextSettled: {
    color: Colors.dark.secondary,
  },
  statusTextPending: {
    color: Colors.dark.warning,
  },
  tripCardDetails: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  addressLabel: {
    color: Colors.dark.textDim,
    fontSize: 12,
    fontWeight: '600',
    width: 42,
  },
  addressValue: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 12,
  },
  tripCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardActionBtn: {
    backgroundColor: Colors.dark.surfaceBright,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  cardActionBtnText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 48,
  },
  emptyTextIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTextTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyTextSub: {
    color: Colors.dark.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderColor: Colors.dark.outline,
  },
  scanBtn: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
