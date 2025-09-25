# Troubleshooting Guide for eAPD-Next

This guide covers common issues you might encounter while developing or using eAPD-Next, along with step-by-step solutions and preventive measures.

## 🚀 Development Environment Issues

### Node.js and npm Issues

#### Problem: `npm install` fails with permission errors

```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**

```bash
# Option 1: Use a Node version manager (recommended)
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Problem: Wrong Node.js version

```bash
Error: The engine "node" is incompatible with this module
```

**Solution:**

```bash
# Check current version
node --version

# Install correct version (18.x or 20.x)
nvm install 20
nvm use 20

# Verify version
node --version
npm --version
```

#### Problem: Package conflicts or corrupted node_modules

```bash
Error: Cannot resolve dependency tree
```

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Build and Development Server Issues

#### Problem: Next.js build fails with TypeScript errors

```bash
Type error: Property 'xyz' does not exist on type 'ABC'
```

**Solution:**

```bash
# Check TypeScript configuration
npm run type-check

# Fix common issues:
# 1. Add missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom

# 2. Check tsconfig.json paths
# Ensure paths are correctly configured for @/* imports

# 3. Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### Problem: Development server won't start

```bash
Error: Port 3000 is already in use
```

**Solution:**

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001

# Or set PORT environment variable
PORT=3001 npm run dev
```

#### Problem: Hot reloading not working

**Solution:**

```bash
# Check if you're using WSL on Windows
# Add to next.config.ts:
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

# Or restart the development server
npm run dev
```

### Material-UI Issues

#### Problem: Material-UI styles not loading

```bash
Warning: Prop `className` did not match
```

**Solution:**

```bash
# Ensure proper ThemeProvider setup in layout.tsx
# Check that CssBaseline is included
# Verify emotion dependencies are installed:
npm install @emotion/react @emotion/styled
```

#### Problem: Material-UI TypeScript errors

```bash
Type error: Property 'sx' does not exist
```

**Solution:**

```typescript
// Ensure proper Material-UI imports
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

// For custom components, define sx prop type
interface CustomComponentProps {
  sx?: SxProps<Theme>;
}
```

## 🧪 Testing Issues

### Jest Configuration Problems

#### Problem: Jest can't resolve module paths

```bash
Cannot find module '@/components/Layout' from 'src/app/page.tsx'
```

**Solution:**

```javascript
// Check jest.config.js moduleNameMapper
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}

// Ensure tsconfig.json has matching paths
"paths": {
  "@/*": ["./src/*"]
}
```

#### Problem: Tests fail with "TextEncoder is not defined"

```bash
ReferenceError: TextEncoder is not defined
```

**Solution:**

```javascript
// Add to jest.setup.js
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

#### Problem: Material-UI components not rendering in tests

```bash
Error: useTheme must be used within a ThemeProvider
```

**Solution:**

```typescript
// Create test utility function
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';

export const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Use in tests
renderWithTheme(<MyComponent />);
```

### Accessibility Testing Issues

#### Problem: axe-core tests failing

```bash
Expected no accessibility violations but received 1
```

**Solution:**

```typescript
// Check specific violations
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);

  // Log violations for debugging
  if (results.violations.length > 0) {
    console.log(results.violations);
  }

  expect(results).toHaveNoViolations();
});
```

## 🗄️ Data Storage Issues

### IndexedDB Problems

#### Problem: IndexedDB operations failing

```bash
DOMException: The operation failed for reasons unrelated to the database itself
```

**Solution:**

```typescript
// Add proper error handling
class StorageService {
  async store(key: string, data: any): Promise<void> {
    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        throw new Error('IndexedDB not supported');
      }

      // Add timeout for operations
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), 5000)
      );

      await Promise.race([this.performStore(key, data), timeout]);
    } catch (error) {
      console.error('Storage error:', error);
      // Fallback to localStorage for critical data
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
}
```

#### Problem: Storage quota exceeded

```bash
QuotaExceededError: The quota has been exceeded
```

**Solution:**

```typescript
// Monitor storage usage
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usagePercentage = (estimate.usage! / estimate.quota!) * 100;

    if (usagePercentage > 80) {
      console.warn('Storage quota nearly exceeded:', usagePercentage + '%');
      // Implement cleanup strategy
      await cleanupOldData();
    }
  }
}

// Cleanup old data
async function cleanupOldData() {
  // Remove old APD versions, temporary data, etc.
}
```

### Data Corruption Issues

#### Problem: APD data appears corrupted

```bash
TypeError: Cannot read property 'sections' of undefined
```

**Solution:**

```typescript
// Add data validation
interface APD {
  id: string;
  type: 'PAPD' | 'IAPD' | 'OAPD';
  sections: Record<string, any>;
  metadata: APDMetadata;
}

function validateAPD(data: any): data is APD {
  return (
    data &&
    typeof data.id === 'string' &&
    ['PAPD', 'IAPD', 'OAPD'].includes(data.type) &&
    data.sections &&
    typeof data.sections === 'object' &&
    data.metadata
  );
}

// Use validation when loading data
async function loadAPD(id: string): Promise<APD | null> {
  try {
    const data = await storageService.retrieve(`apd-${id}`);

    if (!validateAPD(data)) {
      console.error('Invalid APD data structure:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load APD:', error);
    return null;
  }
}
```

## 🚀 Deployment Issues

### GitHub Pages Deployment Problems

#### Problem: Deployment fails with build errors

```bash
Error: Process completed with exit code 1
```

**Solution:**

```bash
# Check GitHub Actions logs for specific errors
# Common fixes:

# 1. Ensure all dependencies are in package.json
npm install --save-dev missing-package

# 2. Check for environment-specific code
# Wrap client-side code in useEffect or check for window object
if (typeof window !== 'undefined') {
  // Client-side code
}

# 3. Verify Next.js configuration for static export
# In next.config.ts:
output: 'export',
trailingSlash: true,
images: { unoptimized: true }
```

#### Problem: 404 errors on deployed site

```bash
404 - This page could not be found
```

**Solution:**

```bash
# Check basePath configuration in next.config.ts
basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

# Ensure proper routing in components
import { useRouter } from 'next/navigation';

// Use relative paths for navigation
router.push('/dashboard'); // Not '/eapd-next/dashboard'
```

#### Problem: Assets not loading on deployed site

```bash
Failed to load resource: net::ERR_ABORTED 404
```

**Solution:**

```bash
# Check asset paths in next.config.ts
assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

# Use Next.js Image component for images
import Image from 'next/image';

# Or use relative paths
<img src="./logo.png" alt="Logo" />
```

### Environment Configuration Issues

#### Problem: Environment variables not working

```bash
process.env.NEXT_PUBLIC_ENVIRONMENT is undefined
```

**Solution:**

```bash
# Ensure variables are prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_ENVIRONMENT=production

# Check GitHub Actions workflow
env:
  NEXT_PUBLIC_ENVIRONMENT: production
  NEXT_PUBLIC_BASE_PATH: /eapd-next

# Verify in code
console.log('Environment:', process.env.NEXT_PUBLIC_ENVIRONMENT);
```

## 🎨 UI and Styling Issues

### Layout and Responsive Design Problems

#### Problem: Components not responsive

```bash
Layout breaks on mobile devices
```

**Solution:**

```typescript
// Use Material-UI breakpoints
import { useTheme, useMediaQuery } from '@mui/material';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: { xs: 'block', md: 'flex' },
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 1, md: 2 }
    }}>
      {/* Content */}
    </Box>
  );
}
```

#### Problem: Theme not applying consistently

```bash
Components using default Material-UI theme instead of custom theme
```

**Solution:**

```typescript
// Ensure ThemeProvider wraps entire app
// In layout.tsx:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Check theme usage in components
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      Content
    </Box>
  );
}
```

### Performance Issues

#### Problem: Slow page loads

```bash
Large bundle size affecting performance
```

**Solution:**

```bash
# Analyze bundle size
npm run build
npm run analyze

# Implement code splitting
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <HeavyComponent />
    </Suspense>
  );
}

# Optimize imports
// Instead of:
import * as MUI from '@mui/material';

// Use:
import { Button, TextField } from '@mui/material';
```

#### Problem: Memory leaks

```bash
Application becomes slow over time
```

**Solution:**

```typescript
// Cleanup useEffect hooks
useEffect(() => {
  const interval = setInterval(() => {
    // Some operation
  }, 1000);

  // Cleanup function
  return () => {
    clearInterval(interval);
  };
}, []);

// Cleanup event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## 🔧 Development Tools Issues

### VS Code Configuration Problems

#### Problem: TypeScript errors not showing in VS Code

**Solution:**

```json
// In .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

#### Problem: ESLint not working in VS Code

**Solution:**

```json
// Install ESLint extension
// Add to .vscode/settings.json
{
  "eslint.workingDirectories": ["./"],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Git and Version Control Issues

#### Problem: Pre-commit hooks failing

```bash
husky - pre-commit hook failed (code 1)
```

**Solution:**

```bash
# Check what's failing
npm run lint
npm run format:check
npm run type-check

# Fix issues and try again
npm run lint:fix
npm run format

# If hooks are broken, reinstall
rm -rf .husky
npm run prepare
```

#### Problem: Merge conflicts in package-lock.json

**Solution:**

```bash
# Delete and regenerate
rm package-lock.json
npm install

# Or use npm to resolve
npm install --package-lock-only
```

## 🆘 Getting Additional Help

### Debugging Steps

1. **Check the Console**: Look for error messages in browser dev tools
2. **Check Network Tab**: Look for failed requests or slow loading
3. **Check Application Tab**: Verify IndexedDB data and localStorage
4. **Check GitHub Actions**: Review CI/CD logs for deployment issues
5. **Check Dependencies**: Ensure all packages are up to date

### Useful Commands for Debugging

```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install

# Check for outdated packages
npm outdated

# Run comprehensive checks
npm run type-check
npm run lint
npm test
npm run build

# Check bundle size
npm run build && npx @next/bundle-analyzer
```

### When to Ask for Help

- After trying the solutions in this guide
- When errors persist after clearing caches and reinstalling
- When you encounter new error messages not covered here
- When performance issues can't be resolved with standard optimization

### How to Report Issues

1. **Describe the Problem**: What were you trying to do?
2. **Include Error Messages**: Copy the exact error message
3. **Provide Context**: What environment, browser, OS?
4. **Steps to Reproduce**: How can someone else reproduce the issue?
5. **What You've Tried**: What solutions have you already attempted?

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Remember**: Most issues have been encountered by others before. Don't hesitate to search for error messages online or ask for help when you're stuck. The development community is generally very helpful and supportive.
