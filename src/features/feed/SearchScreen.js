import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { EmptyState } from '../../components/EmptyState';
import { NewsCard } from '../../components/NewsCard';
import { useArticles } from '../../hooks/useArticles';
import { useTheme } from '../../hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const SearchScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { 
    searchArticles, 
    filteredArticles, 
    searchQuery,
    saveArticle 
  } = useArticles();
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState([
    'Technology', 'Climate', 'Space', 'AI', 'Innovation'
  ]);
  
  const searchInputRef = useRef(null);
  const clearButtonScale = useSharedValue(0);

  useEffect(() => {
    // Auto-focus search input
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate clear button
    clearButtonScale.value = withSpring(localQuery.length > 0 ? 1 : 0);
  }, [localQuery]);

  const clearButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clearButtonScale.value }],
  }));

  const handleSearch = (query) => {
    setLocalQuery(query);
    searchArticles(query);
    
    // Add to recent searches if not empty and not already present
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    searchArticles('');
    searchInputRef.current?.focus();
  };

  const handleRecentSearchPress = (query) => {
    setLocalQuery(query);
    searchArticles(query);
    Keyboard.dismiss();
  };

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleSaveArticle = (article) => {
    saveArticle(article);
  };

  const renderArticle = ({ item }) => (
    <NewsCard
      article={item}
      onPress={handleArticlePress}
      onSave={handleSaveArticle}
      variant="compact"
    />
  );

  const renderRecentSearches = () => (
    <View style={styles.recentContainer}>
      <Text style={styles.recentTitle}>Recent Searches</Text>
      <View style={styles.recentChips}>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={`${search}-${index}`}
            style={styles.recentChip}
            onPress={() => handleRecentSearchPress(search)}
            accessibilityLabel={`Search for ${search}`}
          >
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.recentChipText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (!localQuery.trim()) {
      return renderRecentSearches();
    }
    
    return (
      <EmptyState
        icon="search-outline"
        title="No results found"
        message={`No articles found for "${localQuery}"`}
        actionText="Clear search"
        onAction={handleClearSearch}
      />
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={theme.colors.textSecondary}
            value={localQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never" // We'll use custom clear button
          />
          
          <AnimatedTouchableOpacity
            style={[styles.clearButton, clearButtonAnimatedStyle]}
            onPress={handleClearSearch}
            accessibilityLabel="Clear search"
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </AnimatedTouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancel search"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item, index) => item?.id || `search-article-${index}-${Date.now()}`}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredArticles.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
  },
  cancelText: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  recentContainer: {
    padding: theme.spacing.lg,
  },
  recentTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recentChipText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
});
