'use client';

import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Layout from '@/components/common/Layout';

export default function Home() {
  return (
    <Layout title="eAPD-Next Dashboard">
      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to eAPD-Next
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create, manage, and export APDs (Advance Planning Documents) for
            state Medicaid agencies. This modern web application provides a
            guided experience for APD creation with automated calculations,
            validation, and multi-format export capabilities.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Welcome to eAPD-Next</AlertTitle>
            This is the initial setup of eAPD-Next. The application is currently
            in development and will be built incrementally following the
            implementation plan.
          </Alert>
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Create New APD</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start a new APD with guided templates for PAPD, IAPD, or OAPD
                documents.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                disabled
                startIcon={<AddIcon />}
              >
                Create APD (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DashboardIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Manage APDs</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View, edit, and organize your existing APDs with project
                grouping.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                disabled
                startIcon={<DashboardIcon />}
              >
                View APDs (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Export & Share</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export completed APDs to PDF, Markdown, or JSON formats for
                submission.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                disabled
                startIcon={<DescriptionIcon />}
              >
                Export (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Development Status */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Development Progress
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>✅ Completed:</strong>
              </Typography>
              <ul>
                <li>Project setup with Next.js, TypeScript, and Material-UI</li>
                <li>GitHub repository configuration with CI/CD pipeline</li>
                <li>
                  Development environment with ESLint, Prettier, and Husky
                </li>
                <li>Basic layout component with responsive design</li>
                <li>
                  Testing framework setup with Jest and React Testing Library
                </li>
              </ul>

              <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                <strong>🚧 Next Steps:</strong>
              </Typography>
              <ul>
                <li>Kiro steering documents and agent hooks</li>
                <li>IndexedDB storage layer implementation</li>
                <li>Dashboard interface with APD management</li>
                <li>Template system and form generation</li>
                <li>APD editor with guided navigation</li>
              </ul>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
}
