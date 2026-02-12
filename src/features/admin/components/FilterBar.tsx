import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  icon?: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string | number | boolean;
  onSelect: (value: string | number | boolean) => void;
  label?: string;
  showCounts?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  selectedValue,
  onSelect,
  label,
  showCounts = false,
}) => {
  const { theme } = useTheme();
  const { isRTL } = useLocalization();
  const styles = createLocalStyles(theme, isRTL);

  const renderFilterChip = (option: FilterOption) => {
    const isSelected = option.value === selectedValue;

    return (
      <TouchableOpacity
        key={String(option.value)}
        style={[styles.chip, isSelected && styles.chipActive]}
        onPress={() => onSelect(option.value)}
        activeOpacity={0.7}
      >
        {option.icon && (
          <Ionicons
            name={option.icon as any}
            size={16}
            color={isSelected ? theme.primary.contrast : theme.primary.main}
            style={styles.chipIcon}
          />
        )}
        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
          {option.label}
        </Text>
        {showCounts && option.count !== undefined && (
          <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
            <Text style={[styles.countText, isSelected && styles.countTextActive]}>
              {option.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map(renderFilterChip)}
      </ScrollView>
    </View>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
    [isRTL ? 'marginRight' : 'marginLeft']: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: isRTL ? 'right' : 'left',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  chip: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  chipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chipIcon: {
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    textAlign: isRTL ? 'right' : 'left',
  },
  chipTextActive: {
    color: theme.primary.contrast,
    fontWeight: '700',
  },
  countBadge: {
    [isRTL ? 'marginRight' : 'marginLeft']: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: theme.background.tertiary,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.tertiary,
  },
  countTextActive: {
    color: theme.primary.contrast,
  },
});
