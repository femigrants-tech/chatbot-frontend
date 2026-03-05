# View Documents Feature - UI Preview

## What Users Will See

### Before (Old UI)
```
┌─────────────────────────────────────────────┐
│ AI Response:                                │
│ The Femigrant Foundation was founded...     │
│                                             │
│ 📄 Sources:                                 │
│ • 93% relevant - document.pdf               │
│ • 85% relevant - another.pdf                │
└─────────────────────────────────────────────┘
```

### After (New UI with View Details)
```
┌─────────────────────────────────────────────────────────────┐
│ AI Response:                                                │
│ The Femigrant Foundation was founded in 1980 by Kunal...   │
│                                                             │
│ 📄 Sources (2)                                              │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ The Founding of the Femigrant Foundation.pdf        │   │
│ │ Relevance: 93.0% | Pages: 1                         │   │
│ │                                    [View Details]    │   │
│ │ The full text chunk from the document...            │   │
│ └─────────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Immigration Guide 2024.pdf                           │   │
│ │ Relevance: 85.2% | Pages: 3, 4                      │   │
│ │                                    [View Details]    │   │
│ │ Information about immigration processes...           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Source Card (for each document)

```jsx
<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
  
  {/* Header with filename and button */}
  <div className="flex justify-between items-start mb-2">
    
    {/* Document info */}
    <div className="flex-1">
      <p className="font-medium text-gray-800 text-sm">
        📄 The Founding of the Femigrant Foundation.pdf
      </p>
      <div className="flex gap-3 mt-1 text-xs text-gray-600">
        <span>
          Relevance: <strong className="text-purple-600">93.0%</strong>
        </span>
        <span>
          Pages: 1, 2, 3
        </span>
      </div>
    </div>
    
    {/* View Details Button */}
    <button className="bg-purple-600 text-white px-3 py-1.5 rounded">
      View Details
    </button>
  </div>
  
  {/* Text preview */}
  <p className="text-xs text-gray-600">
    The full text chunk from the document that was used as context...
  </p>
</div>
```

## Color Scheme

- **Purple Primary**: `#7C3AED` (purple-600)
  - Used for buttons and highlighted text
  - Matches the existing Femigrants brand

- **Gray Background**: `#F9FAFB` (gray-50)
  - Clean, subtle background for source cards

- **Gray Border**: `#E5E7EB` (gray-200)
  - Soft borders that don't compete with content

- **Purple Hover**: `#6D28D9` (purple-700)
  - Darker shade for button hover states

## Interactive States

### Button States

**Normal:**
```
┌──────────────────┐
│  View Details    │  ← Purple background
└──────────────────┘
```

**Hover:**
```
┌──────────────────┐
│  View Details    │  ← Darker purple background
└──────────────────┘
```

**Disabled:**
```
┌──────────────────┐
│  View Details    │  ← Gray background (if no URL available)
└──────────────────┘
```

## Responsive Design

### Desktop (Wide Screen)
- Source cards display in full width
- All metadata visible on one line
- Button aligned to the right

### Mobile (Narrow Screen)
- Cards stack vertically
- Metadata wraps to multiple lines
- Button remains accessible
- Text preview truncates nicely

## Example Chat Flow

### 1. User Types Question
```
┌─────────────────────────────────────────┐
│ Who founded the Femigrant Foundation?  │  [Send]
└─────────────────────────────────────────┘
```

### 2. AI Responds with Sources
```
┌─────────────────────────────────────────────────────────┐
│ 👤 You                               10:30 AM            │
│ ┌────────────────────────────────────────────────┐      │
│ │ Who founded the Femigrant Foundation?          │      │
│ └────────────────────────────────────────────────┘      │
│                                                          │
│ 🤖 AI Assistant                      10:30 AM            │
│ ┌────────────────────────────────────────────────┐      │
│ │ The Femigrant Foundation was founded by        │      │
│ │ Kunal Tajne in 1980. It was established to     │      │
│ │ help immigrant women navigate...               │      │
│ │                                                 │      │
│ │ ─────────────────────────────────────          │      │
│ │ 📄 Sources (1)                                  │      │
│ │                                                 │      │
│ │ ┌──────────────────────────────────────┐       │      │
│ │ │ The Founding Document.pdf            │       │      │
│ │ │ Relevance: 93.0% | Pages: 1          │       │      │
│ │ │                     [View Details] ←─┼───── Click!  │
│ │ │ The Femigrant Foundation was...      │       │      │
│ │ └──────────────────────────────────────┘       │      │
│ └────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 3. Document Opens in New Tab
```
Browser Tab 1: Femigrants Chat
Browser Tab 2: [NEW!] ← The Founding Document.pdf
```

## Accessibility Features

### Screen Readers
- Button labeled "View Details" for each source
- Document names are clearly announced
- Relevance scores read as percentages

### Keyboard Navigation
- Tab through sources and buttons
- Enter/Space to activate "View Details"
- Escape to close any modals (future enhancement)

### Visual Indicators
- High contrast text for readability
- Clear button boundaries
- Hover states for interactive elements

## Error Messages

### If URL Expired
```
┌─────────────────────────────────────────┐
│ ⚠️ Unable to open document. The URL     │
│    may have expired or the file may not │
│    be available.                         │
│                                    [OK]  │
└─────────────────────────────────────────┘
```

### If No File ID
```
┌─────────────────────────────────────────┐
│ ⚠️ Unable to view document: No file ID  │
│    available                             │
│                                    [OK]  │
└─────────────────────────────────────────┘
```

## Animation & Transitions

### Button Hover
- Smooth color transition (150ms)
- Subtle scale effect (optional)

### Card Appearance
- Sources fade in after AI response
- Staggered animation (optional enhancement)

### Loading States
```
When fetching fresh URL:

┌──────────────────┐
│   Loading...     │  ← Shows briefly if fetching fresh URL
└──────────────────┘
```

## Technical Details

### Tailwind CSS Classes Used

```css
/* Card Container */
.bg-gray-50 .border .border-gray-200 .rounded-lg .p-3

/* Document Name */
.font-medium .text-gray-800 .text-sm

/* Metadata */
.flex .gap-3 .text-xs .text-gray-600

/* Relevance Score */
.text-purple-600 .font-semibold

/* View Details Button */
.bg-purple-600 .text-white .px-3 .py-1.5 
.rounded .hover:bg-purple-700 .transition-colors

/* Text Preview */
.text-xs .text-gray-600 .line-clamp-2
```

### Layout Structure

```
Sources Container
└── Space-y-3 (spacing between cards)
    ├── Source Card 1
    │   ├── Flex Container (header)
    │   │   ├── Document Info
    │   │   └── View Details Button
    │   └── Text Preview
    ├── Source Card 2
    │   └── ...
    └── Source Card 3
        └── ...
```

## Comparison with Other Apps

### Similar to:
- **ChatGPT**: Sources with citations
- **Perplexity**: Referenced documents
- **Google Bard**: Source attribution

### Better because:
- ✅ Direct document viewing (not just citations)
- ✅ Page-specific references
- ✅ Relevance scores shown
- ✅ Text preview for context
- ✅ Beautiful card-based design

## Next Steps

1. **Test the UI** - Run the app and try asking questions
2. **Upload documents** - Make sure you have PDFs uploaded
3. **Click "View Details"** - Verify documents open correctly
4. **Check mobile** - Test responsive design on smaller screens
5. **Share feedback** - Let the team know how it works!

---

The UI is clean, professional, and user-friendly! 🎨✨

