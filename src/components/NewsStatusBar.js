import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { checkAPIStatus } from '../services/newsService';

const AnimatedView = Animated.createAnimatedComponent(View);

export const NewsStatusBar = ({
  lastRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  isRefreshing = false,
  hasError = false
}) => {
  const { theme } = useTheme();
  const [apiStatus, setApiStatus] = useState('active'); // Default to active, only check when needed
  const [nextRefresh, setNextRefresh] = useState(null);

  const pulseScale = useSharedValue(1);
  const refreshRotation = useSharedValue(0);

  // Only check API status when there's an error
  useEffect(() => {
    if (hasError) {
      const checkStatus = async () => {
        const status = await checkAPIStatus();
        setApiStatus(status.status);
      };
      checkStatus();
    } else {
      setApiStatus('active');
    }
  }, [hasError]);

  // Animate refresh icon when refreshing
  useEffect(() => {
    if (isRefreshing) {
      refreshRotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      refreshRotation.value = withTiming(0, { duration: 300 });
    }
  }, [isRefreshing]);

  // Pulse animation for live indicator
  useEffect(() => {
    if (autoRefreshEnabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [autoRefreshEnabled]);

  // Calculate next refresh time
  useEffect(() => {
    if (lastRefresh && autoRefreshEnabled) {
      const nextRefreshTime = new Date(lastRefresh.getTime() + 5 * 60 * 1000);
      setNextRefresh(nextRefreshTime);
      
      const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = nextRefreshTime - now;
        
        if (timeLeft <= 0) {
          setNextRefresh(null);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lastRefresh, autoRefreshEnabled]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const refreshAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${refreshRotation.value}deg` }],
  }));

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'active':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'active':
        return 'Live';
      case 'error':
        return 'Offline';
      default:
        return 'Checking';
    }
  };

  const formatTimeLeft = () => {
    if (!nextRefresh) return '';
    
    const now = new Date();
    const timeLeft = Math.max(0, nextRefresh - now);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* API Status */}
      <View style={styles.statusSection}>
        <AnimatedView style={[styles.statusDot, pulseAnimatedStyle]}>
          <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        </AnimatedView>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* NewsAPI Attribution */}
      <View style={styles.centerSection}>
        <Text style={styles.attributionText}>NewsAPI</Text>
        {isRefreshing && (
          <Animated.View style={refreshAnimatedStyle}>
            <Ionicons 
              name="refresh" 
              size={14} 
              color={theme.colors.accent} 
              style={styles.refreshIcon}
            />
          </Animated.View>
        )}
      </View>

      {/* Auto-refresh Controls */}
      <TouchableOpacity 
        style={styles.autoRefreshSection}
        onPress={onToggleAutoRefresh}
        accessibilityLabel={`Auto-refresh is ${autoRefreshEnabled ? 'on' : 'off'}`}
      >
        <Ionicons 
          name={autoRefreshEnabled ? 'timer' : 'timer-outline'} 
          size={16} 
          color={autoRefreshEnabled ? theme.colors.accent : theme.colors.textSecondary} 
        />
        {autoRefreshEnabled && nextRefresh && (
          <Text style={styles.timerText}>{formatTimeLeft()}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    marginRight: theme.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  attributionText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  refreshIcon: {
    marginLeft: theme.spacing.xs,
  },
  autoRefreshSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  timerText: {
    ...theme.typography.small,
    color: theme.colors.accent,
    marginLeft: theme.spacing.xs / 2,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
