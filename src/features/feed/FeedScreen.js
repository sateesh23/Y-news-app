import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

import { EmptyState } from '../../components/EmptyState';
import { NewsCard } from '../../components/NewsCard';
import { NewsStatusBar } from '../../components/NewsStatusBar';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useArticles } from '../../hooks/useArticles';
import { useOffline } from '../../hooks/useOffline';
import { useTheme } from '../../hooks/useTheme';
import { CategoryChips } from './CategoryChips';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const FeedScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const {
    filteredArticles,
    categories,
    selectedCategory,
    setSelectedCategory,
    refreshing,
    refreshArticles,
    loading,
    loadingMore,
    hasMorePages,
    error,
    saveArticle,
    loadMoreArticles
  } = useArticles();
  const { isConnected, saveArticleOffline } = useOffline();

  const scrollY = useSharedValue(0);
  const [headerHeight] = useState(120);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight],
      [1, 0],
      'clamp'
    );

    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight / 2],
      'clamp'
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleSaveArticle = async (article) => {
    // Save to regular saved articles
    const saved = saveArticle(article);
    
    if (saved && isConnected) {
      // Also save for offline reading
      await saveArticleOffline(article);
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const renderArticle = ({ item, index }) => (
    <NewsCard
      article={item}
      onPress={handleArticlePress}
      onSave={handleSaveArticle}
      style={{
        marginTop: index === 0 ? theme.spacing.sm : 0,
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="newspaper-outline"
      title="No articles found"
      message={
        selectedCategory !== 'All'
          ? `No articles in ${selectedCategory} category`
          : 'No articles available at the moment'
      }
      actionText="Refresh"
      onAction={refreshArticles}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading more articles...</Text>
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMorePages && !loadingMore && !refreshing) {
      loadMoreArticles();
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      {/* Offline Banner */}
      {!isConnected && <OfflineBanner />}

      {/* News Status Bar - Real-time indicator */}
      <NewsStatusBar
        lastRefresh={new Date()}
        autoRefreshEnabled={true}
        onToggleAutoRefresh={() => {}}
        isRefreshing={refreshing}
        hasError={!!error}
      />

      {/* API Usage Bar - Show usage information */}
      {/* Temporarily disabled until theme issue is resolved */}
      {/* {React.createElement(require('../../components/APIUsageBar').APIUsageBar, {
        visible: true
      })} */}

      {/* Animated Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Y</Text>
            <Text style={styles.headerSubtitle}>News Reader</Text>
          </View>
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
            accessibilityLabel="Search articles"
            accessibilityRole="button"
          >
            <Ionicons
              name="search-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Articles List */}
      <AnimatedFlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item, index) => item?.id || `article-${index}-${Date.now()}`}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshArticles}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        contentContainerStyle={[
          styles.listContent,
          filteredArticles.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  searchButton: {
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
  listHeader: {
    paddingTop: theme.spacing.md,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
});
