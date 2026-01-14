# Subscription Access Control Integration Guide

This guide shows how to integrate subscription-based access control throughout the app.

## Table of Contents
- [Quick Start](#quick-start)
- [Access Control Hook](#access-control-hook)
- [Upgrade Prompt Components](#upgrade-prompt-components)
- [Common Use Cases](#common-use-cases)
- [Examples](#examples)

## Quick Start

Import the necessary utilities:

```typescript
import {
  useSubscriptionAccess,
  UpgradePrompt,
  UpgradePromptInline,
} from '../../features/subscription';
```

## Access Control Hook

The `useSubscriptionAccess` hook provides comprehensive access control utilities.

### Available Properties

```typescript
const {
  // Subscription state
  subscription,           // Current subscription object
  loading,               // Loading state
  currentTier,           // Current subscription tier ('free', 'basic', etc.)

  // Access checks (functions)
  hasTierAccess,         // Check if user has access to specific tier
  hasActiveSubscription, // Check if user has any paid subscription
  hasPremiumAccess,      // Check if user has at least 'basic' tier
  hasProAccess,          // Check if user has at least 'premium' tier
  hasEnterpriseAccess,   // Check if user has 'enterprise' tier
  canAccessInsight,      // Check insight access ('free' | 'premium')

  // Subscription status
  isExpiringSoon,        // Is subscription expiring within warning period
  daysRemaining,         // Days left on subscription
  canUpgrade,            // Can user upgrade
  shouldPromptUpgrade,   // Should show upgrade prompts

  // Utilities
  getUpgradeMessage,     // Get formatted upgrade message
} = useSubscriptionAccess();
```

## Upgrade Prompt Components

### UpgradePrompt (Full)

Use this for dedicated screens or when content is completely locked:

```typescript
<UpgradePrompt
  requiredTier="premium"
  message="Custom message here (optional)"
  style={{ marginTop: 20 }} // optional
/>
```

### UpgradePromptInline

Use this in lists or compact spaces:

```typescript
<UpgradePromptInline
  requiredTier="basic"
  message="Subscribe to view full content"
/>
```

## Common Use Cases

### 1. Locking Individual Content Items

**Scenario**: Show locked insight cards in a list

```typescript
import { useSubscriptionAccess, UpgradePromptInline } from '../../features/subscription';

const InsightCard = ({ insight }) => {
  const { canAccessInsight } = useSubscriptionAccess();
  const hasAccess = canAccessInsight(insight.type);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{insight.title}</Text>

      {hasAccess ? (
        <Text style={styles.content}>{insight.content}</Text>
      ) : (
        <UpgradePromptInline requiredTier="basic" />
      )}
    </View>
  );
};
```

### 2. Conditional Feature Rendering

**Scenario**: Show/hide features based on tier

```typescript
const ProfileScreen = () => {
  const { hasProAccess, currentTier } = useSubscriptionAccess();

  return (
    <View>
      <Text>Your Tier: {currentTier}</Text>

      {hasProAccess && (
        <AdvancedAnalytics />
      )}

      {!hasProAccess && (
        <UpgradePrompt
          requiredTier="premium"
          message="Unlock advanced analytics with Pro subscription"
        />
      )}
    </View>
  );
};
```

### 3. Gating Entire Screens

**Scenario**: Prevent navigation to premium screens

```typescript
const PremiumInsightScreen = () => {
  const { hasPremiumAccess } = useSubscriptionAccess();

  if (!hasPremiumAccess) {
    return (
      <View style={styles.container}>
        <UpgradePrompt requiredTier="basic" />
      </View>
    );
  }

  return <PremiumContent />;
};
```

### 4. Show Expiry Warnings

**Scenario**: Warn users about expiring subscriptions

```typescript
const SubscriptionBanner = () => {
  const { isExpiringSoon, daysRemaining } = useSubscriptionAccess();

  if (!isExpiringSoon) return null;

  return (
    <View style={styles.warningBanner}>
      <Icon name="warning" />
      <Text>
        Your subscription expires in {daysRemaining} days. Renew now!
      </Text>
    </View>
  );
};
```

### 5. Dynamic Button Text

**Scenario**: Change button behavior based on access

```typescript
const InsightDetailScreen = ({ insight }) => {
  const {
    canAccessInsight,
    getUpgradeMessage,
  } = useSubscriptionAccess();
  const navigation = useNavigation();

  const hasAccess = canAccessInsight(insight.type);

  const handlePress = () => {
    if (hasAccess) {
      // Show content
      navigation.navigate('InsightDetail', { id: insight.id });
    } else {
      // Navigate to subscription screen
      navigation.navigate('Subscription');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{hasAccess ? 'View Insight' : 'Upgrade to View'}</Text>
    </TouchableOpacity>
  );
};
```

### 6. Checking Multiple Tiers

**Scenario**: Show different content for different tiers

```typescript
const DashboardScreen = () => {
  const { hasTierAccess } = useSubscriptionAccess();

  return (
    <View>
      {/* Free tier content */}
      <BasicStats />

      {/* Basic tier and above */}
      {hasTierAccess('basic') && <PremiumInsights />}

      {/* Premium tier and above */}
      {hasTierAccess('premium') && <AdvancedCharts />}

      {/* Enterprise only */}
      {hasTierAccess('enterprise') && <WhiteLabelOptions />}
    </View>
  );
};
```

### 7. Integrating with Chat/Insights Feed

**Scenario**: Filter or lock premium insights in a feed

```typescript
const InsightsFeed = () => {
  const { canAccessInsight, shouldPromptUpgrade } = useSubscriptionAccess();
  const [insights, setInsights] = useState([]);

  return (
    <ScrollView>
      {shouldPromptUpgrade && (
        <UpgradePrompt requiredTier="basic" style={{ margin: 16 }} />
      )}

      {insights.map((insight) => {
        const hasAccess = canAccessInsight(insight.type);

        return (
          <InsightCard
            key={insight.id}
            insight={insight}
            locked={!hasAccess}
            onPress={() => {
              if (!hasAccess) {
                navigation.navigate('Subscription');
              }
            }}
          />
        );
      })}
    </ScrollView>
  );
};
```

## Examples

### Complete Example: Premium Insight Screen

```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  useSubscriptionAccess,
  UpgradePrompt,
  UpgradePromptInline,
} from '../../features/subscription';

export const InsightDetailScreen = ({ route }) => {
  const { insightId } = route.params;
  const {
    canAccessInsight,
    hasPremiumAccess,
    loading,
  } = useSubscriptionAccess();

  // Fetch insight data
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    // Fetch insight by ID
    fetchInsight(insightId).then(setInsight);
  }, [insightId]);

  if (loading || !insight) {
    return <LoadingSpinner />;
  }

  const hasAccess = canAccessInsight(insight.type);

  return (
    <ScrollView style={styles.container}>
      {/* Always show title and metadata */}
      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.author}>By {insight.author}</Text>
      <Text style={styles.date}>{insight.publishedAt}</Text>

      {/* Show excerpt for everyone */}
      <Text style={styles.excerpt}>{insight.excerpt}</Text>

      {/* Lock full content if premium and user doesn't have access */}
      {hasAccess ? (
        <View style={styles.content}>
          <Text>{insight.fullContent}</Text>
          {/* Charts, images, etc. */}
        </View>
      ) : (
        <UpgradePrompt
          requiredTier="basic"
          message="Unlock full insights and analysis with a premium subscription"
          style={styles.upgradePrompt}
        />
      )}

      {/* Show related insights with inline locks */}
      <Text style={styles.sectionTitle}>Related Insights</Text>
      {insight.relatedInsights.map((related) => {
        const canAccessRelated = canAccessInsight(related.type);

        return (
          <View key={related.id} style={styles.relatedCard}>
            <Text>{related.title}</Text>
            {!canAccessRelated && (
              <UpgradePromptInline requiredTier="basic" />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', padding: 16 },
  author: { fontSize: 14, color: '#8e8e93', paddingHorizontal: 16 },
  date: { fontSize: 13, color: '#8e8e93', paddingHorizontal: 16 },
  excerpt: { fontSize: 16, padding: 16, lineHeight: 24 },
  content: { padding: 16 },
  upgradePrompt: { margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', padding: 16 },
  relatedCard: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e5ea' },
});
```

## Best Practices

1. **Always check access before rendering sensitive content**
   - Use `canAccessInsight()` for insights
   - Use `hasTierAccess()` for features

2. **Provide clear upgrade paths**
   - Use `UpgradePrompt` for full-screen locks
   - Use `UpgradePromptInline` for list items

3. **Show what users are missing**
   - Display locked content titles/previews
   - Explain benefits of upgrading

4. **Handle loading states**
   - Check `loading` from `useSubscriptionAccess`
   - Don't show locked content while loading

5. **Don't trust frontend access checks**
   - Backend MUST enforce all access control
   - Frontend checks are for UX only

6. **Cache subscription state**
   - The hook handles caching automatically
   - Avoid multiple calls in same component

## Integration Checklist

- [ ] Import `useSubscriptionAccess` hook
- [ ] Check access before rendering premium content
- [ ] Add `UpgradePrompt` for locked content
- [ ] Handle loading states properly
- [ ] Test with different subscription tiers
- [ ] Verify backend enforces same rules
- [ ] Add analytics for upgrade prompts (optional)
- [ ] Test subscription expiry warnings
- [ ] Test upgrade flow end-to-end
