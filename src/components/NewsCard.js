import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

import { useArticles } from '../hooks/useArticles';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Account for horizontal padding

export const NewsCard = ({ 
  article, 
  onPress, 
  onSave, 
  variant = 'default',
  style 
}) => {
  const { theme } = useTheme();
  const { isArticleSaved } = useArticles();
  
  const scale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);
  
  const isSaved = isArticleSaved(article.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bookmarkScale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1.0, { duration: 150 })
    );
    onSave?.(article);
  };

  const formatDate = (date) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now - articleDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return articleDate.toLocaleDateString();
  };

  const styles = createStyles(theme, variant);

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(article)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
        accessibilityLabel={`Read article: ${article.title}`}
        accessibilityHint="Double tap to open article"
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          
          {/* Bookmark Button */}
          <Animated.View style={[styles.bookmarkButton, bookmarkAnimatedStyle]}>
            <TouchableOpacity
              onPress={handleSavePress}
              style={styles.bookmarkTouchable}
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
              accessibilityRole="button"
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? theme.colors.accent : theme.colors.text}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          
          <Text style={styles.excerpt} numberOfLines={3}>
            {article.excerpt}
          </Text>
          
          {/* Meta Information */}
          <View style={styles.meta}>
            <View style={styles.metaLeft}>
              <Text style={styles.author}>{article.author}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
            </View>
            
            <View style={styles.metaRight}>
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.readTime}>{article.readTime} min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (theme, variant) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: theme.layout.cardElevation,
  },
  touchable: {
    borderRadius: theme.layout.borderRadius,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: variant === 'compact' ? 120 : 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  categoryText: {
    ...theme.typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookmarkButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  excerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  separator: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  readTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs / 2,
  },
});
