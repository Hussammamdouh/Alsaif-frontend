import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    StyleSheet,
    Platform,
    StatusBar,
    TextInput,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { ResponsiveContainer } from '../../../shared/components';
import { Disclosure, updateDisclosureNote, DisclosureComment, fetchDisclosureComments, createDisclosureComment } from '../disclosure.api';
import { useDisclosures } from '../disclosure.hooks';
import { useIsAdmin } from '../../../app/auth/auth.hooks';

type DisclosureDetailRouteParams = {
    DisclosureDetails: {
        disclosureId: string;
        disclosure?: Disclosure;
    };
};

export const DisclosureDetailsScreen: React.FC = () => {
    const route = useRoute<RouteProp<DisclosureDetailRouteParams, 'DisclosureDetails'>>();
    const navigation = useNavigation<any>();
    const { disclosureId, disclosure: initialDisclosure } = route.params;
    const { theme, isDark } = useTheme();
    const { t, language, isRTL } = useLocalization();
    const isAdmin = useIsAdmin();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const [disclosure, setDisclosure] = useState<Disclosure | undefined>(initialDisclosure);
    const [loading, setLoading] = useState(!initialDisclosure);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(initialDisclosure?.noteEn || initialDisclosure?.note || '');
    const [noteArText, setNoteArText] = useState(initialDisclosure?.noteAr || '');
    const [saving, setSaving] = useState(false);

    // Comment state
    const [comments, setComments] = useState<DisclosureComment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const commentInputRef = useRef<TextInput>(null);

    const fetchDisclosure = useCallback(async () => {
        try {
            // Since useDisclosures returns a list, find the specific one
            // In a real app, we might have a fetchDisclosureById, but we'll use list for now
            // or assume it's passed in params
            if (!disclosure) {
                setLoading(true);
            }
            // If we don't have it, we could fetch all and find, but ideally it should be passed
            setLoading(false);
        } catch (error) {
            console.error('Error fetching disclosure:', error);
            setLoading(false);
        }
    }, [disclosureId, disclosure]);

    // Fetch comments for this disclosure
    const loadComments = useCallback(async () => {
        if (!disclosureId) return;
        setCommentsLoading(true);
        try {
            const fetchedComments = await fetchDisclosureComments(disclosureId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    }, [disclosureId]);

    // Load comments on mount
    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchDisclosure(), loadComments()]);
        setRefreshing(false);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !disclosureId) return;
        setSubmittingComment(true);
        try {
            const newComment = await createDisclosureComment(disclosureId, commentText.trim());
            if (newComment) {
                setComments(prev => [newComment, ...prev]);
                setCommentText('');
            }
        } catch (error) {
            Alert.alert(t('common.error'), language === 'ar' ? 'فشل في إرسال التعليق' : 'Failed to submit comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSaveNote = async () => {
        if (!disclosure) return;
        setSaving(true);
        try {
            const updated = await updateDisclosureNote(disclosure._id, {
                note: noteText,
                noteEn: noteText,
                noteAr: noteArText,
            });
            setDisclosure(updated);
            setIsEditing(false);
            Alert.alert(t('common.success'), t('common.savedSuccessfully'));
        } catch (error) {
            Alert.alert(t('common.error'), t('common.failedToSave'));
        } finally {
            setSaving(false);
        }
    };

    const currentTitle = useMemo(() => {
        if (!disclosure) return '';
        return language === 'ar' ? (disclosure.titleAr || disclosure.title) : (disclosure.titleEn || disclosure.title);
    }, [disclosure, language]);

    const currentNote = useMemo(() => {
        if (!disclosure) return null;
        return language === 'ar' ? (disclosure.noteAr || disclosure.note) : (disclosure.noteEn || disclosure.note);
    }, [disclosure, language]);

    const pdfUrls = useMemo(() => {
        if (!disclosure) return [];
        return (disclosure.pdfUrls && disclosure.pdfUrls.length > 0)
            ? disclosure.pdfUrls
            : (disclosure.url ? [disclosure.url] : []);
    }, [disclosure]);

    if (loading && !disclosure) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
                <ActivityIndicator size="large" color={theme.primary.main} />
            </View>
        );
    }

    if (!disclosure) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.background.primary }]}>
                <Text style={{ color: theme.text.primary }}>Disclosure not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <ResponsiveContainer>
                {/* Hero Header */}
                <View style={[styles.heroHeader, { backgroundColor: theme.background.secondary }]}>
                    <View style={[styles.headerToolbar, { paddingTop: Platform.OS === 'ios' ? 50 : 30 }]}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.background.primary }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={theme.text.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text.primary, opacity: 0 }]}>
                            {currentTitle}
                        </Text>
                        {isAdmin ? (
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: isEditing ? theme.primary.main : theme.background.primary }]}
                                onPress={() => setIsEditing(!isEditing)}
                            >
                                <Ionicons name={isEditing ? "close" : "create-outline"} size={22} color={isEditing ? "#FFF" : theme.text.primary} />
                            </TouchableOpacity>
                        ) : <View style={{ width: 40 }} />}
                    </View>

                    <View style={[styles.heroContent, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
                        <View style={styles.topMeta}>
                            <View style={[styles.badge, { backgroundColor: disclosure.exchange === 'ADX' ? '#EAB30815' : '#3B82F615' }]}>
                                <Text style={{ color: disclosure.exchange === 'ADX' ? '#EAB308' : '#3B82F6', fontWeight: '800', fontSize: 12 }}>
                                    {disclosure.exchange}
                                </Text>
                            </View>
                            <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                                {new Date(disclosure.date).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>

                        <Text style={[styles.heroTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                            {currentTitle}
                        </Text>

                        <View style={[styles.companyRow, { backgroundColor: theme.background.primary, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Ionicons name="business" size={20} color={theme.primary.main} />
                            <Text style={[styles.companyName, { color: theme.text.secondary }]}>
                                {language === 'ar' ? (disclosure.companyNameAr || disclosure.companyName) : (disclosure.companyNameEn || disclosure.companyName)}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary.main} />
                    }
                >
                    <View style={[styles.contentContainer, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
                        <View style={[
                            isDesktop && styles.desktopGrid,
                            isDesktop && isRTL && { flexDirection: 'row-reverse' }
                        ]}>
                            {/* Main Column (Notes) */}
                            <View style={[isDesktop && styles.mainColumn]}>
                                {/* Note Section Card */}
                                <View style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.iconContainer, { backgroundColor: theme.primary.main + '15' }]}>
                                            <Ionicons name="document-text" size={24} color={theme.primary.main} />
                                        </View>
                                        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
                                            {language === 'ar' ? 'ملاحظات المحلل' : 'Analyst Notes'}
                                        </Text>
                                    </View>

                                    {isEditing ? (
                                        <View style={styles.editContainer}>
                                            <Text style={styles.label}>English Note</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.background.primary, color: theme.text.primary, borderColor: theme.ui.border }]}
                                                multiline
                                                value={noteText}
                                                onChangeText={setNoteText}
                                                placeholder="Enter note in English..."
                                                placeholderTextColor={theme.text.tertiary}
                                            />
                                            <Text style={[styles.label, { marginTop: 12 }]}>Arabic Note</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.background.primary, color: theme.text.primary, borderColor: theme.ui.border, textAlign: 'right' }]}
                                                multiline
                                                value={noteArText}
                                                onChangeText={setNoteArText}
                                                placeholder="أدخل الملاحظة بالعربية..."
                                                placeholderTextColor={theme.text.tertiary}
                                            />
                                            <TouchableOpacity
                                                style={[styles.saveButton, { backgroundColor: theme.primary.main }]}
                                                onPress={handleSaveNote}
                                                disabled={saving}
                                            >
                                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Note</Text>}
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.noteContent}>
                                            {currentNote ? (
                                                <Text style={[styles.noteText, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                                    {currentNote}
                                                </Text>
                                            ) : (
                                                <Text style={[styles.emptyNote, { color: theme.text.tertiary }]}>
                                                    {language === 'ar' ? 'لا توجد ملاحظات متاحة' : 'No notes available for this disclosure.'}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Sidebar Column (Docs & Comments) */}
                            <View style={[isDesktop && styles.sidebarColumn]}>
                                {/* PDF Section Card */}
                                <View style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border, marginBottom: 24 }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.iconContainer, { backgroundColor: theme.primary.main + '15' }]}>
                                            <Ionicons name="file-tray-full" size={24} color={theme.primary.main} />
                                        </View>
                                        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
                                            {language === 'ar' ? 'المستندات' : 'Documents'}
                                        </Text>
                                    </View>
                                    <View style={styles.pdfList}>
                                        {pdfUrls.map((url, index) => {
                                            const filename = decodeURIComponent(url.split('/').pop() || `Document ${index + 1}`);
                                            const displayName = filename.replace(/\.pdf$/i, '').replace(/%20/g, ' ');

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[styles.pdfItem, { backgroundColor: theme.background.primary }]}
                                                    onPress={() => navigation.navigate('PdfViewer', { url, title: `${currentTitle} (${index + 1})` })}
                                                >
                                                    <View style={[styles.pdfIcon, { backgroundColor: theme.primary.main + '15' }]}>
                                                        <Ionicons name="document" size={20} color={theme.primary.main} />
                                                    </View>
                                                    <Text style={[styles.pdfName, { color: theme.text.primary }]} numberOfLines={1}>
                                                        {displayName}
                                                    </Text>
                                                    <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={theme.text.tertiary} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* User Comments Section Card */}
                                <View style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <View style={[styles.iconContainer, { backgroundColor: theme.primary.main + '15' }]}>
                                                <Ionicons name="chatbubbles" size={24} color={theme.primary.main} />
                                            </View>
                                            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
                                                {language === 'ar' ? 'التعليقات' : 'Comments'}
                                            </Text>
                                        </View>
                                        <View style={[styles.commentCountBadge, { backgroundColor: theme.primary.main + '20' }]}>
                                            <Text style={[styles.commentCountText, { color: theme.primary.main }]}>{comments.length}</Text>
                                        </View>
                                    </View>

                                    {/* Comment Input */}
                                    <View style={[styles.commentInputContainer, { backgroundColor: theme.background.primary }]}>
                                        <TextInput
                                            ref={commentInputRef}
                                            style={[styles.commentInput, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}
                                            placeholder={language === 'ar' ? 'أضف تعليقًا...' : 'Add a comment...'}
                                            placeholderTextColor={theme.text.tertiary}
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            multiline
                                            maxLength={500}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.sendButton,
                                                { backgroundColor: commentText.trim() ? theme.primary.main : theme.background.tertiary }
                                            ]}
                                            onPress={handleSubmitComment}
                                            disabled={!commentText.trim() || submittingComment}
                                        >
                                            {submittingComment ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <Ionicons
                                                    name={isRTL ? "send" : "send"}
                                                    size={18}
                                                    color={commentText.trim() ? '#FFF' : theme.text.tertiary}
                                                    style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Comments List */}
                                    {commentsLoading ? (
                                        <View style={styles.commentsLoadingContainer}>
                                            <ActivityIndicator size="small" color={theme.primary.main} />
                                        </View>
                                    ) : comments.length > 0 ? (
                                        <View style={styles.commentsList}>
                                            {comments.map((comment) => (
                                                <View key={comment._id} style={[styles.commentItem, { backgroundColor: theme.background.primary }]}>
                                                    <View style={styles.commentHeader}>
                                                        <View style={[styles.commentAvatar, { backgroundColor: theme.primary.main + '20' }]}>
                                                            <Ionicons name="person" size={16} color={theme.primary.main} />
                                                        </View>
                                                        <View style={styles.commentMeta}>
                                                            <Text style={[styles.commentAuthor, { color: theme.text.primary }]}>
                                                                {comment.author?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                                                            </Text>
                                                            <Text style={[styles.commentDate, { color: theme.text.tertiary }]}>
                                                                {new Date(comment.createdAt).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text style={[styles.commentText, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                                        {comment.content}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.noCommentsContainer}>
                                            <Ionicons name="chatbubbles-outline" size={40} color={theme.text.tertiary} />
                                            <Text style={[styles.noCommentsText, { color: theme.text.tertiary }]}>
                                                {language === 'ar' ? 'لا توجد تعليقات بعد. كن أول من يعلق!' : 'No comments yet. Be the first to comment!'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Hero Header
    heroHeader: {
        paddingBottom: 20,
        marginBottom: 16,
    },
    headerToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        justifyContent: 'space-between',
        gap: 12,
    },
    heroContent: {
        paddingHorizontal: 24,
        marginTop: 8,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 8,
    },
    iconButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

    scrollContent: { padding: 0, paddingBottom: 60 },
    contentContainer: { paddingHorizontal: 24 },

    topMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    dateText: { fontSize: 14, fontWeight: '600' },

    companyRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, gap: 10, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 8 },
    companyName: { fontSize: 16, fontWeight: '700' },

    // Cards
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 20, fontWeight: '800' },

    editContainer: { gap: 16 },
    label: { fontSize: 15, fontWeight: '700', color: '#666', marginLeft: 4 },
    input: { borderRadius: 16, padding: 16, fontSize: 16, minHeight: 140, textAlignVertical: 'top', borderWidth: 1 },
    saveButton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    // Note Section
    noteContent: { minHeight: 120 },
    noteText: { fontSize: 18, lineHeight: 28, fontWeight: '500' },
    emptyNote: { textAlign: 'center', marginTop: 24, fontStyle: 'italic', fontSize: 16 },

    // PDF Section
    pdfList: { gap: 12 },
    pdfItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 16 },
    pdfIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    pdfName: { flex: 1, fontSize: 15, fontWeight: '600' },

    // Comment Section
    commentCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
    commentCountText: { fontSize: 13, fontWeight: '800' },
    commentInputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, borderRadius: 20, gap: 12, marginBottom: 24 },
    commentInput: { flex: 1, fontSize: 16, minHeight: 44, maxHeight: 120, paddingVertical: 10 },
    sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    commentsLoadingContainer: { padding: 32, alignItems: 'center' },

    // Desktop Styles
    desktopGrid: {
        flexDirection: 'row',
        gap: 24,
        alignItems: 'flex-start',
    },
    mainColumn: {
        flex: 2,
    },
    sidebarColumn: {
        flex: 1,
    },
    commentsList: { gap: 16 },
    commentItem: { padding: 16, borderRadius: 20 },
    commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    commentMeta: { flex: 1 },
    commentAuthor: { fontSize: 15, fontWeight: '700' },
    commentDate: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    commentText: { fontSize: 15, lineHeight: 24 },
    noCommentsContainer: { alignItems: 'center', paddingVertical: 40, gap: 16 },
    noCommentsText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
});

export default DisclosureDetailsScreen;
