import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/providers';
import { ConversationView } from './ConversationView';

interface ConversationScreenProps {
  conversationId: string;
  onNavigateBack: () => void;
  onChatRemoved?: (chatId: string) => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  conversationId,
  onNavigateBack,
  onChatRemoved,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ConversationView
        conversationId={conversationId}
        onNavigateBack={onNavigateBack}
        onChatRemoved={onChatRemoved || ((chatId: string) => onNavigateBack())}
      />
    </SafeAreaView>
  );
};
