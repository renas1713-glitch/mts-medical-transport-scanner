import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Colors from '../constants/Colors';
import { useMTSOCR, MTSFormData } from '../hooks/useMTSOCR';

interface MTSCameraProps {
  onScanCompleted: (result: MTSFormData, imageUri: string) => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bounding box dimensions for the form guide
const OVERLAY_WIDTH = SCREEN_WIDTH * 0.85;
const OVERLAY_HEIGHT = OVERLAY_WIDTH * 1.41; // A4 aspect ratio approx

export const MTSCamera: React.FC<MTSCameraProps> = ({
  onScanCompleted,
  onCancel,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [useSimulator, setUseSimulator] = useState(Platform.OS === 'web');
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [flashlight, setFlashlight] = useState(false);
  const [documentDetected, setDocumentDetected] = useState(true); // Default green guides
  
  // High-fidelity animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const guideOpacity = useRef(new Animated.Value(0.7)).current;
  const [currentTip, setCurrentTip] = useState(0);

  const {
    isProcessing,
    progress,
    statusMessage,
    result,
    scanForm,
    mockTemplatesCount,
  } = useMTSOCR();

  const tipsList = [
    'Formular im Rahmen ausrichten. Kontrast beachten.',
    'Tipp: Halten Sie das Dokument flach und vermeiden Sie Schatten.',
    'Kamera stabilisieren. Optimale Helligkeit wird angestrebt.',
    'Tipp: Gute Ausleuchtung sorgt für 95%+ OCR-Genauigkeit.',
  ];

  // Breathe effect for scanning boundaries
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(guideOpacity, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(guideOpacity, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [guideOpacity]);

  // Smooth laser animation loop (scans up and down viewport)
  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [isProcessing, scanLineAnim]);

  // Dynamic tips rotator
  useEffect(() => {
    if (isProcessing) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tipsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isProcessing, tipsList.length]);

  // Handle OCR result completed
  useEffect(() => {
    if (result) {
      onScanCompleted(result, `file:///simulated_cache/form_${selectedTemplate}.jpg`);
    }
  }, [result, onScanCompleted, selectedTemplate]);

  // Request camera permissions on load if not web
  useEffect(() => {
    if (Platform.OS !== 'web' && (!permission || !permission.granted)) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    // Start scanning simulation
    const dummyUri = `file:///app_cache/scanned_page_${selectedTemplate}.jpg`;
    await scanForm(dummyUri, selectedTemplate);
  };

  const templatesInfo = [
    { label: 'Form A (Standard)', desc: 'Hinfahrt, Korrekturen' },
    { label: 'Form B (Rückfahrt)', desc: 'Mitte, Typo-Bereinigung' },
    { label: 'Form C (Hin- & Rück)', desc: 'Beide Checkboxen aktiv' },
    { label: 'Form D (Unvollständig)', desc: 'Keine Fahrtart' },
  ];

  if (!permission && Platform.OS !== 'web') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.statusText}>Kamera-Berechtigungen werden geprüft...</Text>
      </View>
    );
  }

  const cameraActive = permission?.granted && !useSimulator;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Abbrechen</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Formular Scannen</Text>
        <TouchableOpacity
          onPress={() => setFlashlight(!flashlight)}
          style={styles.headerButton}
          disabled={useSimulator}
        >
          <Text style={[styles.headerButtonText, useSimulator && { opacity: 0.3 }]}>
            {flashlight ? 'Blitz Ein' : 'Blitz Aus'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Viewfinder Section */}
      <View style={styles.viewfinderContainer}>
        {cameraActive ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={flashlight}
          />
        ) : (
          // Simulation Feed View
          <View style={styles.simulatorFeed}>
            {/* Mocked form texture in background */}
            <View style={styles.mockFormContainer}>
              <Text style={styles.mockFormTitle}>Verordnung einer Krankenbeförderung</Text>
              <View style={styles.mockFormDivider} />
              <View style={styles.mockFormRow}>
                <View style={styles.mockFormBox}>
                  <Text style={styles.mockFormLabel}>1. Abholort (Patient)</Text>
                  <Text style={styles.mockFormValue}>
                    {templatesInfo[selectedTemplate].label}
                  </Text>
                </View>
              </View>
              <View style={[styles.mockFormRow, { marginTop: 10 }]}>
                <View style={styles.mockFormBox}>
                  <Text style={styles.mockFormLabel}>2. Zielort</Text>
                  <Text style={styles.mockFormValue}>
                    {selectedTemplate === 0 && 'Kinderklinik (KMSerkiinik)'}
                    {selectedTemplate === 1 && 'Krankenbeirderung Station 4'}
                    {selectedTemplate === 2 && 'Physiotherapiezentrum West'}
                    {selectedTemplate === 3 && 'Unfallkrankenhaus Berlin'}
                  </Text>
                </View>
              </View>
              <View style={styles.mockFormCheckboxes}>
                <View style={styles.mockCheckboxItem}>
                  <View style={[styles.mockCheckboxSquare, (selectedTemplate === 0 || selectedTemplate === 2) && styles.mockCheckboxChecked]} />
                  <Text style={styles.mockCheckboxLabel}>Hinfahrt</Text>
                </View>
                <View style={styles.mockCheckboxItem}>
                  <View style={[styles.mockCheckboxSquare, (selectedTemplate === 1 || selectedTemplate === 2) && styles.mockCheckboxChecked]} />
                  <Text style={styles.mockCheckboxLabel}>Rückfahrt</Text>
                </View>
              </View>
            </View>
            <View style={styles.simulatorIndicator}>
              <Text style={styles.simulatorIndicatorText}>SIMULATOR-MODUS AKTIV</Text>
            </View>
          </View>
        )}

        {/* Bounding box guide overlay */}
        <View style={styles.overlayMaskContainer}>
          {/* Top dark block */}
          <View style={styles.maskTop} />
          {/* Center row */}
          <View style={styles.maskCenterRow}>
            <View style={styles.maskSide} />
            <Animated.View style={[
              styles.targetBox, 
              documentDetected && styles.targetBoxActive,
              { 
                borderColor: documentDetected ? Colors.dark.secondary : Colors.dark.outline,
                opacity: guideOpacity 
              }
            ]}>
              {/* Corner Guides */}
              <View style={[styles.cornerGuide, styles.topLeft, { borderColor: documentDetected ? Colors.dark.secondary : Colors.dark.outline }]} />
              <View style={[styles.cornerGuide, styles.topRight, { borderColor: documentDetected ? Colors.dark.secondary : Colors.dark.outline }]} />
              <View style={[styles.cornerGuide, styles.bottomLeft, { borderColor: documentDetected ? Colors.dark.secondary : Colors.dark.outline }]} />
              <View style={[styles.cornerGuide, styles.bottomRight, { borderColor: documentDetected ? Colors.dark.secondary : Colors.dark.outline }]} />

              {/* Scanning red line (animates when processing) */}
              {isProcessing && (
                <Animated.View style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, OVERLAY_HEIGHT - 6]
                      })
                    }]
                  }
                ]} />
              )}
            </Animated.View>
            <View style={styles.maskSide} />
          </View>
          {/* Bottom dark block */}
          <View style={styles.maskBottom} />
        </View>

        {/* Real-time tooltips overlay */}
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipText}>
            {isProcessing
              ? 'Wird analysiert... Bitte ruhig halten'
              : tipsList[currentTip]}
          </Text>
        </View>
      </View>

      {/* Simulator Toggle Button if permissions exist */}
      {permission?.granted && (
        <TouchableOpacity
          onPress={() => setUseSimulator(!useSimulator)}
          style={styles.modeToggleBtn}
        >
          <Text style={styles.modeToggleText}>
            Wechsle zu {useSimulator ? 'Echtzeit-Kamera' : 'Mock-Simulator'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Processing Loader Modal */}
      {isProcessing && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
            <Text style={styles.loaderTitle}>MTS OCR wird ausgeführt</Text>
            <Text style={styles.loaderMessage}>{statusMessage}</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
        </View>
      )}

      {/* Bottom Controls / Template Selector */}
      <View style={styles.controlsContainer}>
        <Text style={styles.selectorLabel}>Test-Vorlage auswählen (Layouts):</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templatesScroll}
        >
          {templatesInfo.map((tpl, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedTemplate(idx)}
              style={[
                styles.templateCard,
                selectedTemplate === idx && styles.templateCardActive,
              ]}
              disabled={isProcessing}
            >
              <Text
                style={[
                  styles.templateText,
                  selectedTemplate === idx && styles.templateTextActive,
                ]}
              >
                {tpl.label}
              </Text>
              <Text
                style={[
                  styles.templateDesc,
                  selectedTemplate === idx && styles.templateDescActive,
                ]}
              >
                {tpl.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 24,
  },
  statusText: {
    color: Colors.dark.textDim,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.surfaceDim,
    borderBottomWidth: 1,
    borderColor: Colors.dark.outline,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: Colors.dark.primaryLight,
    fontSize: 15,
    fontWeight: '600',
  },
  viewfinderContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  simulatorFeed: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockFormContainer: {
    width: OVERLAY_WIDTH * 0.9,
    height: OVERLAY_HEIGHT * 0.9,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  mockFormTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  mockFormDivider: {
    height: 2,
    backgroundColor: '#005EB8',
    marginBottom: 16,
  },
  mockFormRow: {
    marginVertical: 4,
  },
  mockFormBox: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#F1F5F9',
  },
  mockFormLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mockFormValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
  },
  mockFormCheckboxes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
  },
  mockCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockCheckboxSquare: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#334155',
    marginRight: 6,
    borderRadius: 2,
  },
  mockCheckboxChecked: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  mockCheckboxLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#334155',
  },
  simulatorIndicator: {
    position: 'absolute',
    top: 16,
    backgroundColor: Colors.dark.warning,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  simulatorIndicatorText: {
    color: Colors.dark.surfaceDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlayMaskContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  maskTop: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  maskCenterRow: {
    height: OVERLAY_HEIGHT,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  targetBox: {
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    backgroundColor: 'transparent',
    borderWidth: 1,
    position: 'relative',
  },
  targetBoxActive: {
    shadowColor: Colors.dark.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  maskBottom: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  cornerGuide: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.dark.secondary,
    shadowColor: Colors.dark.secondary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
    top: '30%',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  tooltipText: {
    color: Colors.dark.text,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  modeToggleBtn: {
    position: 'absolute',
    top: 76,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.outline,
    zIndex: 10,
  },
  modeToggleText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loaderCard: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.outline,
  },
  loaderTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  loaderMessage: {
    color: Colors.dark.textDim,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.dark.surfaceDim,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.secondary,
  },
  progressPercent: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  controlsContainer: {
    backgroundColor: Colors.dark.surfaceDim,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderColor: Colors.dark.outline,
  },
  selectorLabel: {
    color: Colors.dark.textDim,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  templatesScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  templateCard: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1.5,
    borderColor: Colors.dark.outline,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    width: 140,
  },
  templateCardActive: {
    borderColor: Colors.dark.primaryLight,
    backgroundColor: 'rgba(0, 94, 184, 0.15)',
  },
  templateText: {
    color: Colors.dark.textDim,
    fontSize: 12,
    fontWeight: '700',
  },
  templateTextActive: {
    color: Colors.dark.text,
  },
  templateDesc: {
    color: Colors.dark.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  templateDescActive: {
    color: Colors.dark.textDim,
  },
  captureRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    borderColor: Colors.dark.outline,
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primaryLight,
  },
});

export default MTSCamera;
