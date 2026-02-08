
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../app/providers';
import { ResponsiveContainer } from '../../shared/components';

export type SettingsTab = 'profile' | 'preferences' | 'security' | 'subscription' | 'terms' | 'about';

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onLogout: () => void;
}

/**
 * SettingsLayout Component
 * Provides a desktop-optimized sidebar navigation for Profile and Settings
 */
export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;

  if (!isDesktop) {
    return <>{children}</>;
  }

  const menuItems = [
    { id: 'profile', icon: 'person-outline', label: t('profile.title') },
    { id: 'preferences', icon: 'settings-outline', label: t('common.settings') },
    { id: 'security', icon: 'lock-closed-outline', label: t('profile.security') },
    { id: 'subscription', icon: 'card-outline', label: t('profile.subscription') },
    { id: 'terms', icon: 'document-text-outline', label: t('legal.terms.title') },
    { id: 'about', icon: 'information-circle-outline', label: t('about.title') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ResponsiveContainer maxWidth={1200}>
        <View style={[styles.layoutWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row', minHeight: height * 0.8 }]}>
          {/* Sidebar */}
          <View style={[
            styles.sidebar,
            {
              borderRightWidth: isRTL ? 0 : 1,
              borderLeftWidth: isRTL ? 1 : 0,
              borderColor: theme.border.main
            }
          ]}>
            <Text style={[styles.sidebarTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('common.settings')}
            </Text>

            <View style={styles.menuItemsContainer}>
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      styles.menuItem,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      isActive && { backgroundColor: theme.primary.main + '10' }
                    ]}
                    onPress={() => onTabChange(item.id as SettingsTab)}
                  >
                    <Ionicons
                      name={isActive ? item.icon.replace('-outline', '') as any : item.icon as any}
                      size={20}
                      color={isActive ? theme.primary.main : theme.text.secondary}
                    />
                    <Text style={[
                      styles.menuItemText,
                      {
                        color: isActive ? theme.primary.main : theme.text.secondary,
                        fontWeight: isActive ? '700' : '500',
                        textAlign: isRTL ? 'right' : 'left'
                      }
                    ]}>
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={[
                        styles.activeIndicator,
                        {
                          backgroundColor: theme.primary.main,
                          right: isRTL ? undefined : 0,
                          left: isRTL ? 0 : undefined
                        }
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.spacer} />

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.logoutItem,
                {
                  backgroundColor: theme.error.main + '10',
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }
              ]}
              onPress={onLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.error.main} />
              <Text style={[styles.logoutText, { color: theme.error.main, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('profile.logout')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <ScrollView
            style={styles.contentArea}
            contentContainerStyle={styles.contentScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.contentInner, isRTL && { alignItems: 'flex-end' }]}>
              {children}
            </View>
          </ScrollView>
        </View>
      </ResponsiveContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layoutWrapper: {
    flex: 1,
    marginTop: 20,
  },
  sidebar: {
    width: 280,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  menuItemsContainer: {
    gap: 8,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    position: 'relative',
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    top: '25%',
    bottom: '25%',
    width: 3,
    borderRadius: 3,
  },
  spacer: {
    flex: 1,
  },
  logoutItem: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  contentScroll: {
    paddingBottom: 100,
  },
  contentInner: {
    width: '100%',
  }
});
