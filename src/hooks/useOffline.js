import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_ARTICLES_KEY = 'y:offlineArticles';
const OFFLINE_IMAGES_DIR = `${FileSystem.documentDirectory}offline_images/`;

export const useOffline = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [offlineArticles, setOfflineArticles] = useState([]);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Load offline articles on mount
    loadOfflineArticles();
    calculateStorageSize();

    // Ensure offline images directory exists
    FileSystem.makeDirectoryAsync(OFFLINE_IMAGES_DIR, { intermediates: true })
      .catch(error => console.log('Directory already exists or error:', error));

    return unsubscribe;
  }, []);

  const loadOfflineArticles = async () => {
    try {
      const articlesJson = await AsyncStorage.getItem(OFFLINE_ARTICLES_KEY);
      if (articlesJson) {
        const articles = JSON.parse(articlesJson);
        setOfflineArticles(articles);
      }
    } catch (error) {
      console.error('Error loading offline articles:', error);
    }
  };

  const calculateStorageSize = async () => {
    try {
      // Calculate size of offline articles data
      const articlesJson = await AsyncStorage.getItem(OFFLINE_ARTICLES_KEY);
      let totalSize = 0;

      if (articlesJson) {
        totalSize += new Blob([articlesJson]).size;
      }

      // Calculate size of offline images
      const imageFiles = await FileSystem.readDirectoryAsync(OFFLINE_IMAGES_DIR)
        .catch(() => []);
      
      for (const file of imageFiles) {
        const fileInfo = await FileSystem.getInfoAsync(`${OFFLINE_IMAGES_DIR}${file}`);
        if (fileInfo.exists) {
          totalSize += fileInfo.size || 0;
        }
      }

      setStorageSize(totalSize);
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
  };

  const downloadImageForOffline = async (imageUrl, articleId) => {
    try {
      const filename = `${articleId}_hero.jpg`;
      const localUri = `${OFFLINE_IMAGES_DIR}${filename}`;
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
      
      if (downloadResult.status === 200) {
        return localUri;
      }
      return null;
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  };

  const saveArticleOffline = async (article) => {
    try {
      // Check if article is already saved offline
      const existingIndex = offlineArticles.findIndex(a => a.id === article.id);
      if (existingIndex !== -1) {
        return false; // Already saved
      }

      // Download hero image for offline use
      let localImageUri = null;
      if (article.heroImage && isConnected) {
        localImageUri = await downloadImageForOffline(article.heroImage, article.id);
      }

      // Create offline article object
      const offlineArticle = {
        ...article,
        savedOfflineAt: new Date().toISOString(),
        localImageUri: localImageUri || article.heroImage,
        offlineSize: new Blob([JSON.stringify(article)]).size
      };

      // Update offline articles list
      const updatedArticles = [...offlineArticles, offlineArticle];
      setOfflineArticles(updatedArticles);

      // Save to AsyncStorage
      await AsyncStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updatedArticles));
      
      // Recalculate storage size
      await calculateStorageSize();

      return true;
    } catch (error) {
      console.error('Error saving article offline:', error);
      return false;
    }
  };

  const removeOfflineArticle = async (articleId) => {
    try {
      // Remove from offline articles list
      const updatedArticles = offlineArticles.filter(article => article.id !== articleId);
      setOfflineArticles(updatedArticles);

      // Update AsyncStorage
      await AsyncStorage.setItem(OFFLINE_ARTICLES_KEY, JSON.stringify(updatedArticles));

      // Remove associated image file
      const filename = `${articleId}_hero.jpg`;
      const localUri = `${OFFLINE_IMAGES_DIR}${filename}`;
      
      await FileSystem.deleteAsync(localUri, { idempotent: true });

      // Recalculate storage size
      await calculateStorageSize();

      return true;
    } catch (error) {
      console.error('Error removing offline article:', error);
      return false;
    }
  };

  const clearAllOfflineData = async () => {
    try {
      // Clear offline articles
      setOfflineArticles([]);
      await AsyncStorage.removeItem(OFFLINE_ARTICLES_KEY);

      // Clear offline images directory
      await FileSystem.deleteAsync(OFFLINE_IMAGES_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(OFFLINE_IMAGES_DIR, { intermediates: true });

      // Reset storage size
      setStorageSize(0);

      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  };

  const isArticleAvailableOffline = (articleId) => {
    return offlineArticles.some(article => article.id === articleId);
  };

  const getOfflineArticle = (articleId) => {
    return offlineArticles.find(article => article.id === articleId);
  };

  const formatStorageSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    isConnected,
    offlineArticles,
    storageSize: formatStorageSize(storageSize),
    storageSizeBytes: storageSize,
    saveArticleOffline,
    removeOfflineArticle,
    clearAllOfflineData,
    isArticleAvailableOffline,
    getOfflineArticle,
    refreshStorageSize: calculateStorageSize
  };
};
