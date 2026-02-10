/**
 * Splash Screen
 * Beautiful animated splash screen with smooth transitions
 * Displays app branding during initialization
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './splash.styles';
import { APP_CONFIG } from '../../core/constants';
import { useTheme, useLocalization } from '../../app/providers';
import { getApiBaseUrl } from '../../core/config/env';

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * SplashScreen Component
 * Modern animated splash screen with gradient background
 */
export const SplashScreen: React.FC<SplashScreenProps> = React.memo(({ onFinish }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Readiness state
  const [healthChecked, setHealthChecked] = React.useState(false);
  const [minDurationElapsed, setMinDurationElapsed] = React.useState(false);

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';

    // Logo animation - scale and fade in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver,
      }),
    ]).start();

    // Title animation - fade in and slide up
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        easing: Easing.ease,
        useNativeDriver,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]).start();

    // Tagline fade in
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 600,
      delay: 800,
      easing: Easing.ease,
      useNativeDriver,
    }).start();

    // Loader fade in
    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 600,
      delay: 1000,
      easing: Easing.ease,
      useNativeDriver,
    }).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    ).start();

    // Animated bouncing dots loader
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -10,
            duration: 400,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver,
          }),
        ])
      );
    };

    setTimeout(() => {
      animateDot(dot1, 0).start();
      animateDot(dot2, 150).start();
      animateDot(dot3, 300).start();
    }, 1200);
  }, [dot1, dot2, dot3, logoOpacity, logoScale, loaderOpacity, pulseAnim, taglineOpacity, titleOpacity, titleTranslateY]);

  /**
   * Minimum duration timer
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDurationElapsed(true);
    }, APP_CONFIG.splashDuration);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Health check polling
   */
  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/health`);
        if (response.ok) {
          if (isMounted) setHealthChecked(true);
        } else {
          if (isMounted) pollTimer = setTimeout(checkHealth, 2000);
        }
      } catch (error) {
        if (isMounted) pollTimer = setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  /**
   * Auto-navigate after both conditions met
   */
  useEffect(() => {
    if (healthChecked && minDurationElapsed) {
      onFinish();
    }
  }, [healthChecked, minDurationElapsed, onFinish]);

  return (
    <LinearGradient
      colors={[theme.primary.main, theme.primary.dark, theme.background.primary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* App Logo with animations */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, pulseAnim) },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Title and Tagline */}
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.title,
              { color: theme.text.primary },
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            {t('common.appName')}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.tagline,
              { color: theme.text.secondary },
              { opacity: taglineOpacity },
            ]}
          >
            {t('common.tagline')}
          </Animated.Text>
        </View>

        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: loaderOpacity },
          ]}
        >
          <Text style={[styles.progressLabel, { color: theme.primary.main }]}>
            {t('splash.initializing')}
          </Text>
          <View style={styles.loaderContainer}>
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: theme.primary.main },
                { transform: [{ translateY: dot1 }] }
              ]}
            />
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: theme.primary.main },
                { transform: [{ translateY: dot2 }] }
              ]}
            />
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: theme.primary.main },
                { transform: [{ translateY: dot3 }] }
              ]}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
});

SplashScreen.displayName = 'SplashScreen';
