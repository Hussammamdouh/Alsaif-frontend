/**
 * Admin Guard Component
 * Protects admin routes with role-based access control
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth';
import { UserRole } from '../auth/auth.types';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackMessage?: string;
}

/**
 * Admin Guard
 * Wraps admin screens to enforce role-based access
 *
 * @param children - Screen component to protect
 * @param requiredRole - Required role(s) to access (defaults to ADMIN or SUPERADMIN)
 * @param fallbackMessage - Custom message for unauthorized access
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requiredRole = [UserRole.ADMIN, UserRole.SUPERADMIN],
  fallbackMessage = 'You do not have permission to access this page.',
}) => {
  const { state } = useAuth();
  const navigation = useNavigation();

  // Check if user is authenticated
  if (!state.isAuthenticated || !state.session?.user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="lock-closed" size={64} color="#ff3b30" />
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.message}>Please log in to access this page.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Auth' as never, { screen: 'Login' } as never)}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userRole = state.session.user.role;

  // Check if user has required role
  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(userRole)
    : userRole === requiredRole;

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="shield-off" size={64} color="#ff3b30" />
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.message}>{fallbackMessage}</Text>
          <Text style={styles.roleInfo}>
            Your role: <Text style={styles.roleBadge}>{userRole}</Text>
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User has access, render children
  return <>{children}</>;
};

/**
 * Superadmin Guard
 * Shorthand for superadmin-only routes
 */
export const SuperadminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminGuard
      requiredRole={UserRole.SUPERADMIN}
      fallbackMessage="This page is only accessible to superadmins."
    >
      {children}
    </AdminGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleInfo: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 24,
  },
  roleBadge: {
    fontWeight: '600',
    color: '#007aff',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007aff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
