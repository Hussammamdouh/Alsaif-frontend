import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  clearTransactionIOS,
  fetchProducts,
  requestPurchase,
  finishTransaction
} from 'react-native-iap';
import apiClient from '../../core/services/api/apiClient';

/**
 * Initialize IAP Connection
 */
export const initIAP = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
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

  try {
    // 1. Ensure connection is active
    await initIAP();

    console.log(`[IAP] Requesting subscription for product: ${appleProductId}`);
    
    // 2. Fetch the product details to ensure product is available
    const subscriptions = await fetchProducts({ skus: [appleProductId], type: 'subs' });
    if (!subscriptions || subscriptions.length === 0) {
      throw new Error(`Product ${appleProductId} is not available on the App Store.`);
    }

    // 3. Trigger purchase
    const purchase = await requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: appleProductId }
      }
    });
    
    if (!purchase) {
      throw new Error('Purchase request returned empty response.');
    }

    // Handle array response or single object depending on react-native-iap version
    const actualPurchase = Array.isArray(purchase) ? purchase[0] : purchase;
    const transactionId = actualPurchase.transactionId;
    if (!transactionId) {
      throw new Error('No transaction ID returned for purchase.');
    }

    console.log(`[IAP] Purchase succeeded. Transaction ID: ${transactionId}. Verifying with backend...`);

    // 4. Send transaction ID to backend for server-to-server validation
    const response = await apiClient.post('/api/subscriptions/apple/verify', {
      transactionId
    }) as any;

    if (response && response.success) {
      console.log('[IAP] Backend verification successful!');
      
      // 5. Acknowledge and finish transaction on Apple side
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
    await endIAP();
  }
};
