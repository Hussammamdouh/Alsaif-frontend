# Paywall & Subscription Plans Screens Guide

This guide explains how to use the new paywall and subscription plans screens that match the design specifications.

## Overview

We now have **3 subscription-related screens**:

1. **PaywallScreen** - Initial premium access introduction (Paywall.png design)
2. **SubscriptionPlansScreen** - Detailed plan selection with pricing (Plans.png design)
3. **SubscriptionScreen** - Manage existing subscription (original implementation)

## Screen Flows

### Flow 1: First-Time Premium Access
```
User encounters locked content
→ Shows PaywallScreen (introduction to premium)
→ User clicks "Choose Your Plan" or "Upgrade to Premium"
→ Navigates to SubscriptionPlansScreen
→ User selects a plan
→ Redirects to payment gateway
→ Returns to app with active subscription
```

### Flow 2: Direct Plan Selection
```
User clicks "Upgrade" or "Subscribe" button
→ Directly shows SubscriptionPlansScreen
→ User selects plan and completes payment
```

### Flow 3: Manage Existing Subscription
```
User navigates to Subscription from Profile/Settings
→ Shows SubscriptionScreen
→ View current plan, renew, or cancel
```

## Screen Details

### 1. PaywallScreen

**Purpose**: Introduce premium features and benefits to users who haven't subscribed

**Design Elements**:
- Purple gradient background (#6366f1)
- "PREMIUM ACCESS" badge
- Large headline: "Unlock Premium Insights"
- Social proof subtitle
- 3 feature icons with descriptions
- Feature checklist with checkmarks
- Two CTAs: "CHOOSE YOUR PLAN" and "Upgrade to Premium"
- Trust badges (Secure Payment, Cancel Anytime)
- Footer links

**When to Use**:
- First time user encounters premium content
- Onboarding flow for premium features
- Marketing campaign landing

**Navigation**:
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('Paywall');
```

**Example Integration**:
```typescript
// When user clicks locked insight
const InsightCard = ({ insight }) => {
  const { canAccessInsight } = useSubscriptionAccess();
  const navigation = useNavigation();

  const handlePress = () => {
    if (!canAccessInsight(insight.type)) {
      navigation.navigate('Paywall');
    } else {
      // Show full content
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Insight preview */}
    </TouchableOpacity>
  );
};
```

---

### 2. SubscriptionPlansScreen

**Purpose**: Show detailed pricing and allow plan selection

**Design Elements**:
- Clean white background
- Close button (X) in header
- "Subscription Plans" title
- Large headline: "Unlock Premium Insights"
- Social proof subtitle
- Billing cycle toggle (Monthly/Yearly with "Save 20%" badge)
- Plan cards:
  - **Investor Plan**: Basic tier with 3 features
  - **Professional Plan**: Premium tier with "RECOMMENDED" badge, 5 features, "7-day free trial"
- Blue primary button for recommended plan
- Trust badges (SSL Secure, Cancel Anytime, Money Back)
- Footer links (Terms, Privacy, Restore Purchase)

**When to Use**:
- User clicks CTA from PaywallScreen
- Direct "Subscribe" or "Upgrade" button
- After viewing feature comparison

**Navigation**:
```typescript
navigation.navigate('SubscriptionPlans');
```

**Example Integration**:
```typescript
// From PaywallScreen
const PaywallScreen = () => {
  const navigation = useNavigation();

  const handleChoosePlan = () => {
    navigation.navigate('SubscriptionPlans');
  };

  return (
    <TouchableOpacity onPress={handleChoosePlan}>
      <Text>CHOOSE YOUR PLAN</Text>
    </TouchableOpacity>
  );
};
```

**Features**:
- Billing cycle toggle (Monthly/Yearly)
- Automatic price calculation based on billing cycle
- Plan selection initiates checkout flow
- Loading states during checkout
- Free trial messaging for Professional plan

---

### 3. SubscriptionScreen (Original)

**Purpose**: Manage active subscription

**Design Elements**:
- Current plan display with status badge
- Expiry warning banner
- Days remaining counter
- Billing cycle selector
- Available plans grid
- Cancel subscription button
- Pull-to-refresh

**When to Use**:
- User has active subscription and wants to manage it
- User wants to view subscription details
- User wants to cancel or renew

**Navigation**:
```typescript
navigation.navigate('Subscription');
```

---

## Implementation Examples

### Example 1: Show Paywall on Locked Content

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionAccess } from '../../features/subscription';

const PremiumInsightCard = ({ insight }) => {
  const navigation = useNavigation();
  const { canAccessInsight } = useSubscriptionAccess();

  const hasAccess = canAccessInsight(insight.type);

  const handlePress = () => {
    if (hasAccess) {
      navigation.navigate('InsightDetail', { id: insight.id });
    } else {
      // Show paywall for first-time users
      navigation.navigate('Paywall');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.card}>
        <Text style={styles.title}>{insight.title}</Text>
        {!hasAccess && (
          <View style={styles.lockBadge}>
            <Icon name="lock-closed" />
            <Text>Premium</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
```

### Example 2: Direct Subscribe Button

```typescript
const ProfileScreen = () => {
  const navigation = useNavigation();
  const { hasActiveSubscription } = useSubscriptionAccess();

  return (
    <View>
      {hasActiveSubscription ? (
        <TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
          <Text>Manage Subscription</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('SubscriptionPlans')}>
          <Text>Subscribe Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Example 3: Onboarding Flow

```typescript
const OnboardingScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    // After showing app features, show paywall
    navigation.navigate('Paywall');
  };

  return (
    <View>
      <Text>Welcome to VertexCapital</Text>
      {/* Show app features */}
      <TouchableOpacity onPress={handleGetStarted}>
        <Text>Get Started with Premium</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Example 4: Settings Integration

```typescript
const SettingsScreen = () => {
  const navigation = useNavigation();
  const { subscription, currentTier } = useSubscriptionAccess();

  return (
    <ScrollView>
      {/* Other settings */}

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('Subscription')}
      >
        <Text>Subscription</Text>
        <View style={styles.settingRight}>
          <Text style={styles.tierBadge}>{currentTier}</Text>
          <Icon name="chevron-forward" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

---

## Design Specifications

### Color Palette

```typescript
const colors = {
  primary: '#6366f1',      // Primary purple/blue
  success: '#34c759',      // Green for save badges
  text: {
    primary: '#000',
    secondary: '#8e8e93',
    onPrimary: '#fff',
  },
  background: {
    primary: '#fff',
    secondary: '#f2f2f7',
    gradient: '#6366f1',
  },
  border: {
    default: '#e5e5ea',
    active: '#6366f1',
  },
};
```

### Typography

```typescript
const typography = {
  largeTitle: { fontSize: 32, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700' },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  badge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

---

## Best Practices

### 1. Progressive Disclosure
Show PaywallScreen → SubscriptionPlansScreen flow for first-time users to:
- Build trust and explain value
- Reduce decision fatigue
- Increase conversion rates

### 2. Direct Access for Returning Users
For users who've seen the paywall before, directly show SubscriptionPlansScreen.

### 3. Clear Navigation Paths
Always provide a way back:
- PaywallScreen has close button
- SubscriptionPlansScreen has close button (X)
- Use navigation.goBack() appropriately

### 4. Loading States
Handle checkout loading gracefully:
```typescript
const { loading, initiateCheckout } = useCheckout();

<TouchableOpacity
  disabled={loading}
  onPress={() => initiateCheckout(planId, billingCycle)}
>
  <Text>{loading ? 'Processing...' : 'Start Free Trial'}</Text>
</TouchableOpacity>
```

### 5. Error Handling
Show user-friendly errors if checkout fails:
```typescript
const handleSelectPlan = async (planId) => {
  try {
    const success = await initiateCheckout(planId, billingCycle);
    if (!success) {
      Alert.alert('Error', 'Unable to start checkout. Please try again.');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## Analytics Tracking (Recommended)

Track these events for conversion optimization:

```typescript
// PaywallScreen
analytics.track('Paywall Viewed', {
  source: 'locked_insight',
  insightId: insightId,
});

analytics.track('Paywall CTA Clicked', {
  button: 'choose_plan',
});

// SubscriptionPlansScreen
analytics.track('Plans Screen Viewed', {
  billingCycle: 'monthly',
});

analytics.track('Billing Cycle Changed', {
  from: 'monthly',
  to: 'yearly',
});

analytics.track('Plan Selected', {
  planId: planId,
  planName: 'Professional',
  price: 49,
  billingCycle: 'yearly',
});

// Checkout
analytics.track('Checkout Started', {
  planId: planId,
  billingCycle: billingCycle,
});

analytics.track('Checkout Completed', {
  planId: planId,
  revenue: 588, // yearly price
});
```

---

## Customization

### Update Plan Features

Edit the plan features in your subscription plans database (SubscriptionPlan model):

```javascript
{
  tier: 'basic',
  name: 'Investor',
  features: [
    { name: 'Daily Market Recap', included: true },
    { name: '5 Stock Picks/mo', included: true },
    { name: 'Basic Price Alerts', included: true },
  ]
}
```

### Update Paywall Features

Edit the checklist in [PaywallScreen.tsx:56](VertexCapital/src/features/subscription/PaywallScreen.tsx#L56):

```typescript
const checklist = [
  'Daily Market Recap',
  'Watchlist',
  'AI Predictions',
  'Analyst Reports',
];
```

### Update Trust Badges

Edit the trust badges in both screens to match your compliance requirements.

---

## Testing Checklist

- [ ] PaywallScreen renders correctly
- [ ] Clicking "Choose Your Plan" navigates to SubscriptionPlansScreen
- [ ] Clicking "Upgrade to Premium" navigates to SubscriptionPlansScreen
- [ ] Close button on PaywallScreen works
- [ ] SubscriptionPlansScreen shows correct plans
- [ ] Billing toggle switches between Monthly/Yearly
- [ ] Prices update when billing cycle changes
- [ ] "Save 20%" badge shows for yearly
- [ ] Plan selection initiates checkout
- [ ] Checkout redirects to payment gateway
- [ ] Loading states display during checkout
- [ ] Trust badges display correctly
- [ ] Footer links are tappable
- [ ] Navigation flows work end-to-end
- [ ] Screens work on both iOS and Android

---

## Summary

You now have three screens for a complete subscription flow:

1. **PaywallScreen** - Introduce premium features with emotional appeal
2. **SubscriptionPlansScreen** - Clear pricing and plan selection
3. **SubscriptionScreen** - Manage active subscription

Use them strategically to maximize conversions:
- First-time users: Paywall → Plans → Checkout
- Returning users: Plans → Checkout
- Existing subscribers: Subscription management

All screens match the provided designs (Paywall.png and Plans.png) and integrate seamlessly with the existing subscription system.
