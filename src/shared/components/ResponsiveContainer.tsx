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

const DESKTOP_BREAKPOINT = 1024;
const DEFAULT_MAX_WIDTH = 2000;

/**
 * ResponsiveContainer wraps content and constrains its width on desktop screens.
 * On mobile (width <= 1024px), content uses full width.
 * On desktop (width > 1024px), content is centered with a max-width constraint.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    maxWidth = DEFAULT_MAX_WIDTH,
    style,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width > DESKTOP_BREAKPOINT;
    const activeMaxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    const shouldConstrain = isDesktop && width > activeMaxWidth;

    return (
        <View
            style={[
                styles.container,
                shouldConstrain ? { 
                    maxWidth: activeMaxWidth, 
                    alignSelf: 'center' as const,
                    width: activeMaxWidth,
                } : null,
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
        flex: 1,
    },
});

export default ResponsiveContainer;
