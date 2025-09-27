'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Layout from '@/components/common/Layout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  loading?: boolean;
  error?: string | undefined;
  showVersionInfo?: boolean;
}

/**
 * Dashboard Layout Component
 *
 * Provides the main dashboard layout with:
 * - Responsive grid layout optimized for desktop
 * - Navigation breadcrumbs for user orientation
 * - Application header with version information
 * - Loading states and error boundaries
 * - Consistent spacing and Material-UI styling
 *
 * Learning Notes:
 * - Uses Material-UI Container and Box for responsive layout
 * - Implements proper error boundaries for robust UX
 * - Includes accessibility features (ARIA labels, semantic HTML)
 * - Follows desktop-first responsive design principles
 *
 * @param children - The main dashboard content to render
 * @param title - Dashboard page title
 * @param subtitle - Optional subtitle for additional context
 * @param breadcrumbs - Navigation breadcrumb items
 * @param loading - Whether to show loading state
 * @param error - Error message to display
 * @param showVersionInfo - Whether to show version information
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle,
  breadcrumbs = [],
  loading = false,
  error,
  showVersionInfo = true,
}) => {
  // Default breadcrumbs with home
  const defaultBreadcrumbs = [
    {
      label: 'Home',
      href: '/',
      icon: <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />,
    },
    ...breadcrumbs,
  ];

  const handleBreadcrumbClick = (href?: string) => {
    if (href) {
      // TODO: Implement navigation when routing is set up
      console.log('Navigate to:', href);
    }
  };

  return (
    <Layout title="eAPD-Next" showNavigation={true}>
      <ErrorBoundary>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Breadcrumb Navigation */}
          {defaultBreadcrumbs.length > 1 && (
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs
                aria-label="dashboard navigation"
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    mx: 1,
                  },
                }}
              >
                {defaultBreadcrumbs.map((crumb, index) => {
                  const isLast = index === defaultBreadcrumbs.length - 1;

                  if (isLast) {
                    return (
                      <Box
                        key={crumb.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.primary',
                          fontWeight: 500,
                        }}
                      >
                        {crumb.icon}
                        {crumb.label}
                      </Box>
                    );
                  }

                  return (
                    <Link
                      key={crumb.label}
                      underline="hover"
                      color="inherit"
                      onClick={() => handleBreadcrumbClick(crumb.href)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                        },
                      }}
                    >
                      {crumb.icon}
                      {crumb.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Box>
          )}

          {/* Dashboard Header */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon
                  color="primary"
                  sx={{ fontSize: '2rem' }}
                  aria-hidden="true"
                />
                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: subtitle ? 0.5 : 0,
                    }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Version Information */}
              {showVersionInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`v${process.env.NEXT_PUBLIC_VERSION || '0.2.0'}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                  {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && (
                    <Chip
                      label={
                        process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() ||
                        'DEV'
                      }
                      size="small"
                      color="warning"
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Help Information */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>APD Management Dashboard</AlertTitle>
              Create, manage, and export APDs (Advance Planning Documents) for
              state Medicaid agencies. Use the dashboard to organize your APDs
              by project, track completion status, and access version history.
            </Alert>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <LoadingSpinner message="Loading dashboard..." />
            </Box>
          ) : (
            /* Main Dashboard Content */
            <Box
              sx={{
                minHeight: '400px',
                '& > *': {
                  mb: 3,
                },
                '& > *:last-child': {
                  mb: 0,
                },
              }}
            >
              {children}
            </Box>
          )}
        </Container>
      </ErrorBoundary>
    </Layout>
  );
};

export default DashboardLayout;
