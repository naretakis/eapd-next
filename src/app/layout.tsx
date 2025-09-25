'use client';

import type { Metadata } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from '@/theme/theme';
import './globals.css';

// Note: In App Router, metadata should be exported from page.tsx files
// This is kept here for the root layout
const metadata: Metadata = {
  title: 'eAPD-Next - APD Creation and Management Tool',
  description:
    'Modern web application for creating, managing, and exporting APDs (Advance Planning Documents) for state Medicaid agencies.',
  keywords: 'APD, Medicaid, CMS, state agencies, planning documents',
  authors: [{ name: 'eAPD-Next Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
