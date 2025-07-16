import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../useTheme';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Appearance
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('should initialize with system theme by default', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for async initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.mode).toBe('system');
    expect(result.current.fontSize).toBe(1); // Medium
  });

  it('should change theme when setTheme is called', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setTheme('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('y:theme', 'dark');
  });

  it('should change font size when setFontSize is called', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setFontSize(2); // Large
    });

    expect(result.current.fontSize).toBe(2);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('y:fontSize', '2');
  });

  it('should scale typography based on font size', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setFontSize(2); // Large (1.125x multiplier)
    });

    const expectedFontSize = Math.round(24 * 1.125); // headline fontSize * multiplier
    expect(result.current.theme.typography.headline.fontSize).toBe(expectedFontSize);
  });

  it('should determine dark mode correctly', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setTheme('dark');
    });

    expect(result.current.isDark).toBe(true);

    await act(async () => {
      result.current.setTheme('light');
    });

    expect(result.current.isDark).toBe(false);
  });

  it('should determine AMOLED mode correctly', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setTheme('amoled');
    });

    expect(result.current.isAmoled).toBe(true);
    expect(result.current.isDark).toBe(true);
  });

  it('should load saved preferences from AsyncStorage', async () => {
    AsyncStorage.getItem
      .mockResolvedValueOnce('dark') // theme
      .mockResolvedValueOnce('0'); // fontSize

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for async initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.mode).toBe('dark');
    expect(result.current.fontSize).toBe(0);
  });

  it('should handle system theme changes', async () => {
    const { Appearance } = require('react-native');
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial async setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate system theme change to dark
    Appearance.getColorScheme.mockReturnValue('dark');

    await act(async () => {
      result.current.setTheme('system');
    });

    expect(result.current.isDark).toBe(true);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for async initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should still work with default values
    expect(result.current.mode).toBe('system');
    expect(result.current.fontSize).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading theme preferences:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
