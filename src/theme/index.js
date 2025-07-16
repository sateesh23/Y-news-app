import { lightTheme } from './light';
import { darkTheme } from './dark';
import { amoledTheme } from './amoled';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  amoled: amoledTheme,
  system: lightTheme // Default fallback, will be determined by system preference
};

export { lightTheme, darkTheme, amoledTheme };
