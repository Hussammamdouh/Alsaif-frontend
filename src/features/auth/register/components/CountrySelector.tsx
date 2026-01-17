/**
 * Country Selector Component
 * Modern searchable country selection modal
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    TextInput,
    StyleSheet,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, useLocalization } from '../../../../app/providers';
import { COUNTRIES, Country } from '../../../../core/constants/countries';

interface CountrySelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (country: Country) => void;
    selectedCountryCode?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
    visible,
    onClose,
    onSelect,
    selectedCountryCode,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = useMemo(() => {
        let result = COUNTRIES;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = COUNTRIES.filter(
                (c) =>
                    c.name.en.toLowerCase().includes(query) ||
                    c.name.ar.includes(query) ||
                    c.phoneCode.includes(query)
            );
        }

        // Sort alphabetically based on active language
        return [...result].sort((a, b) => {
            const nameA = isRTL ? a.name.ar : a.name.en;
            const nameB = isRTL ? b.name.ar : b.name.en;
            return nameA.localeCompare(nameB, isRTL ? 'ar' : 'en');
        });
    }, [searchQuery, isRTL]);

    const renderItem = ({ item }: { item: Country }) => (
        <TouchableOpacity
            style={[
                styles.countryItem,
                { borderBottomColor: theme.ui.border },
                selectedCountryCode === item.code && { backgroundColor: theme.primary.main + '20' },
            ]}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <View style={[styles.countryInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.countryName, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? item.name.ar : item.name.en}
                </Text>
                <Text style={[styles.phoneCode, { color: theme.text.tertiary }]}>
                    (+{item.phoneCode})
                </Text>
            </View>
            {selectedCountryCode === item.code && (
                <Icon name="checkmark-circle" size={20} color={theme.primary.main} />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background.primary }]}>
                    <View style={[styles.header, { borderBottomColor: theme.ui.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                            {t('register.country')}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={theme.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Icon name="search-outline" size={20} color={theme.text.tertiary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={t('common.search')}
                            placeholderTextColor={theme.text.tertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCorrect={false}
                        />
                    </View>

                    <FlatList
                        data={filteredCountries}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.code}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 40,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    countryInfo: {
        flex: 1,
        alignItems: 'center',
    },
    countryName: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    phoneCode: {
        fontSize: 14,
        marginHorizontal: 8,
    },
});
