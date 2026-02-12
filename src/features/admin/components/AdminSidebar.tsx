import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { DASHBOARD_SECTIONS, DASHBOARD_SECTION_TRANSLATIONS } from '../admin.constants';
import { createAdminStyles } from '../admin.styles';

export const AdminSidebar: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();
    const styles = createAdminStyles(theme, isRTL);

    return (
        <View style={styles.desktopSidebar}>
            <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
                <Text style={[styles.headerTitle, { fontSize: 28 }]}>Elsaif</Text>
                <Text style={[styles.cardSubtitle, { color: theme.primary.main, fontWeight: '700' }]}>ADMIN PANEL</Text>
            </View>

            {DASHBOARD_SECTIONS.map((section) => {
                const translations = DASHBOARD_SECTION_TRANSLATIONS[section.id as keyof typeof DASHBOARD_SECTION_TRANSLATIONS];
                const isActive = route.name === section.route;

                return (
                    <TouchableOpacity
                        key={section.id}
                        style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                        onPress={() => navigation.navigate(section.route as never)}
                    >
                        <Ionicons
                            name={section.icon as any}
                            size={22}
                            color={isActive ? theme.primary.main : theme.text.tertiary}
                        />
                        <Text style={[styles.sidebarItemLabel, isActive && styles.sidebarItemLabelActive]}>
                            {t(translations.titleKey)}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <View style={{ flex: 1 }} />

            <TouchableOpacity
                style={[styles.sidebarItem, { marginBottom: 32 }]}
                onPress={() => navigation.navigate('MainTabs' as never)}
            >
                <Ionicons name="exit-outline" size={22} color={theme.error.main} />
                <Text style={[styles.sidebarItemLabel, { color: theme.error.main }]}>
                    {t('common.exit')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
