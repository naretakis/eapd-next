# MilkdownEditor Component

A professional WYSIWYG editor component built with Milkdown and Crepe, integrated with Material-UI for APD content creation.

## Overview

The MilkdownEditor provides a rich text editing experience that stores content as clean Markdown while offering a visual editing interface. It's specifically designed for APD content creation with features like auto-save integration, accessibility compliance, and Material-UI theming.

## Features

- **WYSIWYG Editing**: Visual editing with real-time Markdown output
- **Material-UI Integration**: Seamless theming and component consistency
- **Accessibility**: WCAG AA compliance with screen reader support
- **Auto-save Integration**: Debounced change detection with existing infrastructure
- **Advanced Functionality**: Full Milkdown utils integration (getHTML, outline, insert, etc.)
- **Error Handling**: Robust error boundaries and graceful degradation
- **Performance**: React.memo patterns and 100ms render target compliance

## Usage

### Basic Usage

```tsx
import { MilkdownEditor } from '@/components/forms/MilkdownEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <MilkdownEditor
      label="APD Content"
      defaultValue={content}
      onChange={setContent}
      placeholder="Start writing your APD content..."
      helperText="Use markdown syntax for formatting"
    />
  );
}
```

### Advanced Usage with Ref

```tsx
import {
  MilkdownEditor,
  MilkdownEditorRef,
} from '@/components/forms/MilkdownEditor';

function AdvancedComponent() {
  const editorRef = useRef<MilkdownEditorRef>(null);

  const handleGetHTML = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      console.log('HTML output:', html);
    }
  };

  const handleInsertContent = () => {
    if (editorRef.current) {
      editorRef.current.insertContent(
        '\n\n## New Section\n\nContent here...\n\n'
      );
    }
  };

  return (
    <div>
      <MilkdownEditor
        ref={editorRef}
        label="Executive Summary"
        required
        error={hasValidationError}
        helperText={validationMessage}
      />
      <Button onClick={handleGetHTML}>Get HTML</Button>
      <Button onClick={handleInsertContent}>Insert Section</Button>
    </div>
  );
}
```

### Read-Only Mode

```tsx
<MilkdownEditor
  label="Template Preview"
  defaultValue={templateContent}
  readOnly
  helperText="This content is read-only"
/>
```

## Props

### MilkdownEditorProps

| Prop           | Type                         | Default              | Description                          |
| -------------- | ---------------------------- | -------------------- | ------------------------------------ |
| `defaultValue` | `string`                     | `''`                 | Initial markdown content             |
| `onChange`     | `(markdown: string) => void` | -                    | Callback fired when content changes  |
| `label`        | `string`                     | -                    | Label for the editor (accessibility) |
| `readOnly`     | `boolean`                    | `false`              | Whether editor is read-only          |
| `placeholder`  | `string`                     | `'Start writing...'` | Placeholder text                     |
| `error`        | `boolean`                    | `false`              | Error state for validation           |
| `helperText`   | `string`                     | -                    | Helper text below editor             |
| `required`     | `boolean`                    | `false`              | Whether field is required            |

## Ref Methods

### MilkdownEditorRef

| Method              | Parameters                                            | Returns                                            | Description                  |
| ------------------- | ----------------------------------------------------- | -------------------------------------------------- | ---------------------------- |
| `getMarkdown`       | -                                                     | `string`                                           | Get current markdown content |
| `getHTML`           | -                                                     | `string`                                           | Get HTML representation      |
| `getOutline`        | -                                                     | `Array<{text: string, level: number, id: string}>` | Get document outline         |
| `insertContent`     | `content: string, inline?: boolean`                   | `void`                                             | Insert content at cursor     |
| `insertAtPosition`  | `content: string, position: number, inline?: boolean` | `void`                                             | Insert at specific position  |
| `replaceAllContent` | `content: string, flush?: boolean`                    | `void`                                             | Replace all content          |
| `replaceRange`      | `content: string, range: {from: number, to: number}`  | `void`                                             | Replace content in range     |
| `forceUpdate`       | -                                                     | `void`                                             | Force editor update          |
| `getEditor`         | -                                                     | `Crepe \| null`                                    | Get Crepe editor instance    |

## Integration with APD Services

The MilkdownEditor works seamlessly with APD-specific services:

### APDContentManager

```tsx
import { APDContentManager } from '@/services/milkdownUtils';

// Insert boilerplate content
APDContentManager.insertBoilerplate(editorRef.current, 'executive-summary');

// Insert regulatory citations
APDContentManager.insertCitation(editorRef.current, 'ffp-rates');

// Generate APD outline
const outline = APDContentManager.generateAPDOutline(editorRef.current);
```

### APDValidator

```tsx
import { APDValidator } from '@/services/milkdownUtils';

// Validate APD content
const validation = APDValidator.validateAPD(editorRef.current);
console.log('Validation result:', validation);
```

## Styling and Theming

The editor automatically inherits Material-UI theme settings:

- **Colors**: Uses theme palette (primary, secondary, error, etc.)
- **Typography**: Inherits theme typography settings
- **Spacing**: Uses theme spacing units
- **Borders**: Consistent with Material-UI form components

### Custom Styling

```tsx
<MilkdownEditor
  label="Custom Styled Editor"
  sx={{
    '& .milkdown': {
      minHeight: 400,
      fontSize: '1.1rem',
    },
    '& .ProseMirror': {
      padding: '24px',
    },
  }}
/>
```

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and indicators
- **Error Announcements**: Screen reader announcements for validation errors
- **Semantic HTML**: Uses proper HTML structure for content

## Performance Considerations

- **React.memo**: Component is memoized for performance
- **Debounced Changes**: onChange events are debounced (500ms)
- **Lazy Loading**: Milkdown plugins are loaded on demand
- **Memory Management**: Proper cleanup on component unmount

## Testing

The component includes comprehensive tests:

```bash
# Run MilkdownEditor tests
npm test -- --testPathPatterns=MilkdownEditor

# Run with coverage
npm test -- --testPathPatterns=MilkdownEditor --coverage
```

### Test Examples

```tsx
import { render, screen } from '@testing-library/react';
import { MilkdownEditor } from './MilkdownEditor';

test('renders with label', () => {
  render(<MilkdownEditor label="Test Editor" />);
  expect(screen.getByText('Test Editor')).toBeInTheDocument();
});

test('shows required indicator', () => {
  render(<MilkdownEditor label="Required Field" required />);
  expect(screen.getByText('*')).toBeInTheDocument();
});
```

## Known Issues and Limitations

- **Initial Load**: Editor takes ~200ms to initialize
- **Large Documents**: Performance may degrade with very large documents (>10MB)
- **Mobile Support**: Optimized for desktop, mobile support is basic

## Future Enhancements

- **APD-Specific Plugins**: Custom Milkdown plugins for budget tables, regulatory references
- **Collaboration**: Real-time collaborative editing support
- **Advanced Tables**: Enhanced table editing for budget calculations
- **Math Support**: LaTeX-style math expressions for calculations

## Related Components

- **[APDContentManager](../../services/milkdownUtils.ts)**: APD-specific content management
- **[APDValidator](../../services/milkdownUtils.ts)**: Content validation services
- **[FormField](../FormField/)**: Generic form field wrapper

## Demo

See the comprehensive demo at `/milkdown-demo` which showcases:

- Basic editing functionality
- Validation workflows
- Read-only mode
- Advanced editor methods
- Multi-editor management patterns
