import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CategoryChip = ({ category, isSelected, onPress }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(category);
  };

  const styles = createChipStyles(theme, isSelected);

  return (
    <AnimatedTouchableOpacity
      style={[styles.chip, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      accessibilityLabel={`Filter by ${category} category`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={styles.chipText}>{category}</Text>
    </AnimatedTouchableOpacity>
  );
};

export const CategoryChips = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={120} // Approximate chip width for snapping
        snapToAlignment="start"
      >
        {categories.map((category) => (
          <CategoryChip
            key={category}
            category={category}
            isSelected={selectedCategory === category}
            onPress={onCategorySelect}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
});

const createChipStyles = (theme, isSelected) => StyleSheet.create({
  chip: {
    backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.lg,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isSelected ? 0.2 : 0.1,
    shadowRadius: 2,
    elevation: isSelected ? 3 : 1,
  },
  chipText: {
    ...theme.typography.caption,
    color: isSelected ? '#FFFFFF' : theme.colors.text,
    fontWeight: isSelected ? '600' : '500',
  },
});
