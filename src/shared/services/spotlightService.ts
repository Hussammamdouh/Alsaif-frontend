import { Platform } from 'react-native';
import { requireNativeModule } from 'expo';

/**
 * iOS Spotlight Search Service
 * Indexes content in the Apple search directory to enable deep links from outside the app
 */

// Dynamically resolve the native module on iOS only to prevent web/android import crashes
const getSpotlightModule = () => {
  if (Platform.OS === 'ios') {
    try {
      // Pre-flight check: see if the native module is actually compiled into the binary
      const nativeModule = requireNativeModule('ExpoCoreSpotlight');
      if (nativeModule) {
        return require('expo-core-spotlight').default;
      }
    } catch (e) {
      console.warn('[SpotlightService] ExpoCoreSpotlight native module is not compiled in this binary:', e);
    }
  }
  return null;
};

/**
 * Index a list of Disclosures in Spotlight
 */
export const indexDisclosuresInSpotlight = async (disclosures: any[]): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  try {
    const ExpoCoreSpotlight = getSpotlightModule();
    if (!ExpoCoreSpotlight) return;

    const isAvail = await ExpoCoreSpotlight.isAvailable();
    if (!isAvail) return;

    const items = disclosures.map((disc) => {
      const discId = disc.id || disc._id;
      const title = disc.title || disc.titleEn || 'Corporate Disclosure';
      const company = disc.companyName || disc.companyNameEn || '';
      const exchange = disc.exchange || '';

      return {
        uniqueIdentifier: `disclosure_${discId}`,
        title: `${company} (${exchange})`,
        contentDescription: title,
        url: `alsaif-analysis://disclosure/${discId}`,
        domainIdentifier: 'com.alsaifanalysis.disclosures',
        keywords: [company, exchange, 'disclosure', 'stock', 'report', 'financial'],
      };
    });

    await ExpoCoreSpotlight.indexItems(items);
    console.log('[SpotlightService] Successfully indexed disclosures count:', items.length);
  } catch (error) {
    console.warn('[SpotlightService] Failed to index disclosures in Spotlight:', error);
  }
};

/**
 * Index a specific Stock Symbol in Spotlight
 */
export const indexMarketSymbolInSpotlight = async (
  symbol: string,
  companyName: string,
  exchange: 'DFM' | 'ADX'
): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  try {
    const ExpoCoreSpotlight = getSpotlightModule();
    if (!ExpoCoreSpotlight) return;

    const isAvail = await ExpoCoreSpotlight.isAvailable();
    if (!isAvail) return;

    const item = {
      uniqueIdentifier: `market_${symbol}`,
      title: `${symbol} - ${companyName}`,
      contentDescription: `Live stock price, charts, and analysis on the ${exchange} exchange.`,
      url: `alsaif-analysis://market`,
      domainIdentifier: 'com.alsaifanalysis.market',
      keywords: [symbol, companyName, exchange, 'stock', 'price', 'ticker', 'share'],
    };

    await ExpoCoreSpotlight.indexItem(item);
    console.log('[SpotlightService] Successfully indexed symbol:', symbol);
  } catch (error) {
    console.warn('[SpotlightService] Failed to index symbol in Spotlight:', error);
  }
};

/**
 * Clear all indexed items from Spotlight search index
 */
export const clearAllSpotlightItems = async (): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  try {
    const ExpoCoreSpotlight = getSpotlightModule();
    if (!ExpoCoreSpotlight) return;

    const isAvail = await ExpoCoreSpotlight.isAvailable();
    if (!isAvail) return;

    await ExpoCoreSpotlight.removeAllItems();
    console.log('[SpotlightService] Cleared all Spotlight indexed items successfully.');
  } catch (error) {
    console.warn('[SpotlightService] Failed to clear items from Spotlight:', error);
  }
};
