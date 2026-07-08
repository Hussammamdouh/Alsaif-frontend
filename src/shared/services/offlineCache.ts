import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLOSURES_CACHE_KEY_PREFIX = 'elsaif_cache_disclosures_';
const MARKET_DATA_CACHE_KEY = 'elsaif_cache_market_data';
const CACHE_TIME_KEY_PREFIX = 'elsaif_cache_time_';

/**
 * Save Disclosures Feed to local storage cache
 */
export const saveDisclosuresToCache = async (exchange: string, data: any[]): Promise<void> => {
  try {
    const key = `${DISCLOSURES_CACHE_KEY_PREFIX}${exchange}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(`${CACHE_TIME_KEY_PREFIX}${key}`, Date.now().toString());
  } catch (e) {
    console.warn('[OfflineCache] Failed to save disclosures to cache:', e);
  }
};

/**
 * Read cached disclosures from storage
 */
export const getDisclosuresFromCache = async (
  exchange: string
): Promise<{ data: any[]; timestamp: number | null }> => {
  try {
    const key = `${DISCLOSURES_CACHE_KEY_PREFIX}${exchange}`;
    const data = await AsyncStorage.getItem(key);
    const timeStr = await AsyncStorage.getItem(`${CACHE_TIME_KEY_PREFIX}${key}`);
    return {
      data: data ? JSON.parse(data) : [],
      timestamp: timeStr ? parseInt(timeStr) : null,
    };
  } catch (e) {
    console.warn('[OfflineCache] Failed to load disclosures from cache:', e);
    return { data: [], timestamp: null };
  }
};

/**
 * Save Market Tickers data to local storage cache
 */
export const saveMarketDataToCache = async (data: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MARKET_DATA_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(`${CACHE_TIME_KEY_PREFIX}${MARKET_DATA_CACHE_KEY}`, Date.now().toString());
  } catch (e) {
    console.warn('[OfflineCache] Failed to save market data to cache:', e);
  }
};

/**
 * Read cached market tickers data from storage
 */
export const getMarketDataFromCache = async (): Promise<{ data: any[]; timestamp: number | null }> => {
  try {
    const data = await AsyncStorage.getItem(MARKET_DATA_CACHE_KEY);
    const timeStr = await AsyncStorage.getItem(`${CACHE_TIME_KEY_PREFIX}${MARKET_DATA_CACHE_KEY}`);
    return {
      data: data ? JSON.parse(data) : [],
      timestamp: timeStr ? parseInt(timeStr) : null,
    };
  } catch (e) {
    console.warn('[OfflineCache] Failed to load market data from cache:', e);
    return { data: [], timestamp: null };
  }
};
