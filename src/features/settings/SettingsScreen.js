import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { useOffline } from '../../hooks/useOffline';
import { useTheme } from '../../hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightComponent,
  showChevron = true 
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const styles = createItemStyles(theme);

  return (
    <AnimatedTouchableOpacity
      style={[styles.item, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.itemRight}>
        {rightComponent}
        {showChevron && onPress && (
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={theme.colors.textSecondary}
            style={styles.chevron}
          />
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const { theme } = useTheme();
  const themes = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'amoled', label: 'AMOLED', icon: 'contrast-outline' },
  ];

  const styles = createThemeSelectorStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme</Text>
      <View style={styles.options}>
        {themes.map((themeOption) => (
          <TouchableOpacity
            key={themeOption.key}
            style={[
              styles.option,
              currentTheme === themeOption.key && styles.optionSelected
            ]}
            onPress={() => onThemeChange(themeOption.key)}
            accessibilityLabel={`Set theme to ${themeOption.label}`}
            accessibilityState={{ selected: currentTheme === themeOption.key }}
          >
            <Ionicons
              name={themeOption.icon}
              size={20}
              color={
                currentTheme === themeOption.key 
                  ? '#FFFFFF' 
                  : theme.colors.text
              }
            />
            <Text style={[
              styles.optionText,
              currentTheme === themeOption.key && styles.optionTextSelected
            ]}>
              {themeOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const FontSizeSlider = ({ currentSize, onSizeChange }) => {
  const { theme } = useTheme();
  const sizes = ['Small', 'Medium', 'Large'];
  
  const styles = createFontSliderStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Font Size</Text>
      <View style={styles.options}>
        {sizes.map((size, index) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.option,
              currentSize === index && styles.optionSelected
            ]}
            onPress={() => onSizeChange(index)}
            accessibilityLabel={`Set font size to ${size}`}
            accessibilityState={{ selected: currentSize === index }}
          >
            <Text style={[
              styles.optionText,
              { fontSize: 12 + (index * 2) }, // Visual preview
              currentSize === index && styles.optionTextSelected
            ]}>
              Aa
            </Text>
            <Text style={[
              styles.optionLabel,
              currentSize === index && styles.optionTextSelected
            ]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const SettingsScreen = () => {
  const { theme, mode, setTheme, fontSize, setFontSize, isDark } = useTheme();
  const { storageSize, clearAllOfflineData } = useOffline();
  
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear Offline Data',
      `This will remove all saved articles and free up ${storageSize} of storage. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllOfflineData();
            Alert.alert('Success', 'All offline data has been cleared.');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <ThemeSelector
            currentTheme={mode}
            onThemeChange={setTheme}
          />
          
          <FontSizeSlider
            currentSize={fontSize}
            onSizeChange={setFontSize}
          />
        </View>

        {/* Reading Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading</Text>
          
          <SettingItem
            icon="wifi-outline"
            title="Download on Wi-Fi only"
            subtitle="Save mobile data by downloading articles only on Wi-Fi"
            rightComponent={
              <Switch
                value={wifiOnlyDownload}
                onValueChange={setWifiOnlyDownload}
                trackColor={{ 
                  false: theme.colors.border, 
                  true: theme.colors.accent 
                }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Daily reminders"
            subtitle="Get notified about unread saved articles"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ 
                  false: theme.colors.border, 
                  true: theme.colors.accent 
                }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          <SettingItem
            icon="folder-outline"
            title="Offline storage used"
            subtitle={storageSize}
            showChevron={false}
          />
          
          <SettingItem
            icon="trash-outline"
            title="Clear offline data"
            subtitle="Remove all saved articles and images"
            onPress={handleClearData}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon="information-circle-outline"
            title="Version"
            subtitle="1.0.0"
            showChevron={false}
          />
          
          <SettingItem
            icon="heart-outline"
            title="Made with ❤️"
            subtitle="Built with React Native & Expo"
            showChevron={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
});

const createItemStyles = (theme) => StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.layout.borderRadius,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
});

const createThemeSelectorStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs / 2,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs / 2,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});

const createFontSliderStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs / 2,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  optionLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs / 2,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});
