'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from '@/theme/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Client-side Theme Provider
 *
 * Wraps the Material-UI ThemeProvider to ensure it runs on the client side only.
 * This is necessary because the theme object contains functions that cannot be
 * serialized in server components.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
