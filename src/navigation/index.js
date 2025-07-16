import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { FeedScreen } from '../features/feed/FeedScreen';
import { ArticleDetailScreen } from '../features/article/ArticleDetailScreen';
import { OfflineScreen } from '../features/offline/OfflineScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { SearchScreen } from '../features/feed/SearchScreen';

// Hooks
import { useTheme } from '../hooks/useTheme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Feed Stack Navigator
const FeedStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.typography.title.fontFamily,
          fontSize: theme.typography.title.fontSize,
          fontWeight: theme.typography.title.fontWeight,
        },
      }}
    >
      <Stack.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen}
        options={{ 
          title: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ 
          title: 'Search',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
};

// Offline Stack Navigator
const OfflineStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.typography.title.fontFamily,
          fontSize: theme.typography.title.fontSize,
          fontWeight: theme.typography.title.fontWeight,
        },
      }}
    >
      <Stack.Screen 
        name="Offline" 
        component={OfflineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OfflineArticleDetail" 
        component={ArticleDetailScreen}
        options={{ 
          title: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
export const RootNavigator = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'FeedTab') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'OfflineTab') {
            iconName = focused ? 'download' : 'download-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: theme.layout.tabBarHeight,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.caption.fontFamily,
          fontSize: theme.typography.caption.fontSize,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={FeedStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="OfflineTab" 
        component={OfflineStack}
        options={{
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};
