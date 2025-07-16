import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const EmptyState = ({
  icon = 'document-outline',
  title = 'Nothing here',
  message = 'No content available',
  actionText,
  onAction,
  variant = 'default', // 'default', 'error', 'offline'
}) => {
  const { theme } = useTheme();
  
  const iconScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  // Subtle breathing animation for the icon
  useEffect(() => {
    iconScale.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return theme.colors.error;
      case 'offline':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const styles = createStyles(theme, variant);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <Ionicons
          name={icon}
          size={64}
          color={getIconColor()}
        />
      </Animated.View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <AnimatedTouchableOpacity
          style={[styles.actionButton, buttonAnimatedStyle]}
          onPress={onAction}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
          activeOpacity={0.8}
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </AnimatedTouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme, variant) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.6,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
