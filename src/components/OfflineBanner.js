import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';

import { useTheme } from '../hooks/useTheme';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const OfflineBanner = ({ onRetry }) => {
  const { theme } = useTheme();
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Animate banner in
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRetry = async () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        // Connection restored, hide banner
        translateY.value = withSpring(-100);
        opacity.value = withTiming(0);
      }
      onRetry?.();
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const styles = createStyles(theme);

  return (
    <AnimatedView style={[styles.container, bannerAnimatedStyle]}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Ionicons
            name="cloud-offline-outline"
            size={20}
            color={theme.colors.warning}
          />
          <Text style={styles.text}>You're offline</Text>
        </View>
        
        <AnimatedTouchableOpacity
          style={[styles.retryButton, buttonAnimatedStyle]}
          onPress={handleRetry}
          activeOpacity={0.8}
          accessibilityLabel="Retry connection"
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Retry</Text>
        </AnimatedTouchableOpacity>
      </View>
    </AnimatedView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
