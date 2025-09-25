'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}

/**
 * Layout Component
 *
 * Provides the main application layout with:
 * - Material-UI AppBar with navigation
 * - Responsive container for content
 * - Consistent spacing and styling
 * - Accessibility features (ARIA labels, semantic HTML)
 *
 * @param children - The main content to render
 * @param title - Optional title to display in the AppBar
 * @param showNavigation - Whether to show navigation elements
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'eAPD-Next',
  showNavigation = true,
}) => {
  const handleMenuClick = () => {
    // TODO: Implement navigation menu
    console.log('Menu clicked');
  };

  const handleHomeClick = () => {
    // TODO: Navigate to dashboard
    console.log('Home clicked');
  };

  const handleHelpClick = () => {
    // TODO: Open help dialog
    console.log('Help clicked');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Application Header */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          {showNavigation && (
            <Tooltip title="Open navigation menu">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open navigation menu"
                onClick={handleMenuClick}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          {/* Environment indicator for non-production */}
          {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && (
            <Box
              sx={{
                backgroundColor: 'warning.main',
                color: 'warning.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 500,
                mr: 2,
              }}
            >
              {process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() || 'DEV'}
            </Box>
          )}

          {showNavigation && (
            <>
              <Tooltip title="Go to dashboard">
                <IconButton
                  color="inherit"
                  aria-label="go to dashboard"
                  onClick={handleHomeClick}
                  sx={{ mr: 1 }}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Get help">
                <IconButton
                  color="inherit"
                  aria-label="get help"
                  onClick={handleHelpClick}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'grey.50',
          minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: 'grey.100',
          borderTop: 1,
          borderColor: 'grey.300',
          py: 2,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            eAPD-Next v{process.env.NEXT_PUBLIC_VERSION || '0.1.0'} - APD
            Creation and Management Tool
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
