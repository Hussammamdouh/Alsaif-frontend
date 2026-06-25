import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../app/providers/ThemeProvider';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    minHeight = 200,
}) => {
    const { theme, isDark } = useTheme();
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    // Check which formats are currently active at the cursor position
    const updateActiveFormats = useCallback(() => {
        if (typeof document !== 'undefined') {
            const formats: string[] = [];
            if (document.queryCommandState('bold')) formats.push('bold');
            if (document.queryCommandState('italic')) formats.push('italic');
            if (document.queryCommandState('underline')) formats.push('underline');
            if (document.queryCommandState('insertUnorderedList')) formats.push('insertUnorderedList');
            if (document.queryCommandState('insertOrderedList')) formats.push('insertOrderedList');
            setActiveFormats(formats);
        }
    }, []);

    // Web implementation with direct DOM manipulation
    const handleFormat = useCallback((command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value || undefined);
            // Update content
            onChange(editorRef.current.innerHTML);
            // Update active formats
            setTimeout(updateActiveFormats, 10);
        }
    }, [onChange, updateActiveFormats]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateActiveFormats();
        }
    }, [onChange, updateActiveFormats]);

    const handleSelectionChange = useCallback(() => {
        updateActiveFormats();
    }, [updateActiveFormats]);

    // Set up event listeners on mount
    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [handleSelectionChange]);

    // Set initial content
    useEffect(() => {
        if (editorRef.current && value && editorRef.current.innerHTML !== value) {
            // Only set if the editor is empty (initial load)
            if (!editorRef.current.innerHTML.trim()) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const WebToolbarButton: React.FC<{
        icon?: string;
        label?: string;
        command: string;
        commandValue?: string;
        isBold?: boolean;
        isItalic?: boolean;
        isUnderline?: boolean;
    }> = ({ icon, label, command, commandValue, isBold, isItalic, isUnderline }) => {
        const isActive = activeFormats.includes(command);
        return (
            <TouchableOpacity
                style={[
                    styles.toolbarButton,
                    { backgroundColor: isActive ? theme.primary.main : theme.background.tertiary }
                ]}
                onPress={() => handleFormat(command, commandValue)}
                activeOpacity={0.7}
            >
                {icon ? (
                    <Ionicons name={icon as any} size={18} color={isActive ? '#FFF' : theme.text.primary} />
                ) : (
                    <Text style={[
                        styles.toolbarButtonText,
                        { color: isActive ? '#FFF' : theme.text.primary },
                        isBold && { fontWeight: '900' },
                        isItalic && { fontStyle: 'italic' },
                        isUnderline && { textDecorationLine: 'underline' },
                    ]}>
                        {label}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Formatting Toolbar */}
            <View style={[styles.toolbar, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}>
                <WebToolbarButton label="B" command="bold" isBold />
                <WebToolbarButton label="I" command="italic" isItalic />
                <WebToolbarButton label="U" command="underline" isUnderline />
                <View style={styles.separator} />
                <WebToolbarButton icon="list" command="insertUnorderedList" />
                <WebToolbarButton icon="reorder-three" command="insertOrderedList" />
                <View style={styles.separator} />
                <WebToolbarButton label="H1" command="formatBlock" commandValue="h1" />
                <WebToolbarButton label="H2" command="formatBlock" commandValue="h2" />
            </View>

            {/* Contenteditable Editor */}
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.editorContainer, { borderColor: theme.ui.border }]}
                onPress={() => editorRef.current?.focus()}
            >
                <div
                    ref={editorRef as any}
                    contentEditable
                    onInput={handleInput}
                    onBlur={handleInput}
                    style={{
                        minHeight: minHeight - 50,
                        padding: 12,
                        fontSize: 16,
                        lineHeight: 1.6,
                        outline: 'none',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        overflow: 'auto',
                        cursor: 'text',
                    }}
                    data-placeholder={placeholder}
                    suppressContentEditableWarning
                />
            </TouchableOpacity>
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: ${isDark ? '#6B7280' : '#9CA3AF'};
                    pointer-events: none;
                }
                [contenteditable] ul, [contenteditable] ol { padding-left: 20px; }
                [contenteditable] h1 { font-size: 24px; font-weight: 800; margin: 8px 0; }
                [contenteditable] h2 { font-size: 20px; font-weight: 700; margin: 8px 0; }
            `}</style>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        gap: 6,
        flexWrap: 'wrap',
    },
    toolbarButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbarButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(128,128,128,0.3)',
        marginHorizontal: 4,
    },
    editorContainer: {
        borderWidth: 1,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        overflow: 'hidden',
    },
});

export default RichTextEditor;
