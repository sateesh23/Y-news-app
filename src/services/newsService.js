// NewsAPI Service
const API_KEY = 'a078aa7449c2451b8a100429f0429032';
// NewsAPI supports HTTPS
const BASE_URL = 'https://newsapi.org/v2';
const TOP_HEADLINES_URL = `${BASE_URL}/top-headlines`;
const EVERYTHING_URL = `${BASE_URL}/everything`;

// Import fallback data

// Rate limiting for NewsAPI free plan (1000 requests/month)
let requestCount = 0;
let lastResetDate = new Date().toDateString();
let lastRequestTime = 0;
const MAX_REQUESTS_PER_MONTH = 1000; // NewsAPI free plan allows 1000 requests/month
const MIN_REQUEST_INTERVAL = 100; // 100ms between requests (NewsAPI is more generous)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache (shorter for more fresh news)
const cache = new Map();

// Helper functions for rate limiting and caching
const resetMonthlyCount = () => {
  const today = new Date().toDateString();
  if (lastResetDate !== today) {
    const currentMonth = new Date().getMonth();
    const lastResetMonth = new Date(lastResetDate).getMonth();

    if (currentMonth !== lastResetMonth) {
      requestCount = 0;
      lastResetDate = today;
      console.log('📅 Monthly API request count reset');
    }
  }
};

const canMakeRequest = () => {
  resetMonthlyCount();

  // Check monthly limit
  if (requestCount >= MAX_REQUESTS_PER_MONTH) {
    return false;
  }

  // Check time-based rate limiting (100ms between requests)
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    console.log('⏱️ Rate limiting: Too soon since last request');
    return false;
  }

  return true;
};

const incrementRequestCount = () => {
  requestCount++;
  lastRequestTime = Date.now();
  console.log(`📊 API requests used: ${requestCount}/${MAX_REQUESTS_PER_MONTH}`);
};

const getCacheKey = (category, size, page, query = null) => {
  return `${category}-${size}-${page}-${query || 'no-query'}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('💾 Using cached data for:', key);
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 Cached data for:', key);
};

// Add delay to prevent rapid requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Waiting ${waitTime}ms before next request`);
    await delay(waitTime);
  }
};

// Available categories based on NewsAPI documentation
export const NEWS_CATEGORIES = [
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology'
];

/**
 * Fetch latest news from NewsAPI
 * @param {string} category - News category (default: 'general')
 * @param {number} size - Number of articles to fetch (max 100 for free tier)
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<Object>} API response with articles
 */
export const fetchLatestNews = async (category = 'general', size = 10, page = 1) => {
  try {
    // Map 'All' to 'general' category for NewsAPI
    const apiCategory = category === 'All' ? 'general' : category.toLowerCase();

    // Check cache first
    const cacheKey = getCacheKey(apiCategory, size, page);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limit
    if (!canMakeRequest()) {
      console.warn('⚠️ Rate limit reached. Using fallback data.');
      const { getFallbackArticles } = require('../data/fallbackNews');
      const fallbackData = getFallbackArticles(apiCategory, size);
      return {
        success: true,
        articles: fallbackData,
        totalResults: fallbackData.length,
        rateLimited: true,
        fallback: true
      };
    }

    // Wait for rate limit if needed
    await waitForRateLimit();

    // Construct API URL with parameters for NewsAPI top-headlines
    const params = new URLSearchParams({
      apiKey: API_KEY,
      country: 'us', // NewsAPI requires country for top-headlines
      category: apiCategory,
      pageSize: Math.min(size, 100), // NewsAPI allows up to 100 per request
      page: page || 1,
    });

    const url = `${TOP_HEADLINES_URL}?${params.toString()}`;

    console.log('🔄 Fetching news from NewsAPI:', apiCategory, 'articles:', size, 'page:', page);
    console.log('📡 API URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Increment request count only on successful requests
    incrementRequestCount();

    const data = await response.json();

    // Check for API errors
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI returned an error');
    }

    // Transform the data to match our app's format
    const transformedArticles = transformNewsAPIArticles(data.articles || [], apiCategory);

    console.log('✅ Successfully fetched', transformedArticles.length, 'articles');

    const result = {
      success: true,
      articles: transformedArticles,
      totalResults: data.totalResults || transformedArticles.length,
      pagination: { page, pageSize: size, totalResults: data.totalResults },
    };

    // Cache the successful result
    setCachedData(cacheKey, result);

    return result;

  } catch (error) {
    console.error('❌ Error fetching news:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message || 'Network request failed',
      articles: [],
      totalResults: 0,
    };
  }
};

/**
 * Generate a unique ID for an article
 * @param {Object} article - Raw article from NewsAPI
 * @param {number} index - Index in the array
 * @param {number} timestamp - Base timestamp
 * @returns {string} Unique article ID
 */
const generateUniqueArticleId = (article, index, timestamp) => {
  // Create a more unique ID using multiple factors
  const urlHash = article.url ? article.url.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '') || '' : '';
  const titleHash = article.title ? article.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10) : '';
  const publishedHash = article.publishedAt ? new Date(article.publishedAt).getTime() : timestamp;

  // Combine multiple unique factors to ensure uniqueness
  return `article_${timestamp}_${index}_${publishedHash}_${titleHash}_${urlHash}`.substring(0, 50);
};

/**
 * Clean and process article content from NewsAPI
 * @param {string} content - Raw content from NewsAPI
 * @param {string} description - Article description as fallback
 * @returns {string} Processed content
 */
const processArticleContent = (content, description) => {
  let processedContent = content || description || 'Full content not available';

  // Remove NewsAPI truncation indicators like "[+2535 chars]"
  processedContent = processedContent.replace(/\[\+\d+\s+chars?\]/gi, '');

  // Remove common truncation patterns
  processedContent = processedContent.replace(/\.\.\.\s*$/, '');
  processedContent = processedContent.replace(/…\s*$/, '');

  // Clean up extra whitespace
  processedContent = processedContent.trim();

  // If content is too short or just truncation indicators, use description
  if (processedContent.length < 50 && description && description.length > processedContent.length) {
    processedContent = description;
  }

  // If still no good content, provide a meaningful message
  if (!processedContent || processedContent.length < 20) {
    processedContent = 'Full article content is available at the source. Tap to read more details about this story.';
  }

  return processedContent;
};

/**
 * Generate enhanced excerpt from content and description
 * @param {string} description - Article description
 * @param {string} content - Article content
 * @returns {string} Enhanced excerpt
 */
const generateExcerpt = (description, content) => {
  // Use description as primary excerpt
  let excerpt = description || '';

  // If description is too short, try to enhance with content
  if (excerpt.length < 100 && content && content.length > excerpt.length) {
    // Clean content first
    const cleanContent = content.replace(/\[\+\d+\s+chars?\]/gi, '').trim();

    // If clean content is longer and meaningful, use it
    if (cleanContent.length > excerpt.length && cleanContent.length > 50) {
      excerpt = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
    }
  }

  return excerpt || 'No description available';
};

/**
 * Transform NewsAPI article format to our app's format
 * @param {Array} articles - Raw articles from NewsAPI
 * @param {string} category - Category to assign to articles
 * @returns {Array} Transformed articles
 */
const transformNewsAPIArticles = (articles, category = 'General') => {
  const baseTimestamp = Date.now();

  return articles.map((article, index) => {
    const processedContent = processArticleContent(article.content, article.description);
    const enhancedExcerpt = generateExcerpt(article.description, article.content);

    return {
      id: generateUniqueArticleId(article, index, baseTimestamp),
      title: article.title || 'No title available',
      excerpt: enhancedExcerpt,
      content: processedContent,
      heroImage: article.urlToImage || 'https://via.placeholder.com/800x400?text=No+Image',
      category: capitalizeFirst(category),
      publishedAt: new Date(article.publishedAt || Date.now()),
      readTime: estimateReadTime(processedContent),
      author: article.author || 'Unknown Author',
      source: article.source?.name || 'Unknown',
      tags: [],
      url: article.url || '#',
    };
  });
};

/**
 * Search news articles with keywords using NewsAPI
 * @param {string} query - Search query
 * @param {string} category - News category (optional)
 * @param {number} size - Number of articles to fetch
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<Object>} API response with articles
 */
export const searchNews = async (query, category = null, size = 10, page = 1) => {
  try {
    // Check cache first
    const cacheKey = getCacheKey(category || 'all', size, page, query);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limit
    if (!canMakeRequest()) {
      console.warn('⚠️ Rate limit reached. Using fallback search results.');
      const { getFallbackArticles } = require('../data/fallbackNews');
      const fallbackData = getFallbackArticles(category || 'All', size);
      // Simple search filter on fallback data
      const searchResults = fallbackData.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(query.toLowerCase())
      );
      return {
        success: true,
        articles: searchResults,
        totalResults: searchResults.length,
        query: query,
        rateLimited: true,
        fallback: true
      };
    }

    // Wait for rate limit if needed
    await waitForRateLimit();

    const params = new URLSearchParams({
      apiKey: API_KEY,
      q: query,
      language: 'en',
      pageSize: Math.min(size, 100),
      page: page || 1,
      sortBy: 'publishedAt', // Sort by newest first
    });

    // Add category filter if specified and not 'All'
    // Note: NewsAPI everything endpoint doesn't support category filter directly
    // We'll filter by domains or sources related to categories if needed

    const url = `${EVERYTHING_URL}?${params.toString()}`;

    console.log('🔍 Searching news:', query, category ? `in ${category}` : '');
    console.log('📡 Search API URL:', url);

    const response = await fetch(url);
    console.log('📊 Search response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Increment request count only on successful requests
    incrementRequestCount();

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI search returned an error');
    }

    const transformedArticles = transformNewsAPIArticles(data.articles || [], category || 'general');

    console.log('✅ Search found', transformedArticles.length, 'articles');

    const result = {
      success: true,
      articles: transformedArticles,
      totalResults: data.totalResults || transformedArticles.length,
      query: query,
    };

    // Cache the successful result
    setCachedData(cacheKey, result);

    return result;

  } catch (error) {
    console.error('❌ Error searching news:', error);
    console.error('❌ Search error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message || 'Network request failed',
      articles: [],
      totalResults: 0,
      query: query,
    };
  }
};

/**
 * Get available news categories
 * @returns {Array} List of available categories
 */
export const getNewsCategories = () => {
  return ['All', ...NEWS_CATEGORIES.map(cat => capitalizeFirst(cat))];
};

/**
 * Estimate reading time based on content length
 * @param {string} content - Article content
 * @returns {number} Estimated reading time in minutes
 */
const estimateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get current API usage status
 * @returns {Object} API usage information
 */
export const getAPIUsage = () => {
  resetMonthlyCount();
  return {
    used: requestCount,
    limit: MAX_REQUESTS_PER_MONTH,
    remaining: MAX_REQUESTS_PER_MONTH - requestCount,
    percentage: Math.round((requestCount / MAX_REQUESTS_PER_MONTH) * 100),
    canMakeRequest: canMakeRequest(),
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  };
};

/**
 * Check API status and remaining quota
 * @returns {Promise<Object>} API status information
 */
export const checkAPIStatus = async () => {
  try {
    const usage = getAPIUsage();

    if (!usage.canMakeRequest) {
      return {
        status: 'rate_limited',
        statusCode: 429,
        message: `Monthly limit reached (${usage.used}/${usage.limit} requests used)`,
        usage
      };
    }

    // Only make actual API call if we have requests remaining
    const params = new URLSearchParams({
      apiKey: API_KEY,
      country: 'us',
      pageSize: 1,
    });

    const url = `${TOP_HEADLINES_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (response.ok) {
      incrementRequestCount();
    }

    return {
      status: response.ok ? 'active' : 'error',
      statusCode: response.status,
      message: response.ok ? 'API is working' : 'API error',
      usage: getAPIUsage()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      usage: getAPIUsage()
    };
  }
};