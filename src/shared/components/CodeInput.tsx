/**
 * CodeInput Component
 * A premium 6-digit input component with individual digit boxes and animations.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
    Text,
} from 'react-native';
import { useTheme } from '../../app/providers';

interface CodeInputProps {
    value: string;
    onChangeText: (value: string) => void;
    length?: number;
    error?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
    value,
    onChangeText,
    length = 6,
    error = false,
}) => {
    const { theme } = useTheme();
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Create an array of refs for animations if needed, or just use one for the container
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (error) {
            triggerShake();
        }
    }, [error]);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handlePress = () => {
        inputRef.current?.focus();
    };

    const renderBoxes = () => {
        const boxes = [];
        for (let i = 0; i < length; i++) {
            const char = value[i] || '';
            const isActive = isFocused && (value.length === i || (value.length === length && i === length - 1));

            boxes.push(
                <View
                    key={i}
                    style={[
                        styles.box,
                        {
                            borderColor: error ? theme.accent.error : (isActive ? theme.primary.main : theme.ui.border),
                            backgroundColor: theme.ui.card,
                        },
                        isActive && styles.activeBox
                    ]}
                >
                    <Text style={[styles.boxText, { color: theme.text.primary }]}>
                        {char}
                    </Text>
                    {isActive && (
                        <Animated.View
                            style={[styles.cursor, { backgroundColor: theme.primary.main }]}
                        />
                    )}
                </View>
            );
        }
        return boxes;
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={handlePress}
            style={styles.container}
        >
            <Animated.View style={[
                styles.boxesContainer,
                { transform: [{ translateX: shakeAnim }] }
            ]}>
                {renderBoxes()}
            </Animated.View>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9]/g, '').slice(0, length);
                    onChangeText(cleanText);
                }}
                keyboardType="number-pad"
                maxLength={length}
                style={styles.hiddenInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                caretHidden
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 20,
    },
    boxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 400,
    },
    box: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    activeBox: {
        transform: [{ scale: 1.05 }],
    },
    boxText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    cursor: {
        position: 'absolute',
        bottom: 12,
        width: 20,
        height: 2,
        borderRadius: 1,
    }
});
