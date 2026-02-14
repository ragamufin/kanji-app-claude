import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from './colors';

// Typography scale
export const typography = {
  kanjiDisplay: {
    fontSize: 72,
    fontWeight: '700' as const,
  },
  meaning: {
    fontSize: 28,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
};

// Spacing scale (based on 4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Border radius tokens
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadow presets for different elevations
export const getShadow = (colors: ColorScheme, elevation: 'low' | 'medium' | 'high') => {
  const shadows = {
    low: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    high: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  };
  return shadows[elevation];
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: ColorScheme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const toggleTheme = useMemo(
    () => () => {
      setMode((current) => {
        if (current === 'system') {
          return systemColorScheme === 'dark' ? 'light' : 'dark';
        }
        return 'system';
      });
    },
    [systemColorScheme]
  );

  const value = useMemo(
    () => ({
      colors,
      isDark,
      mode,
      setMode,
      toggleTheme,
    }),
    [colors, isDark, mode, toggleTheme]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Re-export colors for convenience
export { lightColors, darkColors };
export type { ColorScheme };
export { useThemedStyles } from './createThemedStyles';
