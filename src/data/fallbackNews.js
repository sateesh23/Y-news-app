// Fallback news data for when API limit is reached
export const fallbackArticles = [
  {
    id: 'fallback_1',
    title: 'API Limit Reached - Sample Article 1',
    excerpt: 'This is a sample article shown when the NewsAPI monthly limit has been reached. Upgrade your plan for unlimited access.',
    content: 'This is a sample article content. The NewsAPI free plan allows 1000 requests per month. Consider upgrading to a paid plan for unlimited access to real-time news data.',
    heroImage: 'https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Sample+News',
    category: 'General',
    publishedAt: new Date(),
    readTime: 2,
    author: 'Y News Reader',
    source: 'Sample',
    tags: ['sample', 'api-limit'],
    url: '#',
  },
  {
    id: 'fallback_2',
    title: 'Understanding API Rate Limits',
    excerpt: 'Learn about API rate limits and how they affect your news reading experience.',
    content: 'API rate limits are restrictions placed by service providers to ensure fair usage and system stability. The NewsAPI free plan includes 1000 requests per month.',
    heroImage: 'https://via.placeholder.com/800x400/50C878/FFFFFF?text=Rate+Limits',
    category: 'Technology',
    publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
    readTime: 3,
    author: 'Y News Reader',
    source: 'Sample',
    tags: ['api', 'rate-limits', 'technology'],
    url: '#',
  },
  {
    id: 'fallback_3',
    title: 'Upgrade Your News Experience',
    excerpt: 'Discover the benefits of upgrading to a paid MediaStack plan for unlimited news access.',
    content: 'Paid NewsAPI plans offer unlimited API requests, real-time news data, historical articles, and priority support. Choose the plan that fits your needs.',
    heroImage: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Upgrade+Plan',
    category: 'Business',
    publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
    readTime: 4,
    author: 'Y News Reader',
    source: 'Sample',
    tags: ['upgrade', 'business', 'plans'],
    url: '#',
  },
  {
    id: 'fallback_4',
    title: 'Caching Improves Performance',
    excerpt: 'Learn how caching helps reduce API calls and improves app performance.',
    content: 'Caching is a technique that stores frequently accessed data temporarily to reduce the number of API calls and improve application performance.',
    heroImage: 'https://via.placeholder.com/800x400/9B59B6/FFFFFF?text=Caching',
    category: 'Technology',
    publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
    readTime: 3,
    author: 'Y News Reader',
    source: 'Sample',
    tags: ['caching', 'performance', 'technology'],
    url: '#',
  },
  {
    id: 'fallback_5',
    title: 'Offline Reading Features',
    excerpt: 'Save articles for offline reading when you have limited internet connectivity.',
    content: 'The Y News Reader app includes offline reading capabilities, allowing you to save articles locally and read them without an internet connection.',
    heroImage: 'https://via.placeholder.com/800x400/F39C12/FFFFFF?text=Offline+Reading',
    category: 'General',
    publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
    readTime: 2,
    author: 'Y News Reader',
    source: 'Sample',
    tags: ['offline', 'reading', 'features'],
    url: '#',
  }
];

export const getFallbackArticles = (category = 'All', count = 10) => {
  let filtered = fallbackArticles;
  
  if (category !== 'All') {
    filtered = fallbackArticles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  return filtered.slice(0, count);
};
