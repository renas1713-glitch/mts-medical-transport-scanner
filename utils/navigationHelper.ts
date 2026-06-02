import { Linking, Platform, Alert } from 'react-native';

/**
 * Triggers external map navigation to a specific address.
 * Standardizes behavior for iOS (Apple Maps or Google Maps) and Android (Google Maps).
 * 
 * @param address The formatted address string to navigate to.
 * @param provider Choice of map provider ('google' | 'apple' | 'default')
 */
export const openMapsWithAddress = async (
  address: string,
  provider: 'google' | 'apple' | 'default' = 'default'
): Promise<boolean> => {
  if (!address || address.trim() === '') {
    Alert.alert('Fehler', 'Ungültige Adresse für die Navigation angegeben.');
    return false;
  }

  const encodedAddress = encodeURIComponent(address.trim());
  let url = '';

  if (Platform.OS === 'ios') {
    if (provider === 'apple') {
      url = `maps://?q=${encodedAddress}`;
    } else if (provider === 'google') {
      url = `comgooglemaps://?q=${encodedAddress}`;
    } else {
      // Default: Fallback to Apple Maps, but check if we can open
      url = `maps://?q=${encodedAddress}`;
    }
  } else {
    // Android default
    url = `geo:0,0?q=${encodedAddress}`;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to web link if native app is not available
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (error) {
    console.error('Error opening navigation:', error);
    // Absolute fallback
    try {
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      await Linking.openURL(webUrl);
      return true;
    } catch (fallbackError) {
      Alert.alert('Fehler', 'Navigation konnte nicht gestartet werden.');
      return false;
    }
  }
};
