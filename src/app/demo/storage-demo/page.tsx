'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Storage as StorageIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  demoBasicStorage,
  demoAdvancedFeatures,
  runCompleteDemo,
} from '@/testing/storage-demo';

/**
 * Storage Demo Page
 *
 * Interactive web interface for the storage layer demo functionality.
 * Demonstrates APD storage operations, version control, and project management.
 */
export default function StorageDemo() {
  const [demoResults, setDemoResults] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // Override console.log to capture demo output
  const captureConsoleOutput = () => {
    const originalLog = console.log;
    const originalError = console.error;
    const capturedLogs: string[] = [];

    console.log = (...args) => {
      const message = args.join(' ');
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = `ERROR: ${args.join(' ')}`;
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  };

  const handleRunBasicDemo = async () => {
    setLoading(true);
    setError(null);
    setDemoResults(null);
    setLogs([]);
    setCurrentStep('Running basic storage demo...');

    const restoreConsole = captureConsoleOutput();

    try {
      const result = await demoBasicStorage();
      setDemoResults({ type: 'basic', data: result });
      setCurrentStep('Basic demo completed successfully!');
    } catch (err) {
      console.error('Basic demo failed:', err);
      setError(err instanceof Error ? err.message : 'Basic demo failed');
      setCurrentStep('Basic demo failed');
    } finally {
      restoreConsole();
      setLoading(false);
    }
  };

  const handleRunAdvancedDemo = async () => {
    if (
      !demoResults?.data ||
      typeof demoResults.data !== 'object' ||
      !('apdId' in demoResults.data) ||
      !demoResults.data.apdId
    ) {
      setError('Please run the basic demo first to create an APD');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep('Running advanced features demo...');

    const restoreConsole = captureConsoleOutput();

    try {
      const result = await demoAdvancedFeatures(
        demoResults.data.apdId as string
      );
      setDemoResults({ type: 'advanced', data: result });
      setCurrentStep('Advanced demo completed successfully!');
    } catch (err) {
      console.error('Advanced demo failed:', err);
      setError(err instanceof Error ? err.message : 'Advanced demo failed');
      setCurrentStep('Advanced demo failed');
    } finally {
      restoreConsole();
      setLoading(false);
    }
  };

  const handleRunCompleteDemo = async () => {
    setLoading(true);
    setError(null);
    setDemoResults(null);
    setLogs([]);
    setCurrentStep('Running complete storage demo...');

    const restoreConsole = captureConsoleOutput();

    try {
      const result = await runCompleteDemo();
      setDemoResults({ type: 'complete', data: result });
      setCurrentStep('Complete demo finished successfully!');
    } catch (err) {
      console.error('Complete demo failed:', err);
      setError(err instanceof Error ? err.message : 'Complete demo failed');
      setCurrentStep('Complete demo failed');
    } finally {
      restoreConsole();
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setDemoResults(null);
    setLogs([]);
    setError(null);
    setCurrentStep('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Storage Layer Demo
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This demo showcases the storage layer functionality including APD
        creation, version control, project management, and advanced features
        like duplication and backup.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Development Demo:</strong> This demonstrates the IndexedDB
          storage layer that powers the APD management system. All operations
          are performed locally in your browser.
        </Typography>
      </Alert>

      {/* Demo Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demo Controls
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleRunBasicDemo}
              disabled={loading}
            >
              Run Basic Demo
            </Button>

            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={handleRunAdvancedDemo}
              disabled={
                loading ||
                !demoResults?.data ||
                typeof demoResults.data !== 'object' ||
                !('apdId' in demoResults.data) ||
                !demoResults.data.apdId
              }
            >
              Run Advanced Demo
            </Button>

            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={handleRunCompleteDemo}
              disabled={loading}
            >
              Run Complete Demo
            </Button>

            <Button
              variant="text"
              onClick={handleClearResults}
              disabled={loading}
            >
              Clear Results
            </Button>
          </Box>

          {loading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {currentStep}
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Demo Error:</strong> {error}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Demo Results */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Demo Results
            </Typography>

            {demoResults ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`Demo Type: ${demoResults.type}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label="Success"
                    color="success"
                    size="small"
                    icon={<CheckIcon />}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Generated Data
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(demoResults.data, null, 2)}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Run a demo to see results here
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Console Output */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Console Output
            </Typography>

            {logs.length > 0 ? (
              <Box
                sx={{
                  backgroundColor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                {logs.map((log, index) => (
                  <Box key={index} sx={{ mb: 0.5 }}>
                    {log}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Console output will appear here when running demos
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Features Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Storage Layer Features Demonstrated
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Basic Operations
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database Initialization"
                    secondary="IndexedDB setup and schema creation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="APD Creation"
                    secondary="Create new APDs with metadata"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Content Updates"
                    secondary="Update APD sections and content"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Version Control"
                    secondary="Commit changes with version tracking"
                  />
                </ListItem>
              </List>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Advanced Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Management"
                    secondary="Group APDs into projects"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="APD Duplication"
                    secondary="Clone existing APDs with new metadata"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Backup & Restore"
                    secondary="Export and import APD data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Tracking"
                    secondary="Track modifications and history"
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
