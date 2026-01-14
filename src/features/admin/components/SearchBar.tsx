import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search...',
  debounceMs = 300,
  loading = false,
  autoFocus = false,
}) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState(value);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color={theme.text.tertiary} style={styles.searchIcon} />

        <TextInput
          style={styles.input}
          value={localValue}
          onChangeText={setLocalValue}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="search"
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.primary.main}
            style={styles.loadingIndicator}
          />
        )}

        {localValue.length > 0 && !loading && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.filterButton}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={24} color={theme.primary.main} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    paddingVertical: 0, // Important for Android to prevent text cutting
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  filterButton: {
    marginLeft: 12,
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
});
