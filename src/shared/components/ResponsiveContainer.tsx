/**
 * Responsive Container Component
 * Constrains content width on desktop while keeping full-width on mobile
 */

import React from 'react';
import { View, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    maxWidth?: number;
    style?: ViewStyle;
}

const DESKTOP_BREAKPOINT = 768;
const DEFAULT_MAX_WIDTH = 2000;

/**
 * ResponsiveContainer wraps content and constrains its width on desktop screens.
 * On mobile (width <= 768px), content uses full width.
 * On desktop (width > 768px), content is centered with a max-width constraint.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    maxWidth = DEFAULT_MAX_WIDTH,
    style,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width > DESKTOP_BREAKPOINT;

    return (
        <View
            style={[
                styles.container,
                isDesktop && { maxWidth, alignSelf: 'center' as const },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

export default ResponsiveContainer;
