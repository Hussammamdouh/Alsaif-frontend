/**
 * LoadingState Component
 * Skeleton loading state for screens
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LoadingStateProps {
  type?: 'list' | 'card' | 'stats' | 'chart';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'list',
  count = 3,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const renderListItem = (index: number) => (
    <Animated.View key={index} style={[styles.listItem, { opacity }]}>
      <View style={styles.listItemAvatar} />
      <View style={styles.listItemContent}>
        <View style={styles.listItemTitle} />
        <View style={styles.listItemSubtitle} />
      </View>
    </Animated.View>
  );

  const renderCard = (index: number) => (
    <Animated.View key={index} style={[styles.card, { opacity }]}>
      <View style={styles.cardHeader} />
      <View style={styles.cardBody} />
      <View style={styles.cardFooter} />
    </Animated.View>
  );

  const renderStatCard = (index: number) => (
    <Animated.View key={index} style={[styles.statCard, { opacity }]}>
      <View style={styles.statLabelSkeleton} />
      <View style={styles.statValueSkeleton} />
      <View style={styles.statTrendSkeleton} />
    </Animated.View>
  );

  const renderChart = () => (
    <Animated.View style={[styles.chartContainer, { opacity }]}>
      <View style={styles.chartHeader} />
      <View style={styles.chart} />
    </Animated.View>
  );

  switch (type) {
    case 'list':
      return (
        <View style={styles.container}>
          {Array.from({ length: count }).map((_, index) => renderListItem(index))}
        </View>
      );

    case 'card':
      return (
        <View style={styles.container}>
          {Array.from({ length: count }).map((_, index) => renderCard(index))}
        </View>
      );

    case 'stats':
      return (
        <View style={styles.statsGrid}>
          {Array.from({ length: count }).map((_, index) => renderStatCard(index))}
        </View>
      );

    case 'chart':
      return <View style={styles.container}>{renderChart()}</View>;

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  listItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    height: 14,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  listItemSubtitle: {
    height: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '40%',
  },
  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    height: 18,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 16,
    width: '40%',
  },
  cardBody: {
    height: 120,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
  },
  cardFooter: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginTop: 16,
    width: '30%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 16,
    height: 110,
  },
  statLabelSkeleton: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '40%',
    marginBottom: 8,
  },
  statValueSkeleton: {
    height: 24,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '70%',
    marginBottom: 12,
  },
  statTrendSkeleton: {
    height: 14,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '30%',
  },
  chartContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    height: 18,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 16,
    width: '50%',
  },
  chart: {
    height: 200,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
  },
});
