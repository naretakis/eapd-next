'use client';

import React from 'react';
import { Box } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 *
 * Basic layout wrapper component for consistent page structure.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};
