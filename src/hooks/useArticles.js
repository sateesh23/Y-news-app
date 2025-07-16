import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { fetchLatestNews, getNewsCategories, searchNews } from '../services/newsService';

const ArticlesContext = createContext();

const ARTICLES_KEY = 'y:articles';
const SAVED_ARTICLES_KEY = 'y:savedArticles';

/**
 * Remove duplicate articles based on URL and title+publishedAt
 * @param {Array} articles - Array of articles to deduplicate
 * @returns {Array} Deduplicated articles
 */
const deduplicateArticles = (articles) => {
  const seen = new Set();
  const uniqueArticles = [];

  for (const article of articles) {
    // Create unique identifiers based on URL and title+publishedAt
    const urlKey = article.url && article.url !== '#' ? article.url : null;
    const titleDateKey = `${article.title}_${article.publishedAt}`;

    // Check if we've seen this article before
    const isDuplicate = urlKey ? seen.has(urlKey) : seen.has(titleDateKey);

    if (!isDuplicate) {
      if (urlKey) {
        seen.add(urlKey);
      }
      seen.add(titleDateKey);
      uniqueArticles.push(article);
    }
  }

  return uniqueArticles;
};

/**
 * Merge new articles with existing ones, removing duplicates
 * @param {Array} existingArticles - Current articles in state
 * @param {Array} newArticles - New articles to add
 * @returns {Array} Merged and deduplicated articles
 */
const mergeAndDeduplicateArticles = (existingArticles, newArticles) => {
  const combined = [...existingArticles, ...newArticles];
  return deduplicateArticles(combined);
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ARTICLES':
      return {
        ...state,
        articles: deduplicateArticles(action.articles),
        loading: false,
        error: null,
        currentPage: 0,
        hasMorePages: action.hasMorePages || false,
        totalResults: action.totalResults || 0
      };
    case 'LOAD_MORE_ARTICLES':
      return {
        ...state,
        articles: mergeAndDeduplicateArticles(state.articles, action.articles),
        loadingMore: false,
        currentPage: state.currentPage + 1,
        hasMorePages: action.hasMorePages || false,
        totalResults: action.totalResults || state.totalResults
      };
    case 'SET_LOADING_MORE':
      return {
        ...state,
        loadingMore: action.loading
      };
    case 'LOAD_SAVED_ARTICLES':
      return {
        ...state,
        savedArticles: action.savedArticles
      };
    case 'SAVE_ARTICLE':
      const newSavedArticles = [...state.savedArticles, action.article];
      AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(newSavedArticles));
      return {
        ...state,
        savedArticles: newSavedArticles
      };
    case 'REMOVE_SAVED_ARTICLE':
      const filteredArticles = state.savedArticles.filter(
        article => article.id !== action.articleId
      );
      AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(filteredArticles));
      return {
        ...state,
        savedArticles: filteredArticles
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.query
      };
    case 'SET_SELECTED_CATEGORY':
      return {
        ...state,
        selectedCategory: action.category
      };
    case 'REFRESH_ARTICLES':
      return {
        ...state,
        refreshing: true
      };
    case 'REFRESH_COMPLETE':
      return {
        ...state,
        refreshing: false,
        articles: action.articles ? deduplicateArticles(action.articles) : state.articles,
        currentPage: 0,
        hasMorePages: action.hasMorePages || false,
        totalResults: action.totalResults || state.totalResults
      };
    default:
      return state;
  }
}

const initialState = {
  articles: [],
  savedArticles: [],
  loading: true,
  refreshing: false,
  loadingMore: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'All',
  lastRefresh: null,
  autoRefreshEnabled: true,
  currentPage: 0,
  hasMorePages: true,
  totalResults: 0,
  lastLoadMoreTime: 0
};

export const ArticlesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load articles and saved articles on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', loading: true });

        // Load articles from NewsAPI
        console.log('🚀 Loading articles from NewsAPI...');
        const response = await fetchLatestNews(state.selectedCategory, 10, 1);

        if (response.success) {
          dispatch({
            type: 'LOAD_ARTICLES',
            articles: response.articles,
            hasMorePages: response.articles.length === 10,
            totalResults: response.totalResults
          });
          console.log('✅ Loaded', response.articles.length, 'articles from API');
        } else {
          if (response.rateLimited && response.fallback) {
            // Show fallback data when rate limited
            console.warn('⚠️ Rate limited - showing fallback data');
            dispatch({
              type: 'LOAD_ARTICLES',
              articles: response.articles,
              hasMorePages: false, // No pagination for fallback data
              totalResults: response.totalResults
            });
          } else if (response.rateLimited) {
            console.warn('⚠️ Rate limited - showing empty state');
            dispatch({
              type: 'SET_ERROR',
              error: 'Monthly API limit reached. Please try again next month or upgrade your plan.'
            });
          } else {
            throw new Error(response.error || 'Failed to fetch articles');
          }
        }

        // Load saved articles from AsyncStorage
        const savedArticlesJson = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
        const savedArticles = savedArticlesJson ? JSON.parse(savedArticlesJson) : [];

        dispatch({ type: 'LOAD_SAVED_ARTICLES', savedArticles });
      } catch (error) {
        console.error('Error loading articles:', error);
        dispatch({ type: 'SET_ERROR', error: error.message });

        // Fallback to empty articles array on error
        dispatch({ type: 'LOAD_ARTICLES', articles: [] });
      }
    };

    loadData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!state.autoRefreshEnabled) return;

    const autoRefreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing articles...');
      await refreshArticles();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [state.autoRefreshEnabled]);

  // Get filtered articles based on search and category
  const getFilteredArticles = () => {
    let filtered = state.articles;

    // Filter by category
    if (state.selectedCategory !== 'All') {
      filtered = filtered.filter(article => 
        article.category === state.selectedCategory
      );
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  };

  // Get available categories from NewsData.io
  const getCategories = () => {
    return getNewsCategories();
  };

  // Check if article is saved
  const isArticleSaved = (articleId) => {
    return state.savedArticles.some(article => article.id === articleId);
  };

  // Save article for offline reading
  const saveArticle = (article) => {
    if (!isArticleSaved(article.id)) {
      const articleWithSavedDate = {
        ...article,
        savedAt: new Date().toISOString()
      };
      dispatch({ type: 'SAVE_ARTICLE', article: articleWithSavedDate });
      return true;
    }
    return false;
  };

  // Remove saved article
  const removeSavedArticle = (articleId) => {
    dispatch({ type: 'REMOVE_SAVED_ARTICLE', articleId });
  };

  // Refresh articles from API
  const refreshArticles = async () => {
    dispatch({ type: 'REFRESH_ARTICLES' });

    try {
      console.log('🔄 Refreshing articles from NewsAPI...');
      const response = await fetchLatestNews(state.selectedCategory, 10, 1);

      if (response.success) {
        dispatch({
          type: 'REFRESH_COMPLETE',
          articles: response.articles,
          hasMorePages: response.articles.length === 10,
          totalResults: response.totalResults
        });
        console.log('✅ Refreshed', response.articles.length, 'articles');
      } else {
        throw new Error(response.error || 'Failed to refresh articles');
      }
    } catch (error) {
      console.error('❌ Error refreshing articles:', error);
      dispatch({ type: 'REFRESH_COMPLETE' }); // Complete refresh even on error
    }
  };

  // Load more articles for pagination
  const loadMoreArticles = async () => {
    const now = Date.now();

    // Debounce: prevent multiple calls within 3 seconds
    if (now - state.lastLoadMoreTime < 3000) {
      console.log('🚫 Debouncing loadMore - too soon since last call');
      return;
    }

    if (state.loadingMore || !state.hasMorePages || state.refreshing) {
      console.log('🚫 Skipping loadMore - already loading or no more pages');
      return;
    }

    dispatch({ type: 'SET_LOADING_MORE', loading: true });

    // Update last load more time
    state.lastLoadMoreTime = now;

    try {
      const nextPage = state.currentPage + 1;
      console.log('📄 Loading more articles, page:', nextPage);

      const response = await fetchLatestNews(state.selectedCategory, 10, nextPage);

      if (response.success) {
        dispatch({
          type: 'LOAD_MORE_ARTICLES',
          articles: response.articles,
          hasMorePages: response.articles.length === 10,
          totalResults: response.totalResults
        });
        console.log('✅ Loaded', response.articles.length, 'more articles');
      } else {
        if (response.rateLimited && response.fallback) {
          // Show fallback data when rate limited
          console.warn('⚠️ Rate limited - showing fallback data for pagination');
          dispatch({
            type: 'LOAD_MORE_ARTICLES',
            articles: response.articles,
            hasMorePages: false, // No more pages for fallback data
            totalResults: response.totalResults
          });
        } else if (response.rateLimited) {
          console.warn('⚠️ Rate limited - cannot load more articles');
          dispatch({ type: 'SET_LOADING_MORE', loading: false });
          // Don't throw error, just stop loading more
          return;
        } else {
          throw new Error(response.error || 'Failed to load more articles');
        }
      }
    } catch (error) {
      console.error('❌ Error loading more articles:', error);
      dispatch({ type: 'SET_LOADING_MORE', loading: false });
    }
  };

  // Search articles using MediaStack API
  const searchArticles = async (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });

    if (query.trim()) {
      try {
        console.log('🔍 Searching articles:', query);
        const response = await searchNews(query, state.selectedCategory, 10, 1);

        if (response.success) {
          // Update articles with search results
          dispatch({
            type: 'LOAD_ARTICLES',
            articles: response.articles,
            hasMorePages: response.articles.length === 10,
            totalResults: response.totalResults
          });
          console.log('✅ Found', response.articles.length, 'articles for:', query);
        } else {
          console.error('❌ Search failed:', response.error);
        }
      } catch (error) {
        console.error('❌ Error searching articles:', error);
      }
    } else {
      // If query is empty, refresh with current category
      await refreshArticles();
    }
  };

  // Set selected category and fetch new articles
  const setSelectedCategory = async (category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', category });

    // Fetch articles for the new category
    try {
      console.log('📂 Switching to category:', category);
      const response = await fetchLatestNews(category, 10, 1);

      if (response.success) {
        dispatch({
          type: 'LOAD_ARTICLES',
          articles: response.articles,
          hasMorePages: response.articles.length === 10,
          totalResults: response.totalResults
        });
        console.log('✅ Loaded', response.articles.length, 'articles for category:', category);
      } else {
        console.error('❌ Failed to load articles for category:', category, response.error);
      }
    } catch (error) {
      console.error('❌ Error switching category:', error);
    }
  };

  const value = {
    ...state,
    filteredArticles: getFilteredArticles(),
    categories: getCategories(),
    isArticleSaved,
    saveArticle,
    removeSavedArticle,
    refreshArticles,
    loadMoreArticles,
    searchArticles,
    setSelectedCategory
  };

  return (
    <ArticlesContext.Provider value={value}>
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
};
