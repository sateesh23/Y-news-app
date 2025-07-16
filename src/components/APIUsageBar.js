import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getAPIUsage } from '../services/newsService';

export const APIUsageBar = ({ visible = true }) => {
  const { theme } = useTheme();
  const [usage, setUsage] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (visible) {
      const updateUsage = () => {
        const currentUsage = getAPIUsage();
        setUsage(currentUsage);
      };

      updateUsage();
      const interval = setInterval(updateUsage, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible || !usage) return null;

  const getUsageColor = () => {
    if (usage.percentage >= 90) return theme.colors.error;
    if (usage.percentage >= 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const getUsageIcon = () => {
    if (usage.percentage >= 90) return 'warning';
    if (usage.percentage >= 70) return 'alert-circle';
    return 'checkmark-circle';
  };

  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getUsageIcon()} 
            size={16} 
            color={getUsageColor()} 
          />
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${usage.percentage}%`,
                  backgroundColor: getUsageColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.usageText}>
            {usage.used}/{usage.limit} API calls
          </Text>
        </View>

        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={theme.colors.textSecondary} 
        />
      </View>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Remaining:</Text>
            <Text style={styles.detailValue}>{usage.remaining} requests</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Usage:</Text>
            <Text style={styles.detailValue}>{usage.percentage}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Resets:</Text>
            <Text style={styles.detailValue}>
              {usage.resetDate.toLocaleDateString()}
            </Text>
          </View>
          {usage.percentage >= 80 && (
            <View style={styles.warningContainer}>
              <Ionicons 
                name="information-circle" 
                size={14} 
                color={theme.colors.warning} 
              />
              <Text style={styles.warningText}>
                Consider upgrading to avoid interruptions
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  progressContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs / 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  usageText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  details: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs / 2,
  },
  detailLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  detailValue: {
    ...theme.typography.small,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.sm,
  },
  warningText: {
    ...theme.typography.small,
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
    fontSize: 11,
  },
});
