import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { EmptyState } from '../../components/EmptyState';
import { useArticles } from '../../hooks/useArticles';
import { useOffline } from '../../hooks/useOffline';
import { useTheme } from '../../hooks/useTheme';

const AnimatedView = Animated.createAnimatedComponent(View);

const SavedArticleCard = ({ article, onPress, onDelete }) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value < -50 ? 1 : 0),
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -100);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -50) {
        // Show delete action
        translateX.value = withTiming(-80);
      } else {
        // Snap back
        translateX.value = withTiming(0);
      }
    });

  const handleDelete = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    setIsDeleting(true);
    
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDelete)(article.id);
    });
  };

  const formatSavedDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const styles = createCardStyles(theme);

  return (
    <View style={styles.cardContainer}>
      <GestureDetector gesture={panGesture}>
        <AnimatedView style={[styles.card, animatedStyle]}>
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={() => onPress(article)}
            disabled={isDeleting}
            accessibilityLabel={`Read saved article: ${article.title}`}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={styles.cardExcerpt} numberOfLines={2}>
                {article.excerpt}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>
                  Saved {formatSavedDate(article.savedAt)}
                </Text>
                <View style={styles.cardBadges}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{article.category}</Text>
                  </View>
                  <Ionicons 
                    name="download-outline" 
                    size={16} 
                    color={theme.colors.accent} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedView>
      </GestureDetector>
      
      {/* Delete Button */}
      <Animated.View style={[styles.deleteButton, deleteAnimatedStyle]}>
        <TouchableOpacity
          style={styles.deleteButtonTouchable}
          onPress={handleDelete}
          accessibilityLabel="Delete saved article"
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const OfflineScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { savedArticles, removeSavedArticle } = useArticles();
  const { 
    offlineArticles, 
    removeOfflineArticle, 
    storageSize,
    clearAllOfflineData 
  } = useOffline();

  const handleArticlePress = (article) => {
    navigation.navigate('OfflineArticleDetail', { article });
  };

  const handleDeleteArticle = async (articleId) => {
    // Remove from both saved and offline storage
    removeSavedArticle(articleId);
    await removeOfflineArticle(articleId);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Saved Articles',
      'This will remove all saved articles and free up storage space. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllOfflineData();
            // Also clear saved articles
            savedArticles.forEach(article => {
              removeSavedArticle(article.id);
            });
          },
        },
      ]
    );
  };

  const renderArticle = ({ item }) => (
    <SavedArticleCard
      article={item}
      onPress={handleArticlePress}
      onDelete={handleDeleteArticle}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="bookmark-outline"
      title="No saved articles"
      message="Articles you save will appear here for offline reading"
      actionText="Browse articles"
      onAction={() => navigation.navigate('FeedTab')}
    />
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Saved Articles</Text>
          <Text style={styles.headerSubtitle}>
            {savedArticles.length} articles • {storageSize}
          </Text>
        </View>
        
        {savedArticles.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            accessibilityLabel="Clear all saved articles"
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Articles List */}
      <FlatList
        data={savedArticles}
        renderItem={renderArticle}
        keyExtractor={(item, index) => item?.id || `saved-article-${index}-${Date.now()}`}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          savedArticles.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  clearButton: {
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
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

const createCardStyles = (theme) => StyleSheet.create({
  cardContainer: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    position: 'relative',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: theme.layout.cardElevation,
  },
  cardTouchable: {
    borderRadius: theme.layout.borderRadius,
    overflow: 'hidden',
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardExcerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  categoryText: {
    ...theme.typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
