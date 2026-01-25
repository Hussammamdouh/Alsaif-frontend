/**
 * Admin Group Chat Management Screen
 * Specialized UI for admins to build groups using tiers and identifiers
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../app/providers';
import { apiClient } from '../../core/services/api/apiClient';
import { spacing } from '../../core/theme/spacing';

const SUBSCRIPTION_TIERS = [
    { id: 'free', label: 'Free Tier', icon: 'people-outline' },
    { id: 'premium', label: 'Premium Tier', icon: 'star-outline' },
    // Could add more if defined in constants
];

export const AdminGroupChatScreen: React.FC<{ onNavigateBack: () => void }> = ({
    onNavigateBack,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();

    const [groupName, setGroupName] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [identifiers, setIdentifiers] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSystemGroup, setIsSystemGroup] = useState(false);
    const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(true);

    const toggleTier = (tierId: string) => {
        setSelectedTiers((prev) =>
            prev.includes(tierId)
                ? prev.filter((id) => id !== tierId)
                : [...prev, tierId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert(t('common.error'), 'Group name is required');
            return;
        }

        if (selectedTiers.length === 0 && !identifiers.trim()) {
            Alert.alert(t('common.error'), 'Please select at least one tier or provide identifiers');
            return;
        }

        setIsCreating(true);
        try {
            // 1. Create the base group chat
            const createResponse = await apiClient.post<any>('/api/admin/chats/group', {
                name: groupName.trim(),
                isSystemGroup,
                settings: {
                    onlyAdminsCanSend,
                },
            });

            if (!createResponse.success) {
                throw new Error(createResponse.message || 'Failed to create group');
            }

            const chatId = createResponse.data.chat._id;

            // 2. Bulk add participants
            const identifierList = identifiers
                .split(/[,\n]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const bulkResponse = await apiClient.post<any>(
                `/api/admin/chats/${chatId}/participants/bulk`,
                {
                    tiers: selectedTiers,
                    identifiers: identifierList,
                    reason: `Group creation: ${groupName}`,
                }
            );

            if (bulkResponse.success) {
                Alert.alert(
                    t('common.success'),
                    `Group created and ${bulkResponse.data.addedCount} participants added.`
                );
                onNavigateBack();
            } else {
                Alert.alert(t('common.error'), 'Group created but failed to add participants');
            }
        } catch (error) {
            console.error('[AdminGroupChat] Error:', error);
            Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : 'Operation failed'
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <LinearGradient
                colors={isDark ? ['#1e293b', '#0f172a'] : ['#F8FAFC', '#F1F5F9']}
                style={styles.header}
            >
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Icon name="chevron-back" size={28} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                    Advanced Group Manager
                </Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Group Basics Section */}
                <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                        Group Details
                    </Text>
                    <TextInput
                        style={[styles.input, { color: theme.text.primary, borderColor: theme.border.main }]}
                        placeholder="Group Name (e.g. VIP Gold Traders)"
                        placeholderTextColor={theme.text.tertiary}
                        value={groupName}
                        onChangeText={setGroupName}
                    />

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={{ color: theme.text.primary, fontWeight: '600' }}>System Group</Text>
                            <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>Auto-enroll for tiers applies</Text>
                        </View>
                        <Switch
                            value={isSystemGroup}
                            onValueChange={setIsSystemGroup}
                            trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={{ color: theme.text.primary, fontWeight: '600' }}>Broadcast Mode</Text>
                            <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>Only admins can send messages</Text>
                        </View>
                        <Switch
                            value={onlyAdminsCanSend}
                            onValueChange={setOnlyAdminsCanSend}
                            trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                        />
                    </View>
                </View>

                {/* Bulk Tiers Section */}
                <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                        Bulk Add by Tiers
                    </Text>
                    <Text style={{ color: theme.text.tertiary, fontSize: 13, marginBottom: 12 }}>
                        Select tiers to include all current users with these subscription levels.
                    </Text>
                    <View style={styles.tierContainer}>
                        {SUBSCRIPTION_TIERS.map((tier) => {
                            const isSelected = selectedTiers.includes(tier.id);
                            return (
                                <TouchableOpacity
                                    key={tier.id}
                                    style={[
                                        styles.tierButton,
                                        { borderColor: isSelected ? theme.primary.main : theme.border.light },
                                        isSelected && { backgroundColor: theme.primary.main + '10' },
                                    ]}
                                    onPress={() => toggleTier(tier.id)}
                                >
                                    <Icon
                                        name={tier.icon as any}
                                        size={20}
                                        color={isSelected ? theme.primary.main : theme.text.tertiary}
                                    />
                                    <Text
                                        style={[
                                            styles.tierLabel,
                                            { color: isSelected ? theme.primary.main : theme.text.secondary },
                                        ]}
                                    >
                                        {tier.label}
                                    </Text>
                                    {isSelected && (
                                        <Icon name="checkmark-circle" size={18} color={theme.primary.main} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Identifiers Section */}
                <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                        Specific Participants
                    </Text>
                    <Text style={{ color: theme.text.tertiary, fontSize: 13, marginBottom: 12 }}>
                        Add users by Email, Phone Number, or Name (one per line or comma separated).
                    </Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            {
                                color: theme.text.primary,
                                borderColor: theme.border.main,
                                textAlign: isRTL ? 'right' : 'left',
                            },
                        ]}
                        placeholder="user@example.com&#10;+1234567890&#10;John Smith"
                        placeholderTextColor={theme.text.tertiary}
                        value={identifiers}
                        onChangeText={setIdentifiers}
                        multiline
                        numberOfLines={5}
                    />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: theme.primary.main }]}
                    onPress={handleCreateGroup}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Icon name="chatbubbles" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create Group & Add Participants</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: spacing.lg,
    },
    section: {
        padding: 16,
        borderRadius: 20,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    tierContainer: {
        gap: 12,
    },
    tierButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1.5,
        borderRadius: 12,
        gap: 12,
    },
    tierLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    textArea: {
        minHeight: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
