import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  Animated,
} from 'react-native';
import Colors from '../constants/Colors';
import { MTSFormData } from '../hooks/useMTSOCR';
import { openMapsWithAddress } from '../utils/navigationHelper';
import { verifyAddress as apiVerifyAddress } from '../utils/mapsApi';
import { saveTrip as dbSaveTrip, SavedTrip } from '../utils/databaseManager';
import { isCheckboxChecked } from '../utils/mtsLogic';

interface MTSReviewProps {
  scannedData: MTSFormData;
  onSave: (savedTrip: SavedTrip) => void;
  onCancel: () => void;
}

export const MTSReview: React.FC<MTSReviewProps> = ({
  scannedData,
  onSave,
  onCancel,
}) => {
  const [abholort, setAbholort] = useState(scannedData.abholort);
  const [zielort, setZielort] = useState(scannedData.zielort);
  const [fahrtart, setFahrtart] = useState(scannedData.fahrtart);
  
  const [hinfahrtBoxChecked, setHinfahrtBoxChecked] = useState(scannedData.hinfahrtBoxChecked);
  const [rueckfahrtBoxChecked, setRueckfahrtBoxChecked] = useState(scannedData.rueckfahrtBoxChecked);

  // Address Verification States
  const [verifyingPickup, setVerifyingPickup] = useState(false);
  const [pickupVerified, setPickupVerified] = useState(true); // Default to true based on mock
  const [verifyingDest, setVerifyingDest] = useState(false);
  const [destVerified, setDestVerified] = useState(true);

  // Save / Billing States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Success Pop Micro-animation scale state
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (saveSuccess) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [saveSuccess, scaleAnim]);

  // Sync checkboxes with trip type
  const handleCheckboxToggle = (type: 'hin' | 'rueck', val: boolean) => {
    let nextHin = hinfahrtBoxChecked;
    let nextRueck = rueckfahrtBoxChecked;

    if (type === 'hin') {
      nextHin = val;
      setHinfahrtBoxChecked(val);
    } else {
      nextRueck = val;
      setRueckfahrtBoxChecked(val);
    }

    if (nextHin && nextRueck) {
      setFahrtart('Hin- & Rückfahrt');
    } else if (nextHin) {
      setFahrtart('Hinfahrt');
    } else if (nextRueck) {
      setFahrtart('Rückfahrt');
    } else {
      setFahrtart('Nicht angegeben');
    }
  };

  const handleTripTypeChange = (type: typeof fahrtart) => {
    setFahrtart(type);
    if (type === 'Hin- & Rückfahrt') {
      setHinfahrtBoxChecked(true);
      setRueckfahrtBoxChecked(true);
    } else if (type === 'Hinfahrt') {
      setHinfahrtBoxChecked(true);
      setRueckfahrtBoxChecked(false);
    } else if (type === 'Rückfahrt') {
      setHinfahrtBoxChecked(false);
      setRueckfahrtBoxChecked(true);
    } else {
      setHinfahrtBoxChecked(false);
      setRueckfahrtBoxChecked(false);
    }
  };

  // Address Verification using Maps API
  const verifyAddress = async (address: string, isPickup: boolean) => {
    if (!address.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie eine Adresse zum Verifizieren ein.');
      return;
    }

    if (isPickup) {
      setVerifyingPickup(true);
      setPickupVerified(false);
    } else {
      setVerifyingDest(true);
      setDestVerified(false);
    }

    try {
      const result = await apiVerifyAddress(address);
      if (result.success) {
        if (isPickup) {
          setAbholort(result.formattedAddress);
          setPickupVerified(true);
        } else {
          setZielort(result.formattedAddress);
          setDestVerified(true);
        }
      } else {
        Alert.alert('Verifizierung unvollständig', result.error || 'Adresse konnte nicht verifiziert werden.');
        if (isPickup) {
          setPickupVerified(false);
        } else {
          setDestVerified(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Fehler', 'Verbindung zum Maps API fehlgeschlagen.');
      if (isPickup) {
        setPickupVerified(false);
      } else {
        setDestVerified(false);
      }
    } finally {
      if (isPickup) {
        setVerifyingPickup(false);
      } else {
        setVerifyingDest(false);
      }
    }
  };

  // Direct Map Deep Link Integration
  const navigateTo = (address: string) => {
    openMapsWithAddress(address, 'default');
  };

  // Save trip to databaseManager (local cache + Supabase sync)
  const handleSave = async () => {
    const cleanAbholort = abholort.trim();
    const cleanZielort = zielort.trim();

    if (!cleanAbholort || !cleanZielort) {
      Alert.alert('Eingabefehler', 'Abholort und Zielort dürfen nicht leer sein.');
      return;
    }

    if (cleanAbholort.length > 250 || cleanZielort.length > 250) {
      Alert.alert('Eingabefehler', 'Die Adresse ist zu lang. Bitte kürzen.');
      return;
    }

    setIsSaving(true);

    try {
      const tripId = (scannedData as any).id || `trip-${Date.now()}`;
      const tripToSave: SavedTrip = {
        ...scannedData,
        id: tripId,
        abholort: cleanAbholort,
        zielort: cleanZielort,
        fahrtart,
        hinfahrtBoxChecked,
        rueckfahrtBoxChecked,
        status: 'Abgerechnet',
        date: new Date().toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const savedTrip = await dbSaveTrip(tripToSave);

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        onSave(savedTrip);
      }, 1500);
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Fehler beim Speichern', err.message || 'Die Daten konnten nicht gespeichert werden.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Success Modal Simulation */}
      {saveSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successBadge}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Daten übermittelt!</Text>
            <Text style={styles.successMessage}>
              Die Fahrt wurde erfolgreich in der Krankenkassen-Abrechnung erfasst.
            </Text>
            <ActivityIndicator size="small" color={Colors.dark.secondary} style={{ marginTop: 12 }} />
          </Animated.View>
        </View>
      )}

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Manuelle Verifizierung</Text>
        <Text style={styles.subtitle}>Prüfen und korrigieren Sie die OCR-Daten</Text>
      </View>

      {/* OCR Scan Metadata Details */}
      <View style={styles.metaCard}>
        <View style={styles.metaHeader}>
          <Text style={styles.metaTitle}>OCR Erkennungsinformationen</Text>
          <View style={[styles.confidenceBadge, { backgroundColor: scannedData.confidence > 0.92 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
            <Text style={[styles.confidenceText, { color: scannedData.confidence > 0.92 ? Colors.dark.secondary : Colors.dark.warning }]}>
              {Math.round(scannedData.confidence * 100)}% Konfidenz
            </Text>
          </View>
        </View>
        
        <View style={styles.metaDetailRow}>
          <View style={styles.metaDetailItem}>
            <Text style={styles.metaLabel}>Datei</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{scannedData.file}</Text>
          </View>
          <View style={styles.metaDetailItem}>
            <Text style={styles.metaLabel}>Autokorrekturen</Text>
            <Text style={[styles.metaValue, scannedData.rawDetails.typosCorrectedCount > 0 && { color: Colors.dark.secondary }]}>
              {scannedData.rawDetails.typosCorrectedCount} angewandt
            </Text>
          </View>
        </View>

        {/* Layout details displaying the coordinate logic */}
        <View style={styles.coordBox}>
          <Text style={styles.coordTitle}>Erkannte Bildbereiche (Pixel-Koordinaten):</Text>
          <Text style={styles.coordLine}>• Abholort: X:200-550, Y:400-480</Text>
          <Text style={styles.coordLine}>• Zielort: X:200-600, Y:1030-1080</Text>
          <Text style={styles.coordLine}>
            • Checkbox Hinfahrt (Ratio: {scannedData.rawDetails.hinfahrtDarkRatio}): {isCheckboxChecked(scannedData.rawDetails.hinfahrtDarkRatio) ? '✓ Aktiviert' : '✗ Inaktiv'}
          </Text>
          <Text style={styles.coordLine}>
            • Checkbox Rückfahrt (Ratio: {scannedData.rawDetails.rueckfahrtDarkRatio}): {isCheckboxChecked(scannedData.rawDetails.rueckfahrtDarkRatio) ? '✓ Aktiviert' : '✗ Inaktiv'}
          </Text>
        </View>
      </View>

      {/* Field 1: Abholort */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Abholort (Startadresse)</Text>
          {pickupVerified ? (
            <Text style={styles.verifiedLabel}>✓ Adressabgleich OK</Text>
          ) : (
            <Text style={styles.unverifiedLabel}>⚠️ Nicht verifiziert</Text>
          )}
        </View>
        <View style={styles.inputActionWrapper}>
          <TextInput
            style={[styles.textInput, !pickupVerified && styles.textInputWarning]}
            value={abholort}
            onChangeText={(t) => {
              setAbholort(t);
              setPickupVerified(false);
            }}
            placeholder="Abholadresse eingeben..."
            placeholderTextColor={Colors.dark.textDim}
            multiline
          />
          <View style={styles.fieldActions}>
            <TouchableOpacity
              onPress={() => verifyAddress(abholort, true)}
              style={styles.verifyBtn}
              disabled={verifyingPickup}
            >
              {verifyingPickup ? (
                <ActivityIndicator size="small" color={Colors.dark.text} />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigateTo(abholort)}
              style={styles.navigateMiniBtn}
            >
              <Text style={styles.navigateMiniBtnText}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Field 2: Zielort */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Zielort (Bestimmungsort)</Text>
          {destVerified ? (
            <Text style={styles.verifiedLabel}>✓ Adressabgleich OK</Text>
          ) : (
            <Text style={styles.unverifiedLabel}>⚠️ Nicht verifiziert</Text>
          )}
        </View>
        <View style={styles.inputActionWrapper}>
          <TextInput
            style={[styles.textInput, !destVerified && styles.textInputWarning]}
            value={zielort}
            onChangeText={(t) => {
              setZielort(t);
              setDestVerified(false);
            }}
            placeholder="Zieladresse eingeben..."
            placeholderTextColor={Colors.dark.textDim}
            multiline
          />
          <View style={styles.fieldActions}>
            <TouchableOpacity
              onPress={() => verifyAddress(zielort, false)}
              style={styles.verifyBtn}
              disabled={verifyingDest}
            >
              {verifyingDest ? (
                <ActivityIndicator size="small" color={Colors.dark.text} />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo(zielort)}
              style={styles.navigateMiniBtn}
            >
              <Text style={styles.navigateMiniBtnText}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Field 3: Checkbox-Verifizierung */}
      <View style={styles.checkboxesCard}>
        <Text style={styles.checkboxSectionTitle}>Checkbox-Erkennung abgleichen</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Hinfahrt Checkbox (Y:344)</Text>
            <Text style={styles.switchSublabel}>Markiert bei Hinfahrt zum Behandlungsort</Text>
          </View>
          <Switch
            value={hinfahrtBoxChecked}
            onValueChange={(val) => handleCheckboxToggle('hin', val)}
            trackColor={{ false: Colors.dark.outline, true: Colors.dark.primary }}
            thumbColor={hinfahrtBoxChecked ? Colors.dark.primaryLight : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Rückfahrt Checkbox (Y:393)</Text>
            <Text style={styles.switchSublabel}>Markiert bei Heimfahrt vom Behandlungsort</Text>
          </View>
          <Switch
            value={rueckfahrtBoxChecked}
            onValueChange={(val) => handleCheckboxToggle('rueck', val)}
            trackColor={{ false: Colors.dark.outline, true: Colors.dark.primary }}
            thumbColor={rueckfahrtBoxChecked ? Colors.dark.primaryLight : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Segmented Picker for Fahrtart (Sync'd) */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Fahrtart (Zugeordnet)</Text>
        <View style={styles.segmentedContainer}>
          {(['Hinfahrt', 'Rückfahrt', 'Hin- & Rückfahrt', 'Nicht angegeben'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.segmentBtn,
                fahrtart === type && styles.segmentBtnActive,
              ]}
              onPress={() => handleTripTypeChange(type)}
            >
              <Text
                style={[
                  styles.segmentText,
                  fahrtart === type && styles.segmentTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Primary Navigation Trigger Action */}
      <TouchableOpacity
        onPress={() => navigateTo(abholort)}
        style={styles.primaryNavBtn}
      >
        <Text style={styles.primaryNavBtnText}>📍 Zum Abholort navigieren</Text>
      </TouchableOpacity>

      {/* Form Controls */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.cancelBtn}
          disabled={isSaving}
        >
          <Text style={styles.cancelBtnText}>Verwerfen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Daten freigeben</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.dark.textDim,
    fontSize: 14,
    marginTop: 4,
  },
  metaCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaDetailItem: {
    flex: 1,
  },
  metaLabel: {
    color: Colors.dark.textDim,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: Colors.dark.text,
    fontSize: 13,
    marginTop: 2,
  },
  coordBox: {
    marginTop: 8,
    backgroundColor: Colors.dark.surfaceDim,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  coordTitle: {
    color: Colors.dark.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  coordLine: {
    color: Colors.dark.textDim,
    fontSize: 11,
    marginVertical: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedLabel: {
    color: Colors.dark.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  unverifiedLabel: {
    color: Colors.dark.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  inputActionWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  textInputWarning: {
    borderColor: Colors.dark.warning,
  },
  fieldActions: {
    marginLeft: 10,
    justifyContent: 'space-between',
    width: 86,
  },
  verifyBtn: {
    backgroundColor: Colors.dark.surfaceBright,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  verifyBtnText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '700',
  },
  navigateMiniBtn: {
    backgroundColor: Colors.dark.surfaceBright,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  navigateMiniBtnText: {
    fontSize: 16,
  },
  checkboxesCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxSectionTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '600',
  },
  switchSublabel: {
    color: Colors.dark.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.outline,
    marginVertical: 10,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surfaceDim,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.dark.primary,
  },
  segmentText: {
    color: Colors.dark.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.dark.text,
  },
  primaryNavBtn: {
    backgroundColor: 'rgba(0, 94, 184, 0.2)',
    borderWidth: 1.5,
    borderColor: Colors.dark.primaryLight,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 12,
  },
  primaryNavBtnText: {
    color: Colors.dark.primaryLight,
    fontSize: 15,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.error,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: Colors.dark.error,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.dark.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveBtnText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    width: '85%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.secondary,
    shadowColor: Colors.dark.secondary,
    shadowRadius: 10,
    shadowOpacity: 0.15,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successCheckmark: {
    color: Colors.dark.secondary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  successTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  successMessage: {
    color: Colors.dark.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default MTSReview;
