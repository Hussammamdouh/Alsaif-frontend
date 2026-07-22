import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../../shared/components/PlatformDateTimePicker';
import { useTheme, useLocalization } from '../../../app/providers';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (startDate: Date, endDate: Date) => void;
  label?: string;
  selectedPreset?: Preset;
  onPresetChange?: (preset: Preset) => void;
}

export type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
  label = 'Date Range',
  selectedPreset: propSelectedPreset,
  onPresetChange,
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [localSelectedPreset, setLocalSelectedPreset] = useState<Preset>('year');
  
  const selectedPreset = propSelectedPreset !== undefined ? propSelectedPreset : localSelectedPreset;
  const setSelectedPreset = onPresetChange !== undefined ? onPresetChange : setLocalSelectedPreset;
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const { isRTL } = useLocalization();
  const styles = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);

  // Sync temp dates with props only when the modal opens
  React.useEffect(() => {
    if (showModal) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [showModal]);

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    
    // Quick presets apply immediately
    onRangeChange(newStartDate, newEndDate);
    setShowModal(false);
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
        transparent={true}
        animationType="fade"
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
                  {Platform.OS === 'web' ? (
                    <View style={styles.dateInput}>
                      {React.createElement('input', {
                        type: 'date',
                        value: formatLocalDate(tempStartDate),
                        onChange: (e: any) => {
                          const val = e.target.value;
                          if (val) {
                            const parts = val.split('-');
                            if (parts.length === 3) {
                              const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                              if (!isNaN(date.getTime())) {
                                setTempStartDate(date);
                              }
                            }
                          }
                        },
                        style: {
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          color: theme.text.primary,
                          fontSize: '15px',
                          fontWeight: '600',
                          fontFamily: 'inherit',
                          padding: 0,
                        }
                      })}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowStartPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateInputText}>{formatDate(tempStartDate)}</Text>
                      <Ionicons name="calendar-outline" size={18} color={theme.primary.main} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>To</Text>
                  {Platform.OS === 'web' ? (
                    <View style={styles.dateInput}>
                      {React.createElement('input', {
                        type: 'date',
                        value: formatLocalDate(tempEndDate),
                        onChange: (e: any) => {
                          const val = e.target.value;
                          if (val) {
                            const parts = val.split('-');
                            if (parts.length === 3) {
                              const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                              if (!isNaN(date.getTime())) {
                                setTempEndDate(date);
                              }
                            }
                          }
                        },
                        style: {
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          color: theme.text.primary,
                          fontSize: '15px',
                          fontWeight: '600',
                          fontFamily: 'inherit',
                          padding: 0,
                        }
                      })}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowEndPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateInputText}>{formatDate(tempEndDate)}</Text>
                      <Ionicons name="calendar-outline" size={18} color={theme.primary.main} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Android Date Pickers */}
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker
            value={tempStartDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setTempStartDate(selectedDate);
            }}
          />
        )}
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker
            value={tempEndDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setTempEndDate(selectedDate);
            }}
          />
        )}

        {/* iOS Date Picker Modal Sheet */}
        {Platform.OS === 'ios' && (showStartPicker || showEndPicker) && (
          <Modal
            transparent={true}
            visible={true}
            animationType="slide"
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: theme.background.secondary, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: theme.border.main }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: theme.border.main, backgroundColor: theme.background.tertiary, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                  <TouchableOpacity onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}>
                    <Text style={{ fontSize: 16, color: theme.text.tertiary, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, color: theme.text.primary, fontWeight: '700' }}>
                    {showStartPicker ? 'Select Start Date' : 'Select End Date'}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}>
                    <Text style={{ fontSize: 16, color: theme.primary.main, fontWeight: '700' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={showStartPicker ? tempStartDate : tempEndDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (showStartPicker) setTempStartDate(selectedDate);
                      else setTempEndDate(selectedDate);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
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
