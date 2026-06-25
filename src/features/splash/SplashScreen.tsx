/**
 * Splash Screen
 * Beautiful animated splash screen with smooth transitions
 * Displays app branding during initialization
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';

import { styles } from './splash.styles';
import { APP_CONFIG } from '../../core/constants';
import { useTheme, useLocalization } from '../../app/providers';
import { getApiBaseUrl } from '../../core/config/env';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashBackground = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#22c55e' : '#16a34a';
  const secondaryColor = isDark ? '#3b82f6' : '#1d4ed8'; // Crisp blue/indigo in light mode
  const supportColor = isDark ? '#eab308' : '#ca8a04'; // Yellow/Gold for support lines
  
  // Adjusted opacities for dark/light modes
  const gridOpacity = isDark ? 0.05 : 0.08;
  const chartOpacity = isDark ? 0.25 : 0.35;
  const secondaryChartOpacity = isDark ? 0.12 : 0.18;
  const textOpacity = isDark ? 0.08 : 0.15;
  const volumeOpacity = isDark ? 0.04 : 0.08;
  const levelLineOpacity = isDark ? 0.08 : 0.12;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity={isDark ? 0.08 : 0.06} />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid Lines */}
        <Path d="M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80" stroke={strokeColor} strokeOpacity={gridOpacity} strokeWidth="0.1" strokeDasharray="1,2" />
        <Path d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100" stroke={strokeColor} strokeOpacity={gridOpacity} strokeWidth="0.1" strokeDasharray="1,2" />

        {/* Y-Axis Price Labels (Bloomberg style) */}
        <SvgText x="1" y="21.5" fill={strokeColor} fillOpacity={textOpacity} fontSize="1.4" fontFamily="monospace">4,300.00</SvgText>
        <SvgText x="1" y="41.5" fill={strokeColor} fillOpacity={textOpacity} fontSize="1.4" fontFamily="monospace">4,200.00</SvgText>
        <SvgText x="1" y="61.5" fill={strokeColor} fillOpacity={textOpacity} fontSize="1.4" fontFamily="monospace">4,100.00</SvgText>
        <SvgText x="1" y="81.5" fill={strokeColor} fillOpacity={textOpacity} fontSize="1.4" fontFamily="monospace">4,000.00</SvgText>

        {/* Support & Resistance Levels (Horizontal Dashed) */}
        <Path d="M 0 35 L 100 35" stroke={secondaryColor} strokeOpacity={levelLineOpacity} strokeWidth="0.1" strokeDasharray="2,3" />
        <SvgText x="98" y="34" fill={secondaryColor} fillOpacity={textOpacity + 0.1} fontSize="1.4" textAnchor="end" fontWeight="bold">RESISTANCE: 4,250</SvgText>

        <Path d="M 0 65 L 100 65" stroke={supportColor} strokeOpacity={levelLineOpacity} strokeWidth="0.1" strokeDasharray="2,3" />
        <SvgText x="98" y="64" fill={supportColor} fillOpacity={textOpacity + 0.1} fontSize="1.4" textAnchor="end" fontWeight="bold">SUPPORT: 4,080</SvgText>

        {/* Stock Tickers Board (Scattered) */}
        <SvgText x="5" y="8" fill={isDark ? '#22c55e' : '#16a34a'} fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">DFMGI 4,210.50  ▲ 1.45%</SvgText>
        <SvgText x="65" y="10" fill={isDark ? '#22c55e' : '#16a34a'} fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">EMAAR 8.45  ▲ 2.80%</SvgText>
        
        <SvgText x="8" y="28" fill={isDark ? '#22c55e' : '#16a34a'} fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">SALIK 3.72  ▲ 0.90%</SvgText>
        <SvgText x="70" y="26" fill="#ef4444" fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">FAB 13.90  ▼ 0.50%</SvgText>
        
        <SvgText x="6" y="74" fill="#ef4444" fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">DEWA 2.42  ▼ 0.20%</SvgText>
        <SvgText x="68" y="72" fill={isDark ? '#22c55e' : '#16a34a'} fillOpacity={textOpacity} fontSize="1.8" fontWeight="bold">TAQA 2.85  ▲ 1.10%</SvgText>

        {/* Volume Bars at the Bottom */}
        <Rect x="2" y="92" width="1.5" height="8" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="6" y="90" width="1.5" height="10" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="10" y="86" width="1.5" height="14" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="14" y="89" width="1.5" height="11" fill="#ef4444" fillOpacity={volumeOpacity} />
        <Rect x="18" y="94" width="1.5" height="6" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="22" y="91" width="1.5" height="9" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="26" y="87" width="1.5" height="13" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="30" y="85" width="1.5" height="15" fill="#ef4444" fillOpacity={volumeOpacity} />
        <Rect x="34" y="88" width="1.5" height="12" fill="#ef4444" fillOpacity={volumeOpacity} />
        <Rect x="38" y="92" width="1.5" height="8" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="42" y="89" width="1.5" height="11" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="46" y="83" width="1.5" height="17" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="50" y="80" width="1.5" height="20" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="54" y="85" width="1.5" height="15" fill="#ef4444" fillOpacity={volumeOpacity} />
        <Rect x="58" y="88" width="1.5" height="12" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="62" y="91" width="1.5" height="9" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="66" y="84" width="1.5" height="16" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="70" y="81" width="1.5" height="19" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="74" y="87" width="1.5" height="13" fill="#ef4444" fillOpacity={volumeOpacity} />
        <Rect x="78" y="90" width="1.5" height="10" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="82" y="85" width="1.5" height="15" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="86" y="78" width="1.5" height="22" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="90" y="75" width="1.5" height="25" fill="#22c55e" fillOpacity={volumeOpacity} />
        <Rect x="94" y="82" width="1.5" height="18" fill="#ef4444" fillOpacity={volumeOpacity} />

        {/* Faint Candlesticks */}
        <Path d="M 15 50 L 15 75" stroke="#22c55e" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="13.5" y="55" width="3" height="12" fill="#22c55e" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 35 40 L 35 65" stroke="#ef4444" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="33.5" y="45" width="3" height="15" fill="#ef4444" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 55 25 L 55 55" stroke="#22c55e" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="53.5" y="30" width="3" height="18" fill="#22c55e" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 75 10 L 75 35" stroke="#22c55e" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="73.5" y="15" width="3" height="14" fill="#22c55e" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        {/* Extra Candlesticks for richness */}
        <Path d="M 25 60 L 25 80" stroke="#ef4444" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="23.5" y="65" width="3" height="10" fill="#ef4444" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 45 35 L 45 55" stroke="#22c55e" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="43.5" y="38" width="3" height="12" fill="#22c55e" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 65 18 L 65 38" stroke="#22c55e" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="63.5" y="22" width="3" height="11" fill="#22c55e" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        <Path d="M 85 5 L 85 25" stroke="#ef4444" strokeOpacity={isDark ? 0.08 : 0.12} strokeWidth="0.2" />
        <Rect x="83.5" y="10" width="3" height="10" fill="#ef4444" fillOpacity={isDark ? 0.08 : 0.12} rx="0.5" />

        {/* Chart Gradient Fill */}
        <Path 
          d="M 0 85 C 20 80, 25 65, 40 70 C 55 75, 65 40, 80 45 C 90 50, 95 20, 100 15 L 100 100 L 0 100 Z" 
          fill="url(#chartGrad)" 
        />

        {/* Secondary Trend Line (Faint Dotted) */}
        <Path 
          d="M 0 90 C 15 88, 30 80, 45 82 C 60 70, 70 60, 85 50 C 95 40, 98 35, 100 32" 
          fill="none" 
          stroke={secondaryColor} 
          strokeWidth="0.3" 
          strokeOpacity={secondaryChartOpacity} 
          strokeDasharray="1,1" 
        />

        {/* Main Chart Line */}
        <Path 
          d="M 0 85 C 20 80, 25 65, 40 70 C 55 75, 65 40, 80 45 C 90 50, 95 20, 100 15" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="0.5" 
          strokeOpacity={chartOpacity} 
        />

        {/* Glowing Data Points & Tooltips */}
        {/* Point 1 (Peak) */}
        <Circle cx="80" cy="45" r="0.8" fill={strokeColor} fillOpacity={chartOpacity + 0.2} />
        <Circle cx="80" cy="45" r="1.8" stroke={strokeColor} strokeWidth="0.2" strokeOpacity={chartOpacity} fill="none" />
        <Rect x="75" y="38" width="10" height="4" rx="1" fill={strokeColor} fillOpacity={isDark ? 0.15 : 0.25} />
        <SvgText x="80" y="41" fill={isDark ? strokeColor : '#000000'} fillOpacity={isDark ? 0.5 : 0.75} fontSize="1.8" fontWeight="bold" textAnchor="middle">+24.8%</SvgText>

        {/* Point 2 (Support) */}
        <Circle cx="40" cy="70" r="0.8" fill={strokeColor} fillOpacity={chartOpacity + 0.2} />
        <Rect x="34" y="73" width="12" height="4" rx="1" fill={strokeColor} fillOpacity={isDark ? 0.15 : 0.25} />
        <SvgText x="40" y="76" fill={isDark ? strokeColor : '#000000'} fillOpacity={isDark ? 0.5 : 0.75} fontSize="1.8" fontWeight="bold" textAnchor="middle">SUPPORT</SvgText>
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

  const colors = isDark 
    ? ['#05130c', '#030d08', '#000000']
    : ['#f7faf5', '#eef5eb', '#e3efe0'];

  return (
    <LinearGradient
      colors={colors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Stock chart, candlestick grid background overlay */}
      <SplashBackground isDark={isDark} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
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
