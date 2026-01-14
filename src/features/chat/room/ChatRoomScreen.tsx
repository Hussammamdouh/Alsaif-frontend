/**
 * Chat Room Screen (Placeholder)
 * Will be implemented in the next phase
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

interface ChatRoomScreenProps {
  conversationId: string;
  onNavigateBack: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  conversationId,
  onNavigateBack,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Chat Room</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Placeholder Content */}
      <View style={styles.content}>
        <Icon name="chatbubbles-outline" size={80} color="#E5E7EB" />
        <Text style={styles.placeholderTitle}>Chat Room</Text>
        <Text style={styles.placeholderText}>
          Conversation ID: {conversationId}
        </Text>
        <Text style={styles.placeholderSubtext}>
          This screen will be implemented in the next phase
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
