import { useState, useCallback } from 'react';

export interface CoordinateBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MTSFormData {
  abholort: string;
  zielort: string;
  fahrtart: 'Hinfahrt' | 'Rückfahrt' | 'Hin- & Rückfahrt' | 'Nicht angegeben';
  hinfahrtBoxChecked: boolean;
  rueckfahrtBoxChecked: boolean;
  confidence: number;
  file: string;
  coordinates: {
    pickup: CoordinateBox;
    destination: CoordinateBox;
    hinfahrt: CoordinateBox;
    rueckfahrt: CoordinateBox;
  };
  rawDetails: {
    ocrLinesProcessed: number;
    typosCorrectedCount: number;
    hinfahrtDarkRatio: number;
    rueckfahrtDarkRatio: number;
  };
}

const MOCK_FORMS: MTSFormData[] = [
  {
    abholort: 'Ambulantes Kinderzentrum, Nordufer 20, 13353 Berlin',
    zielort: 'Kinderklinik, Neuropädiatrie, Wedding',
    fahrtart: 'Hinfahrt',
    hinfahrtBoxChecked: true,
    rueckfahrtBoxChecked: false,
    confidence: 0.94,
    file: '23.jpeg',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 14,
      typosCorrectedCount: 2, // KMSerkiinik -> Kinderklinik, Neurop&atrie -> Neuropädiatrie
      hinfahrtDarkRatio: 0.28,
      rueckfahrtDarkRatio: 0.02
    }
  },
  {
    abholort: 'Seniorenheim St. Elisabeth, Hauptstraße 45, 10827 Berlin',
    zielort: 'Krankenbeförderung Station 4, Charité Campus Mitte, Luisenstraße 65',
    fahrtart: 'Rückfahrt',
    hinfahrtBoxChecked: false,
    rueckfahrtBoxChecked: true,
    confidence: 0.91,
    file: 'form_sample_02.jpeg',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 12,
      typosCorrectedCount: 1, // Krankenbeirderung -> Krankenbeförderung
      hinfahrtDarkRatio: 0.01,
      rueckfahrtDarkRatio: 0.35
    }
  },
  {
    abholort: 'Arztpraxis Dr. Müller, Kurfürstendamm 120, 10711 Berlin',
    zielort: 'Physiotherapiezentrum West, Kaiser-Friedrich-Straße 12, 10585 Berlin',
    fahrtart: 'Hin- & Rückfahrt',
    hinfahrtBoxChecked: true,
    rueckfahrtBoxChecked: true,
    confidence: 0.97,
    file: 'form_sample_03.jpeg',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 16,
      typosCorrectedCount: 0,
      hinfahrtDarkRatio: 0.31,
      rueckfahrtDarkRatio: 0.29
    }
  },
  {
    abholort: 'Kaiserstraße 18, 12099 Berlin',
    zielort: 'Unfallkrankenhaus Berlin, Warener Str. 7, 12683 Berlin',
    fahrtart: 'Nicht angegeben',
    hinfahrtBoxChecked: false,
    rueckfahrtBoxChecked: false,
    confidence: 0.88,
    file: 'form_sample_04.jpeg',
    coordinates: {
      pickup: { x: 200, y: 400, width: 350, height: 80 },
      destination: { x: 200, y: 1030, width: 400, height: 50 },
      hinfahrt: { x: 693, y: 344, width: 34, height: 35 },
      rueckfahrt: { x: 696, y: 393, width: 33, height: 35 }
    },
    rawDetails: {
      ocrLinesProcessed: 11,
      typosCorrectedCount: 0,
      hinfahrtDarkRatio: 0.03,
      rueckfahrtDarkRatio: 0.02
    }
  }
];

export const useMTSOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<MTSFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanForm = useCallback(async (imageUri: string, templateIndex?: number) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const steps = [
      { progress: 10, message: 'Initialisiere OCR-Engine...' },
      { progress: 30, message: 'Lese Grayscale-Bilddaten & wende Autokontrast an...' },
      { progress: 50, message: 'Suche Bounding-Boxes (Abholort X:200-550 Y:400-480)...' },
      { progress: 70, message: 'Lese Zielort (X:200-600 Y:1030-1080)...' },
      { progress: 85, message: 'Prüfe Checkboxen (Hinfahrt & Rückfahrt)...' },
      { progress: 95, message: 'Wende Autokorrekturen (KMSerkiinik -> Kinderklinik)...' },
      { progress: 100, message: 'Fertig!' }
    ];

    // Pick a random mock form or use the provided template index
    const formIndex = templateIndex !== undefined && templateIndex >= 0 && templateIndex < MOCK_FORMS.length
      ? templateIndex 
      : Math.floor(Math.random() * MOCK_FORMS.length);
    const mockData = MOCK_FORMS[formIndex];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 300 : 400));
      setProgress(steps[i].progress);
      setStatusMessage(steps[i].message);
    }

    setResult({
      ...mockData,
      file: imageUri.split('/').pop() || 'captured_form.jpg'
    });
    setIsProcessing(false);
  }, []);

  const resetScanner = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage('');
    setResult(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    progress,
    statusMessage,
    result,
    error,
    scanForm,
    resetScanner,
    mockTemplatesCount: MOCK_FORMS.length
  };
};

export default useMTSOCR;
