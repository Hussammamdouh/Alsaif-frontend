import React from 'react';

interface PlatformDateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  minimumDate?: Date;
  onChange: (event: any, date?: Date) => void;
}

export default function PlatformDateTimePicker(props: PlatformDateTimePickerProps) {
  return null;
}
