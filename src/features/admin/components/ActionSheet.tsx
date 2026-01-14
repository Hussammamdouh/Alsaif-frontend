/**
 * ActionSheet Component
 * Bottom sheet with action options (edit, delete, view, etc.)
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ActionSheetOption {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
  message?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  options,
  title,
  message,
}) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (!option.disabled) {
      option.onPress();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {(title || message) && (
                <View style={styles.header}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {message && <Text style={styles.message}>{message}</Text>}
                </View>
              )}

              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      index === 0 && (title || message) && styles.optionFirst,
                      index === options.length - 1 && styles.optionLast,
                      option.disabled && styles.optionDisabled,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.7}
                    disabled={option.disabled}
                  >
                    {option.icon && (
                      <Ionicons
                        name={option.icon as any}
                        size={22}
                        color={
                          option.disabled
                            ? '#c7c7cc'
                            : option.destructive
                            ? '#ff3b30'
                            : '#007aff'
                        }
                        style={styles.optionIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        option.destructive && styles.optionTextDestructive,
                        option.disabled && styles.optionTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#f2f2f7',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 34,
    paddingHorizontal: 8,
  },
  header: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#c6c6c8',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#c6c6c8',
  },
  optionFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  optionLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 17,
    color: '#007aff',
    fontWeight: '400',
  },
  optionTextDestructive: {
    color: '#ff3b30',
  },
  optionTextDisabled: {
    color: '#8e8e93',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#007aff',
    fontWeight: '600',
  },
});
