import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../app/providers/ThemeProvider';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
}

const editorHtml = (isDark: boolean, initialContent: string, placeholder: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 12px;
      min-height: 150px;
      color: ${isDark ? '#E5E7EB' : '#1F2937'};
      background: ${isDark ? '#1F2937' : '#FFFFFF'};
    }
    #editor {
      outline: none;
      min-height: 120px;
    }
    #editor:empty:before {
      content: attr(data-placeholder);
      color: ${isDark ? '#6B7280' : '#9CA3AF'};
      pointer-events: none;
    }
    #editor ul, #editor ol { padding-left: 20px; }
    #editor h1, #editor h2, #editor h3 { margin: 8px 0; }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" data-placeholder="${placeholder}">
    ${initialContent}
  </div>
  <script>
    const editor = document.getElementById('editor');
    
    function sendContent() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'content',
        html: editor.innerHTML
      }));
    }
    
    editor.addEventListener('input', sendContent);
    
    window.execCommand = function(cmd, value) {
      document.execCommand(cmd, false, value || null);
      editor.focus();
      sendContent();
    };
    
    window.setContent = function(html) {
      editor.innerHTML = html;
    };
  </script>
</body>
</html>
`;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    minHeight = 200,
}) => {
    const { theme, isDark } = useTheme();
    const webViewRef = useRef<WebView>(null);
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    const execCommand = useCallback((command: string, value?: string) => {
        if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`window.execCommand('${command}', '${value || ''}'); true;`);
        }
        setActiveFormats(prev =>
            prev.includes(command) ? prev.filter(f => f !== command) : [...prev, command]
        );
    }, []);

    const handleMessage = useCallback((event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'content') {
                onChange(data.html);
            }
        } catch (e) {
            console.error('Error parsing WebView message:', e);
        }
    }, [onChange]);

    const ToolbarButton: React.FC<{
        icon?: string;
        label?: string;
        command: string;
        value?: string;
    }> = ({ icon, label, command, value }) => {
        const isActive = activeFormats.includes(command);
        return (
            <TouchableOpacity
                style={[
                    styles.toolbarButton,
                    { backgroundColor: isActive ? theme.primary.main : theme.background.tertiary }
                ]}
                onPress={() => execCommand(command, value)}
                activeOpacity={0.7}
            >
                {icon ? (
                    <Ionicons name={icon as any} size={18} color={isActive ? '#FFF' : theme.text.primary} />
                ) : (
                    <Text style={[styles.toolbarButtonText, { color: isActive ? '#FFF' : theme.text.primary }]}>
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
                <ToolbarButton label="B" command="bold" />
                <ToolbarButton label="I" command="italic" />
                <ToolbarButton label="U" command="underline" />
                <View style={styles.separator} />
                <ToolbarButton icon="list" command="insertUnorderedList" />
                <ToolbarButton icon="reorder-three" command="insertOrderedList" />
                <View style={styles.separator} />
                <ToolbarButton label="H1" command="formatBlock" value="h1" />
                <ToolbarButton label="H2" command="formatBlock" value="h2" />
            </View>

            {/* WebView Editor */}
            <View style={[styles.editorContainer, { borderColor: theme.ui.border, minHeight }]}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: editorHtml(isDark, value, placeholder) }}
                    onMessage={handleMessage}
                    scrollEnabled={true}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>
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
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default RichTextEditor;
