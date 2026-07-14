import { Platform, Alert } from 'react-native';
import apiClient from '../../core/services/api/apiClient';

/**
 * Initialize IAP Connection
 */
export const initIAP = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const { initConnection, clearTransactionIOS } = require('react-native-iap');
    await initConnection();
    if (Platform.OS === 'ios') {
      // Clear outstanding transactions on iOS to prevent blocked queues
      await clearTransactionIOS();
    }
    console.log('[IAP] Connection initialized successfully');
    return true;
  } catch (error: any) {
    console.error('[IAP] Connection initialization failed:', error);
    return false;
  }
};

/**
 * Close IAP Connection
 */
export const endIAP = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const { endConnection } = require('react-native-iap');
    await endConnection();
    console.log('[IAP] Connection closed');
  } catch (error) {
    console.error('[IAP] Error closing connection:', error);
  }
};

/**
 * Handle making a subscription purchase
 */
export const purchaseAppleSubscription = async (
  appleProductId: string,
  onVerificationSuccess: () => void
): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;

  let purchaseUpdateSubscription: any;
  let purchaseErrorSubscription: any;

  try {
    const { 
      fetchProducts, 
      requestPurchase, 
      finishTransaction,
      purchaseUpdateListener,
      purchaseErrorListener 
    } = require('react-native-iap');

    // 1. Ensure connection is active
    await initIAP();

    console.log(`[IAP] Requesting subscription for product: ${appleProductId}`);
    
    // 2. Fetch the product details to ensure product is available
    const subscriptions = await fetchProducts({ skus: [appleProductId], type: 'subs' });
    if (!subscriptions || subscriptions.length === 0) {
      throw new Error(`Product ${appleProductId} is not available on the App Store.`);
    }

    // 3. Set up listeners to wait for the purchase update/error asynchronously
    const purchasePromise = new Promise<any>((resolve, reject) => {
      purchaseUpdateSubscription = purchaseUpdateListener(async (purchase: any) => {
        const actualPurchase = Array.isArray(purchase) ? purchase[0] : purchase;
        if (actualPurchase && actualPurchase.productId === appleProductId) {
          resolve(actualPurchase);
        }
      });

      purchaseErrorSubscription = purchaseErrorListener((error: any) => {
        reject(error);
      });
    });

    // 4. Trigger purchase UI dialog
    await requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: appleProductId }
      }
    });

    // 5. Wait for the purchase update to resolve via listeners
    const actualPurchase = await purchasePromise;
    const transactionId = actualPurchase.transactionId;
    if (!transactionId) {
      throw new Error('No transaction ID returned for purchase.');
    }

    console.log(`[IAP] Purchase succeeded. Transaction ID: ${transactionId}. Verifying with backend...`);

    // 6. Send transaction ID to backend for server-to-server validation
    const response = await apiClient.post('/api/subscriptions/apple/verify', {
      transactionId
    }) as any;

    if (response && response.success) {
      console.log('[IAP] Backend verification successful!');
      
      // 7. Acknowledge and finish transaction on Apple side
      await finishTransaction({ purchase: actualPurchase });
      
      Alert.alert('Success', 'Your premium subscription has been activated successfully!');
      onVerificationSuccess();
      return true;
    } else {
      throw new Error(response.message || 'Backend validation of purchase failed.');
    }
  } catch (error: any) {
    console.error('[IAP] Subscription purchase failed:', error);
    
    // Ignore user cancel error
    if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
      console.log('[IAP] Purchase cancelled by user.');
      return false;
    }

    Alert.alert('Subscription Error', error.message || 'An error occurred during purchase.');
    return false;
  } finally {
    // Clean up listeners
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
    }
    await endIAP();
  }
};

/**
 * Restore active Apple purchases
 */
export const restoreApplePurchases = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;

  try {
    const { getAvailablePurchases } = require('react-native-iap');
    const purchases = await getAvailablePurchases();
    if (purchases && purchases.length > 0) {
      const latestPurchase = purchases[purchases.length - 1];
      const transactionId = latestPurchase.transactionId;
      if (transactionId) {
        console.log(`[IAP] Restoring transaction: ${transactionId}`);
        const response = await apiClient.post('/api/subscriptions/apple/verify', {
          transactionId
        }) as any;
        if (response && response.success) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('[IAP] Restore purchases failed:', error);
    throw error;
  }
};

/**
 * Present Apple's native Promo/Offer Code redemption sheet
 */
export const presentRedemptionSheet = async (): Promise<void> => {
  if (Platform.OS !== 'ios') return;
  try {
    const { presentCodeRedemptionSheetIOS } = require('react-native-iap');
    if (presentCodeRedemptionSheetIOS) {
      await presentCodeRedemptionSheetIOS();
      console.log('[IAP] Native code redemption sheet presented');
    } else {
      console.warn('[IAP] presentCodeRedemptionSheetIOS is not available in react-native-iap');
    }
  } catch (error) {
    console.error('[IAP] Present code redemption sheet failed:', error);
    throw error;
  }
};
