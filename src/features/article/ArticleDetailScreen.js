import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useArticles } from '../../hooks/useArticles';
import { useOffline } from '../../hooks/useOffline';
import { useTheme } from '../../hooks/useTheme';
import { FontSlider } from './FontSlider';
import { ProgressBar } from './ProgressBar';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.4;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const { theme, fontSize, setFontSize, isDark } = useTheme();
  const { isArticleSaved, saveArticle, removeSavedArticle } = useArticles();
  const { saveArticleOffline, isArticleAvailableOffline } = useOffline();
  
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [showFontSlider, setShowFontSlider] = useState(false);
  
  const isSaved = isArticleSaved(article.id);
  const isOfflineAvailable = isArticleAvailableOffline(article.id);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Hero image parallax effect
  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT],
      [0, -HERO_HEIGHT * 0.3],
      'clamp'
    );

    return {
      transform: [{ translateY }],
    };
  });

  // Header opacity animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT - 100, HERO_HEIGHT],
      [0, 1],
      'clamp'
    );

    return { opacity };
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.excerpt}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isSaved) {
      removeSavedArticle(article.id);
    } else {
      const saved = saveArticle(article);
      if (saved) {
        // Also save for offline reading
        await saveArticleOffline(article);
      }
    }
  };

  const handleFontSliderToggle = () => {
    setShowFontSlider(!showFontSlider);
  };

  const handleReadFullArticle = async () => {
    try {
      if (article.url && article.url !== '#') {
        await Linking.openURL(article.url);
      }
    } catch (error) {
      console.error('Error opening article URL:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingProgress = () => {
    if (contentHeight === 0 || scrollViewHeight === 0) return 0;
    const maxScroll = contentHeight - scrollViewHeight;
    return maxScroll > 0 ? Math.min(scrollY.value / maxScroll, 1) : 0;
  };

  const styles = createStyles(theme, fontSize);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Progress Bar */}
      <ProgressBar progress={getReadingProgress()} />

      {/* Animated Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {article.title}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              accessibilityLabel="Share article"
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Content */}
      <AnimatedScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(width, height) => setContentHeight(height)}
        onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
          <Image
            source={{ uri: article.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
        </Animated.View>

        {/* Article Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta Information */}
          <View style={styles.meta}>
            <Text style={styles.author}>{article.author}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.readTime}>{article.readTime} min read</Text>
          </View>

          {/* Article Body */}
          <Text style={styles.body}>{article.content}</Text>

          {/* Read Full Article Button */}
          {article.url && article.url !== '#' && (
            <TouchableOpacity
              style={styles.readFullButton}
              onPress={handleReadFullArticle}
              accessibilityLabel="Read full article at source"
            >
              <Ionicons name="open-outline" size={20} color={theme.colors.accent} />
              <Text style={styles.readFullText}>Read Full Article at Source</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </AnimatedScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleFontSliderToggle}
          accessibilityLabel="Adjust font size"
        >
          <Ionicons name="text-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.fabButton, styles.saveButton]}
          onPress={handleSave}
          accessibilityLabel={isSaved ? 'Remove from saved' : 'Save article'}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#FFFFFF' : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Font Slider */}
      {showFontSlider && (
        <FontSlider
          value={fontSize}
          onChange={setFontSize}
          onClose={() => setShowFontSlider(false)}
        />
      )}
    </View>
  );
};

const createStyles = (theme, fontSizeIndex) => {
  const fontMultipliers = [0.875, 1, 1.125]; // Small, Medium, Large
  const multiplier = fontMultipliers[fontSizeIndex] || 1;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      zIndex: 1000,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerTitle: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
      marginHorizontal: theme.spacing.md,
      fontWeight: '600',
    },
    headerActions: {
      flexDirection: 'row',
    },
    heroContainer: {
      height: HERO_HEIGHT,
      position: 'relative',
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      background: `linear-gradient(transparent, ${theme.colors.background})`,
    },
    content: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    categoryText: {
      ...theme.typography.small,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    title: {
      ...theme.typography.headline,
      fontSize: theme.typography.headline.fontSize * multiplier,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      lineHeight: theme.typography.headline.fontSize * multiplier * 1.3,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
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
    },
    body: {
      ...theme.typography.body,
      fontSize: theme.typography.body.fontSize * multiplier,
      color: theme.colors.text,
      lineHeight: theme.typography.body.fontSize * multiplier * 1.6,
      marginBottom: theme.spacing.lg,
    },
    readFullButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    readFullText: {
      ...theme.typography.body,
      color: theme.colors.accent,
      fontWeight: '600',
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.lg,
    },
    tag: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagText: {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing.xl,
      right: theme.spacing.md,
      flexDirection: 'column',
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    saveButton: {
      backgroundColor: theme.colors.accent,
    },
  });
};
