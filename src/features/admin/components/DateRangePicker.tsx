import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, useLocalization } from '../../../app/providers';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (startDate: Date, endDate: Date) => void;
  label?: string;
}

type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
  label = 'Date Range',
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>('month');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const { isRTL } = useLocalization();
  const styles = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getDateRangeText = (): string => {
    if (selectedPreset === 'today') return 'Today';
    if (selectedPreset === 'week') return 'This Week';
    if (selectedPreset === 'month') return 'This Month';
    if (selectedPreset === 'quarter') return 'This Quarter';
    if (selectedPreset === 'year') return 'This Year';
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const applyPreset = (preset: Preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let newStartDate: Date;
    let newEndDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (preset) {
      case 'today':
        newStartDate = new Date(today);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - dayOfWeek);
        break;
      case 'month':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        newStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'year':
        newStartDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        setSelectedPreset('custom');
        return;
    }

    setSelectedPreset(preset);
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
  };

  const handleApply = () => {
    onRangeChange(tempStartDate, tempEndDate);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowModal(false);
  };

  const renderPresetButton = (preset: Preset, label: string) => (
    <TouchableOpacity
      key={preset}
      style={[
        styles.presetButton,
        selectedPreset === preset && styles.presetButtonActive,
      ]}
      onPress={() => applyPreset(preset)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.presetButtonText,
          selectedPreset === preset && styles.presetButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={20} color={theme.primary.main} />
        <Text style={styles.pickerButtonText}>{getDateRangeText()}</Text>
        <Ionicons name="chevron-down" size={18} color={theme.text.tertiary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Range</Text>
              <TouchableOpacity onPress={handleApply} activeOpacity={0.7}>
                <Text style={styles.modalApplyButton}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <View style={styles.presetsContainer}>
              <Text style={styles.sectionTitle}>Quick Select</Text>
              <View style={styles.presetsGrid}>
                {renderPresetButton('today', 'Today')}
                {renderPresetButton('week', 'Week')}
                {renderPresetButton('month', 'Month')}
                {renderPresetButton('quarter', 'Quarter')}
                {renderPresetButton('year', 'Year')}
                {renderPresetButton('custom', 'Custom')}
              </View>
            </View>

            {/* Custom Date Selection */}
            {selectedPreset === 'custom' && (
              <View style={styles.customDatesContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>From</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateInputText}>{formatDate(tempStartDate)}</Text>
                    <Ionicons name="calendar-outline" size={18} color={theme.primary.main} />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateInputText}>{formatDate(tempEndDate)}</Text>
                    <Ionicons name="calendar-outline" size={18} color={theme.primary.main} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={tempStartDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) setTempStartDate(selectedDate);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={tempEndDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) setTempEndDate(selectedDate);
            }}
          />
        )}
      </Modal>
    </View>
  );
};

const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: isRTL ? 'right' : 'left',
  },
  pickerButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.background.tertiary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  pickerButtonText: {
    flex: 1,
    [isRTL ? 'marginRight' : 'marginLeft']: 12,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.background.secondary,
    borderRadius: 24,
    paddingBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  modalHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
    backgroundColor: theme.background.tertiary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: 'center',
  },
  modalCancelButton: {
    fontSize: 16,
    color: theme.text.tertiary,
    fontWeight: '600',
  },
  modalApplyButton: {
    fontSize: 16,
    color: theme.primary.main,
    fontWeight: '700',
  },
  presetsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.secondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    textAlign: isRTL ? 'right' : 'left',
  },
  presetsGrid: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.background.tertiary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  presetButtonActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  presetButtonTextActive: {
    color: theme.primary.contrast,
  },
  customDatesContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border.main,
    gap: 16,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  dateInputContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    width: 50,
  },
  dateInput: {
    flex: 1,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.background.tertiary,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  dateInputText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
