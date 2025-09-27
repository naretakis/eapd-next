'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear';
  progress?: number; // 0-100 for determinate progress
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
}

/**
 * Loading Spinner Component
 *
 * Provides consistent loading indicators throughout the application.
 *
 * Features:
 * - Multiple variants (circular, linear)
 * - Determinate and indeterminate progress
 * - Customizable size and color
 * - Optional loading messages
 * - Full-screen overlay option
 * - Accessibility support with ARIA labels
 *
 * Learning Notes:
 * - Uses Material-UI CircularProgress and LinearProgress
 * - Implements proper accessibility attributes
 * - Supports both determinate (with progress value) and indeterminate loading
 * - Provides consistent loading UX across the application
 *
 * @param message - Optional loading message to display
 * @param size - Size of the loading indicator
 * @param variant - Type of progress indicator
 * @param progress - Progress value (0-100) for determinate progress
 * @param fullScreen - Whether to show as full-screen overlay
 * @param color - Color theme for the progress indicator
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'circular',
  progress,
  fullScreen = false,
  color = 'primary',
}) => {
  // Size mapping for circular progress
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const circularSize = sizeMap[size];

  // Determine if progress is determinate
  const isDeterminate = typeof progress === 'number';

  const LoadingContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {variant === 'circular' ? (
        <CircularProgress
          size={circularSize}
          color={color}
          variant={isDeterminate ? 'determinate' : 'indeterminate'}
          {...(isDeterminate && { value: progress })}
          aria-label={message}
          role="progressbar"
          aria-valuenow={isDeterminate ? progress : undefined}
          aria-valuemin={isDeterminate ? 0 : undefined}
          aria-valuemax={isDeterminate ? 100 : undefined}
        />
      ) : (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <LinearProgress
            color={color}
            variant={isDeterminate ? 'determinate' : 'indeterminate'}
            {...(isDeterminate && { value: progress })}
            aria-label={message}
            role="progressbar"
            aria-valuenow={isDeterminate ? progress : undefined}
            aria-valuemin={isDeterminate ? 0 : undefined}
            aria-valuemax={isDeterminate ? 100 : undefined}
            sx={{
              height: size === 'small' ? 4 : size === 'large' ? 8 : 6,
              borderRadius: 2,
            }}
          />
        </Box>
      )}

      {message && (
        <Typography
          variant={size === 'small' ? 'body2' : 'body1'}
          color="text.secondary"
          align="center"
          sx={{
            fontWeight: 500,
            maxWidth: 300,
          }}
        >
          {message}
          {isDeterminate && ` (${Math.round(progress!)}%)`}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme => theme.zIndex.modal,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            minWidth: 200,
          }}
        >
          <LoadingContent />
        </Box>
      </Box>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
