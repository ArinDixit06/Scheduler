import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  Vibration,
  LayoutAnimation,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ScreenShell } from '../../components/common/ScreenShell';
import { usePlannerStore } from '../../store/plannerStore';
import { colors } from '../../constants/colors';

// Complete incoming OAuth redirect loops cleanly
WebBrowser.maybeCompleteAuthSession();

export function IntegrationsScreen() {
  const integrations = usePlannerStore((s) => s.integrations);
  const toggleIntegration = usePlannerStore((s) => s.toggleIntegration);
  const syncGoogleCalendar = usePlannerStore((s) => s.syncGoogleCalendar);

  // Simulated UI states
  const [isOAuthVisible, setIsOAuthVisible] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  // Real production Google OAuth integration hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly']
  });

  // Handle successful live authorization callback
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const accessToken = response.authentication.accessToken;
      setSyncingProvider('gcal');
      
      // Perform live sync fetch with Google access token
      syncGoogleCalendar(accessToken).then(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSyncingProvider(null);
        Vibration.vibrate(15);
      }).catch((err) => {
        console.error('Error during active calendar sync:', err);
        setSyncingProvider(null);
      });
    }
  }, [response]);

  const handleConnectIntegration = (providerId: string) => {
    Vibration.vibrate(10);
    if (providerId === 'gcal') {
      // Launch branded permissions card overlay
      setIsOAuthVisible(true);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleIntegration(providerId);
    }
  };

  const handleOAuthAllow = async () => {
    Vibration.vibrate(8);
    setIsOAuthVisible(false);
    
    // Launch standard system browser OAuth login prompt
    try {
      await promptAsync();
    } catch (err) {
      console.warn('OAuth prompt cancelled or blocked:', err);
    }
  };

  const handleManualSync = (providerId: string) => {
    Vibration.vibrate(8);
    setSyncingProvider(providerId);
    
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (providerId === 'gcal') {
        // Run calendar sync fetch
        syncGoogleCalendar();
      } else {
        toggleIntegration(providerId);
      }
      setSyncingProvider(null);
      Vibration.vibrate(12);
    }, 1800);
  };

  const getProviderIcon = (id: string) => {
    if (id === 'gcal') return 'logo-google';
    if (id === 'outlook') return 'mail-outline';
    if (id === 'slack') return 'logo-slack';
    return 'logo-github';
  };

  const getProviderColor = (id: string) => {
    if (id === 'gcal') return '#EA4335';
    if (id === 'outlook') return '#0078D4';
    if (id === 'slack') return '#4A154B';
    return '#24292E';
  };

  return (
    <ScreenShell
      title="Integrations"
      subtitle="Connect external calendars and tools to unify your flow state work."
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>CONNECTED PROVIDERS</Text>

        <View style={styles.cardsStack}>
          {integrations.map((item) => {
            const iconName = getProviderIcon(item.id);
            const brandColor = getProviderColor(item.id);
            const isSyncing = syncingProvider === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.providerCard,
                  item.connected && styles.providerCardConnected
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.brandIconBg, { backgroundColor: `${brandColor}12` }]}>
                    <Ionicons name={iconName as any} size={22} color={brandColor} />
                  </View>

                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{item.name}</Text>
                    <Text style={styles.providerScope}>{item.scope}</Text>
                  </View>

                  {item.connected ? (
                    <View style={styles.connectedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.connectedText}>Connected</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.syncStatusText}>
                    {isSyncing ? 'Synchronizing...' : `Last Synced: ${item.lastSyncedAt}`}
                  </Text>

                  <View style={styles.actionsRow}>
                    {item.connected ? (
                      <>
                        <Pressable
                          disabled={isSyncing}
                          onPress={() => handleManualSync(item.id)}
                          style={({ pressed }) => [
                            styles.syncButton,
                            pressed && styles.buttonPressed,
                            isSyncing && styles.disabledButton
                          ]}
                        >
                          {isSyncing ? (
                            <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 6 }} />
                          ) : (
                            <Ionicons name="sync-outline" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                          )}
                          <Text style={styles.syncButtonText}>Sync</Text>
                        </Pressable>

                        <Pressable
                          disabled={isSyncing}
                          onPress={() => {
                            Vibration.vibrate(10);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            toggleIntegration(item.id);
                          }}
                          style={({ pressed }) => [
                            styles.disconnectButton,
                            pressed && styles.buttonPressed
                          ]}
                        >
                          <Text style={styles.disconnectButtonText}>Disconnect</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => handleConnectIntegration(item.id)}
                        style={({ pressed }) => [
                          styles.connectButton,
                          { backgroundColor: brandColor },
                          pressed && styles.buttonPressed
                        ]}
                      >
                        <Ionicons name="link-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.connectButtonText}>Connect</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Branded Google OAuth Authorization Info Modal */}
      <Modal
        visible={isOAuthVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOAuthVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.dismissArea} onPress={() => setIsOAuthVisible(false)} />
          
          <View style={styles.modalSheetContent}>
            <View style={styles.sheetHandle} />

            <View style={styles.gLogoWrapper}>
              <Ionicons name="logo-google" size={40} color="#EA4335" />
            </View>

            <Text style={styles.oauthTitle}>Sign in with Google</Text>
            <Text style={styles.oauthSubtitle}>
              Chronos requests authorization to link your calendar meetings and focus activities.
            </Text>

            <View style={styles.permissionsGroup}>
              <View style={styles.permissionItem}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <View style={styles.permissionItemContent}>
                  <Text style={styles.permissionItemTitle}>View your calendar events</Text>
                  <Text style={styles.permissionItemDesc}>Allows Chronos to synchronize meeting blocks into your daily dashboard agenda.</Text>
                </View>
              </View>

              <View style={styles.permissionItem}>
                <Ionicons name="people-outline" size={20} color="#6B7280" />
                <View style={styles.permissionItemContent}>
                  <Text style={styles.permissionItemTitle}>Read workspace schedules</Text>
                  <Text style={styles.permissionItemDesc}>Accesses scheduling periods to suggest optimal Pomodoro focus time slots.</Text>
                </View>
              </View>
            </View>

            <Text style={styles.privacyDisclaim}>
              By proceeding, you authorize Chronos to securely manage calendar resources locally. No data leaves your mobile device.
            </Text>

            <View style={styles.buttonActionGroup}>
              <Pressable
                onPress={() => setIsOAuthVisible(false)}
                style={({ pressed }) => [styles.oauthCancelBtn, pressed && styles.buttonPressed]}
              >
                <Text style={styles.oauthCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!request}
                onPress={handleOAuthAllow}
                style={({ pressed }) => [
                  styles.oauthAllowBtn,
                  pressed && styles.buttonPressed,
                  !request && styles.disabledButton
                ]}
              >
                <Text style={styles.oauthAllowBtnText}>Allow & Link</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 4,
    paddingBottom: 40
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSubdued,
    letterSpacing: 1.5,
    marginBottom: 14
  },
  cardsStack: {
    gap: 16
  },
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  providerCardConnected: {
    borderColor: '#3B82F6'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: colors.border,
    paddingBottom: 14
  },
  brandIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  providerInfo: {
    flex: 1
  },
  providerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  providerScope: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: 2
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  connectedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981'
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12
  },
  syncStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSubdued
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  connectButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  syncButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6'
  },
  disconnectButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  disconnectButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  disabledButton: {
    opacity: 0.6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  dismissArea: {
    flex: 1
  },
  modalSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    alignItems: 'center'
  },
  sheetHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 20
  },
  gLogoWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  oauthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1E24',
    marginBottom: 6
  },
  oauthSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginBottom: 24
  },
  permissionsGroup: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginBottom: 20
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  permissionItemContent: {
    flex: 1
  },
  permissionItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E1E24'
  },
  permissionItemDesc: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2
  },
  privacyDisclaim: {
    fontSize: 9.5,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 12,
    marginBottom: 24
  },
  buttonActionGroup: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  oauthCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  oauthCancelBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '800'
  },
  oauthAllowBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA4335',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2
  },
  oauthAllowBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800'
  }
});
