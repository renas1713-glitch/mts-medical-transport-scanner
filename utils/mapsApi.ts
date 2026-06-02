export interface VerificationResult {
  success: boolean;
  formattedAddress: string;
  lat?: number;
  lng?: number;
  error?: string;
}

/**
 * Verifies an address using the Google Maps Geocoding API if a valid key is provided.
 * Falls back to a mock verification simulator if using a placeholder key.
 */
export const verifyAddress = async (address: string): Promise<VerificationResult> => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isRealKey = !!(
    apiKey && 
    !apiKey.includes('Placeholder') && 
    apiKey.trim() !== ''
  );

  if (!address.trim()) {
    return {
      success: false,
      formattedAddress: '',
      error: 'Adresse darf nicht leer sein.'
    };
  }

  if (isRealKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          formattedAddress: result.formatted_address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        };
      } else {
        return {
          success: false,
          formattedAddress: address,
          error: `Google Maps Geocoding API error status: ${data.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        formattedAddress: address,
        error: err.message || 'Network request failed'
      };
    }
  } else {
    // Simulated validation fallback (placeholder key / unconfigured)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic capitalization cleanup
    let formatted = address
      .trim()
      .replace(/\s+/g, ' '); // collapse extra spaces

    // Append country if not present
    const lower = formatted.toLowerCase();
    if (!lower.includes('deutschland') && !lower.includes('germany') && !lower.includes(', de')) {
      formatted += ', Deutschland';
    }

    // Generate mock coordinates around Berlin (52.5200° N, 13.4050° E)
    let hash = 0;
    for (let i = 0; i < formatted.length; i++) {
      hash = formatted.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 52.52 + (Math.abs(hash % 100) / 1000);
    const lng = 13.40 + (Math.abs((hash >> 3) % 100) / 1000);

    return {
      success: true,
      formattedAddress: formatted,
      lat,
      lng
    };
  }
};
