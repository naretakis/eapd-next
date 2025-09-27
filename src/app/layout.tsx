import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'eAPD-Next - APD Creation and Management Tool',
  description:
    'Modern web application for creating, managing, and exporting APDs (Advance Planning Documents) for state Medicaid agencies.',
  keywords: 'APD, Medicaid, CMS, state agencies, planning documents',
  authors: [{ name: 'eAPD-Next Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
