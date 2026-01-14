import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/providers';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  trendUp,
  onPress,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(theme, color), [theme, color]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={styles.label}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            {trend && (
              <View style={styles.trendContainer}>
                <View style={[styles.trendBadge, { backgroundColor: trendUp ? theme.success.main + '20' : theme.error.main + '20' }]}>
                  <Ionicons
                    name={trendUp ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={trendUp ? theme.success.main : theme.error.main}
                  />
                  <Text style={[styles.trendText, { color: trendUp ? theme.success.main : theme.error.main }]}>
                    {trend}
                  </Text>
                </View>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            )}
          </View>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={22} color={color} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const createStyles = (theme: any, iconColor: string) => StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '45%',
  },
  container: {
    backgroundColor: theme.background.secondary,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: theme.text.tertiary,
    marginLeft: 6,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
