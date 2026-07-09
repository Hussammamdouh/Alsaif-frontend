import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser, UserRole } from '../../../app/auth';
import { DASHBOARD_SECTIONS, DASHBOARD_SECTION_TRANSLATIONS } from '../admin.constants';
import { createAdminStyles } from '../admin.styles';
import { useSidebarState } from '../../../shared/utils/sidebarState';

export const AdminSidebar: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();
    const styles = createAdminStyles(theme, isRTL);
    const user = useUser();
    const isSuper = user?.role === UserRole.SUPERADMIN;
    const isModerator = user?.role === UserRole.MODERATOR;

    const [collapsed, toggle] = useSidebarState('admin');

    const allowedSections = React.useMemo(() => {
        if (isModerator) {
            return DASHBOARD_SECTIONS.filter(section => section.id === 'moderation' || section.id === 'banners');
        }
        return DASHBOARD_SECTIONS.filter(section => !(section as any).superadminOnly || isSuper);
    }, [isModerator, isSuper]);

    return (
        <View style={[
            styles.desktopSidebar, 
            { 
                width: collapsed ? 76 : 280,
                paddingHorizontal: collapsed ? 8 : 0,
            }
        ]}>
            {/* Sidebar Header with Toggle button */}
            <View style={{ 
                flexDirection: isRTL ? 'row' : 'row-reverse', 
                paddingHorizontal: collapsed ? 0 : 24, 
                marginBottom: 20,
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between'
            }}>
                {!collapsed && (
                    <View>
                        <Text style={[styles.headerTitle, { fontSize: 24 }]}>AlSaif</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.primary.main, fontWeight: '700', fontSize: 10 }]}>ADMIN PANEL</Text>
                    </View>
                )}
                <TouchableOpacity 
                    onPress={toggle}
                    activeOpacity={0.7}
                    style={{
                        padding: 6,
                        borderRadius: 8,
                        backgroundColor: theme.background.secondary,
                        borderWidth: 1,
                        borderColor: theme.border.main,
                    }}
                >
                    <Ionicons 
                        name={collapsed 
                            ? (isRTL ? "chevron-back-outline" : "chevron-forward-outline") 
                            : (isRTL ? "chevron-forward-outline" : "chevron-back-outline")
                        } 
                        size={20} 
                        color={theme.text.primary} 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingVertical: 10 }}
                showsVerticalScrollIndicator={true}
            >
                {allowedSections.map((section) => {
                    const translations = DASHBOARD_SECTION_TRANSLATIONS[section.id as keyof typeof DASHBOARD_SECTION_TRANSLATIONS];
                    const isActive = route.name === section.route;

                    return (
                        <TouchableOpacity
                            key={section.id}
                            style={[
                                styles.sidebarItem, 
                                isActive && styles.sidebarItemActive,
                                collapsed && { justifyContent: 'center', paddingHorizontal: 0, marginHorizontal: 8 }
                            ]}
                            onPress={() => navigation.navigate(section.route as never)}
                        >
                            <Ionicons
                                name={section.icon as any}
                                size={22}
                                color={isActive ? theme.primary.main : theme.text.tertiary}
                            />
                            {!collapsed && (
                                <Text style={styles.sidebarItemLabel}>
                                    {t(translations.titleKey)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity
                style={[
                    styles.sidebarItem, 
                    { marginBottom: 32, marginTop: 16 },
                    collapsed && { justifyContent: 'center', paddingHorizontal: 0, marginHorizontal: 8 }
                ]}
                onPress={() => navigation.navigate('MainTabs' as never)}
            >
                <Ionicons name="exit-outline" size={22} color={theme.error.main} />
                {!collapsed && (
                    <Text style={[styles.sidebarItemLabel, { color: theme.error.main }]}>
                        {t('common.exit')}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
