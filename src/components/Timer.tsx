import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  isRunning?: boolean;
  size?: 'small' | 'large';
}

export const Timer: React.FC<TimerProps> = ({
  initialSeconds,
  onTimeUp,
  isRunning = true,
  size = 'large',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!isRunning || secondsLeft === 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, size === 'large' ? styles.largText : styles.smallText]}>
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  largText: {
    fontSize: 56,
  },
  smallText: {
    fontSize: 32,
  },
});
