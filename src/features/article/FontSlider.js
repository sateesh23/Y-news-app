import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const THUMB_SIZE = 24;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FontSlider = ({ value, onChange, onClose }) => {
  const { theme } = useTheme();
  
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const thumbPosition = useSharedValue((value / 2) * SLIDER_WIDTH);
  
  const fontSizes = ['Small', 'Medium', 'Large'];
  const fontSizeValues = [14, 16, 18]; // Preview font sizes

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 300 });
    
    // Set initial thumb position
    thumbPosition.value = withSpring((value / 2) * SLIDER_WIDTH);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value - THUMB_SIZE / 2 }],
  }));

  const trackFillAnimatedStyle = useAnimatedStyle(() => ({
    width: thumbPosition.value,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(SLIDER_WIDTH, event.x));
      thumbPosition.value = newPosition;
      
      // Calculate font size index (0, 1, or 2)
      const newValue = Math.round((newPosition / SLIDER_WIDTH) * 2);
      runOnJS(onChange)(newValue);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onEnd(() => {
      // Snap to nearest position
      const newValue = Math.round((thumbPosition.value / SLIDER_WIDTH) * 2);
      thumbPosition.value = withSpring((newValue / 2) * SLIDER_WIDTH);
    });

  const handleClose = () => {
    translateY.value = withSpring(100);
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  const handlePresetPress = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    thumbPosition.value = withSpring((index / 2) * SLIDER_WIDTH);
    onChange(index);
  };

  const styles = createStyles(theme);

  return (
    <AnimatedView style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Font Size</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close font slider"
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Preview Text */}
        <View style={styles.previewContainer}>
          <Text style={[styles.previewText, { fontSize: fontSizeValues[value] }]}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View style={[styles.sliderTrackFill, trackFillAnimatedStyle]} />
          </View>
          
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.sliderThumb, thumbAnimatedStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Size Labels */}
        <View style={styles.labelsContainer}>
          {fontSizes.map((size, index) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.labelButton,
                value === index && styles.labelButtonActive
              ]}
              onPress={() => handlePresetPress(index)}
              accessibilityLabel={`Set font size to ${size}`}
            >
              <Text style={[
                styles.labelText,
                value === index && styles.labelTextActive
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AnimatedView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    minHeight: 60,
    justifyContent: 'center',
  },
  previewText: {
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  labelButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  labelText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '500',
  },
  labelTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
