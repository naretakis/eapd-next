# Material-UI Guidelines for eAPD-Next

## Component Selection and Usage

### Form Components

#### TextField

**When to use**: All text input fields, including single-line and multi-line text

```typescript
// Standard text input
<TextField
  label="Project Name"
  variant="outlined"
  fullWidth
  required
  value={value}
  onChange={handleChange}
  helperText="Enter a descriptive name for your project"
  error={!!error}
/>

// Multi-line text area
<TextField
  label="Project Description"
  variant="outlined"
  multiline
  rows={4}
  fullWidth
  value={description}
  onChange={handleDescriptionChange}
/>
```

#### Select

**When to use**: Dropdown selections with predefined options

```typescript
<FormControl fullWidth>
  <InputLabel>APD Type</InputLabel>
  <Select
    value={apdType}
    label="APD Type"
    onChange={handleTypeChange}
  >
    <MenuItem value="PAPD">Planning APD (PAPD)</MenuItem>
    <MenuItem value="IAPD">Implementation APD (IAPD)</MenuItem>
    <MenuItem value="OAPD">Operational APD (OAPD)</MenuItem>
  </Select>
</FormControl>
```

#### DatePicker (from @mui/x-date-pickers)

**When to use**: Date selection fields

```typescript
<DatePicker
  label="Project Start Date"
  value={startDate}
  onChange={handleDateChange}
  renderInput={(params) => <TextField {...params} fullWidth />}
/>
```

#### Checkbox and Radio

**When to use**: Boolean selections and mutually exclusive options

```typescript
// Checkbox for boolean values
<FormControlLabel
  control={
    <Checkbox
      checked={isChecked}
      onChange={handleCheckboxChange}
    />
  }
  label="This project benefits multiple programs"
/>

// Radio group for exclusive selections
<RadioGroup value={value} onChange={handleRadioChange}>
  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
  <FormControlLabel value="no" control={<Radio />} label="No" />
</RadioGroup>
```

### Layout Components

#### Container

**When to use**: Main content wrapper with responsive max-width

```typescript
<Container maxWidth="xl" sx={{ py: 3 }}>
  {/* Page content */}
</Container>
```

#### Box

**When to use**: Flexible container with sx prop for custom styling

```typescript
// Flexbox layout
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
  <Icon />
  <Typography>Content</Typography>
</Box>

// Grid layout
<Box sx={{
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
  gap: 3
}}>
  {/* Grid items */}
</Box>
```

#### Card and CardContent

**When to use**: Grouped content sections, dashboard widgets

```typescript
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Section Title
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Section content goes here
    </Typography>
  </CardContent>
</Card>
```

### Navigation Components

#### AppBar and Toolbar

**When to use**: Application header with navigation

```typescript
<AppBar position="sticky">
  <Toolbar>
    <IconButton edge="start" color="inherit" aria-label="menu">
      <MenuIcon />
    </IconButton>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      eAPD-Next
    </Typography>
    <Button color="inherit">Help</Button>
  </Toolbar>
</AppBar>
```

#### Breadcrumbs

**When to use**: Navigation hierarchy display

```typescript
<Breadcrumbs aria-label="breadcrumb">
  <Link underline="hover" color="inherit" href="/dashboard">
    Dashboard
  </Link>
  <Link underline="hover" color="inherit" href="/apd/123">
    My Project APD
  </Link>
  <Typography color="text.primary">Executive Summary</Typography>
</Breadcrumbs>
```

#### Stepper

**When to use**: Multi-step processes, progress indication

```typescript
<Stepper activeStep={activeStep} alternativeLabel>
  {steps.map((label) => (
    <Step key={label}>
      <StepLabel>{label}</StepLabel>
    </Step>
  ))}
</Stepper>
```

### Feedback Components

#### Alert

**When to use**: Important messages, validation feedback

```typescript
// Success message
<Alert severity="success">
  <AlertTitle>Success</AlertTitle>
  Your APD has been saved successfully.
</Alert>

// Error message
<Alert severity="error">
  <AlertTitle>Validation Error</AlertTitle>
  Please correct the following issues before continuing.
</Alert>

// Warning message
<Alert severity="warning">
  This section is incomplete and may affect your submission.
</Alert>
```

#### Snackbar

**When to use**: Temporary notifications, action confirmations

```typescript
<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  message="Changes saved automatically"
  action={
    <Button color="secondary" size="small" onClick={handleUndo}>
      UNDO
    </Button>
  }
/>
```

#### CircularProgress and LinearProgress

**When to use**: Loading states, progress indication

```typescript
// Loading spinner
<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
  <CircularProgress />
</Box>

// Progress bar
<LinearProgress
  variant="determinate"
  value={completionPercentage}
  sx={{ mb: 2 }}
/>
```

### Data Display Components

#### Table

**When to use**: Structured data display, budget tables

```typescript
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Category</TableCell>
        <TableCell align="right">Federal Share</TableCell>
        <TableCell align="right">State Share</TableCell>
        <TableCell align="right">Total</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.category}</TableCell>
          <TableCell align="right">{formatCurrency(row.federal)}</TableCell>
          <TableCell align="right">{formatCurrency(row.state)}</TableCell>
          <TableCell align="right">{formatCurrency(row.total)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

#### List and ListItem

**When to use**: Simple data lists, navigation menus

```typescript
<List>
  <ListItem button onClick={handleClick}>
    <ListItemIcon>
      <DescriptionIcon />
    </ListItemIcon>
    <ListItemText
      primary="Executive Summary"
      secondary="Project overview and objectives"
    />
    <ListItemSecondaryAction>
      <Chip label="Complete" color="success" size="small" />
    </ListItemSecondaryAction>
  </ListItem>
</List>
```

## Theme Customization

### Color Palette

Use the predefined theme colors for consistency:

```typescript
// Primary colors (professional blue)
sx={{ color: 'primary.main' }}
sx={{ backgroundColor: 'primary.light' }}

// Secondary colors (accent red)
sx={{ color: 'secondary.main' }}

// Semantic colors
sx={{ color: 'success.main' }}  // Green for success
sx={{ color: 'warning.main' }}  // Orange for warnings
sx={{ color: 'error.main' }}    // Red for errors
sx={{ color: 'info.main' }}     // Blue for information

// Text colors
sx={{ color: 'text.primary' }}    // Main text
sx={{ color: 'text.secondary' }}  // Secondary text
sx={{ color: 'text.disabled' }}   // Disabled text
```

### Typography

Use consistent typography variants:

```typescript
// Headings
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2">Section Title</Typography>
<Typography variant="h3">Subsection Title</Typography>
<Typography variant="h4">Component Title</Typography>
<Typography variant="h5">Small Heading</Typography>
<Typography variant="h6">Smallest Heading</Typography>

// Body text
<Typography variant="body1">Main body text</Typography>
<Typography variant="body2">Secondary body text</Typography>

// Special text
<Typography variant="caption">Small text, captions</Typography>
<Typography variant="overline">Overline text</Typography>
<Typography variant="button">Button text</Typography>
```

### Spacing

Use consistent spacing with the theme's spacing function:

```typescript
// Padding and margins
sx={{ p: 2 }}    // 16px padding all sides
sx={{ px: 3 }}   // 24px horizontal padding
sx={{ py: 1 }}   // 8px vertical padding
sx={{ m: 2 }}    // 16px margin all sides
sx={{ mb: 3 }}   // 24px bottom margin

// Gaps in flexbox/grid
sx={{ gap: 2 }}  // 16px gap between items
```

## Responsive Design Patterns

### Breakpoints

Use theme breakpoints for responsive design:

```typescript
sx={{
  display: { xs: 'block', md: 'flex' },
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 1, sm: 2, md: 3 },
  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
}}
```

### Grid Layouts

Use CSS Grid for complex layouts:

```typescript
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)'
  },
  gap: 2
}}>
  {/* Grid items */}
</Box>
```

## Accessibility Best Practices

### ARIA Labels and Roles

Always include proper accessibility attributes:

```typescript
// Buttons with descriptive labels
<IconButton aria-label="Delete APD" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>

// Form fields with proper labeling
<TextField
  label="Project Name"
  aria-describedby="project-name-helper"
  helperText="Enter a descriptive name for your project"
  id="project-name-helper"
/>

// Navigation elements
<nav aria-label="APD sections">
  <List role="navigation">
    {/* Navigation items */}
  </List>
</nav>
```

### Focus Management

Ensure proper focus handling:

```typescript
// Focus trap in dialogs
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this APD?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose} autoFocus>
      Cancel
    </Button>
    <Button onClick={handleConfirm} color="error">
      Delete
    </Button>
  </DialogActions>
</Dialog>
```

### Color Contrast

Ensure sufficient color contrast:

```typescript
// Use theme colors that meet WCAG AA standards
sx={{
  color: 'text.primary',
  backgroundColor: 'background.paper',
  '&:hover': {
    backgroundColor: 'action.hover'
  }
}}
```

## Performance Optimization

### Component Memoization

Use React.memo for expensive components:

```typescript
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return (
    <Box>
      {/* Expensive rendering logic */}
    </Box>
  );
});
```

### Lazy Loading

Lazy load heavy components:

```typescript
const HeavyDialog = React.lazy(() => import('./HeavyDialog'));

// Usage
<Suspense fallback={<CircularProgress />}>
  <HeavyDialog open={dialogOpen} />
</Suspense>
```

### Bundle Optimization

Import only needed components:

```typescript
// Good - tree-shakable imports
import { Button, TextField, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Avoid - imports entire library
import * as MUI from '@mui/material';
```

## Common Patterns

### Form Validation

Standard form validation pattern:

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (name: string, value: string) => {
  const newErrors = { ...errors };

  if (!value.trim()) {
    newErrors[name] = 'This field is required';
  } else {
    delete newErrors[name];
  }

  setErrors(newErrors);
};

// In render
<TextField
  error={!!errors.projectName}
  helperText={errors.projectName}
  onChange={(e) => {
    setValue(e.target.value);
    validateField('projectName', e.target.value);
  }}
/>
```

### Loading States

Standard loading state pattern:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitData();
  } finally {
    setLoading(false);
  }
};

// In render
<Button
  disabled={loading}
  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
>
  {loading ? 'Saving...' : 'Save'}
</Button>
```

### Confirmation Dialogs

Standard confirmation dialog pattern:

```typescript
const [confirmOpen, setConfirmOpen] = useState(false);

const handleDelete = () => {
  setConfirmOpen(true);
};

const handleConfirm = () => {
  // Perform delete action
  setConfirmOpen(false);
};

// In render
<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
  <DialogTitle>Confirm Deletion</DialogTitle>
  <DialogContent>
    <DialogContentText>
      This action cannot be undone. Are you sure?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm} color="error">Delete</Button>
  </DialogActions>
</Dialog>
```

## Testing with Material-UI

### Component Testing

Test Material-UI components properly:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

test('button handles click events', () => {
  const handleClick = jest.fn();

  renderWithTheme(
    <Button onClick={handleClick}>Click me</Button>
  );

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Accessibility Testing

Include accessibility tests:

```typescript
test('form is accessible', () => {
  renderWithTheme(<MyForm />);

  // Check for proper labels
  expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();

  // Check for proper ARIA attributes
  const button = screen.getByRole('button', { name: /submit/i });
  expect(button).toHaveAttribute('aria-describedby');
});
```
