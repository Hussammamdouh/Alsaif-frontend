/**
 * UpgradePrompt Component
 * Displays a prompt to upgrade subscription when content is locked
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionTier } from './subscription.types';
import { TIER_COLORS } from './subscription.constants';

interface UpgradePromptProps {
  requiredTier: SubscriptionTier;
  message?: string;
  style?: any;
}

/**
 * UpgradePrompt
 * Shows a locked content message with a button to navigate to subscription screen
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredTier,
  message,
  style,
}) => {
  const navigation = useNavigation();

  const tierColor = TIER_COLORS[requiredTier] || TIER_COLORS.premium;
  const tierName = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

  const defaultMessage = `This content requires ${tierName} subscription or higher.`;

  const handleUpgradePress = () => {
    navigation.navigate('Subscription' as never);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: `${tierColor}20` }]}>
        <Ionicons name="lock-closed" size={32} color={tierColor} />
      </View>

      <Text style={styles.title}>Premium Content</Text>
      <Text style={styles.message}>{message || defaultMessage}</Text>

      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: tierColor }]}
        onPress={handleUpgradePress}
        activeOpacity={0.8}
      >
        <Ionicons name="rocket" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>
        Unlock unlimited access to premium insights and features
      </Text>
    </View>
  );
};

/**
 * UpgradePromptInline
 * Compact inline version for use in lists
 */
export const UpgradePromptInline: React.FC<UpgradePromptProps> = ({
  requiredTier,
  message,
  style,
}) => {
  const navigation = useNavigation();

  const tierColor = TIER_COLORS[requiredTier] || TIER_COLORS.premium;
  const tierName = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

  const handleUpgradePress = () => {
    navigation.navigate('Subscription' as never);
  };

  return (
    <View style={[styles.inlineContainer, style]}>
      <View style={styles.inlineContent}>
        <Ionicons name="lock-closed" size={18} color={tierColor} style={styles.inlineLock} />
        <Text style={styles.inlineText} numberOfLines={1}>
          {message || `${tierName} subscription required`}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.inlineButton, { borderColor: tierColor }]}
        onPress={handleUpgradePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.inlineButtonText, { color: tierColor }]}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Full upgrade prompt styles
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  helperText: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
  },

  // Inline upgrade prompt styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  inlineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineLock: {
    marginRight: 8,
  },
  inlineText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  inlineButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  inlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
