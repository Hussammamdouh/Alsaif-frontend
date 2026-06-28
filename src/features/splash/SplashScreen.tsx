/**
 * Splash Screen
 * Beautiful animated splash screen with smooth transitions
 * Displays app branding during initialization
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Text as SvgText, RadialGradient } from 'react-native-svg';

import { styles } from './splash.styles';
import { APP_CONFIG } from '../../core/constants';
import { useTheme, useLocalization } from '../../app/providers';
import { getApiBaseUrl } from '../../core/config/env';

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * CircularSideGradients
 * Renders a large radial gradient starting from the outer sides and corners
 * of the page, fading out inwards towards the clean center logo area.
 */
const CircularSideGradients = ({ isDark }: { isDark: boolean }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  // Define a radius that is proportional to the smaller screen dimension
  // to ensure a perfect circular shape that doesn't stretch into an oval.
  const radius = Math.min(screenWidth, screenHeight) * 0.95;

  // Glow color at the outer sides and corners (dark emerald vignette in dark mode, brand light green in light mode)
  const glowColor = isDark ? '#0c2917' : '#5fa948';
  const glowOpacity = isDark ? 0.80 : 0.95;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id="outerEdgeGrad"
            cx={screenWidth / 2}
            cy={screenHeight / 2}
            r={radius}
            fx={screenWidth / 2}
            fy={screenHeight / 2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={glowColor} stopOpacity="0" />
            <Stop offset="50%" stopColor={glowColor} stopOpacity={glowOpacity * 0.25} />
            <Stop offset="80%" stopColor={glowColor} stopOpacity={glowOpacity * 0.70} />
            <Stop offset="100%" stopColor={glowColor} stopOpacity={glowOpacity} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#outerEdgeGrad)" />
      </Svg>
    </View>
  );
};

/**
 * SplashScreen Component
 * Modern animated splash screen with gradient background
 */
export const SplashScreen: React.FC<SplashScreenProps> = React.memo(({ onFinish }) => {
  const { theme, isDark } = useTheme();
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
    let retries = 0;
    const maxRetries = 3;

    const checkHealth = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${getApiBaseUrl()}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          if (isMounted) setHealthChecked(true);
        } else {
          console.warn(`[SplashScreen] Health check returned status ${response.status}`);
          if (isMounted) {
            retries++;
            if (retries >= maxRetries) {
              console.warn('[SplashScreen] Max retries reached. Proceeding to app.');
              setHealthChecked(true);
            } else {
              pollTimer = setTimeout(checkHealth, 2000);
            }
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('[SplashScreen] Health check failed or timed out:', error);
        if (isMounted) {
          setHealthChecked(true);
        }
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

  const colors = ['#438730', '#438730'] as const;

  return (
    <LinearGradient
      colors={colors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <CircularSideGradients isDark={isDark} />
      
      {/* Centered Logo Container */}
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
          source={require('../../../assets/Logo Secondry.jpg')}
          style={[
            styles.logo,
            {
              borderRadius: 36, // Rounded corners for premium app icon look
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App Title and Tagline */}
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.title,
            { color: '#FFFFFF' },
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
            { color: 'rgba(255, 255, 255, 0.8)' },
            { opacity: taglineOpacity },
          ]}
        >
          {t('common.tagline')}
        </Animated.Text>
      </View>

      {/* SafeAreaView solely to handle bottom inset padding for progress indicators */}
      <SafeAreaView style={styles.container} edges={['bottom']} pointerEvents="box-none">
        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: loaderOpacity },
          ]}
        >
          <Text style={[styles.progressLabel, { color: '#FFFFFF' }]}>
            {t('splash.initializing')}
          </Text>
          <View style={styles.loaderContainer}>
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: '#FFFFFF' },
                { transform: [{ translateY: dot1 }] }
              ]}
            />
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: '#FFFFFF' },
                { transform: [{ translateY: dot2 }] }
              ]}
            />
            <Animated.View
              style={[
                styles.loaderDot,
                { backgroundColor: '#FFFFFF' },
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
