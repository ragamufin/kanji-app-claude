import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from './colors';

// Font family tokens
export const fonts = {
  serif: 'NotoSerifJP_400Regular',
  serifMedium: 'NotoSerifJP_500Medium',
  serifBold: 'NotoSerifJP_700Bold',
  sans: 'ZenKakuGothicNew_400Regular',
  sansMedium: 'ZenKakuGothicNew_500Medium',
  sansBold: 'ZenKakuGothicNew_700Bold',
};

// Typography scale
export const typography = {
  kanjiDisplay: {
    fontSize: 80,
    fontFamily: fonts.serifBold,
  },
  meaning: {
    fontSize: 26,
    fontFamily: fonts.serifMedium,
  },
  heading: {
    fontSize: 22,
    fontFamily: fonts.sansBold,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.sansMedium,
  },
  button: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 14,
    fontFamily: fonts.sans,
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.sans,
    letterSpacing: 0.2,
  },
};

// Spacing scale (based on 4px grid)
export const spacing = {
  xxs: 2,
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow presets — color-tinted for premium feel
export const getShadow = (colors: ColorScheme, elevation: 'low' | 'medium' | 'high') => {
  const shadows = {
    low: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    medium: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    high: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
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
