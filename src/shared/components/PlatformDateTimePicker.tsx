import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PlatformDateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  minimumDate?: Date;
  onChange: (event: any, date?: Date) => void;
}

export default function PlatformDateTimePicker({
  value,
  mode = 'date',
  display = 'default',
  minimumDate,
  onChange,
}: PlatformDateTimePickerProps) {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      minimumDate={minimumDate}
      onChange={onChange}
    />
  );
}
