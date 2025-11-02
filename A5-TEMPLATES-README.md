# New A5 Invoice Templates - Documentation

## Overview

Four new professional A5 invoice templates have been added to the billing system, designed specifically for A5 paper size (148mm x 210mm) with optimized layouts for professional invoicing.

## New Templates

### 1. A5 Bordered (Color)
- **Full-page border**: 3px solid blue (#2c5aa0)
- **Color scheme**: Blue gradient header with white text
- **Header**: Bold company name (2em font size), no "TAX INVOICE" label
- **Features**:
  - Professional blue gradient header
  - Color-coded sections for better readability
  - Blue accents throughout
  - Fills entire A5 page with flexible spacing

### 2. A5 Bordered (B&W)
- **Full-page border**: 3px solid black
- **Color scheme**: Black and white with grayscale accents
- **Header**: Bold company name (2em font size), black background
- **Features**:
  - Printer-friendly monochrome design
  - High contrast for clarity
  - Perfect for B&W printing
  - Fills entire A5 page with flexible spacing

### 3. A5 Simple (Color)
- **Border**: 2px solid blue (#1e88e5)
- **Color scheme**: Clean blue design with minimal decorations
- **Header**: Large bold company name with blue background
- **Features**:
  - Simplified design for faster processing
  - Color-coded headers and footers
  - Modern minimalist look
  - Fills entire A5 page with flexible spacing

### 4. A5 Simple (B&W)
- **Border**: 2px solid black
- **Color scheme**: Clean black and white design
- **Header**: Large bold company name with black background
- **Features**:
  - Ultra-simple design for maximum compatibility
  - Printer-friendly
  - Fast rendering
  - Fills entire A5 page with flexible spacing

## Key Features

### 1. Company Name Styling
- **Font Size**: 2em (approximately 200% of base text)
- **Font Weight**: Bold
- **Positioning**: Centered in header
- **Letter Spacing**: Enhanced for readability
- All company details clearly displayed

### 2. No "TAX INVOICE" Header
- Removed the "TAX INVOICE" text as requested
- Clean header with just company information
- Professional appearance

### 3. Full-Page Layout
- **Dimensions**: Exactly 148mm x 210mm (A5 size)
- **Margins**: 0mm - border goes to page edge
- **Border**: Full-page border covering entire perimeter
- **Padding**: Internal padding only (no external margins)

### 4. Flexible Content Area
- **Minimum Rows**: 8 item rows guaranteed
- **Filler Rows**: Automatically added when items < 8
- **Height**: Dynamic filler rows expand to fill space
- **Result**: Total section always appears at bottom of page

### 5. Bottom-Aligned Totals
- **Position**: Always at bottom regardless of content
- **Sections**: Subtotal, Tax (if applicable), Grand Total
- **Styling**: Highlighted background for emphasis
- **Spacing**: Consistent spacing from content

## How to Use

### Selecting Templates

1. **From Print Preview**:
   - Open an invoice for viewing/printing
   - Select template from "Select Template" dropdown
   - Choose from "New A5 Templates" section
   - Preview updates automatically

2. **From Settings**:
   - Go to Settings → Template Settings
   - Choose from "New A5 Templates" section
   - Save settings
   - Selected template becomes default

### Printing

1. Click "Print" button in invoice preview
2. Template selection is remembered
3. Print dialog opens with A5 size pre-selected
4. Print as normal

### Saving as PDF

1. Click "Save as PDF" button in invoice preview
2. Choose location:
   - Click "OK" to choose custom location
   - Click "Cancel" to use default "invoice" folder
3. Template and size preferences are saved automatically
4. PDF saved with selected template

## Template Preferences

The system now remembers your template preferences:

- **Last Used Template**: Automatically saved when you print or save
- **Last Used Size**: A4 or A5 selection is remembered
- **Persistent**: Preferences persist across sessions
- **Per-Selection**: Each print/save can use different template

## Technical Details

### Page Specifications
```
Width: 148mm
Height: 210mm
Border: 2-3px solid (varies by template)
Margins: 0mm (full bleed)
Orientation: Portrait
```

### Font Sizes
- Company Name: 1.8-2em
- Headers: 0.9-1em
- Body Text: 0.7-0.72em base
- Table Headers: 0.85em
- Total Section: 1.1-1.4em

### Color Schemes

**Color Templates**:
- Primary: #2c5aa0 (Blue) or #1e88e5 (Light Blue)
- Accents: #4a7dc2, #e3f2fd
- Background: White
- Text: Black

**B&W Templates**:
- Primary: #000000 (Black)
- Grays: #e0e0e0, #ddd, #f5f5f5
- Background: White
- Text: Black

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Electron: Full support (primary target)

## Troubleshooting

### Template Not Showing
- Refresh the application
- Check console for JavaScript errors
- Verify app.js is loaded correctly

### PDF Save Location Not Working
- Ensure Electron API is available
- Check file permissions for save directory
- Try saving to different location

### Borders Not Appearing
- Check print settings for "Background graphics"
- Enable "Print backgrounds" in browser
- Verify border styling in template

### Spacing Issues
- Verify A5 size is selected
- Check that content is not exceeding page height
- Review filler row calculation

## Migration from Old Templates

Old templates remain available:
- Modern Template
- Classic Template
- Professional Template
- Minimal Template
- Compact Template

You can switch between old and new templates at any time.

## Best Practices

1. **For Color Printing**: Use A5 Bordered (Color) or A5 Simple (Color)
2. **For B&W Printing**: Use A5 Bordered (B&W) or A5 Simple (B&W)
3. **For Professional Look**: Use A5 Bordered templates
4. **For Quick Printing**: Use A5 Simple templates
5. **Always Use A5 Size**: New templates optimized for A5

## Support

For issues or questions about the new templates:
1. Check this documentation
2. Review test-template.html for visual reference
3. Check app.js for template implementation
4. Contact development team for assistance
