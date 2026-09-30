import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '@/utils/colors';
import { Button, Card, Timer } from '@/components';
import { AudioRecorder } from '@/utils/audioUtils';
import { WebRTCPeer, getUserAudioStream } from '@/utils/webrtcUtils';

interface ConnectedUser {
  id: string;
  name: string;
  language: string;
  photo: string;
}

type TranslateState = 'idle' | 'listening' | 'translating' | 'connected' | 'waiting';

export const TranslateScreen: React.FC = () => {
  const [state, setState] = useState<TranslateState>('idle');
  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranslation, setLastTranslation] = useState('');
  const [chatDuration, setChatDuration] = useState(0);

  const recorderRef = useRef(new AudioRecorder());
  const webrtcRef = useRef<WebRTCPeer | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      recorderRef.current?.cleanup();
      webrtcRef.current?.cleanup();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await recorderRef.current.startRecording();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setState('translating');
      const uri = await recorderRef.current.stopRecording();
      // Send to Grok for translation
      setLastTranslation(`[Translation from ${uri}]`);
      setState('connected');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleQRScan = () => {
    // Simulate connecting via QR code
    setConnectedUser({
      id: 'user_123',
      name: 'Maria',
      language: 'es',
      photo: 'https://via.placeholder.com/100',
    });
    setState('connected');
  };

  const handleInviteShare = () => {
    Alert.alert('Share', 'Share this code with your partner: ECHO2024');
  };

  if (state === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Translate</Text>
          <Text style={styles.headerSubtitle}>
            Real-time peer-to-peer voice translation
          </Text>
        </View>

        <View style={styles.mainContent}>
          <Card style={styles.methodCard}>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={handleQRScan}
            >
              <Text style={styles.methodIcon}>📱</Text>
              <Text style={styles.methodTitle}>Scan QR Code</Text>
              <Text style={styles.methodDesc}>
                Scan your partner's code
              </Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.methodCard}>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={handleInviteShare}
            >
              <Text style={styles.methodIcon}>🔗</Text>
              <Text style={styles.methodTitle}>Share Code</Text>
              <Text style={styles.methodDesc}>
                Generate a 6-digit code
              </Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.methodCard}>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => setState('waiting')}
            >
              <Text style={styles.methodIcon}>⏳</Text>
              <Text style={styles.methodTitle}>Wait for Connection</Text>
              <Text style={styles.methodDesc}>
                Go online and wait for others
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Your conversations are encrypted end-to-end
          </Text>
        </View>
      </View>
    );
  }

  if (state === 'waiting') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setState('idle')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.waitingContainer}>
          <Text style={styles.waitingTitle}>Waiting for connection...</Text>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.waitingCode}>Your code: ECHO2024</Text>

          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setState('idle')}
            style={styles.cancelButton}
          />
        </View>
      </View>
    );
  }

  if (state === 'connected' && connectedUser) {
    return (
      <View style={styles.container}>
        {/* User Info Header */}
        <View style={styles.connectedHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userPhoto} />
            <View>
              <Text style={styles.userName}>{connectedUser.name}</Text>
              <Text style={styles.userLanguage}>
                Learning: {connectedUser.language.toUpperCase()}
              </Text>
            </View>
          </View>
          <Timer initialSeconds={120} size="small" />
        </View>

        {/* Translation Display */}
        <View style={styles.translationContainer}>
          <Card style={styles.translationCard}>
            <Text style={styles.translationLabel}>Your message</Text>
            <Text style={styles.translationText}>
              {lastTranslation || 'Tap microphone to speak...'}
            </Text>
          </Card>

          <View style={styles.translationArrow}>
            <Text style={styles.arrowText}>🔄</Text>
          </View>

          <Card style={[styles.translationCard, styles.responseCard]}>
            <Text style={styles.translationLabel}>Translation</Text>
            <Text style={styles.translationText}>
              [Waiting for partner's response...]
            </Text>
          </Card>
        </View>

        {/* Recording Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <Text style={styles.recordIcon}>
              {isRecording ? '🟥' : '🎤'}
            </Text>
          </TouchableOpacity>

          <Button
            title="End Chat"
            variant="outline"
            onPress={() => {
              setConnectedUser(null);
              setState('idle');
            }}
            style={styles.endButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );
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
    gap: 12,
  },
  methodCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  methodButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
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

  // Waiting styles
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  waitingCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: 24,
    letterSpacing: 2,
  },
  cancelButton: {
    width: 120,
    marginTop: 24,
  },

  // Connected styles
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userLanguage: {
    fontSize: 12,
    color: colors.textLight,
  },
  translationContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    gap: 12,
  },
  translationCard: {
    flex: 1,
    backgroundColor: colors.pastelBlue,
  },
  responseCard: {
    backgroundColor: colors.pastelOrange,
  },
  translationLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  translationArrow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  arrowText: {
    fontSize: 24,
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: colors.error,
  },
  recordIcon: {
    fontSize: 28,
  },
  endButton: {
    flex: 1,
  },
});
