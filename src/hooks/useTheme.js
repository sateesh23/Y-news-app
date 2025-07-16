import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme';

const ThemeContext = createContext();

const THEME_KEY = 'y:theme';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      AsyncStorage.setItem(THEME_KEY, action.value);
      return { ...state, mode: action.value };
    case 'SET_FONT_SIZE':
      AsyncStorage.setItem('y:fontSize', action.value.toString());
      return { ...state, fontSize: action.value };
    case 'INIT_THEME':
      return { ...state, mode: action.mode, fontSize: action.fontSize };
    default:
      return state;
  }
}

const getSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

const getCurrentTheme = (mode) => {
  if (mode === 'system') {
    const systemTheme = getSystemTheme();
    return themes[systemTheme];
  }
  return themes[mode] || themes.light;
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { 
    mode: 'system', 
    fontSize: 1 // 0 = small, 1 = medium, 2 = large
  });

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const [savedTheme, savedFontSize] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem('y:fontSize')
        ]);
        
        dispatch({
          type: 'INIT_THEME',
          mode: savedTheme || 'system',
          fontSize: savedFontSize ? parseInt(savedFontSize) : 1
        });
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };

    initializeTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (state.mode === 'system') {
        // Force re-render when system theme changes
        dispatch({ type: 'SET_THEME', value: 'system' });
      }
    });

    return () => subscription?.remove();
  }, []);

  const currentTheme = getCurrentTheme(state.mode);
  
  // Apply font size scaling to typography
  const fontSizeMultipliers = [0.875, 1, 1.125]; // Small, Medium, Large
  const multiplier = fontSizeMultipliers[state.fontSize] || 1;
  
  const scaledTheme = {
    ...currentTheme,
    typography: Object.keys(currentTheme.typography).reduce((acc, key) => {
      acc[key] = {
        ...currentTheme.typography[key],
        fontSize: Math.round(currentTheme.typography[key].fontSize * multiplier)
      };
      return acc;
    }, {})
  };

  const value = {
    theme: scaledTheme,
    mode: state.mode,
    fontSize: state.fontSize,
    setTheme: (mode) => dispatch({ type: 'SET_THEME', value: mode }),
    setFontSize: (size) => dispatch({ type: 'SET_FONT_SIZE', value: size }),
    isDark: state.mode === 'dark' || state.mode === 'amoled' || 
            (state.mode === 'system' && getSystemTheme() === 'dark'),
    isAmoled: state.mode === 'amoled'
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
