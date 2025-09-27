'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Container,
  Paper,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: ErrorInfo | undefined;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Features:
 * - Graceful error handling with user-friendly messages
 * - Error reporting and logging capabilities
 * - Recovery options (refresh, navigate home)
 * - Accessible error display with proper ARIA labels
 * - Material-UI styled error interface
 *
 * Learning Notes:
 * - Uses React class component (required for error boundaries)
 * - Implements componentDidCatch lifecycle method
 * - Provides fallback UI when errors occur
 * - Includes error reporting for debugging
 *
 * @param children - Components to wrap with error boundary
 * @param fallback - Custom fallback UI to display on error
 * @param onError - Callback function for error reporting
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send error to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send error to logging service
      // logErrorToService(error, errorInfo);
    }
  }

  handleRefresh = () => {
    // Reset error state and reload the page
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset error state and navigate to home
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <ErrorIcon
                color="error"
                sx={{ fontSize: '4rem' }}
                aria-hidden="true"
              />

              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  color="error"
                  sx={{ fontWeight: 600 }}
                >
                  Something went wrong
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: '600px' }}
                >
                  We&apos;re sorry, but something unexpected happened. The error
                  has been logged and we&apos;ll work to fix it. You can try
                  refreshing the page or returning to the dashboard.
                </Typography>
              </Box>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert
                  severity="error"
                  sx={{ width: '100%', textAlign: 'left' }}
                >
                  <AlertTitle>Error Details (Development Mode)</AlertTitle>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      mt: 1,
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Alert>
              )}

              {/* Recovery Actions */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRefresh}
                  size="large"
                  sx={{ minWidth: '140px' }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  size="large"
                  sx={{ minWidth: '140px' }}
                >
                  Go to Dashboard
                </Button>
              </Box>

              {/* Additional Help */}
              <Typography variant="body2" color="text.secondary">
                If this problem persists, please contact support with the error
                details above.
              </Typography>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
