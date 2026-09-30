import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/utils/colors';
import { Button, Card, Timer } from '@/components';
import { bleDiscovery } from '@/utils/bleDiscovery';

interface NearbyUser {
  id: string;
  displayName: string;
  targetLanguage: string;
  nativeLanguage: string;
  distance: number;
}

type BlitzState = 'idle' | 'discovering' | 'matching' | 'chatting' | 'extending';

export const BlitzScreen: React.FC = () => {
  const [state, setState] = useState<BlitzState>('idle');
  const [discoverEnabled, setDiscoverEnabled] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [chatTime, setChatTime] = useState(120); // 2 minutes

  useEffect(() => {
    if (discoverEnabled) {
      startDiscovery();
    } else {
      stopDiscovery();
    }
  }, [discoverEnabled]);

  const startDiscovery = async () => {
    try {
      setLoading(true);
      setState('discovering');
      await bleDiscovery.startDiscovery();
      // Simulate finding users
      setNearbyUsers([
        {
          id: '1',
          displayName: 'Sofia',
          targetLanguage: 'es',
          nativeLanguage: 'pt',
          distance: 15,
        },
        {
          id: '2',
          displayName: 'Marco',
          targetLanguage: 'it',
          nativeLanguage: 'en',
          distance: 22,
        },
        {
          id: '3',
          displayName: 'Emma',
          targetLanguage: 'fr',
          nativeLanguage: 'de',
          distance: 31,
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to start discovery:', error);
      setDiscoverEnabled(false);
      setLoading(false);
    }
  };

  const stopDiscovery = () => {
    bleDiscovery.stopDiscovery();
    setState('idle');
    setNearbyUsers([]);
  };

  const handleUserSelected = (user: NearbyUser) => {
    setSelectedUser(user);
    setState('matching');
    // Simulate matching
    setTimeout(() => {
      setState('chatting');
      setChatTime(120);
    }, 1500);
  };

  const handleExtendChat = () => {
    setState('extending');
    // Show unlock options
  };

  const handleEndChat = () => {
    setSelectedUser(null);
    setState('discovering');
  };

  if (state === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Blitz</Text>
          <Text style={styles.headerSubtitle}>
            Speed dating for language learners
          </Text>
        </View>

        <View style={styles.mainContent}>
          <Card style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>2-Minute Chats</Text>
              <Text style={styles.featureDesc}>
                Quick, intense language immersion sessions
              </Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Text style={styles.featureIcon}>🎲</Text>
              <Text style={styles.featureTitle}>Random Matching</Text>
              <Text style={styles.featureDesc}>
                Meet new learners near you via BLE
              </Text>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Text style={styles.featureIcon}>👤</Text>
              <Text style={styles.featureTitle}>Anonymous</Text>
              <Text style={styles.featureDesc}>
                No names or photos during chat
              </Text>
            </View>
          </Card>

          <View style={styles.discoverToggle}>
            <Text style={styles.toggleLabel}>Enable Discover</Text>
            <Switch
              value={discoverEnabled}
              onValueChange={setDiscoverEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Conversations are private and ephemeral
          </Text>
        </View>
      </View>
    );
  }

  if (state === 'discovering' && !selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDiscoverEnabled(false)}>
            <Text style={styles.backButton}>← Stop</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scanning for nearby users...</Text>
          </View>
        ) : nearbyUsers.length > 0 ? (
          <View style={styles.usersContainer}>
            <Text style={styles.usersTitle}>
              Found {nearbyUsers.length} users nearby
            </Text>

            {nearbyUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => handleUserSelected(user)}
              >
                <Card style={styles.userCard}>
                  <View style={styles.userCardContent}>
                    <View style={styles.userCardHeader}>
                      <View style={styles.userCardPhoto} />
                      <View style={styles.userCardInfo}>
                        <Text style={styles.userCardName}>
                          Learning {user.targetLanguage.toUpperCase()}
                        </Text>
                        <Text style={styles.userCardLang}>
                          Native: {user.nativeLanguage.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userCardDistance}>
                      <Text style={styles.distanceText}>
                        {Math.round(user.distance)}m away
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUsersIcon}>🔍</Text>
            <Text style={styles.noUsersText}>No users nearby yet</Text>
            <Text style={styles.noUsersSubtext}>
              Turn on your Bluetooth and come back
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (state === 'matching') {
    return (
      <View style={styles.container}>
        <View style={styles.matchingContainer}>
          <Text style={styles.matchingTitle}>Finding match...</Text>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.matchingCountdown}>
            {selectedUser?.displayName} ({selectedUser?.targetLanguage.toUpperCase()})
          </Text>
        </View>
      </View>
    );
  }

  if (state === 'chatting' && selectedUser) {
    return (
      <View style={styles.container}>
        {/* Header with user info and timer */}
        <View style={styles.chatHeader}>
          <View />
          <Timer
            initialSeconds={chatTime}
            onTimeUp={() => setState('extending')}
            size="large"
          />
          <TouchableOpacity onPress={handleEndChat}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Chat area */}
        <View style={styles.chatContainer}>
          <Card style={styles.chatCard}>
            <Text style={styles.chatLabel}>Your speech</Text>
            <Text style={styles.chatText}>Listening...</Text>
          </Card>

          <View style={styles.chatDivider}>
            <Text style={styles.dividerIcon}>↓</Text>
          </View>

          <Card style={[styles.chatCard, styles.responseCard]}>
            <Text style={styles.chatLabel}>Live translation</Text>
            <Text style={styles.chatText}>Translating your voice...</Text>
          </Card>
        </View>

        {/* Microphone button */}
        <View style={styles.chatControls}>
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state === 'extending') {
    return (
      <View style={styles.container}>
        <View style={styles.extendingContainer}>
          <Text style={styles.extendingIcon}>⏰</Text>
          <Text style={styles.extendingTitle}>Time's up!</Text>
          <Text style={styles.extendingText}>
            Would you like to continue chatting?
          </Text>

          <View style={styles.extendingOptions}>
            <Card style={styles.optionCard}>
              <TouchableOpacity style={styles.optionContent}>
                <Text style={styles.optionIcon}>⭐</Text>
                <Text style={styles.optionTitle}>Unlock Unlimited</Text>
                <Text style={styles.optionPrice}>$12/month (Pro)</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.optionCard}>
              <TouchableOpacity style={styles.optionContent}>
                <Text style={styles.optionIcon}>💬</Text>
                <Text style={styles.optionTitle}>Share WhatsApp</Text>
                <Text style={styles.optionPrice}>Keep talking privately</Text>
              </TouchableOpacity>
            </Card>
          </View>

          <Button
            title="End Chat"
            variant="outline"
            onPress={handleEndChat}
            style={styles.endChatButton}
          />
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  featureCard: {
    marginBottom: 12,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
  },
  discoverToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.pastelPurple,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.pastelGreen,
    margin: 16,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },

  // Discovering
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  usersContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 12,
  },
  userCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userCardPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userCardLang: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  userCardDistance: {
    backgroundColor: colors.pastelBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUsersIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noUsersText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  noUsersSubtext: {
    fontSize: 14,
    color: colors.textLight,
  },

  // Matching
  matchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  matchingCountdown: {
    marginTop: 24,
    fontSize: 14,
    color: colors.textLight,
  },

  // Chatting
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    gap: 12,
  },
  chatCard: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  responseCard: {
    backgroundColor: colors.pastelOrange,
  },
  chatLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 8,
  },
  chatText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  chatDivider: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dividerIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  chatControls: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 36,
  },

  // Extending
  extendingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extendingIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  extendingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  extendingText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  extendingOptions: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  optionCard: {
    marginBottom: 0,
  },
  optionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 12,
    color: colors.textLight,
  },
  endChatButton: {
    width: 140,
  },
});
