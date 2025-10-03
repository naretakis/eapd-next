# Milkdown Editor State Management - Standardized Approach

## Overview

This document describes the standardized ref-based approach for managing Milkdown editor state across the eAPD-Next application. This approach was implemented to address reliability issues with Milkdown's onChange callback in validation-heavy contexts.

## The Problem

Previously, the application used inconsistent patterns for handling Milkdown editor state changes:

1. **Direct onChange callbacks** - Caused editor re-initialization issues
2. **Mixed polling approaches** - Different intervals and cleanup patterns
3. **Hybrid implementations** - Combining onChange with polling, leading to conflicts

These inconsistencies led to:

- Editor focus loss during typing
- Validation logic breaking editor state
- Performance issues from excessive re-renders
- Unpredictable behavior across different use cases

## The Solution: Standardized Ref-Based Approach

### Core Principles

1. **No onChange prop** - MilkdownEditor component no longer accepts onChange
2. **Ref-based content retrieval** - All content access goes through editor refs
3. **Configurable polling** - Consistent polling with configurable intervals
4. **Immediate blur sync** - Content syncs immediately when editor loses focus
5. **Proper cleanup** - All intervals and event listeners are properly cleaned up

### Implementation Pattern

```typescript
// Standard pattern for all Milkdown usage
const editorRef = useRef<MilkdownEditorRef>(null);

// Set up content change listener
useEffect(() => {
  if (!editorRef.current) return;

  const cleanup = editorRef.current.onContentChange((content) => {
    handleContentChange(content);
  });

  return cleanup;
}, [handleContentChange]);

// Use the editor
<MilkdownEditor
  ref={editorRef}
  defaultValue={initialContent}
  label="Field Label"
  pollingInterval={500} // 500ms for responsive, 1000ms for validation-heavy
  enablePolling={true}
/>
```

## Configuration Options

### Polling Intervals

- **500ms** - Responsive contexts (form fields, basic editing)
- **1000ms** - Validation-heavy contexts (complex validation rules)
- **Disabled** - Read-only editors (no polling needed)

### MilkdownEditor Props

```typescript
interface MilkdownEditorProps {
  // Standard props
  defaultValue?: string;
  label?: string;
  readOnly?: boolean;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;

  // Standardized state management
  pollingInterval?: number; // Default: 1000ms
  enablePolling?: boolean; // Default: true
}
```

### MilkdownEditorRef Methods

```typescript
interface MilkdownEditorRef {
  // Content access
  getMarkdown: () => string;
  getHTML: () => string;
  getOutline: () => Array<{ text: string; level: number; id: string }>;

  // Content manipulation
  insertContent: (content: string, inline?: boolean) => void;
  replaceAllContent: (content: string, flush?: boolean) => void;
  replaceRange: (content: string, range: { from: number; to: number }) => void;

  // Standardized state management
  onContentChange: (callback: (markdown: string) => void) => () => void;
  syncContent: () => string;

  // Advanced features
  getEditor: () => Crepe | null;
  forceUpdate: () => void;
}
```

## Usage Examples

### Basic Form Field

```typescript
const FormField = ({ field, value, onChange }) => {
  const editorRef = useRef<MilkdownEditorRef>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const cleanup = editorRef.current.onContentChange((content) => {
      if (content !== value) {
        onChange(content);
      }
    });

    return cleanup;
  }, [value, onChange]);

  return (
    <MilkdownEditor
      ref={editorRef}
      defaultValue={String(value || '')}
      label={field.label}
      pollingInterval={500} // Responsive for form fields
      enablePolling={true}
    />
  );
};
```

### Validation-Heavy Context

```typescript
const ValidationEditor = ({ onValidationChange }) => {
  const editorRef = useRef<MilkdownEditorRef>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const cleanup = editorRef.current.onContentChange((content) => {
      // Strip markdown for validation
      const plainText = content.replace(/[#*_`~\[\]()]/g, '').trim();
      onValidationChange(plainText);
    });

    return cleanup;
  }, [onValidationChange]);

  return (
    <MilkdownEditor
      ref={editorRef}
      label="Content with Validation"
      pollingInterval={1000} // Slower for validation-heavy
      enablePolling={true}
    />
  );
};
```

### Read-Only Display

```typescript
const ReadOnlyEditor = ({ content }) => {
  return (
    <MilkdownEditor
      defaultValue={content}
      label="Preview"
      readOnly={true}
      enablePolling={false} // No polling needed
    />
  );
};
```

### Using the Custom Hook

```typescript
import { useMilkdownEditor } from '@/hooks/useMilkdownEditor';

const MyComponent = () => {
  const { editorRef, getContent, syncContent } = useMilkdownEditor({
    initialContent: 'Initial content',
    onContentChange: (content) => console.log('Content changed:', content),
    pollingInterval: 500,
  });

  const handleSave = () => {
    const content = syncContent(); // Force immediate sync
    // Save content...
  };

  return (
    <MilkdownEditor
      ref={editorRef}
      label="My Editor"
      pollingInterval={500}
      enablePolling={true}
    />
  );
};
```

## Benefits

### Reliability

- No more editor re-initialization issues
- Consistent behavior across all use cases
- Validation logic doesn't interfere with editor state

### Performance

- Configurable polling prevents excessive updates
- Proper cleanup prevents memory leaks
- Debounced content synchronization

### Consistency

- Same pattern used everywhere
- Predictable behavior for developers
- Easy to maintain and debug

### User Experience

- No focus loss during typing
- Immediate updates on blur
- Smooth editing experience

## Migration Guide

### From Direct onChange

**Before:**

```typescript
<MilkdownEditor
  onChange={(content) => handleChange(content)}
  // other props
/>
```

**After:**

```typescript
const editorRef = useRef<MilkdownEditorRef>(null);

useEffect(() => {
  const cleanup = editorRef.current?.onContentChange(handleChange);
  return cleanup;
}, [handleChange]);

<MilkdownEditor
  ref={editorRef}
  pollingInterval={500}
  enablePolling={true}
  // other props (no onChange)
/>
```

### From Custom Polling

**Before:**

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const content = editorRef.current?.getMarkdown();
    if (content !== currentValue) {
      handleChange(content);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [currentValue, handleChange]);
```

**After:**

```typescript
useEffect(() => {
  const cleanup = editorRef.current?.onContentChange((content) => {
    if (content !== currentValue) {
      handleChange(content);
    }
  });

  return cleanup;
}, [currentValue, handleChange]);

// Configure polling in the component
<MilkdownEditor
  pollingInterval={1000}
  enablePolling={true}
/>
```

## Best Practices

1. **Use appropriate polling intervals**
   - 500ms for responsive contexts
   - 1000ms for validation-heavy contexts
   - Disable for read-only editors

2. **Always clean up listeners**
   - Use the cleanup function returned by `onContentChange`
   - Proper dependency arrays in useEffect

3. **Avoid direct content manipulation**
   - Use ref methods instead of direct DOM manipulation
   - Let the editor manage its own state

4. **Consider using the custom hook**
   - Simplifies common patterns
   - Provides additional utility methods
   - Consistent implementation

5. **Test with validation**
   - Ensure validation doesn't interfere with editing
   - Use slower polling for complex validation rules

## Troubleshooting

### Editor loses focus while typing

- Check that you're not using onChange prop
- Ensure proper cleanup of event listeners
- Verify polling interval isn't too aggressive

### Content not syncing

- Check that `enablePolling` is true
- Verify the content change callback is set up correctly
- Use `syncContent()` for immediate synchronization

### Performance issues

- Increase polling interval for validation-heavy contexts
- Ensure proper cleanup of intervals and listeners
- Consider disabling polling for read-only editors

### Validation conflicts

- Use slower polling (1000ms) for validation contexts
- Avoid triggering validation on every keystroke
- Use blur events for immediate validation when needed
