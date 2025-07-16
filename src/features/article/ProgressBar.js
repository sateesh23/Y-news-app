import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

export const ProgressBar = ({ progress = 0 }) => {
  const { theme } = useTheme();

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progressWidth = withTiming(progress * width, { duration: 100 });
    
    return {
      width: progressWidth,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Show progress bar only when there's actual progress
    const opacity = interpolate(progress, [0, 0.01], [0, 1], 'clamp');
    
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const styles = createStyles(theme);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, progressAnimatedStyle]} />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 1.5,
  },
});
