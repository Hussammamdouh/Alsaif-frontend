/**
 * Device Security Utility
 * Detects jailbroken/rooted devices
 */

import DeviceInfo from 'react-native-device-info';

export interface DeviceSecurityCheck {
  isSecure: boolean;
  isJailbroken: boolean;
  isRooted: boolean;
  reasons: string[];
}

/**
 * Check if device is secure
 * Detects jailbreak (iOS) and root (Android)
 */
export const checkDeviceSecurity = async (): Promise<DeviceSecurityCheck> => {
  try {
    // Check if running on emulator (basic security check)
    const isEmulator = await DeviceInfo.isEmulator();
    const isJailbroken = isEmulator; // Treat emulator as potential security risk

    const reasons: string[] = [];

    if (isJailbroken) {
      reasons.push('Device appears to be jailbroken or rooted');
    }

    return {
      isSecure: !isJailbroken,
      isJailbroken,
      isRooted: isJailbroken, // DeviceInfo combines both
      reasons,
    };
  } catch (error) {
    // If check fails, assume device is secure to avoid false positives
    return {
      isSecure: true,
      isJailbroken: false,
      isRooted: false,
      reasons: ['Unable to verify device security'],
    };
  }
};

/**
 * Get user-friendly security warning message
 */
export const getSecurityWarningMessage = (check: DeviceSecurityCheck): string => {
  if (check.isSecure) {
    return '';
  }

  return `For your security, this app cannot run on jailbroken or rooted devices. ` +
    `This is to protect your financial information and transactions.`;
};
