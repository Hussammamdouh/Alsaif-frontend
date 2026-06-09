/**
 * useAdminSystemControl Hook
 * Custom React hook for Superadmin System Control Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import adminService from '../../../core/services/admin/adminService';
import { useSystemSettings } from '../../subscription/subscription.hooks';

export const useAdminSystemControl = () => {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [dbAnalysis, setDbAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for individual actions
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  // States for Certificate and Support Emails CRUD
  const [supportEmails, setSupportEmails] = useState<string[]>([]);
  const [isLicenseUploading, setIsLicenseUploading] = useState(false);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);

  // Integrate subscription settings toggles from existing hook
  const {
    settings,
    loading: isSettingsLoading,
    error: settingsError,
    refetch: refetchSettings,
    toggleSubscriptionPause: baseToggleSubscriptionPause,
    toggleNewSubscriptions: baseToggleNewSubscriptions,
  } = useSystemSettings();

  const fetchControlData = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setIsEmailsLoading(true);
    }
    setError(null);

    try {
      const [stats, analysis, emails] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getCollectionAnalysis(),
        adminService.getSupportEmails(),
        refetchSettings(),
      ]);

      setSystemStats(stats);
      setDbAnalysis(analysis);
      setSupportEmails(emails);
    } catch (err: any) {
      console.error('[useAdminSystemControl] Error fetching controls data:', err);
      setError(err.message || 'Failed to fetch system control data');
    } finally {
      setIsLoading(false);
      setIsEmailsLoading(false);
    }
  }, [refetchSettings]);

  const runDatabaseMaintenance = useCallback(async () => {
    setIsMaintenanceLoading(true);
    try {
      await adminService.performDatabaseMaintenance();
      Alert.alert('Success', 'Database maintenance completed successfully.');
      await fetchControlData(true);
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Database maintenance failed.');
      return false;
    } finally {
      setIsMaintenanceLoading(false);
    }
  }, [fetchControlData]);

  const handleClearFailedJobs = useCallback(async () => {
    setIsJobsLoading(true);
    try {
      const result = await adminService.clearFailedJobs();
      Alert.alert('Success', `Cleared failed jobs successfully. ${result.deletedCount || 0} jobs removed.`);
      await fetchControlData(true);
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clear jobs.');
      return false;
    } finally {
      setIsJobsLoading(true); // Wait, should be false! Let's make sure it's false in finally.
      setIsJobsLoading(false);
    }
  }, [fetchControlData]);

  const handleRetryFailedJobs = useCallback(async () => {
    setIsJobsLoading(true);
    try {
      const result = await adminService.retryFailedJobs();
      Alert.alert('Success', `Queued failed jobs for retry. ${result.retriedCount || 0} jobs retried.`);
      await fetchControlData(true);
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to retry jobs.');
      return false;
    } finally {
      setIsJobsLoading(false);
    }
  }, [fetchControlData]);

  const handleResetMetrics = useCallback(async () => {
    setIsMetricsLoading(true);
    try {
      await adminService.resetPerformanceMetrics();
      Alert.alert('Success', 'Performance metrics reset successfully.');
      await fetchControlData(true);
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset performance metrics.');
      return false;
    } finally {
      setIsMetricsLoading(false);
    }
  }, [fetchControlData]);

  const toggleSubscriptionPause = useCallback(async (pausedState?: boolean) => {
    try {
      await baseToggleSubscriptionPause(pausedState);
      await fetchControlData(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle subscription pause.');
    }
  }, [baseToggleSubscriptionPause, fetchControlData]);

  const toggleNewSubscriptions = useCallback(async (enabledState?: boolean, customMessage?: string) => {
    try {
      await baseToggleNewSubscriptions(enabledState, customMessage);
      await fetchControlData(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle new subscriptions.');
    }
  }, [baseToggleNewSubscriptions, fetchControlData]);

  const uploadLicensePdf = useCallback(async (formData: FormData) => {
    setIsLicenseUploading(true);
    try {
      await adminService.uploadLicense(formData);
      Alert.alert('Success', 'Certificate uploaded successfully.');
      await refetchSettings(); // reload settings to get new URL
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload certificate.');
      return false;
    } finally {
      setIsLicenseUploading(false);
    }
  }, [refetchSettings]);

  const deleteLicensePdf = useCallback(async () => {
    setIsLicenseUploading(true);
    try {
      await adminService.deleteLicense();
      Alert.alert('Success', 'Certificate removed successfully, reverted to default.');
      await refetchSettings(); // reload settings to get new URL
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to remove certificate.');
      return false;
    } finally {
      setIsLicenseUploading(false);
    }
  }, [refetchSettings]);

  const handleAddSupportEmail = useCallback(async (email: string) => {
    setIsEmailsLoading(true);
    try {
      const updated = await adminService.addSupportEmail(email);
      setSupportEmails(updated);
      Alert.alert('Success', 'Support email added successfully.');
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add support email.');
      return false;
    } finally {
      setIsEmailsLoading(false);
    }
  }, []);

  const handleDeleteSupportEmail = useCallback(async (email: string) => {
    setIsEmailsLoading(true);
    try {
      const updated = await adminService.deleteSupportEmail(email);
      setSupportEmails(updated);
      Alert.alert('Success', 'Support email removed successfully.');
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete support email.');
      return false;
    } finally {
      setIsEmailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchControlData();
  }, [fetchControlData]);

  return {
    systemStats,
    dbAnalysis,
    settings,
    supportEmails,
    isLicenseUploading,
    isEmailsLoading,
    isLoading: isLoading || isSettingsLoading,
    error: error || settingsError,
    refresh: () => fetchControlData(false),
    runDatabaseMaintenance,
    clearFailedJobs: handleClearFailedJobs,
    retryFailedJobs: handleRetryFailedJobs,
    resetPerformanceMetrics: handleResetMetrics,
    toggleSubscriptionPause,
    toggleNewSubscriptions,
    uploadLicensePdf,
    deleteLicensePdf,
    addSupportEmail: handleAddSupportEmail,
    deleteSupportEmail: handleDeleteSupportEmail,
    isMaintenanceLoading,
    isJobsLoading,
    isMetricsLoading,
  };
};
